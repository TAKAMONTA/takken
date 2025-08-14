# 宅建合格ロード - 実装計画書

## 1. 追加機能の実装

### 1.1 合格者の学習パターン分析機能

#### 概要
過去の合格者データを分析し、効果的な学習パターンを抽出して、ユーザーに最適な学習プランを提案する機能。

#### 実装ステップ
1. **データ収集システムの構築**
   - 合格者の学習履歴データの収集
   - アンケート機能による合格者の学習方法調査
   - 匿名化処理によるプライバシー保護

2. **分析エンジンの開発**
   ```typescript
   // lib/analytics/pattern-analysis.ts
   export class LearningPatternAnalysis {
     // 合格者の学習パターンを分析
     analyzeSuccessPatterns(userData: UserData[], successData: SuccessData[]): LearningPattern[] {
       // 時間帯別学習効率の分析
       // 科目別学習順序の分析
       // 復習間隔の分析
       // 問題演習と理論学習のバランス分析
     }
     
     // ユーザーに最適な学習プランを生成
     generateOptimalPlan(userProfile: UserProfile, patterns: LearningPattern[]): StudyPlan {
       // ユーザーの現在の進捗状況を考慮
       // 合格者パターンとのマッチング
       // 個別最適化された学習プランの生成
     }
   }
   ```

3. **UI実装**
   - ダッシュボードに「合格者パターン」セクション追加
   - パーソナライズされた学習プラン表示
   - 進捗状況との比較グラフ

4. **API実装**
   ```typescript
   // app/api/analytics/success-patterns/route.ts
   export async function GET(request: NextRequest) {
     const { searchParams } = new URL(request.url);
     const userId = searchParams.get('userId');
     
     // ユーザーデータ取得
     const userData = await getUserData(userId);
     
     // 合格者パターンとのマッチング
     const patternAnalysis = new LearningPatternAnalysis();
     const successPatterns = await getSuccessPatterns();
     const matchedPatterns = patternAnalysis.matchWithSuccessPatterns(userData, successPatterns);
     
     // 最適プラン生成
     const optimalPlan = patternAnalysis.generateOptimalPlan(userData.profile, matchedPatterns);
     
     return NextResponse.json({ matchedPatterns, optimalPlan });
   }
   ```

### 1.2 スペーシング効果を活用した復習機能

#### 概要
記憶の定着に効果的な間隔で復習を促す機能。エビングハウスの忘却曲線に基づき、最適なタイミングで復習通知を送信。

#### 実装ステップ
1. **スペーシングアルゴリズムの開発**
   ```typescript
   // lib/spacing-algorithm.ts
   export class SpacingAlgorithm {
     // 初期間隔設定（日数）
     private static readonly INITIAL_INTERVALS = [1, 3, 7, 14, 30, 90];
     
     // 問題の難易度に基づく間隔調整
     adjustIntervalByDifficulty(baseInterval: number, difficulty: number): number {
       return Math.round(baseInterval * (1 - 0.2 * difficulty));
     }
     
     // 正答率に基づく間隔調整
     adjustIntervalByPerformance(baseInterval: number, correctRate: number): number {
       return Math.round(baseInterval * (0.5 + correctRate * 0.5));
     }
     
     // 次の復習日を計算
     calculateNextReviewDate(
       lastReviewDate: Date,
       reviewCount: number,
       difficulty: number,
       correctRate: number
     ): Date {
       let interval = this.INITIAL_INTERVALS[Math.min(reviewCount, this.INITIAL_INTERVALS.length - 1)];
       interval = this.adjustIntervalByDifficulty(interval, difficulty);
       interval = this.adjustIntervalByPerformance(interval, correctRate);
       
       const nextDate = new Date(lastReviewDate);
       nextDate.setDate(nextDate.getDate() + interval);
       return nextDate;
     }
   }
   ```

