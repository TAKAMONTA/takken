// AI駆動のパーソナライズド問題生成システム
import { aiClient } from './ai-client';
import { WeaknessAnalysis } from './ai-analytics';
import { logger } from './logger';

export interface GeneratedQuestion {
  id: string;
  category: string;
  subcategory: string;
  question: string;
  choices: string[];
  correctAnswer: number;
  explanation: string;
  difficulty: number;
  concepts: string[];
  targetWeakness: string;
  generatedAt: Date;
  aiProvider: string;
}

export interface QuestionGenerationRequest {
  weaknesses: WeaknessAnalysis[];
  userLevel: number;
  preferredDifficulty?: number;
  focusAreas?: string[];
  questionCount?: number;
}

export interface AdaptiveQuestionConfig {
  baselineCorrectRate: number;
  targetCorrectRate: number;
  difficultyAdjustmentRate: number;
  conceptReinforcement: boolean;
}

export class AIQuestionGeneratorService {
  private generatedQuestions: Map<string, GeneratedQuestion> = new Map();
  private adaptiveConfig: AdaptiveQuestionConfig = {
    baselineCorrectRate: 0.7,
    targetCorrectRate: 0.8,
    difficultyAdjustmentRate: 0.1,
    conceptReinforcement: true
  };

  // メイン問題生成メソッド
  async generatePersonalizedQuestions(
    request: QuestionGenerationRequest
  ): Promise<GeneratedQuestion[]> {
    const { weaknesses, userLevel, questionCount = 5 } = request;
    
    if (weaknesses.length === 0) {
      return this.generateGeneralQuestions(userLevel, questionCount);
    }

    // 高優先度の弱点を特定
    const highPriorityWeaknesses = weaknesses
      .filter(w => w.priority === 'high')
      .slice(0, 3); // 最大3つの弱点に集中

    const questions: GeneratedQuestion[] = [];

    for (const weakness of highPriorityWeaknesses) {
      try {
        const generatedQuestions = await this.generateQuestionsForWeakness(
          weakness,
          userLevel,
          Math.ceil(questionCount / highPriorityWeaknesses.length)
        );
        questions.push(...generatedQuestions);
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));
        logger.error(`弱点 ${weakness.category} の問題生成エラー`, err, { category: weakness.category });
      }
    }

    // 生成された問題をキャッシュ
    questions.forEach(q => {
      this.generatedQuestions.set(q.id, q);
    });

    return questions.slice(0, questionCount);
  }

  // 特定の弱点に対する問題生成
  private async generateQuestionsForWeakness(
    weakness: WeaknessAnalysis,
    userLevel: number,
    count: number
  ): Promise<GeneratedQuestion[]> {
    const prompt = this.buildWeaknessPrompt(weakness, userLevel, count);

    try {
      const response = await aiClient.chat([
        {
          role: 'system',
          content: `あなたは宅建試験問題の作成専門家です。以下の要件に従って、効果的な学習問題を生成してください：

1. 問題は実際の宅建試験レベルに準拠
2. 選択肢は紛らわしく、思考力を要求
3. 解説は法的根拠を含む詳細なもの
4. ユーザーの弱点を克服できる内容
5. 段階的な難易度設定

回答は必ずJSON形式で返してください。`
        },
        {
          role: 'user',
          content: prompt
        }
      ], {
        temperature: 0.7,
        maxTokens: 2500
      });

      const result = JSON.parse(response.content) as { questions: Partial<GeneratedQuestion>[] };
      
      return result.questions.map((q) => ({
        ...q,
        id: `ai_generated_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        generatedAt: new Date(),
        aiProvider: 'OpenAI',
        targetWeakness: `${weakness.category}-${weakness.subcategory}`
      })) as GeneratedQuestion[];

    } catch (error) {
            const err = error instanceof Error ? error : new Error(String(error));
      logger.error('AI問題生成エラー', err, { weakness });
      return [];
    }
  }

  // 一般的な問題生成（弱点がない場合）
  private async generateGeneralQuestions(
    userLevel: number,
    count: number
  ): Promise<GeneratedQuestion[]> {
    const categories = ['権利関係', '宅建業法', '法令上の制限', '税・その他'];
    const selectedCategory = categories[Math.floor(Math.random() * categories.length)];

    const prompt = `
ユーザーレベル: ${userLevel}
対象カテゴリ: ${selectedCategory}
問題数: ${count}

${selectedCategory}分野の宅建試験問題を${count}問生成してください。
ユーザーレベル${userLevel}に適した難易度で作成してください。

以下のJSON形式で返してください：
{
  "questions": [
    {
      "category": "${selectedCategory}",
      "subcategory": "具体的なサブカテゴリ",
      "question": "問題文",
      "choices": ["選択肢1", "選択肢2", "選択肢3", "選択肢4"],
      "correctAnswer": 正解番号(1-4),
      "explanation": "詳細な解説",
      "difficulty": 難易度(1-5),
      "concepts": ["関連概念1", "関連概念2"]
    }
  ]
}
    `;

    try {
      const response = await aiClient.chat([
        {
          role: 'system',
          content: '宅建試験問題の作成専門家として、質の高い問題を生成してください。'
        },
        {
          role: 'user',
          content: prompt
        }
      ], {
        temperature: 0.7,
        maxTokens: 2000
      });

      const result = JSON.parse(response.content) as { questions: Partial<GeneratedQuestion>[] };
      
      return result.questions.map((q) => ({
        ...q,
        id: `ai_general_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        generatedAt: new Date(),
        aiProvider: 'OpenAI',
        targetWeakness: 'general'
      })) as GeneratedQuestion[];

    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error('一般問題生成エラー', err, { category: selectedCategory, count });
      return [];
    }
  }

  // 適応型難易度調整
  async adjustDifficultyBasedOnPerformance(
    userPerformance: number,
    currentDifficulty: number
  ): Promise<number> {
    const { targetCorrectRate, difficultyAdjustmentRate } = this.adaptiveConfig;
    
    if (userPerformance > targetCorrectRate + 0.1) {
      // 正答率が高すぎる場合、難易度を上げる
      return Math.min(5, currentDifficulty + difficultyAdjustmentRate);
    } else if (userPerformance < targetCorrectRate - 0.1) {
      // 正答率が低すぎる場合、難易度を下げる
      return Math.max(1, currentDifficulty - difficultyAdjustmentRate);
    }
    
    return currentDifficulty;
  }

  // 概念強化問題の生成
  async generateConceptReinforcementQuestions(
    concepts: string[],
    userLevel: number
  ): Promise<GeneratedQuestion[]> {
    const prompt = `
強化対象概念: ${concepts.join(', ')}
ユーザーレベル: ${userLevel}

上記の概念を深く理解するための宅建試験問題を3問生成してください。
各概念の理解を確認し、関連知識を統合できる問題を作成してください。

JSON形式で返してください：
{
  "questions": [
    {
      "category": "カテゴリ",
      "subcategory": "サブカテゴリ",
      "question": "問題文",
      "choices": ["選択肢1", "選択肢2", "選択肢3", "選択肢4"],
      "correctAnswer": 正解番号,
      "explanation": "概念を深める解説",
      "difficulty": 難易度,
      "concepts": ["対象概念"],
      "reinforcementType": "概念強化の種類"
    }
  ]
}
    `;

    try {
      const response = await aiClient.chat([
        {
          role: 'system',
          content: '概念理解を深める問題作成の専門家として、学習効果の高い問題を生成してください。'
        },
        {
          role: 'user',
          content: prompt
        }
      ], {
        temperature: 0.6,
        maxTokens: 2000
      });

      const result = JSON.parse(response.content) as { questions: Partial<GeneratedQuestion>[] };
      
      return result.questions.map((q) => ({
        ...q,
        id: `ai_concept_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        generatedAt: new Date(),
        aiProvider: 'OpenAI',
        targetWeakness: 'concept_reinforcement'
      })) as GeneratedQuestion[];

    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error('概念強化問題生成エラー', err, { concepts, userLevel });
      return [];
    }
  }

  // 段階的学習問題の生成
  async generateProgressiveQuestions(
    topic: string,
    startDifficulty: number,
    steps: number
  ): Promise<GeneratedQuestion[]> {
    const questions: GeneratedQuestion[] = [];
    
    for (let i = 0; i < steps; i++) {
      const currentDifficulty = startDifficulty + (i * 0.5);
      
      const prompt = `
トピック: ${topic}
難易度: ${currentDifficulty}
段階: ${i + 1}/${steps}

${topic}について、難易度${currentDifficulty}の宅建試験問題を1問生成してください。
${i === 0 ? '基礎的な理解を確認する' : i === steps - 1 ? '応用力を試す' : '段階的に理解を深める'}問題を作成してください。

JSON形式で返してください：
{
  "question": {
    "category": "カテゴリ",
    "subcategory": "${topic}",
    "question": "問題文",
    "choices": ["選択肢1", "選択肢2", "選択肢3", "選択肢4"],
    "correctAnswer": 正解番号,
    "explanation": "段階的学習を意識した解説",
    "difficulty": ${currentDifficulty},
    "concepts": ["関連概念"],
    "progressiveStep": ${i + 1}
  }
}
      `;

      try {
        const response = await aiClient.chat([
          {
            role: 'system',
            content: '段階的学習を支援する問題作成の専門家として、学習者の理解を段階的に深める問題を生成してください。'
          },
          {
            role: 'user',
            content: prompt
          }
        ], {
          temperature: 0.6,
          maxTokens: 1500
        });

        const result = JSON.parse(response.content);
        const question = {
          ...result.question,
          id: `ai_progressive_${Date.now()}_${i}_${Math.random().toString(36).substr(2, 9)}`,
          generatedAt: new Date(),
          aiProvider: 'OpenAI',
          targetWeakness: 'progressive_learning'
        };
        
        questions.push(question);
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));
        logger.error(`段階的問題生成エラー (ステップ ${i + 1})`, err, { step: i + 1, topic, difficulty: currentDifficulty });
      }
    }

    return questions;
  }

  // プライベートメソッド
  private buildWeaknessPrompt(
    weakness: WeaknessAnalysis,
    userLevel: number,
    count: number
  ): string {
    return `
弱点分析結果：
- カテゴリ: ${weakness.category}
- サブカテゴリ: ${weakness.subcategory}
- 誤答率: ${(weakness.errorRate * 100).toFixed(1)}%
- よくある間違い: ${weakness.commonMistakes.join(', ')}
- 概念の欠落: ${weakness.conceptGaps.join(', ')}

ユーザーレベル: ${userLevel}
生成問題数: ${count}

上記の弱点を克服するための宅建試験問題を${count}問生成してください。
特に以下の点に注意してください：

1. よくある間違いを避けるための思考プロセスを促す問題
2. 欠落している概念を理解できる問題
3. 段階的に理解を深められる構成
4. 実際の試験で応用できる実践的な内容

JSON形式で返してください：
{
  "questions": [
    {
      "category": "${weakness.category}",
      "subcategory": "${weakness.subcategory}",
      "question": "問題文",
      "choices": ["選択肢1", "選択肢2", "選択肢3", "選択肢4"],
      "correctAnswer": 正解番号(1-4),
      "explanation": "弱点克服に焦点を当てた詳細解説",
      "difficulty": 難易度(1-5),
      "concepts": ["関連概念1", "関連概念2"],
      "weaknessTarget": "対象となる具体的な弱点"
    }
  ]
}
    `;
  }

  // 問題の品質評価
  async evaluateQuestionQuality(question: GeneratedQuestion): Promise<{
    score: number;
    feedback: string[];
    improvements: string[];
  }> {
    const evaluationPrompt = `
生成された問題を評価してください：

問題: ${question.question}
選択肢: ${question.choices.join(', ')}
正解: ${question.choices[question.correctAnswer - 1]}
解説: ${question.explanation}

評価基準：
1. 問題文の明確性 (1-5)
2. 選択肢の適切性 (1-5)
3. 解説の詳細度 (1-5)
4. 学習効果 (1-5)
5. 実試験との整合性 (1-5)

JSON形式で返してください：
{
  "score": 総合スコア(1-5),
  "feedback": ["良い点1", "良い点2"],
  "improvements": ["改善点1", "改善点2"]
}
    `;

    try {
      const response = await aiClient.chat([
        {
          role: 'system',
          content: '宅建試験問題の品質評価専門家として、客観的で建設的な評価を提供してください。'
        },
        {
          role: 'user',
          content: evaluationPrompt
        }
      ], {
        temperature: 0.3,
        maxTokens: 800
      });

      return JSON.parse(response.content);
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error('問題品質評価エラー', err, { questionId: question.id });
      return {
        score: 3,
        feedback: ['標準的な問題です'],
        improvements: ['より詳細な分析が必要']
      };
    }
  }

  // 問題の改善
  async improveQuestion(
    question: GeneratedQuestion,
    improvements: string[]
  ): Promise<GeneratedQuestion> {
    const improvementPrompt = `
改善対象の問題：
${JSON.stringify(question, null, 2)}

改善要求：
${improvements.join('\n')}

上記の改善要求に基づいて、問題を改善してください。
改善された問題をJSON形式で返してください：

{
  "question": {
    "category": "カテゴリ",
    "subcategory": "サブカテゴリ",
    "question": "改善された問題文",
    "choices": ["改善された選択肢1", "選択肢2", "選択肢3", "選択肢4"],
    "correctAnswer": 正解番号,
    "explanation": "改善された解説",
    "difficulty": 難易度,
    "concepts": ["関連概念"],
    "improvements": ["適用した改善点1", "改善点2"]
  }
}
    `;

    try {
      const response = await aiClient.chat([
        {
          role: 'system',
          content: '問題改善の専門家として、指摘された点を的確に改善してください。'
        },
        {
          role: 'user',
          content: improvementPrompt
        }
      ], {
        temperature: 0.5,
        maxTokens: 1500
      });

      const result = JSON.parse(response.content);
      
      return {
        ...result.question,
        id: `${question.id}_improved`,
        generatedAt: new Date(),
        aiProvider: question.aiProvider,
        targetWeakness: question.targetWeakness
      };

    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error('問題改善エラー', err, { questionId: question.id });
      return question; // 改善に失敗した場合は元の問題を返す
    }
  }

  // 類似問題の生成
  async generateSimilarQuestions(
    baseQuestion: GeneratedQuestion,
    variations: number = 3
  ): Promise<GeneratedQuestion[]> {
    const prompt = `
ベース問題：
${JSON.stringify(baseQuestion, null, 2)}

上記の問題をベースに、同じ概念を異なる角度から問う類似問題を${variations}問生成してください。

要件：
1. 同じ法的概念を扱う
2. 異なる事例や状況設定
3. 同程度の難易度
4. 理解を深める多角的なアプローチ

JSON形式で返してください：
{
  "questions": [
    {
      "category": "${baseQuestion.category}",
      "subcategory": "${baseQuestion.subcategory}",
      "question": "類似問題文",
      "choices": ["選択肢1", "選択肢2", "選択肢3", "選択肢4"],
      "correctAnswer": 正解番号,
      "explanation": "解説",
      "difficulty": ${baseQuestion.difficulty},
      "concepts": ${JSON.stringify(baseQuestion.concepts)},
      "variationType": "類似問題の種類"
    }
  ]
}
    `;

    try {
      const response = await aiClient.chat([
        {
          role: 'system',
          content: '類似問題作成の専門家として、概念理解を深める多様な問題を生成してください。'
        },
        {
          role: 'user',
          content: prompt
        }
      ], {
        temperature: 0.8,
        maxTokens: 2000
      });

      const result = JSON.parse(response.content) as { questions: Partial<GeneratedQuestion>[] };
      
      return result.questions.map((q, index: number) => ({
        ...q,
        id: `${baseQuestion.id}_similar_${index + 1}`,
        generatedAt: new Date(),
        aiProvider: baseQuestion.aiProvider,
        targetWeakness: baseQuestion.targetWeakness
      })) as GeneratedQuestion[];

    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error('類似問題生成エラー', err, { baseQuestionId: baseQuestion.id });
      return [];
    }
  }

  // 生成された問題の取得
  getGeneratedQuestion(id: string): GeneratedQuestion | undefined {
    return this.generatedQuestions.get(id);
  }

  // 生成された問題の一覧取得
  getAllGeneratedQuestions(): GeneratedQuestion[] {
    return Array.from(this.generatedQuestions.values());
  }

  // 問題キャッシュのクリア
  clearQuestionCache(): void {
    this.generatedQuestions.clear();
  }

  // 適応型設定の更新
  updateAdaptiveConfig(config: Partial<AdaptiveQuestionConfig>): void {
    this.adaptiveConfig = { ...this.adaptiveConfig, ...config };
  }
}

export const aiQuestionGenerator = new AIQuestionGeneratorService();
