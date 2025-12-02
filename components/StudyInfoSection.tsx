'use client';

import { useState, useEffect } from 'react';
import { aiClient } from '@/lib/ai-client';
import { logger } from '@/lib/logger';
import { UserProfile } from '@/lib/types';
import type { UserProfile as UserProfileType } from '@/lib/types';

interface StudyInfo {
  title: string;
  content: string;
  category: 'tip' | 'strategy' | 'motivation' | 'reminder';
  icon: string;
}

interface StudyInfoSectionProps {
  user?: UserProfile | null;
}

export default function StudyInfoSection({ user }: StudyInfoSectionProps) {
  const [studyInfo, setStudyInfo] = useState<StudyInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStudyInfo = async () => {
      try {
        setLoading(true);
        setError(null);

        // キャッシュをチェック（30分間有効）
        const cacheKey = 'study_info_cache';
        const cacheData = localStorage.getItem(cacheKey);
        if (cacheData) {
          const { data, timestamp } = JSON.parse(cacheData);
          const cacheAge = Date.now() - timestamp;
          if (cacheAge < 30 * 60 * 1000) { // 30分
            setStudyInfo(data);
            setLoading(false);
            return;
          }
        }

        // ユーザーの学習状況を分析
        const streak = user?.streak?.currentStreak || 0;
        const totalQuestions = user?.progress?.totalQuestions || user?.totalStats?.totalQuestions || 0;
        const correctAnswers = user?.progress?.correctAnswers || user?.totalStats?.totalCorrect || 0;
        // weakAreasは暫定的に空配列（将来的に実装）
        const weakAreas: string[] = [];
        const recentPerformance = 0; // 暫定的に0（将来的に実装）

        // AI プロンプトを作成
        const prompt = `あなたは宅建試験の学習アドバイザーです。以下の学習者の状況に基づいて、具体的で実践的な学習アドバイスを1つ提供してください。

学習者の状況:
- 連続学習日数: ${streak}日
- 解答問題数: ${totalQuestions}問
- 正答率: ${totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0}%
- 最近の成績: ${recentPerformance > 0 ? `${recentPerformance}%` : 'データなし'}
- 苦手分野: ${weakAreas.length > 0 ? weakAreas.join('、') : '特定されていません'}

以下の形式でJSON形式で回答してください:
{
  "title": "アドバイスのタイトル（30文字以内）",
  "content": "具体的なアドバイス内容（150文字程度）",
  "category": "tip または strategy または motivation または reminder",
  "icon": "適切な絵文字（1つ）"
}

注意事項:
- 学習者の状況に合わせた個別のアドバイスを提供してください
- 実践的で具体的な内容にしてください
- 励ましの言葉も含めてください
- JSON形式のみを返答してください（説明文は不要）`;

        // AI APIを呼び出し（クライアント側で直接呼び出し）
        const response = await aiClient.chat([
          {
            role: 'system',
            content: 'あなたは宅建試験の学習アドバイザーです。学習者の状況に基づいて、実践的で具体的なアドバイスをJSON形式で提供してください。',
          },
          {
            role: 'user',
            content: prompt,
          },
        ], {
          temperature: 0.8,
          maxTokens: 300,
        });

        // レスポンスをパース
        let parsedInfo: StudyInfo;
        try {
          // JSON形式のレスポンスを抽出
          const content = response.content.trim();
          const jsonMatch = content.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            parsedInfo = JSON.parse(jsonMatch[0]);
          } else {
            // JSONが見つからない場合はフォールバック
            throw new Error('JSON形式が見つかりません');
          }
        } catch (parseError) {
          const err = parseError instanceof Error ? parseError : new Error(String(parseError));
          logger.warn('AI response parsing failed, using fallback', { 
            error: err.message 
          });
          // フォールバック: 一般的なアドバイス
          parsedInfo = generateFallbackInfo(streak, totalQuestions, weakAreas);
        }

        setStudyInfo(parsedInfo);

        // キャッシュに保存
        localStorage.setItem(cacheKey, JSON.stringify({
          data: parsedInfo,
          timestamp: Date.now(),
        }));

      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        logger.error('Failed to fetch study info', error);
        setError('学習情報の取得に失敗しました');
        
        // エラー時はフォールバック情報を表示
        const fallbackInfo = generateFallbackInfo(
          user?.streak?.currentStreak || 0,
          user?.progress?.totalQuestions || user?.totalStats?.totalQuestions || 0,
          [] // weakAreasは暫定的に空配列
        );
        setStudyInfo(fallbackInfo);
      } finally {
        setLoading(false);
      }
    };

    fetchStudyInfo();
  }, [user]);

  const getCategoryStyle = (category: StudyInfo['category']) => {
    switch (category) {
      case 'tip':
        return 'bg-blue-50 border-blue-200 text-blue-800';
      case 'strategy':
        return 'bg-purple-50 border-purple-200 text-purple-800';
      case 'motivation':
        return 'bg-orange-50 border-orange-200 text-orange-800';
      case 'reminder':
        return 'bg-green-50 border-green-200 text-green-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  if (loading && !studyInfo) {
    return (
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg border border-gray-200">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-2xl">💡</span>
          <h3 className="font-semibold text-gray-800">宅建試験の学習に役立つ情報</h3>
        </div>
        <div className="text-sm text-gray-600">
          <div className="animate-pulse">情報を取得中...</div>
        </div>
      </div>
    );
  }

  if (error && !studyInfo) {
    return null; // エラー時は何も表示しない（既にフォールバックが表示されている）
  }

  if (!studyInfo) {
    return null;
  }

  return (
    <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg border border-gray-200">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-2xl">{studyInfo.icon || '💡'}</span>
        <h3 className="font-semibold text-gray-800">宅建試験の学習に役立つ情報</h3>
      </div>
      
      <div className={`rounded-lg p-4 border ${getCategoryStyle(studyInfo.category)}`}>
        <h4 className="font-medium mb-2">{studyInfo.title}</h4>
        <p className="text-sm leading-relaxed">{studyInfo.content}</p>
      </div>

      {error && (
        <p className="text-xs text-gray-500 mt-2">
          ※ 最新情報の取得に失敗しましたが、キャッシュから情報を表示しています
        </p>
      )}
    </div>
  );
}

