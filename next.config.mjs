/** @type {import('next').NextConfig} */
const nextConfig = {
  // API Routesを有効化するため、静的エクスポートを無効化
  // ⚠️ 重要: API Routes (app/api/*) を使用するには、Node.jsサーバーが必要です
  // 
  // デプロイオプション:
  // 1. Vercel (推奨) - Next.jsのAPI Routesを完全サポート
  // 2. Node.jsサーバー (自前ホスティング)
  // 3. Firebase Hosting + Firebase Functions - APIロジックをFunctionsに移行
  //
  // 注意: Firebase HostingのみではAPI Routesは動作しません
  // output: "export" を削除したため、静的エクスポートは無効化されています
  
  // trailingSlash: true, // API Routes使用時は通常false
  images: {
    unoptimized: false, // API Routes使用時は最適化を有効化可能
  },
  typescript: {
    ignoreBuildErrors: false, // 型エラーは表示するが、ビルドを継続
    // functionsディレクトリを型チェックから除外
    tsconfigPath: './tsconfig.json',
  },
  // ビルド時のエラーメッセージを詳細に表示
  // onDemandEntries は開発サーバー専用の設定
  webpack: (config, { isServer, webpack }) => {
    // ビルド時のエラー詳細を取得するため、エラーハンドリングを改善
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    
    
    // エラーの詳細を表示
    config.stats = {
      ...config.stats,
      errorDetails: true,
      errorStack: true,
      moduleTrace: true,
      colors: true,
    };
    
    // プラグインでエラーハンドリングを追加
    config.plugins.push(
      new webpack.DefinePlugin({
        'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'production'),
      })
    );
    
    // エラーハンドラーを追加
    config.infrastructureLogging = {
      level: 'error',
    };
    
    return config;
  },
  // Enable experimental features for better PWA support
  experimental: {
    serverComponentsExternalPackages: ["firebase-admin"],
  },
  // Environment variables for client-side
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
  // 本番環境でのconsole.logを無効化（デバッグ中は無効化）
  // TODO: デバッグ完了後、本番環境では再度有効化を検討
  compiler: {
    removeConsole: false, // デバッグのため一時的に無効化
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

// PWA configuration
// API Routesを有効化したため、PWA機能も使用可能
// next-pwa を使用する場合は、package.jsonに追加して設定してください
// 現在はPWA機能は手動実装（Service Worker等）を使用

export default nextConfig;
