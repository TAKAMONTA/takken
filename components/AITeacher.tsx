"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  aiTeacherService,
  AITeacherMessage,
  UserContext,
} from "@/lib/ai-teacher-messages";

interface AITeacherProps {
  userContext: UserContext;
  className?: string;
  style?: React.CSSProperties;
}

export default function AITeacher({
  userContext,
  className = "",
  style,
}: AITeacherProps) {
  const [message, setMessage] = useState<AITeacherMessage | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showTeacher, setShowTeacher] = useState(false);

  useEffect(() => {
    const generateMessage = async () => {
      try {
        setIsLoading(true);
        const generatedMessage = await aiTeacherService.generateMessage(
          userContext
        );
        setMessage(generatedMessage);

        // アニメーション用の遅延
        setTimeout(() => {
          setShowTeacher(true);
        }, 500);
      } catch (error) {
        console.error("Failed to generate AI teacher message:", error);
        // フォールバックメッセージ
        setMessage({
          type: "greeting",
          message: "こんにちは！今日も一緒に宅建の勉強を頑張りましょう！",
          actionText: "学習を始める",
          actionRoute: "/practice",
        });
        setShowTeacher(true);
      } finally {
        setIsLoading(false);
      }
    };

    generateMessage();
  }, [userContext]);

  const handleTeacherClick = () => {
    setIsExpanded(!isExpanded);
  };

  const getMessageTypeColor = (type: string) => {
    switch (type) {
      case "greeting":
        return "bg-blue-50 border-blue-200";
      case "encouragement":
        return "bg-green-50 border-green-200";
      case "advice":
        return "bg-yellow-50 border-yellow-200";
      case "garden":
        return "bg-green-50 border-green-200";
      case "reminder":
        return "bg-orange-50 border-orange-200";
      default:
        return "bg-gray-50 border-gray-200";
    }
  };

  const getMessageTypeIcon = (type: string) => {
    switch (type) {
      case "greeting":
        return "👋";
      case "encouragement":
        return "💪";
      case "advice":
        return "💡";
      case "garden":
        return "🌱";
      case "reminder":
        return "⏰";
      default:
        return "📚";
    }
  };

  if (isLoading) {
    return (
      <div className={`${className}`}>
        <div className="card-minimal animate-pulse">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gray-200 rounded-full"></div>
            <div className="flex-1">
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-3/4"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!message) return null;

  return (
    <div
      className={`${className} transition-all duration-500 ${
        showTeacher ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
      }`}
      style={style}
    >
      <div
        className={`card-minimal ${getMessageTypeColor(
          message.type
        )} relative overflow-hidden`}
      >
        {/* AI先生のイラスト部分 */}
        <div className="flex items-start space-x-4">
          <div
            className="flex-shrink-0 cursor-pointer transition-transform hover:scale-105"
            onClick={handleTeacherClick}
          >
            <div className="relative">
              {/* AI先生のアバター（画像の代わりに絵文字とアイコンで表現） */}
              <div className="w-16 h-16 bg-white rounded-full border-2 border-gray-200 flex items-center justify-center shadow-sm">
                <div className="text-2xl">👩‍🏫</div>
              </div>
              {/* メッセージタイプのアイコン */}
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-white rounded-full border border-gray-200 flex items-center justify-center text-xs">
                {getMessageTypeIcon(message.type)}
              </div>
            </div>
          </div>

          {/* メッセージ部分 */}
          <div className="flex-1 min-w-0">
            <div className="relative">
              {/* 吹き出しの三角形 */}
              <div className="absolute -left-2 top-3 w-0 h-0 border-t-4 border-t-transparent border-b-4 border-b-transparent border-r-4 border-r-white"></div>

              {/* メッセージ内容 */}
              <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-100">
                <p className="text-sm text-gray-800 leading-relaxed">
                  {message.message}
                </p>

                {/* アクションボタン */}
                {message.actionText && message.actionRoute && (
                  <div className="mt-3 pt-2 border-t border-gray-100">
                    <Link href={message.actionRoute}>
                      <button className="text-xs bg-blue-500 text-white px-3 py-1.5 rounded-full hover:bg-blue-600 transition-colors">
                        {message.actionText}
                      </button>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 展開時の追加情報 */}
        {isExpanded && (
          <div className="mt-4 pt-4 border-t border-gray-200 animate-fadeIn">
            <div className="text-xs text-gray-600 space-y-2">
              <div className="flex items-center justify-between">
                <span>メッセージタイプ:</span>
                <span className="font-medium">{message.type}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>学習状況:</span>
                <span className="font-medium">{userContext.streak}日連続</span>
              </div>
              <div className="flex items-center justify-between">
                <span>精霊レベル:</span>
                <span className="font-medium">Lv.{userContext.petLevel}</span>
              </div>
            </div>

            {/* 追加アクション */}
            <div className="mt-3 flex space-x-2">
              <Link href="/stats">
                <button className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded hover:bg-gray-200 transition-colors">
                  進捗確認
                </button>
              </Link>
              <Link href="/plant-garden">
                <button className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded hover:bg-green-200 transition-colors">
                  🌱 庭園
                </button>
              </Link>
            </div>
          </div>
        )}

        {/* クリックヒント */}
        <div className="absolute top-2 right-2">
          <div className="text-xs text-gray-400 opacity-50">
            {isExpanded ? "▼" : "▶"}
          </div>
        </div>
      </div>
    </div>
  );
}

// アニメーション用のCSS（globals.cssに追加する必要があります）
export const aiTeacherStyles = `
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fadeIn {
  animation: fadeIn 0.3s ease-out;
}
`;