// フォールバック情報の生成（AI APIが使えない場合）
function generateFallbackInfo(
  streak: number,
  totalQuestions: number,
  weakAreas: string[]
): StudyInfo {
  const tips = [
    {
      title: '継続は力なり',
      content: streak > 0 
        ? `${streak}日連続学習、素晴らしいですね！毎日少しずつでも学習を続けることで、知識が定着します。今日も頑張りましょう！`
        : '今日から新しいスタートです。短時間でも毎日学習することで、効果的に知識を身につけられます。',
      category: 'motivation' as const,
      icon: '🌟',
    },
    {
      title: '苦手分野の克服',
      content: weakAreas.length > 0
        ? `苦手分野「${weakAreas[0]}」を重点的に学習しましょう。基礎から丁寧に理解を深めることで、着実に実力が向上します。`
        : '定期的に復習を行うことで、苦手分野を早期に発見し、対策を立てることができます。',
      category: 'strategy' as const,
      icon: '🎯',
    },
    {
      title: '効果的な学習方法',
      content: totalQuestions > 0
        ? '問題を解いた後は、正解・不正解に関わらず解説をしっかり読み、理解を深めましょう。特に間違えた問題は、後日再チャレンジすることで記憶が定着します。'
        : 'まずは基本的な問題から始めて、徐々に難易度を上げていきましょう。焦らず着実に進めることが大切です。',
      category: 'tip' as const,
      icon: '📚',
    },
    {
      title: '復習のタイミング',
      content: 'エビングハウスの忘却曲線によると、学習後24時間以内に復習すると記憶の定着率が高まります。今日学んだ内容は、明日もう一度確認してみましょう。',
      category: 'reminder' as const,
      icon: '🔄',
    },
  ];

  // 状況に応じたアドバイスを選択
  let selectedTip;
  if (streak === 0) {
    selectedTip = tips[0]; // 継続の重要性
  } else if (weakAreas.length > 0) {
    selectedTip = tips[1]; // 苦手分野の克服
  } else if (totalQuestions > 50) {
    selectedTip = tips[3]; // 復習のタイミング
  } else {
    selectedTip = tips[2]; // 効果的な学習方法
  }

  return selectedTip;
}

