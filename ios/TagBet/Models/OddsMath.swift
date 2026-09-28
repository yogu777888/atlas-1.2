import Foundation

/// Mirrors web/src/lib/odds/math.ts so the app can recompute locally.
enum OddsMath {
    /// Bookmaker overround: sum of implied probabilities minus 1.
    static func margin(_ prices: [Double]) -> Double {
        prices.reduce(0) { $0 + 1 / $1 } - 1
    }

    static func bookMargin(_ book: BookPrices, outcomes: [Outcome]) -> Double? {
        let prices = outcomes.compactMap { book.price($0) }
        guard prices.count == outcomes.count else { return nil }
        return margin(prices)
    }

    /// Stakes that return the same payout on every outcome, summing to `total`.
    static func splitStakes(_ prices: [Double], total: Double) -> [Double] {
        let inv = prices.map { 1 / $0 }
        let sum = inv.reduce(0, +)
        guard sum > 0 else { return prices.map { _ in 0 } }
        return inv.map { $0 / sum * total }
    }

    static func edge(price: Double, fairProbability: Double) -> Double {
        price * fairProbability - 1
    }
}

extension Double {
    var odds: String { String(format: "%.2f", self) }
    func percent(_ digits: Int = 1) -> String { String(format: "%.\(digits)f%%", self * 100) }
}
