// AI音声アシスタント機能
import { aiClient } from './ai-client';
import { logger } from './logger';

export interface VoiceConfig {
  language: string;
  rate: number;
  pitch: number;
  volume: number;
  voice?: SpeechSynthesisVoice;
}

export interface VoiceInteraction {
  id: string;
  userInput: string;
  aiResponse: string;
  timestamp: Date;
  duration: number;
  confidence: number;
}

export class AIVoiceAssistantService {
  private synthesis: SpeechSynthesis | null = null;
  private recognition: any = null; // SpeechRecognition
  private isListening = false;
  private isSpeaking = false;
  private voiceConfig: VoiceConfig = {
    language: 'ja-JP',
    rate: 1.0,
    pitch: 1.0,
    volume: 0.8
  };
  private interactions: VoiceInteraction[] = [];

  constructor() {
    // クライアントサイドでのみ初期化
    if (typeof window !== 'undefined') {
      this.initializeVoiceServices();
    }
  }

  // 音声サービスの初期化
  private initializeVoiceServices() {
    // Speech Synthesis (音声合成)
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synthesis = window.speechSynthesis;
    }

    // Speech Recognition (音声認識)
    if (typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      this.recognition = new SpeechRecognition();
      this.setupRecognition();
    }
  }

  // 音声認識の設定
  private setupRecognition() {
    if (!this.recognition) return;

    this.recognition.continuous = false;
    this.recognition.interimResults = false;
    this.recognition.lang = this.voiceConfig.language;
    this.recognition.maxAlternatives = 1;

    this.recognition.onstart = () => {
      this.isListening = true;
      logger.debug('音声認識開始');
    };

    this.recognition.onend = () => {
      this.isListening = false;
      logger.debug('音声認識終了');
    };

    this.recognition.onerror = (event: any) => {
      const error = event.error instanceof Error ? event.error : new Error(String(event.error));
      logger.error('音声認識エラー', error, { errorCode: event.error });
      this.isListening = false;
    };
  }

  // 音声認識の開始
  async startListening(): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!this.recognition) {
        reject(new Error('音声認識がサポートされていません'));
        return;
      }

      if (this.isListening) {
        reject(new Error('既に音声認識中です'));
        return;
      }

      this.recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        const confidence = event.results[0][0].confidence;
        
        logger.debug('認識結果', { transcript, confidence });
        resolve(transcript);
      };

      this.recognition.start();
    });
  }

  // 音声認識の停止
  stopListening() {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
    }
  }

  // テキストを音声で読み上げ
  async speak(text: string, config?: Partial<VoiceConfig>): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.synthesis) {
        reject(new Error('音声合成がサポートされていません'));
        return;
      }

      if (this.isSpeaking) {
        this.synthesis.cancel();
      }

      const utterance = new SpeechSynthesisUtterance(text);
      const finalConfig = { ...this.voiceConfig, ...config };

      utterance.lang = finalConfig.language;
      utterance.rate = finalConfig.rate;
      utterance.pitch = finalConfig.pitch;
      utterance.volume = finalConfig.volume;

      if (finalConfig.voice) {
        utterance.voice = finalConfig.voice;
      }

      utterance.onstart = () => {
        this.isSpeaking = true;
      };

      utterance.onend = () => {
        this.isSpeaking = false;
        resolve();
      };

      utterance.onerror = (event) => {
        this.isSpeaking = false;
        reject(new Error(`音声合成エラー: ${event.error}`));
      };

      this.synthesis.speak(utterance);
    });
  }

  // 音声対話セッション
  async startVoiceSession(): Promise<VoiceInteraction> {
    const startTime = Date.now();
    
    try {
      // 1. 音声認識で質問を取得
      const userInput = await this.startListening();
      
      // 2. AIに質問を送信
      const aiResponse = await this.processVoiceQuery(userInput);
      
      // 3. AI応答を音声で読み上げ
      await this.speak(aiResponse);
      
      const interaction: VoiceInteraction = {
        id: `voice_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userInput,
        aiResponse,
        timestamp: new Date(),
        duration: Date.now() - startTime,
        confidence: 0.8 // 実際の信頼度計算が必要
      };

      this.interactions.push(interaction);
      return interaction;

    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error('音声セッションエラー', err);
      throw error;
    }
  }

  // 音声クエリの処理
  private async processVoiceQuery(userInput: string): Promise<string> {
    try {
      const response = await aiClient.chat([
        {
          role: 'system',
          content: `あなたは宅建試験の学習をサポートする音声AIアシスタントです。
          
以下の点に注意して回答してください：
1. 音声で聞き取りやすい自然な日本語で回答
2. 長すぎず、要点を簡潔に伝える
3. 専門用語は分かりやすく説明
4. 必要に応じて具体例を含める
5. 励ましの言葉を含める

音声での対話なので、視覚的な要素（図表、リンクなど）は使用しないでください。`
        },
        {
          role: 'user',
          content: `音声質問: ${userInput}`
        }
      ], {
        temperature: 0.7,
        maxTokens: 300 // 音声なので短めに
      });

      return response.content;
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error('音声クエリ処理エラー', err, { userInput });
      return 'すみません、うまく聞き取れませんでした。もう一度お話しください。';
    }
  }

  // 問題の音声読み上げ
  async readQuestion(question: any): Promise<void> {
    const questionText = `
問題です。${question.question}

選択肢は次の通りです。
1番、${question.choices[0]}
2番、${question.choices[1]}
3番、${question.choices[2]}
4番、${question.choices[3]}

どちらが正解だと思いますか？
    `;

    await this.speak(questionText, { rate: 0.9 });
  }

  // 解説の音声読み上げ
  async readExplanation(explanation: string, isCorrect: boolean): Promise<void> {
    const prefix = isCorrect ? '正解です！' : '残念、不正解です。';
    const fullText = `${prefix} ${explanation}`;
    
    await this.speak(fullText, { rate: 0.8 });
  }

  // 音声による学習セッション
  async conductVoiceLearningSession(questions: any[]): Promise<VoiceInteraction[]> {
    const sessionInteractions: VoiceInteraction[] = [];

    await this.speak('音声学習セッションを開始します。質問を読み上げますので、答えを声に出してお答えください。');

    for (let i = 0; i < questions.length; i++) {
      const question = questions[i];
      
      try {
        // 問題読み上げ
        await this.readQuestion(question);
        
        // ユーザーの回答を待機
        await this.speak('お答えください。');
        const userAnswer = await this.startListening();
        
        // 回答の評価
        const isCorrect = this.evaluateVoiceAnswer(userAnswer, question);
        
        // 結果の読み上げ
        await this.readExplanation(question.explanation, isCorrect);
        
        const interaction: VoiceInteraction = {
          id: `session_${i}_${Date.now()}`,
          userInput: userAnswer,
          aiResponse: question.explanation,
          timestamp: new Date(),
          duration: 0, // 実際の計測が必要
          confidence: 0.8
        };

        sessionInteractions.push(interaction);
        
        // 短い休憩
        if (i < questions.length - 1) {
          await this.speak('次の問題に進みます。');
          await new Promise(resolve => setTimeout(resolve, 1000));
        }

      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));
        logger.error(`問題 ${i + 1} の音声セッションエラー`, err, { questionIndex: i + 1 });
        await this.speak('申し訳ありません。次の問題に進みます。');
      }
    }

    await this.speak('音声学習セッションが完了しました。お疲れ様でした！');
    return sessionInteractions;
  }

  // 音声回答の評価
  private evaluateVoiceAnswer(userAnswer: string, question: any): boolean {
    const normalizedAnswer = userAnswer.toLowerCase().trim();
    
    // 数字での回答
    const numberMatch = normalizedAnswer.match(/[1-4]/);
    if (numberMatch) {
      return parseInt(numberMatch[0]) === question.correctAnswer;
    }

    // 選択肢の内容での回答
    const correctChoice = question.choices[question.correctAnswer - 1].toLowerCase();
    return normalizedAnswer.includes(correctChoice) || correctChoice.includes(normalizedAnswer);
  }

  // 利用可能な音声の取得
  getAvailableVoices(): SpeechSynthesisVoice[] {
    if (!this.synthesis || typeof window === 'undefined') return [];
    
    return this.synthesis.getVoices().filter(voice => 
      voice.lang.startsWith('ja') || voice.lang.startsWith('en')
    );
  }

  // 音声設定の更新
  updateVoiceConfig(config: Partial<VoiceConfig>) {
    this.voiceConfig = { ...this.voiceConfig, ...config };
  }

  // 音声機能のサポート状況確認
  isVoiceSupported(): {
    synthesis: boolean;
    recognition: boolean;
    fullSupport: boolean;
  } {
    if (typeof window === 'undefined') {
      return {
        synthesis: false,
        recognition: false,
        fullSupport: false
      };
    }

    return {
      synthesis: !!this.synthesis,
      recognition: !!this.recognition,
      fullSupport: !!(this.synthesis && this.recognition)
    };
  }

  // 音声停止
  stopSpeaking() {
    if (this.synthesis && this.isSpeaking) {
      this.synthesis.cancel();
      this.isSpeaking = false;
    }
  }

  // セッション履歴の取得
  getInteractionHistory(): VoiceInteraction[] {
    return [...this.interactions];
  }

  // セッション履歴のクリア
  clearInteractionHistory() {
    this.interactions = [];
  }

  // 音声学習統計
  getVoiceStats(): {
    totalInteractions: number;
    averageDuration: number;
    averageConfidence: number;
    lastInteraction?: Date;
  } {
    if (this.interactions.length === 0) {
      return {
        totalInteractions: 0,
        averageDuration: 0,
        averageConfidence: 0
      };
    }

    const totalDuration = this.interactions.reduce((sum, i) => sum + i.duration, 0);
    const totalConfidence = this.interactions.reduce((sum, i) => sum + i.confidence, 0);

    return {
      totalInteractions: this.interactions.length,
      averageDuration: totalDuration / this.interactions.length,
      averageConfidence: totalConfidence / this.interactions.length,
      lastInteraction: this.interactions[this.interactions.length - 1]?.timestamp
    };
  }
}

export const aiVoiceAssistant = new AIVoiceAssistantService();
