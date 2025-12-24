#!/usr/bin/env ts-node

/**
 * Stripe Webhookイベント確認スクリプト
 * 
 * このスクリプトは、Stripe APIを使用してWebhookイベントの履歴を確認します。
 * 
 * 使用方法:
 * npx ts-node scripts/check-stripe-webhook-events.ts [limit]
 * 
 * パラメータ:
 * - limit: 取得するイベント数（デフォルト: 10）
 */

import Stripe from 'stripe';
import * as dotenv from 'dotenv';
import * as path from 'path';

// .env.localを読み込む
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

// Stripe初期化
function initializeStripe(): Stripe {
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
  
  if (!stripeSecretKey) {
    console.error('❌ STRIPE_SECRET_KEY が設定されていません');
    console.error('');
    console.error('.env.local に以下の形式で設定してください:');
    console.error('STRIPE_SECRET_KEY=sk_live_xxx または sk_test_xxx');
    process.exit(1);
  }

  const stripe = new Stripe(stripeSecretKey, {
    apiVersion: '2025-07-30.basil',
  });

  console.log('✅ Stripe初期化完了');
  
  // テストモードか本番モードかを表示
  if (stripeSecretKey.startsWith('sk_test_')) {
    console.log('⚠️  テストモードで動作中');
  } else if (stripeSecretKey.startsWith('sk_live_')) {
    console.log('🚀 本番モードで動作中');
  }
  
  return stripe;
}

// イベントタイプの日本語名を取得
function getEventTypeLabel(type: string): string {
  const eventLabels: { [key: string]: string } = {
    'checkout.session.completed': '決済完了',
    'customer.subscription.created': 'サブスクリプション作成',
    'customer.subscription.updated': 'サブスクリプション更新',
    'customer.subscription.deleted': 'サブスクリプション削除',
    'invoice.paid': '請求書支払い完了',
    'invoice.payment_failed': '請求書支払い失敗',
    'payment_intent.succeeded': '支払い成功',
    'payment_intent.payment_failed': '支払い失敗',
  };
  
  return eventLabels[type] || type;
}

// イベントの詳細をフォーマット
function formatEventDetails(event: Stripe.Event) {
  console.log('\n' + '='.repeat(80));
  console.log(`📋 イベント: ${event.type} (${getEventTypeLabel(event.type)})`);
  console.log('='.repeat(80));
  console.log(`ID: ${event.id}`);
  console.log(`作成日時: ${new Date(event.created * 1000).toLocaleString('ja-JP')}`);
  console.log(`Livemode: ${event.livemode ? '本番' : 'テスト'}`);
  
  // イベントタイプに応じて詳細情報を表示
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    console.log('\n💳 Checkoutセッション情報:');
    console.log(`  セッションID: ${session.id}`);
    console.log(`  支払い状態: ${session.payment_status}`);
    console.log(`  金額: ¥${session.amount_total ? session.amount_total / 100 : 0}`);
    console.log(`  カスタマーID: ${session.customer || '未設定'}`);
    console.log(`  サブスクリプションID: ${session.subscription || '未設定'}`);
    
    if (session.metadata) {
      console.log('\n  メタデータ:');
      Object.entries(session.metadata).forEach(([key, value]) => {
        console.log(`    ${key}: ${value}`);
      });
    }
  } else if (event.type === 'customer.subscription.updated' || event.type === 'customer.subscription.deleted') {
    const subscription = event.data.object as Stripe.Subscription;
    console.log('\n📋 サブスクリプション情報:');
    console.log(`  サブスクリプションID: ${subscription.id}`);
    console.log(`  カスタマーID: ${subscription.customer}`);
    console.log(`  ステータス: ${subscription.status}`);
    console.log(`  開始日: ${new Date(subscription.current_period_start * 1000).toLocaleString('ja-JP')}`);
    console.log(`  終了日: ${new Date(subscription.current_period_end * 1000).toLocaleString('ja-JP')}`);
    console.log(`  期間終了時にキャンセル: ${subscription.cancel_at_period_end ? 'はい' : 'いいえ'}`);
  }
}

