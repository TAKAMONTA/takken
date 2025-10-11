"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  subscriptionService,
  SubscriptionService,
  SubscriptionPlan,
} from "@/lib/subscription-service";
import { Product } from "@/src/plugins/InAppPurchase";

export default function SubscriptionPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [userSubscription, setUserSubscription] = useState<any>(null);
  const [purchasing, setPurchasing] = useState(false);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const { onAuthStateChanged } = await import("firebase/auth");
        const { initializeFirebase } = await import(
          "../../lib/firebase-client"
        );
        const { auth } = initializeFirebase();

        onAuthStateChanged(auth, async (firebaseUser) => {
          if (firebaseUser) {
            setUser(firebaseUser);

            // サブスクリプション情報を取得
            const subscription = await subscriptionService.getUserSubscription(
              firebaseUser.uid
            );
            setUserSubscription(subscription);

            // 商品情報を取得
            const availableProducts =
              await subscriptionService.getAvailableProducts();
            setProducts(availableProducts);
          } else {
            router.push("/auth/login");
          }
          setLoading(false);
        });
      } catch (error) {
        console.error("Auth initialization failed:", error);
        setLoading(false);
      }
    };

    initAuth();
  }, [router]);

  const handlePurchase = async (planId: string) => {
    if (!user || purchasing) return;

    setPurchasing(true);
    try {
      const success = await subscriptionService.purchaseSubscription(
        planId,
        user.uid
      );

      if (success) {
        // サブスクリプション情報を再取得
        const subscription = await subscriptionService.getUserSubscription(
          user.uid
        );
        setUserSubscription(subscription);
        alert("サブスクリプションの購入が完了しました！");
      } else {
        alert("購入に失敗しました。もう一度お試しください。");
      }
    } catch (error) {
      console.error("Purchase failed:", error);
      alert("購入中にエラーが発生しました。");
    } finally {
      setPurchasing(false);
    }
  };

  const handleRestore = async () => {
    if (!user) return;

    try {
      const success = await subscriptionService.restorePurchases(user.uid);

      if (success) {
        const subscription = await subscriptionService.getUserSubscription(
          user.uid
        );
        setUserSubscription(subscription);
        alert("購入履歴の復元が完了しました！");
      } else {
        alert("復元できる購入履歴がありません。");
      }
    } catch (error) {
      console.error("Restore failed:", error);
      alert("復元中にエラーが発生しました。");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">読み込み中...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">ログインが必要です</p>
          <Link href="/auth/login">
            <button className="bg-purple-600 text-white px-6 py-3 rounded-lg font-bold">
              ログイン
            </button>
          </Link>
        </div>
      </div>
    );
  }

  const isPremium = userSubscription?.status === "active";

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex items-center space-x-3">
            <Link
              href="/dashboard"
              className="text-gray-600 hover:text-gray-900"
            >
              <i className="ri-arrow-left-line text-xl"></i>
            </Link>
            <h1 className="text-lg font-bold text-gray-900">
              サブスクリプション
            </h1>
          </div>
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 py-6">
        {/* Current Status */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            現在のプラン
          </h2>

          {isPremium ? (
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="ri-vip-crown-line text-2xl text-purple-600"></i>
              </div>
              <h3 className="text-xl font-bold text-purple-600 mb-2">
                プレミアムプラン
              </h3>
              <p className="text-gray-600 mb-4">
                すべての機能をご利用いただけます
              </p>
              <div className="text-sm text-gray-500">
                有効期限:{" "}
                {userSubscription?.endDate
                  ? new Date(userSubscription.endDate).toLocaleDateString(
                      "ja-JP"
                    )
                  : "無期限"}
              </div>
            </div>
          ) : (
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="ri-user-line text-2xl text-gray-600"></i>
              </div>
              <h3 className="text-xl font-bold text-gray-600 mb-2">
                無料プラン
              </h3>
              <p className="text-gray-600 mb-4">基本機能をご利用いただけます</p>
              <div className="text-sm text-gray-500">
                AI機能: 月3回まで / 広告表示あり
              </div>
            </div>
          )}
        </div>

        {/* Premium Features */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            プレミアム機能
          </h2>

          <div className="space-y-3">
            {SubscriptionService.PLANS[0].features.map((feature, index) => (
              <div key={index} className="flex items-center space-x-3">
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center ${
                    isPremium ? "bg-green-100" : "bg-gray-100"
                  }`}
                >
                  <i
                    className={`ri-check-line text-sm ${
                      isPremium ? "text-green-600" : "text-gray-400"
                    }`}
                  ></i>
                </div>
                <span
                  className={`text-sm ${
                    isPremium ? "text-gray-900" : "text-gray-500"
                  }`}
                >
                  {feature}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Purchase Button */}
        {!isPremium && (
          <div className="space-y-4">
            <button
              onClick={() => handlePurchase("premium_monthly")}
              disabled={purchasing}
              className="w-full bg-purple-600 text-white py-4 px-6 rounded-lg font-bold text-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {purchasing
                ? "処理中..."
                : "プレミアムプランにアップグレード (月額500円)"}
            </button>

            <button
              onClick={handleRestore}
              className="w-full bg-gray-100 text-gray-700 py-3 px-6 rounded-lg font-medium hover:bg-gray-200"
            >
              購入履歴を復元
            </button>
          </div>
        )}

        {/* Terms */}
        <div className="mt-8 text-center">
          <p className="text-xs text-gray-500">
            サブスクリプションは自動更新されます。
            <br />
            設定からいつでもキャンセルできます。
          </p>
          <div className="mt-2 space-x-4">
            <Link
              href="/terms"
              className="text-xs text-blue-600 hover:underline"
            >
              利用規約
            </Link>
            <Link
              href="/privacy"
              className="text-xs text-blue-600 hover:underline"
            >
              プライバシーポリシー
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