2. **復習スケジューラーの実装**
   ```typescript
   // lib/review-scheduler.ts
   export class ReviewScheduler {
     private spacingAlgorithm = new SpacingAlgorithm();
     
     // ユーザーの復習スケジュールを生成
     async generateReviewSchedule(userId: string): Promise<ReviewItem[]> {
       // 学習履歴の取得
       const history = await getStudyHistory(userId);
       
       // 各問題の次回復習日を計算
       const reviewItems = history.map(item => {
         const nextReviewDate = this.spacingAlgorithm.calculateNextReviewDate(
           item.lastReviewDate,
           item.reviewCount,
           item.difficulty,
           item.correctRate
         );
         
         return {
           questionId: item.questionId,
           category: item.category,
           nextReviewDate,
           priority: this.calculatePriority(item, nextReviewDate)
         };
       });
       
       // 優先度でソート
       return reviewItems.sort((a, b) => b.priority - a.priority);
     }
     
     // 復習優先度の計算
     private calculatePriority(item: StudyHistoryItem, nextReviewDate: Date): number {
       const daysUntilReview = (nextReviewDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24);
       const urgencyFactor = Math.max(0, 7 - daysUntilReview) / 7;
       const difficultyFactor = item.difficulty;
       const importanceFactor = this.getCategoryImportance(item.category);
       
       return urgencyFactor * 0.5 + difficultyFactor * 0.3 + importanceFactor * 0.2;
     }
     
     // カテゴリの重要度（宅建試験の配点に基づく）
     private getCategoryImportance(category: string): number {
       const importanceMap = {
         'takkengyouhou': 0.9, // 宅建業法（配点が最も高い）
         'minpou': 0.7,       // 民法等
         'hourei': 0.6,       // 法令上の制限
         'zeihou': 0.5        // 税・その他
       };
       
       return importanceMap[category] || 0.5;
     }
   }
   ```

3. **通知システムの拡張**
   ```typescript
   // lib/notification-service.ts
   export class NotificationService {
     // 復習リマインダー通知の送信
     async sendReviewReminder(userId: string, reviewItems: ReviewItem[]): Promise<void> {
       const user = await getUserProfile(userId);
       
       if (!user.notificationSettings.reviewReminders) {
         return; // 通知設定がオフの場合
       }
       
       // 今日復習すべきアイテムをフィルタリング
       const today = new Date();
       const todayReviews = reviewItems.filter(item => {
         const reviewDate = new Date(item.nextReviewDate);
         return reviewDate.toDateString() === today.toDateString();
       });
       
       if (todayReviews.length === 0) {
         return; // 今日の復習アイテムがない場合
       }
       
       // 通知内容の生成
       const categories = [...new Set(todayReviews.map(item => item.category))];
       const categoryNames = categories.map(c => this.getCategoryDisplayName(c));
       
       const notificationData = {
         title: '📚 今日の復習アイテムが準備できました',
         body: `${categoryNames.join('、')}の${todayReviews.length}問を復習しましょう！`,
         data: {
           type: 'review_reminder',
           url: '/review',
           reviewIds: todayReviews.map(item => item.questionId)
         }
       };
       
       // 通知の送信
       await this.sendPushNotification(userId, notificationData);
     }
   }
   ```

4. **UI実装**
   - 「今日の復習」セクションをダッシュボードに追加
   - 復習カレンダーの実装
   - 復習進捗トラッキング機能

## 2. マルチプラットフォーム展開計画

### 2.1 展開ロードマップ

1. **PWA（現状）**
   - 現在のNext.js + PWAアプリケーション
   - オフライン機能とプッシュ通知対応済み

2. **Android アプリ（第1フェーズ）**
   - React Native への移行
   - Google Play Store へのリリース
   - Firebase 連携の維持

3. **iOS アプリ（第2フェーズ）**
   - App Store へのリリース
   - Apple Push Notification Service の実装
   - In-App Purchase の実装

4. **ウェブアプリ（第3フェーズ）**
   - 独自ドメインでのリリース
   - SEO 最適化
   - ソーシャル機能の強化

### 2.2 技術スタック更新