// Webhookエンドポイントの情報を取得
async function checkWebhookEndpoints(stripe: Stripe) {
  console.log('\n' + '='.repeat(80));
  console.log('🔗 Webhookエンドポイント設定');
  console.log('='.repeat(80));
  
  try {
    const endpoints = await stripe.webhookEndpoints.list({ limit: 10 });
    
    if (endpoints.data.length === 0) {
      console.log('❌ Webhookエンドポイントが設定されていません');
      console.log('\n💡 設定方法:');
      console.log('  1. https://dashboard.stripe.com/webhooks にアクセス');
      console.log('  2. "送信先を追加する" をクリック');
      console.log('  3. エンドポイントURL: https://takken-study.com/api/subscription/webhook');
      console.log('  4. イベントを選択:');
      console.log('     - checkout.session.completed');
      console.log('     - customer.subscription.updated');
      console.log('     - customer.subscription.deleted');
      return;
    }
    
    console.log(`✅ ${endpoints.data.length}個のWebhookエンドポイントが設定されています\n`);
    
    endpoints.data.forEach((endpoint, index) => {
      console.log(`\n${index + 1}. ${endpoint.url}`);
      console.log(`   ステータス: ${endpoint.status}`);
      console.log(`   説明: ${endpoint.description || '（説明なし）'}`);
      console.log(`   登録イベント: ${endpoint.enabled_events.length}個`);
      endpoint.enabled_events.forEach(eventType => {
        const label = getEventTypeLabel(eventType);
        const indicator = ['checkout.session.completed', 'customer.subscription.updated', 'customer.subscription.deleted'].includes(eventType) ? '✅' : '  ';
        console.log(`     ${indicator} ${eventType}${label !== eventType ? ` (${label})` : ''}`);
      });
    });
    
  } catch (error) {
    console.error('❌ Webhookエンドポイントの取得に失敗しました:', error);
  }
}

// メイン処理
async function main() {
  console.log('🔍 Stripe Webhookイベントを確認中...\n');
  
  const stripe = initializeStripe();
  const args = process.argv.slice(2);
  const limit = parseInt(args[0]) || 10;
  
  try {
    // Webhookエンドポイントの確認
    await checkWebhookEndpoints(stripe);
    
    // 最近のイベントを取得
    console.log('\n' + '='.repeat(80));
    console.log(`📊 最近の${limit}件のイベント`);
    console.log('='.repeat(80));
    
    const events = await stripe.events.list({ limit });
    
    if (events.data.length === 0) {
      console.log('❌ イベントが見つかりません');
      return;
    }
    
    console.log(`\n✅ ${events.data.length}件のイベントが見つかりました\n`);
    
    // Webhook関連のイベントをフィルタリング
    const webhookEvents = events.data.filter(event => 
      event.type === 'checkout.session.completed' ||
      event.type === 'customer.subscription.updated' ||
      event.type === 'customer.subscription.deleted' ||
      event.type === 'customer.subscription.created'
    );
    
    const otherEvents = events.data.filter(event => !webhookEvents.includes(event));
    
    // サマリー表示
    console.log('📋 イベントサマリー:');
    console.log(`  Webhook処理対象イベント: ${webhookEvents.length}件`);
    console.log(`  その他のイベント: ${otherEvents.length}件`);
    
    // Webhook関連イベントの詳細
    if (webhookEvents.length > 0) {
      console.log('\n' + '='.repeat(80));
      console.log('🎯 Webhook処理対象イベント');
      console.log('='.repeat(80));
      
      webhookEvents.forEach(event => {
        formatEventDetails(event);
      });
    }
    
    // その他のイベントの一覧
    if (otherEvents.length > 0) {
      console.log('\n' + '='.repeat(80));
      console.log('📋 その他のイベント（Webhook処理対象外）');
      console.log('='.repeat(80));
      
      otherEvents.forEach(event => {
        const date = new Date(event.created * 1000).toLocaleString('ja-JP');
        console.log(`  - ${event.type} (${getEventTypeLabel(event.type)}) - ${date}`);
      });
    }
    
    console.log('\n' + '='.repeat(80));
    console.log('✅ 確認完了！');
    console.log('='.repeat(80));
    
    // ヒント表示
    if (webhookEvents.length === 0) {
      console.log('\n💡 ヒント:');
      console.log('  Webhook処理対象のイベントが見つかりません。');
      console.log('  テスト決済を実行してイベントを生成してください。');
      console.log('  ');
      console.log('  テストカード情報:');
      console.log('    カード番号: 4242 4242 4242 4242');
      console.log('    有効期限: 任意の未来の日付（例: 12/25）');
      console.log('    CVC: 任意の3桁（例: 123）');
    }
    
  } catch (error) {
    console.error('\n❌ エラーが発生しました:', error);
    process.exit(1);
  }
}

// スクリプト実行
if (require.main === module) {
  main().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}



