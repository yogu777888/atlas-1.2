import SwiftUI

struct RootView: View {
    var body: some View {
        TabView {
            OddsView()
                .tabItem { Label("Odds", systemImage: "chart.line.uptrend.xyaxis") }
            BonusesView()
                .tabItem { Label("Bonuses", systemImage: "gift") }
            BookmakersView()
                .tabItem { Label("Books", systemImage: "list.number") }
            SettingsView()
                .tabItem { Label("More", systemImage: "ellipsis.circle") }
        }
    }
}