#### React Native への移行
```typescript
// package.json 更新
{
  "dependencies": {
    "react-native": "^0.72.0",
    "react-native-web": "^0.19.0",
    "expo": "^48.0.0",
    "expo-notifications": "^0.20.0",
    "@react-navigation/native": "^6.1.0",
    "@react-native-firebase/app": "^18.0.0",
    "@react-native-firebase/firestore": "^18.0.0",
    "@react-native-firebase/auth": "^18.0.0",
    "@react-native-firebase/messaging": "^18.0.0"
  }
}
```

#### クロスプラットフォーム対応
```typescript
// lib/platform-utils.ts
import { Platform } from 'react-native';

export const isPlatform = {
  web: () => Platform.OS === 'web',
  android: () => Platform.OS === 'android',
  ios: () => Platform.OS === 'ios',
  mobile: () => Platform.OS === 'android' || Platform.OS === 'ios',
};

export const getPlatformSpecificStyles = (styles) => {
  const platformStyles = {};
  
  if (isPlatform.android()) {
    platformStyles.elevation = styles.shadowElevation || 5;
  }
  
  if (isPlatform.ios()) {
    platformStyles.shadowColor = styles.shadowColor || '#000';
    platformStyles.shadowOffset = styles.shadowOffset || { width: 0, height: 2 };
    platformStyles.shadowOpacity = styles.shadowOpacity || 0.25;
    platformStyles.shadowRadius = styles.shadowRadius || 3.84;
  }
  
  return platformStyles;
};
```

#### プラットフォーム固有機能の抽象化
```typescript
// lib/notifications/index.ts
import { Platform } from 'react-native';
import * as WebNotifications from './web-notifications';
import * as AndroidNotifications from './android-notifications';
import * as IOSNotifications from './ios-notifications';

export const NotificationService = Platform.select({
  web: WebNotifications,
  android: AndroidNotifications,
  ios: IOSNotifications,
});
```

### 2.3 プラットフォーム別の最適化

#### Android 最適化
- Material Design コンポーネントの使用
- Google Play Services の統合
- Android 特有のナビゲーションの実装

#### iOS 最適化
- iOS デザインガイドラインへの準拠
- Apple Push Notification Service の実装
- App Store 審査基準への対応

#### ウェブ最適化
- SEO 対策
- ソーシャルシェア機能
- PWA インストールプロモーション

## 3. 収益化モデルの実装計画

### 3.1 無料版と課金プラン

#### 機能比較
| 機能 | 無料版 | プレミアムプラン |
|------|--------|----------------|
| 基本問題演習 | ✅ 500問 | ✅ 1,500問以上 |
| 過去問演習 | ✅ 直近3年分 | ✅ 過去10年分 |
| ペット育成 | ✅ 基本ペット | ✅ 全種類のペット |
| AI解説 | ❌ | ✅ 無制限 |
| 学習分析 | ✅ 基本分析 | ✅ 詳細分析 |
| 合格者パターン分析 | ❌ | ✅ |
| スペーシング復習 | ❌ | ✅ |
| 広告表示 | ✅ あり | ❌ なし |

#### 実装計画
```typescript
// lib/subscription/plans.ts
export enum SubscriptionPlan {
  FREE = 'free',
  PREMIUM = 'premium',
  PREMIUM_PLUS = 'premium_plus'
}

export const PLAN_FEATURES = {
  [SubscriptionPlan.FREE]: {
    questionLimit: 500,
    pastExamYears: 3,
    aiExplanationLimit: 0,
    advancedAnalytics: false,
    successPatternAnalysis: false,
    spacedRepetition: false,
    adFree: false,
    price: 0
  },
  [SubscriptionPlan.PREMIUM]: {
    questionLimit: 1500,
    pastExamYears: 10,
    aiExplanationLimit: 50,
    advancedAnalytics: true,
    successPatternAnalysis: true,
    spacedRepetition: true,
    adFree: true,
    price: 980 // 月額980円
  },
  [SubscriptionPlan.PREMIUM_PLUS]: {
    questionLimit: -1, // 無制限
    pastExamYears: 10,
    aiExplanationLimit: -1, // 無制限
    advancedAnalytics: true,
    successPatternAnalysis: true,
    spacedRepetition: true,
    adFree: true,
    price: 1980 // 月額1980円
  }
};
```

