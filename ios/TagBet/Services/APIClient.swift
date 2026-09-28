import Foundation

struct APIClient {
    static let shared = APIClient()

    let baseURL: URL = {
        let raw = Bundle.main.object(forInfoDictionaryKey: "TagBetAPIBaseURL") as? String
        return URL(string: raw ?? "") ?? URL(string: "https://tag.bet")!
    }()

    private let session: URLSession = {
        let config = URLSessionConfiguration.default
        config.timeoutIntervalForRequest = 15
        config.requestCachePolicy = .reloadRevalidatingCacheData
        return URLSession(configuration: config)
    }()

    enum APIError: LocalizedError {
        case http(Int)

        var errorDescription: String? {
            switch self {
            case .http(let code): "The server returned an error (\(code)). Pull to retry."
            }
        }
    }

    private func get<T: Decodable>(_ path: String, query: [URLQueryItem] = []) async throws -> T {
        var components = URLComponents(url: baseURL.appending(path: path), resolvingAgainstBaseURL: false)!
        if !query.isEmpty { components.queryItems = query }
        var request = URLRequest(url: components.url!)
        request.setValue("application/json", forHTTPHeaderField: "Accept")
        let (data, response) = try await session.data(for: request)
        if let http = response as? HTTPURLResponse, !(200..<300).contains(http.statusCode) {
            throw APIError.http(http.statusCode)
        }
        return try JSONDecoder().decode(T.self, from: data)
    }

    func odds(sport: Sport, sureBetsOnly: Bool = false) async throws -> OddsResponse {
        var query: [URLQueryItem] = []
        if sport != .all { query.append(.init(name: "sport", value: sport.rawValue)) }
        if sureBetsOnly { query.append(.init(name: "view", value: "surebets")) }
        return try await get("api/v1/odds", query: query)
    }

    func bookmakers() async throws -> BookmakersResponse {
        try await get("api/v1/bookmakers", query: [.init(name: "platform", value: "ios")])
    }

    func config() async throws -> AppConfig {
        try await get("api/v1/config")
    }

    /// Outbound link through the site's click tracker so iOS clicks are attributed.
    func goLink(slug: String, source: String) -> URL {
        var components = URLComponents(url: baseURL.appending(path: "go/\(slug)"), resolvingAgainstBaseURL: false)!
        components.queryItems = [.init(name: "src", value: "ios-\(source)")]
        return components.url!
    }
}
