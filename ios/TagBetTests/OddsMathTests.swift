import XCTest
@testable import TagBet

final class OddsMathTests: XCTestCase {
    func testMargin() {
        XCTAssertEqual(OddsMath.margin([2, 2]), 0, accuracy: 1e-9)
        XCTAssertEqual(OddsMath.margin([1.9, 1.9]), 0.0526, accuracy: 1e-3)
    }

    func testSplitStakesGivesEqualPayout() {
        let prices = [2.3, 3.6, 4.0]
        let stakes = OddsMath.splitStakes(prices, total: 100)
        XCTAssertEqual(stakes.reduce(0, +), 100, accuracy: 1e-9)
        let payouts = zip(stakes, prices).map { $0 * $1 }
        XCTAssertEqual(payouts[0], payouts[1], accuracy: 1e-9)
        XCTAssertEqual(payouts[1], payouts[2], accuracy: 1e-9)
    }

    func testDecodesAPIPayload() throws {
        let json = """
        {"source":"demo","generatedAt":"2026-01-01T00:00:00.000Z","events":[{"id":"e1","sport":"tennis","league":"ATP","home":"A","away":"B",
        "commenceTime":"2026-01-01T12:00:00.000Z","outcomes":["home","away"],
        "books":[{"bookmaker":"pinnacle","prices":{"home":2.0,"away":1.9},"updatedAt":"2026-01-01T00:00:00Z"}],
        "best":[{"outcome":"home","price":2.0,"bookmaker":"pinnacle"},{"outcome":"away","price":1.9,"bookmaker":"pinnacle"}],
        "bestMargin":0.026,"fair":{"home":0.487,"away":0.513}}]}
        """
        let response = try JSONDecoder().decode(OddsResponse.self, from: Data(json.utf8))
        XCTAssertEqual(response.events.first?.outcomes, [.home, .away])
        XCTAssertNotNil(ISODate.parse(response.events[0].commenceTime))
        XCTAssertFalse(response.events[0].isSureBet)
    }
}