### 3.2 Google AdMob 統合

#### 実装計画
```typescript
// lib/ads/admob-service.ts
import { Platform } from 'react-native';
import { 
  InterstitialAd, 
  AdEventType, 
  BannerAd, 
  TestIds 
} from 'react-native-google-mobile-ads';

export class AdMobService {
  private bannerAdUnitId = Platform.select({
    android: process.env.NEXT_PUBLIC_ADMOB_ANDROID_BANNER_ID || TestIds.BANNER,
    ios: process.env.NEXT_PUBLIC_ADMOB_IOS_BANNER_ID || TestIds.BANNER,
    default: TestIds.BANNER,
  });
  
  private interstitialAdUnitId = Platform.select({
    android: process.env.NEXT_PUBLIC_ADMOB_ANDROID_INTERSTITIAL_ID || TestIds.INTERSTITIAL,
    ios: process.env.NEXT_PUBLIC_ADMOB_IOS_INTERSTITIAL_ID || TestIds.INTERSTITIAL,
    default: TestIds.INTERSTITIAL,
  });
  
  private interstitialAd = null;
  
  constructor() {
    this.loadInterstitialAd();
  }
  
  // バナー広告コンポーネントを取得
  getBannerAdComponent() {
    return (
      <BannerAd
        unitId={this.bannerAdUnitId}
        size="BANNER"
        requestOptions={{
          requestNonPersonalizedAdsOnly: true,
        }}
      />
    );
  }
  
  // インタースティシャル広告の読み込み
  loadInterstitialAd() {
    this.interstitialAd = InterstitialAd.createForAdRequest(this.interstitialAdUnitId, {
      requestNonPersonalizedAdsOnly: true,
    });
    
    this.interstitialAd.load();
    
    this.interstitialAd.addAdEventListener(AdEventType.LOADED, () => {
      console.log('Interstitial ad loaded');
    });
    
    this.interstitialAd.addAdEventListener(AdEventType.ERROR, (error) => {
      console.error('Interstitial ad error:', error);
    });
  }
  
  // インタースティシャル広告の表示
  showInterstitialAd() {
    if (this.interstitialAd?.loaded) {
      this.interstitialAd.show();
    } else {
      console.log('Interstitial ad not loaded yet');
      this.loadInterstitialAd();
    }
  }
}

export const adMobService = new AdMobService();
```

#### 広告表示ロジック
```typescript
// components/AdBanner.tsx
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useSubscription } from '@/lib/subscription/use-subscription';
import { adMobService } from '@/lib/ads/admob-service';
import { SubscriptionPlan } from '@/lib/subscription/plans';

export const AdBanner = () => {
  const { currentPlan } = useSubscription();
  
  // プレミアムプランの場合は広告を表示しない
  if (currentPlan !== SubscriptionPlan.FREE) {
    return null;
  }
  
  return (
    <View style={styles.adContainer}>
      {adMobService.getBannerAdComponent()}
    </View>
  );
};

const styles = StyleSheet.create({
  adContainer: {
    width: '100%',
    alignItems: 'center',
    marginVertical: 10,
  },
});
```

### 3.3 サブスクリプション管理

#### プラットフォーム別の実装
```typescript
// lib/subscription/subscription-service.ts
import { Platform } from 'react-native';
import { SubscriptionPlan } from './plans';
import * as WebSubscription from './web-subscription';
import * as AndroidSubscription from './android-subscription';
import * as IOSSubscription from './ios-subscription';

// プラットフォーム別の実装を選択
const PlatformSubscription = Platform.select({
  web: WebSubscription,
  android: AndroidSubscription,
  ios: IOSSubscription,
});

export class SubscriptionService {
  // 現在のサブスクリプションプランを取得
  async getCurrentPlan(userId: string): Promise<SubscriptionPlan> {
    return await PlatformSubscription.getCurrentPlan(userId);
  }
  
  // サブスクリプションの購入
  async purchaseSubscription(userId: string, plan: SubscriptionPlan): Promise<boolean> {
    return await PlatformSubscription.purchaseSubscription(userId, plan);
  }
  
  // サブスクリプションのキャンセル
  async cancelSubscription(userId: string): Promise<boolean> {
    return await PlatformSubscription.cancelSubscription(userId);
  }
  
  // サブスクリプションの更新
  async renewSubscription(userId: string): Promise<boolean> {
    return await PlatformSubscription.renewSubscription(userId);
  }
  
  // サブスクリプション状態の検証
  async verifySubscription(userId: string): Promise<{
    isActive: boolean;
    expiryDate: Date;
    plan: SubscriptionPlan;
  }> {
    return await PlatformSubscription.verifySubscription(userId);
  }
}

export const subscriptionService = new SubscriptionService();
```

