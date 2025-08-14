import { NextRequest, NextResponse } from 'next/server';
import { pwaManager } from '@/lib/pwa-utils';

export async function POST(request: NextRequest) {
  try {
    const { userId, subscription, action } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: 'ユーザーIDが必要です' },
        { status: 400 }
      );
    }

    switch (action) {
      case 'subscribe':
        if (!subscription) {
          return NextResponse.json(
            { error: 'プッシュ通知の購読情報が必要です' },
            { status: 400 }
          );
        }

        // プッシュ通知の購読を保存（localStorage使用）
        try {
          localStorage.setItem(`push_subscription_${userId}`, JSON.stringify(subscription));
        } catch (error) {
          console.error('Failed to save subscription:', error);
        }

        return NextResponse.json({
          success: true,
          message: 'プッシュ通知の購読が完了しました',
          timestamp: new Date().toISOString(),
        });

      case 'unsubscribe':
        // プッシュ通知の購読を削除
        try {
          localStorage.removeItem(`push_subscription_${userId}`);
          await pwaManager.unsubscribeFromPush();
        } catch (error) {
          console.error('Failed to remove subscription:', error);
        }

        return NextResponse.json({
          success: true,
          message: 'プッシュ通知の購読を解除しました',
          timestamp: new Date().toISOString(),
        });

      case 'send':
        const { title, body, icon, badge, data } = await request.json();

        if (!title || !body) {
          return NextResponse.json(
            { error: 'タイトルと本文が必要です' },
            { status: 400 }
          );
        }

        // プッシュ通知を送信（ローカル通知として）
        try {
          await pwaManager.showLocalNotification(
            title,
            body,
            data?.url || '/'
          );

          return NextResponse.json({
            success: true,
            message: 'プッシュ通知を送信しました',
            timestamp: new Date().toISOString(),
          });
        } catch (error) {
          return NextResponse.json({
            success: false,
            message: 'プッシュ通知の送信に失敗しました',
            timestamp: new Date().toISOString(),
          });
        }

      default:
        return NextResponse.json(
          { error: '無効なアクションです' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('Notifications API Error:', error);
    
    return NextResponse.json(
      { 
        error: 'プッシュ通知の処理中にエラーが発生しました',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'ユーザーIDが必要です' },
        { status: 400 }
      );
    }

    // プッシュ通知の購読状態を確認
    let subscription = null;
    try {
      const subscriptionData = localStorage.getItem(`push_subscription_${userId}`);
      subscription = subscriptionData ? JSON.parse(subscriptionData) : null;
    } catch (error) {
      console.error('Failed to get subscription:', error);
    }

    return NextResponse.json({
      userId,
      isSubscribed: !!subscription,
      subscription: subscription || null,
      vapidPublicKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || null,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Notifications GET API Error:', error);
    
    return NextResponse.json(
      { 
        error: 'プッシュ通知状態の取得中にエラーが発生しました',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// 定期的な学習リマインダー通知を送信
export async function PUT(request: NextRequest) {
  try {
    const { userId, reminderType } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: 'ユーザーIDが必要です' },
        { status: 400 }
      );
    }

    let notificationData;

    switch (reminderType) {
      case 'daily_study':
        notificationData = {
          title: '📚 今日の学習時間です！',
          body: 'ペットがあなたを待っています。一緒に宅建の勉強を始めましょう！',
          icon: '/icons/icon-192x192.png',
          badge: '/icons/badge-72x72.png',
          data: {
            type: 'daily_reminder',
            url: '/dashboard',
          },
        };
        break;

      case 'streak_reminder':
        notificationData = {
          title: '🔥 学習ストリークを継続しよう！',
          body: '連続学習記録を途切れさせないよう、今日も頑張りましょう！',
          icon: '/icons/icon-192x192.png',
          badge: '/icons/badge-72x72.png',
          data: {
            type: 'streak_reminder',
            url: '/practice',
          },
        };
        break;

      case 'pet_care':
        notificationData = {
          title: '🐾 ペットのお世話の時間です',
          body: 'あなたのペットがお腹を空かせています。エサをあげましょう！',
          icon: '/icons/icon-192x192.png',
          badge: '/icons/badge-72x72.png',
          data: {
            type: 'pet_care',
            url: '/pet',
          },
        };
        break;

      case 'weak_area':
        notificationData = {
          title: '💪 苦手分野の克服チャンス！',
          body: '苦手分野を重点的に学習して、実力アップを図りましょう！',
          icon: '/icons/icon-192x192.png',
          badge: '/icons/badge-72x72.png',
          data: {
            type: 'weak_area_reminder',
            url: '/weak-points',
          },
        };
        break;

      default:
        return NextResponse.json(
          { error: '無効なリマインダータイプです' },
          { status: 400 }
        );
    }

    // プッシュ通知を送信
    try {
      await pwaManager.showLocalNotification(
        notificationData.title,
        notificationData.body,
        notificationData.data.url
      );

      return NextResponse.json({
        success: true,
        message: 'リマインダー通知を送信しました',
        reminderType,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      return NextResponse.json({
        success: false,
        message: 'リマインダー通知の送信に失敗しました',
        reminderType,
        timestamp: new Date().toISOString(),
      });
    }

  } catch (error) {
    console.error('Reminder Notification API Error:', error);
    
    return NextResponse.json(
      { 
        error: 'リマインダー通知の送信中にエラーが発生しました',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}