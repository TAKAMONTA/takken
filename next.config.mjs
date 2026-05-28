/** @type {import('next').NextConfig} */
const nextConfig = {
  outputFileTracingRoot: process.cwd(),
  serverExternalPackages: ["firebase-admin"],
  // ビルドモード切り替え:
  // - Vercel (Web): サーバーモード (API Routes有効)
  // - Capacitor (iOS): 静的エクスポート (CAPACITOR_BUILD=true で有効化)
  ...(process.env.CAPACITOR_BUILD ? { output: "export" } : {}),
  
  // trailingSlash: true, // API Routes使用時は通常false
  images: {
    unoptimized: true, // API Routes使用時は最適化を有効化可能
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
  // Environment variables for client-side
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
  // 本番環境では console.log を除去（error/warn は残す）
  compiler: {
    removeConsole: process.env.NODE_ENV === "production"
      ? { exclude: ["error", "warn"] }
      : false,
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