#### Firebase との連携
```typescript
// lib/subscription/web-subscription.ts
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { SubscriptionPlan } from './plans';

// 現在のサブスクリプションプランを取得
export async function getCurrentPlan(userId: string): Promise<SubscriptionPlan> {
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      return SubscriptionPlan.FREE;
    }
    
    const userData = userDoc.data();
    return userData.subscriptionPlan || SubscriptionPlan.FREE;
  } catch (error) {
    console.error('Error getting subscription plan:', error);
    return SubscriptionPlan.FREE;
  }
}

// サブスクリプションの購入（ウェブ版）
export async function purchaseSubscription(userId: string, plan: SubscriptionPlan): Promise<boolean> {
  try {
    // 支払い処理（Stripe等の決済サービスと連携）
    // ...支払い処理のコード...
    
    // 成功したら、Firestoreを更新
    const userRef = doc(db, 'users', userId);
    const now = new Date();
    const expiryDate = new Date();
    expiryDate.setMonth(expiryDate.getMonth() + 1); // 1ヶ月後
    
    await updateDoc(userRef, {
      subscriptionPlan: plan,
      subscriptionStartDate: now,
      subscriptionExpiryDate: expiryDate,
      subscriptionStatus: 'active'
    });
    
    return true;
  } catch (error) {
    console.error('Error purchasing subscription:', error);
    return false;
  }
}
```

## 4. 実装スケジュール

### フェーズ1: 追加機能実装（4週間）
- 週1-2: 合格者学習パターン分析機能
- 週3-4: スペーシング効果を活用した復習機能

### フェーズ2: Android アプリ開発（8週間）
- 週1-2: React Native 移行
- 週3-4: Android 固有機能実装
- 週5-6: 収益化モデル実装
- 週7-8: テストとリリース準備

### フェーズ3: iOS アプリ開発（6週間）
- 週1-2: iOS 固有機能実装
- 週3-4: App Store 対応
- 週5-6: テストとリリース準備

### フェーズ4: ウェブアプリ最適化（4週間）
- 週1-2: SEO 最適化
- 週3-4: ソーシャル機能強化

## 5. 予算計画

### 開発コスト
- 追加機能開発: 約100万円
- Android アプリ開発: 約200万円
- iOS アプリ開発: 約150万円
- ウェブアプリ最適化: 約50万円

### 運用コスト（月額）
- サーバー費用: 約5万円
- API 利用料（AI等）: 約10万円
- マーケティング費用: 約20万円

### 収益予測（月額）
- 無料ユーザー広告収入: 約15万円（1万DAU想定）
- プレミアムプラン収入: 約50万円（500ユーザー想定）
- プレミアムプラスプラン収入: 約30万円（150ユーザー想定）

## 6. リスク管理

### 技術的リスク
- クロスプラットフォーム対応の複雑さ
- Apple審査の厳格さへの対応
- パフォーマンス最適化の課題

### 対策
- プラットフォーム固有コードの分離
- App Store ガイドラインの事前確認
- パフォーマンステストの徹底

### ビジネスリスク
- 競合アプリの出現
- 収益化モデルの受け入れ度
- ユーザー獲得コストの上昇

### 対策
- 独自機能の強化（AI、ゲーミフィケーション）
- 無料版の価値向上
- オーガニック流入の強化（SEO、口コミ）