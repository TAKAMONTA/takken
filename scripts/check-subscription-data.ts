#!/usr/bin/env ts-node

/**
 * Firestore サブスクリプションデータ確認スクリプト
 * 
 * このスクリプトは、Firestoreに保存されているサブスクリプションデータを確認します。
 * 
 * 使用方法:
 * npx ts-node scripts/check-subscription-data.ts [userId]
 * 
 * パラメータなしで実行すると、全ユーザーのサブスクリプションを表示します。
 */

import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import * as dotenv from 'dotenv';
import * as path from 'path';

// .env.localを読み込む
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

// Firebase Admin SDK初期化
function initializeFirebase() {
  if (getApps().length > 0) {
    return getFirestore();
  }

  const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  
  if (!serviceAccountKey) {
    console.error('❌ FIREBASE_SERVICE_ACCOUNT_KEY が設定されていません');
    console.error('');
    console.error('.env.local に以下の形式で設定してください:');
    console.error('FIREBASE_SERVICE_ACCOUNT_KEY=\'{"type":"service_account",...}\'');
    process.exit(1);
  }

  try {
    let serviceAccount;
    
    // BASE64エンコードされている場合はデコード
    if (!serviceAccountKey.trim().startsWith('{')) {
      console.log('🔓 BASE64エンコードされたキーをデコード中...');
      const decoded = Buffer.from(serviceAccountKey, 'base64').toString('utf-8');
      serviceAccount = JSON.parse(decoded);
    } else {
      // 通常のJSON文字列
      serviceAccount = JSON.parse(serviceAccountKey);
    }
    
    initializeApp({
      credential: cert(serviceAccount),
    });

    console.log('✅ Firebase Admin SDK初期化完了');
    return getFirestore();
  } catch (error) {
    console.error('❌ Firebase Admin SDK初期化エラー:', error);
    process.exit(1);
  }
}

// サブスクリプションデータをフォーマット
function formatSubscriptionData(userId: string, data: any) {
  console.log('\n' + '='.repeat(80));
  console.log(`👤 ユーザーID: ${userId}`);
  console.log('='.repeat(80));
  
  console.log('\n📋 基本情報:');
  console.log(`  プラン: ${data.plan || data.planId || '未設定'}`);
  console.log(`  ステータス: ${data.status || '未設定'}`);
  console.log(`  自動更新: ${data.autoRenew !== undefined ? (data.autoRenew ? '有効' : '無効') : '未設定'}`);
  
  console.log('\n💳 Stripe情報:');
  console.log(`  サブスクリプションID: ${data.stripeSubscriptionId || '未設定'}`);
  console.log(`  カスタマーID: ${data.stripeCustomerId || '未設定'}`);
  console.log(`  期間終了時にキャンセル: ${data.cancelAtPeriodEnd !== undefined ? (data.cancelAtPeriodEnd ? 'はい' : 'いいえ') : '未設定'}`);
  
  console.log('\n📅 期間情報:');
  if (data.currentPeriodStart) {
    const start = data.currentPeriodStart.toDate ? data.currentPeriodStart.toDate() : new Date(data.currentPeriodStart);
    console.log(`  開始日: ${start.toLocaleString('ja-JP')}`);
  } else if (data.startDate) {
    const start = data.startDate.toDate ? data.startDate.toDate() : new Date(data.startDate);
    console.log(`  開始日: ${start.toLocaleString('ja-JP')}`);
  }
  
  if (data.currentPeriodEnd) {
    const end = data.currentPeriodEnd.toDate ? data.currentPeriodEnd.toDate() : new Date(data.currentPeriodEnd);
    console.log(`  終了日: ${end.toLocaleString('ja-JP')}`);
    
    const now = new Date();
    const daysLeft = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    if (daysLeft > 0) {
      console.log(`  残り日数: ${daysLeft}日`);
    } else {
      console.log(`  残り日数: 期限切れ（${Math.abs(daysLeft)}日前）`);
    }
  } else if (data.endDate) {
    const end = data.endDate.toDate ? data.endDate.toDate() : new Date(data.endDate);
    console.log(`  終了日: ${end.toLocaleString('ja-JP')}`);
  }
  
  console.log('\n🕐 タイムスタンプ:');
  if (data.createdAt) {
    const created = data.createdAt.toDate ? data.createdAt.toDate() : new Date(data.createdAt);
    console.log(`  作成日時: ${created.toLocaleString('ja-JP')}`);
  }
  if (data.updatedAt) {
    const updated = data.updatedAt.toDate ? data.updatedAt.toDate() : new Date(data.updatedAt);
    console.log(`  更新日時: ${updated.toLocaleString('ja-JP')}`);
  }
  
  // 追加のメタデータがあれば表示
  const knownFields = [
    'userId', 'plan', 'planId', 'status', 'stripeSubscriptionId', 
    'stripeCustomerId', 'currentPeriodStart', 'currentPeriodEnd',
    'startDate', 'endDate', 'cancelAtPeriodEnd', 'autoRenew',
    'createdAt', 'updatedAt'
  ];
  
  const additionalFields = Object.keys(data).filter(key => !knownFields.includes(key));
  if (additionalFields.length > 0) {
    console.log('\n📦 その他のフィールド:');
    additionalFields.forEach(key => {
      console.log(`  ${key}: ${JSON.stringify(data[key])}`);
    });
  }
}

