/**
 * AI Client - 統一実装への再エクスポート
 * 
 * ⚠️ このファイルは後方互換性のため残されています。
 * 新しいコードでは `lib/ai-client-unified.ts` を直接使用することを推奨します。
 * 
 * このファイルは内部で `lib/ai-client-unified.ts` を使用しており、
 * 静的エクスポート環境でも安全に動作します。
 * 
 * 既存の `import { aiClient } from '@/lib/ai-client'` は引き続き動作します。
 */

// 統一実装を再エクスポート
export {
  aiClient,
  UnifiedAIClient,
} from './ai-client-unified';

// 型定義の再エクスポート（後方互換性のため）
export type { ChatMessage, AIClientOptions, AIResponse } from './ai-client-unified';
