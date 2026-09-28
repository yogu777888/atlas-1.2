import Foundation
import Observation

@MainActor
@Observable
final class AppModel {
    var config: AppConfig?
    var bookmakers: [Bookmaker] = []
    var events: [OddsEvent] = []
    var sport: Sport = .all
    var sureBetsOnly = false
    var oddsSource = ""
    var isLoading = false
    var error: String?

    private(set) var starred: Set<String> = {
        Set(UserDefaults.standard.stringArray(forKey: "starred") ?? [])
    }()

    @ObservationIgnored private let api = APIClient.shared

    /// Links are hidden when the server disables them for the user's country.
    var linksEnabled: Bool { config?.affiliateLinksEnabled ?? false }

    func bookmaker(_ slug: String) -> Bookmaker? {
        bookmakers.first { $0.slug == slug }
    }

    /// Only offer a CTA for bookmakers that accept customers where the user is.
    func outboundLink(for slug: String, source: String) -> URL? {
        guard linksEnabled, bookmaker(slug)?.available ?? false else { return nil }
        return api.goLink(slug: slug, source: source)
    }

    func bootstrap() async {
        async let config = try? api.config()
        async let books = try? api.bookmakers()
        self.config = await config
        if let books = await books { bookmakers = books.bookmakers }
        // Odds load from OddsView's .task, which re-runs when the sport changes
    }

    func loadOdds() async {
        isLoading = true
        defer { isLoading = false }
        do {
            let response = try await api.odds(sport: sport, sureBetsOnly: sureBetsOnly)
            events = response.events
            oddsSource = response.source
            error = nil
        } catch is CancellationError {
            // A newer request replaced this one
        } catch let urlError as URLError where urlError.code == .cancelled {
            // Same, surfaced by URLSession
        } catch {
            self.error = error.localizedDescription
        }
    }

    func isStarred(_ id: String) -> Bool { starred.contains(id) }

    func toggleStar(_ id: String) {
        if starred.contains(id) { starred.remove(id) } else { starred.insert(id) }
        UserDefaults.standard.set(Array(starred), forKey: "starred")
    }
}
