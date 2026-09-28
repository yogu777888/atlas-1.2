import Foundation

enum Outcome: String, Codable, CaseIterable, Hashable {
    case home, draw, away

    var short: String {
        switch self {
        case .home: "1"
        case .draw: "X"
        case .away: "2"
        }
    }
}

struct BookPrices: Codable, Hashable {
    let bookmaker: String
    let prices: [String: Double]
    let updatedAt: String

    func price(_ o: Outcome) -> Double? { prices[o.rawValue] }
}

struct BestPrice: Codable, Hashable {
    let outcome: Outcome
    let price: Double
    let bookmaker: String
}

struct OddsEvent: Codable, Hashable, Identifiable {
    let id: String
    let sport: String
    let league: String
    let home: String
    let away: String
    let commenceTime: String
    let outcomes: [Outcome]
    let books: [BookPrices]
    let best: [BestPrice]
    let bestMargin: Double
    let fair: [String: Double]

    var isSureBet: Bool { bestMargin < 0 }
    var startDate: Date { ISODate.parse(commenceTime) ?? .distantFuture }

    func label(_ o: Outcome) -> String {
        switch o {
        case .home: home
        case .draw: "Draw"
        case .away: away
        }
    }

    func best(_ o: Outcome) -> BestPrice? { best.first { $0.outcome == o } }
}

struct OddsResponse: Codable {
    let source: String
    let generatedAt: String
    let events: [OddsEvent]
}

struct Bonus: Codable, Hashable {
    let headline: String
    let detail: String
    let code: String?
    let terms: String
}

struct Bookmaker: Codable, Hashable, Identifiable {
    let slug: String
    let name: String
    let color: String
    let ink: String
    let monogram: String
    let rating: Double
    let license: String
    let payout: String
    let minDeposit: String
    let avgMargin: Double
    let features: [String]
    let pros: [String]
    let cons: [String]
    let bonus: Bonus
    let available: Bool
    let link: URL

    var id: String { slug }
}

struct BookmakersResponse: Codable {
    let country: String?
    let bookmakers: [Bookmaker]
}

struct AppConfig: Codable, Hashable {
    let country: String?
    let affiliateLinksEnabled: Bool
    let minimumAppVersion: String
    let responsibleGamblingUrl: URL
    let helplineUrl: URL
    let disclosureUrl: URL
}

enum Sport: String, CaseIterable, Identifiable {
    case all, soccer, basketball, tennis, mma, football

    var id: String { rawValue }

    var label: String {
        switch self {
        case .all: "All"
        case .soccer: "Football"
        case .basketball: "Basketball"
        case .tennis: "Tennis"
        case .mma: "MMA"
        case .football: "NFL"
        }
    }

    var emoji: String {
        switch self {
        case .all: "✦"
        case .soccer: "⚽"
        case .basketball: "🏀"
        case .tennis: "🎾"
        case .mma: "🥊"
        case .football: "🏈"
        }
    }
}

enum ISODate {
    private static let withFraction: ISO8601DateFormatter = {
        let f = ISO8601DateFormatter()
        f.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
        return f
    }()

    private static let plain = ISO8601DateFormatter()

    static func parse(_ s: String) -> Date? {
        withFraction.date(from: s) ?? plain.date(from: s)
    }
}