// メイン処理
async function main() {
  console.log('🔍 Firestoreサブスクリプションデータを確認中...\n');
  
  const db = initializeFirebase();
  const args = process.argv.slice(2);
  const targetUserId = args[0];
  
  try {
    if (targetUserId) {
      // 特定のユーザーのデータを取得
      console.log(`📌 対象ユーザー: ${targetUserId}`);
      
      const docRef = db.collection('subscriptions').doc(targetUserId);
      const doc = await docRef.get();
      
      if (!doc.exists) {
        console.log(`\n❌ ユーザー "${targetUserId}" のサブスクリプションデータが見つかりません`);
        console.log('\n💡 ヒント:');
        console.log('  - ユーザーIDが正しいか確認してください');
        console.log('  - 決済が完了しているか確認してください');
        console.log('  - Webhookが正常に動作しているか確認してください');
        process.exit(1);
      }
      
      formatSubscriptionData(targetUserId, doc.data());
      
    } else {
      // 全ユーザーのデータを取得
      console.log('📋 全ユーザーのサブスクリプションデータを取得中...\n');
      
      const snapshot = await db.collection('subscriptions').get();
      
      if (snapshot.empty) {
        console.log('❌ サブスクリプションデータが見つかりません');
        console.log('\n💡 ヒント:');
        console.log('  - まだ誰も決済を完了していない可能性があります');
        console.log('  - Webhookが正常に動作しているか確認してください');
        process.exit(1);
      }
      
      console.log(`✅ ${snapshot.size}件のサブスクリプションが見つかりました\n`);
      
      // プレミアムユーザーと無料ユーザーを分類
      const premiumUsers: Array<{ id: string; data: any }> = [];
      const freeUsers: Array<{ id: string; data: any }> = [];
      const otherUsers: Array<{ id: string; data: any }> = [];
      
      snapshot.forEach(doc => {
        const data = doc.data();
        const plan = data.plan || data.planId;
        
        if (plan === 'premium' && data.status === 'active') {
          premiumUsers.push({ id: doc.id, data });
        } else if (plan === 'free' || !plan) {
          freeUsers.push({ id: doc.id, data });
        } else {
          otherUsers.push({ id: doc.id, data });
        }
      });
      
      // サマリー表示
      console.log('📊 サマリー:');
      console.log(`  🌟 アクティブなプレミアムユーザー: ${premiumUsers.length}人`);
      console.log(`  🆓 無料ユーザー: ${freeUsers.length}人`);
      console.log(`  ⚠️  その他（期限切れ・キャンセル済み等）: ${otherUsers.length}人`);
      
      // プレミアムユーザーの詳細
      if (premiumUsers.length > 0) {
        console.log('\n' + '='.repeat(80));
        console.log('🌟 アクティブなプレミアムユーザー');
        console.log('='.repeat(80));
        premiumUsers.forEach(user => {
          formatSubscriptionData(user.id, user.data);
        });
      }
      
      // その他のユーザー
      if (otherUsers.length > 0) {
        console.log('\n' + '='.repeat(80));
        console.log('⚠️ その他のユーザー（期限切れ・キャンセル済み等）');
        console.log('='.repeat(80));
        otherUsers.forEach(user => {
          formatSubscriptionData(user.id, user.data);
        });
      }
      
      // 無料ユーザーは件数のみ表示（詳細は不要）
      if (freeUsers.length > 0) {
        console.log('\n' + '='.repeat(80));
        console.log(`🆓 無料ユーザー: ${freeUsers.length}人`);
        console.log('='.repeat(80));
        console.log('（詳細を表示するには、個別にユーザーIDを指定してください）');
      }
    }
    
    console.log('\n' + '='.repeat(80));
    console.log('✅ 確認完了！');
    console.log('='.repeat(80));
    
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

