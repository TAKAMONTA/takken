import Foundation
import StoreKit
import Capacitor

@objc(InAppPurchase)
public class InAppPurchase: CAPPlugin {
    
    @objc func echo(_ call: CAPPluginCall) {
        let value = call.getString("value") ?? ""
        call.resolve([
            "value": value
        ])
    }
    
    @objc func getProducts(_ call: CAPPluginCall) {
        guard let productIds = call.getArray("productIds", String.self) else {
            call.reject("Product IDs are required")
            return
        }
        
        Task {
            do {
                let products = try await Product.products(for: productIds)
                let productsData = products.map { product in
                    return [
                        "productId": product.id,
                        "title": product.displayName,
                        "description": product.description,
                        "price": product.displayPrice,
                        "priceLocale": product.priceFormatStyle.locale.identifier,
                        "type": product.type == .consumable ? "consumable" : 
                                product.type == .nonConsumable ? "non_consumable" : "subscription"
                    ]
                }
                call.resolve(["products": productsData])
            } catch {
                call.reject("Failed to fetch products: \(error.localizedDescription)")
            }
        }
    }
    
    @objc func purchaseSubscription(_ call: CAPPluginCall) {
        guard let productId = call.getString("productId") else {
            call.reject("Product ID is required")
            return
        }
        
        Task {
            do {
                guard let product = try await Product.products(for: [productId]).first else {
                    call.reject("Product not found")
                    return
                }
                
                let result = try await product.purchase()
                
                switch result {
                case .success(let verification):
                    switch verification {
                    case .verified(let transaction):
                        await transaction.finish()
                        call.resolve(["transaction": self.formatTransaction(transaction)])
                    case .unverified(_, let error):
                        call.reject("Transaction unverified: \(error.localizedDescription)")
                    }
                case .userCancelled:
                    call.reject("User cancelled", "USER_CANCELLED")
                case .pending:
                    call.reject("Purchase pending")
                @unknown default:
                    call.reject("Unknown purchase result")
                }
            } catch {
                call.reject("Purchase failed: \(error.localizedDescription)")
            }
        }
    }
    
    @objc func restorePurchases(_ call: CAPPluginCall) {
        Task {
            // StoreKit 2 automatically handles restoration for the most part, 
            // but we can sync with App Store
            try? await AppStore.sync()
            
            var restoredTransactions: [[String: Any]] = []
            
            for await result in Transaction.currentEntitlements {
                if case .verified(let transaction) = result {
                    restoredTransactions.append(self.formatTransaction(transaction))
                }
            }
            
            call.resolve(["transactions": restoredTransactions])
        }
    }
    
    @objc func getActiveSubscriptions(_ call: CAPPluginCall) {
        Task {
            var activeSubs: [[String: Any]] = []
            
            for await result in Transaction.currentEntitlements {
                if case .verified(let transaction) = result {
                    // Check if it's a subscription and not expired
                    // StoreKit 2 currentEntitlements returns only active valid method
                    // But we can check product type if needed, assuming all here are active entitlements
                    if transaction.productType == .autoRenewable || transaction.productType == .nonRenewable {
                        activeSubs.append([
                            "productId": transaction.productID,
                            "isActive": true, // If it's in currentEntitlements, it's active
                            "originalPurchaseDate": transaction.originalPurchaseDate.ISO8601Format(),
                            "latestPurchaseDate": transaction.purchaseDate.ISO8601Format(),
                            "willRenew": true // Simplified, real logic needs to check renewal info
                        ])
                    }
                }
            }
            call.resolve(["subscriptions": activeSubs])
        }
    }
    
    @objc func getPurchaseHistory(_ call: CAPPluginCall) {
       // Implementation for history if needed
       call.resolve(["transactions": []])
    }
    
    // Helper
    private func formatTransaction(_ transaction: Transaction) -> [String: Any] {
        return [
            "transactionId": String(transaction.id),
            "productId": transaction.productID,
            "purchaseDate": transaction.purchaseDate.ISO8601Format(),
            "originalPurchaseDate": transaction.originalPurchaseDate.ISO8601Format(),
            "quantity": transaction.purchasedQuantity,
            "state": "purchased" // Simplified
        ]
    }
}
