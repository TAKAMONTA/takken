#!/bin/bash

# Firebase Functions デプロイメントスクリプト
# Windows環境でも動作するようにPowerShell版も提供

echo "🚀 Firebase Functions デプロイメント開始"

# 環境変数の確認
echo "📋 環境変数チェック..."
if [ -z "$OPENAI_API_KEY" ] && [ -z "$ANTHROPIC_API_KEY" ] && [ -z "$GOOGLE_AI_API_KEY" ]; then
    echo "❌ AI APIキーが設定されていません"
    echo "以下のいずれかを設定してください:"
    echo "  - OPENAI_API_KEY"
    echo "  - ANTHROPIC_API_KEY" 
    echo "  - GOOGLE_AI_API_KEY"
    exit 1
fi

# Functions ディレクトリの確認
if [ ! -d "functions" ]; then
    echo "❌ functions ディレクトリが見つかりません"
    exit 1
fi

# Functions の依存関係インストール
echo "📦 Functions 依存関係をインストール中..."
cd ../../functions
npm install

if [ $? -ne 0 ]; then
    echo "❌ 依存関係のインストールに失敗しました"
    exit 1
fi

# TypeScript ビルド
echo "🔨 TypeScript ビルド中..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ TypeScript ビルドに失敗しました"
    exit 1
fi

cd ..

# Firebase プロジェクトの確認
echo "🔍 Firebase プロジェクトを確認中..."
firebase projects:list

# 環境変数をFirebase Functions Configに設定
echo "⚙️ 環境変数を設定中..."

if [ ! -z "$OPENAI_API_KEY" ]; then
    firebase functions:config:set openai.api_key="$OPENAI_API_KEY"
    echo "✅ OpenAI API キーを設定しました"
fi

if [ ! -z "$ANTHROPIC_API_KEY" ]; then
    firebase functions:config:set anthropic.api_key="$ANTHROPIC_API_KEY"
    echo "✅ Anthropic API キーを設定しました"
fi

if [ ! -z "$GOOGLE_AI_API_KEY" ]; then
    firebase functions:config:set google_ai.api_key="$GOOGLE_AI_API_KEY"
    echo "✅ Google AI API キーを設定しました"
fi

# Functions のデプロイ
echo "🚀 Firebase Functions をデプロイ中..."
firebase deploy --only functions

if [ $? -eq 0 ]; then
    echo "✅ Firebase Functions デプロイ完了！"
    echo ""
    echo "📋 デプロイされたFunctions:"
    echo "  - aiChat"
    echo "  - aiExplanation" 
    echo "  - aiMotivation"
    echo "  - aiRecommendations"
    echo ""
    echo "🧪 テストを実行するには:"
    echo "  npm run test:functions"
    echo ""
    echo "📊 ログを確認するには:"
    echo "  firebase functions:log"
else
    echo "❌ Firebase Functions デプロイに失敗しました"
    exit 1
fi
