import SwiftUI

struct OddsView: View {
    @Environment(AppModel.self) private var model
    @State private var search = ""

    private var filtered: [OddsEvent] {
        let q = search.trimmingCharacters(in: .whitespaces).lowercased()
        let list = q.isEmpty ? model.events : model.events.filter {
            "\($0.home) \($0.away) \($0.league)".lowercased().contains(q)
        }
        // Starred matches float to the top
        return list.sorted { model.isStarred($0.id) && !model.isStarred($1.id) }
    }

    var body: some View {
        @Bindable var model = model
        NavigationStack {
            ScrollView {
                LazyVStack(spacing: 10, pinnedViews: []) {
                    SportPicker(sport: $model.sport, sureBetsOnly: $model.sureBetsOnly)
                        .padding(.bottom, 6)

                    if let error = model.error, model.events.isEmpty {
                        ContentUnavailableView("Can't load odds", systemImage: "wifi.exclamationmark", description: Text(error))
                            .padding(.top, 40)
                    } else if filtered.isEmpty && !model.isLoading {
                        ContentUnavailableView(
                            model.sureBetsOnly ? "No sure bets right now" : "No matches",
                            systemImage: model.sureBetsOnly ? "bolt.slash" : "sportscourt",
                            description: Text(model.sureBetsOnly ? "They appear and vanish fast. Pull to refresh." : "Try another sport.")
                        )
                        .padding(.top, 40)
                    }

                    ForEach(filtered) { event in
                        NavigationLink(value: event) {
                            EventCard(event: event)
                        }
                        .buttonStyle(.plain)
                    }

                    if model.oddsSource == "demo" {
                        Text("Demo odds — connect a live feed on the server.")
                            .font(.caption2)
                            .foregroundStyle(Theme.subtle)
                            .padding(.top, 8)
                    }
                }
                .padding(.horizontal)
            }
            .background(Theme.bg)
            .navigationTitle("Odds")
            .navigationDestination(for: OddsEvent.self) { EventDetailView(event: $0) }
            .searchable(text: $search, prompt: "Team, player or league")
            .refreshable { await model.loadOdds() }
            .overlay { if model.isLoading && model.events.isEmpty { ProgressView() } }
            .task(id: "\(model.sport.rawValue)-\(model.sureBetsOnly)") { await model.loadOdds() }
        }
    }
}

private struct SportPicker: View {
    @Binding var sport: Sport
    @Binding var sureBetsOnly: Bool

    var body: some View {
        ScrollView(.horizontal, showsIndicators: false) {
            HStack(spacing: 8) {
                ForEach(Sport.allCases) { s in
                    chip("\(s.emoji) \(s.label)", selected: !sureBetsOnly && sport == s) {
                        sureBetsOnly = false
                        sport = s
                    }
                }
                chip("⚡ Sure bets", selected: sureBetsOnly, accent: true) {
                    sureBetsOnly = true
                    sport = .all
                }
            }
        }
        .sensoryFeedback(.selection, trigger: sport)
        .sensoryFeedback(.selection, trigger: sureBetsOnly)
    }

    private func chip(_ title: String, selected: Bool, accent: Bool = false, action: @escaping () -> Void) -> some View {
        Button(action: action) {
            Text(title)
                .font(.subheadline.weight(.medium))
                .padding(.horizontal, 14)
                .padding(.vertical, 8)
                .foregroundStyle(selected ? (accent ? Theme.accentInk : Theme.bg) : (accent ? Theme.accent : Theme.muted))
                .background(selected ? (accent ? Theme.accent : Color.white) : Theme.surface, in: Capsule())
                .overlay(Capsule().strokeBorder(selected ? .clear : (accent ? Theme.accent.opacity(0.3) : Theme.line)))
        }
        .buttonStyle(.plain)
    }
}

struct EventCard: View {
    @Environment(AppModel.self) private var model
    let event: OddsEvent

    var body: some View {
        VStack(alignment: .leading, spacing: 10) {
            HStack(spacing: 6) {
                Text(event.league)
                Text("·")
                Text(event.startDate.kickoff)
                if event.isSureBet { Tag(text: "SURE BET") }
                Spacer()
                if model.isStarred(event.id) {
                    Image(systemName: "star.fill").foregroundStyle(Theme.accent)
                }
            }
            .font(.caption)
            .foregroundStyle(Theme.subtle)

            Text("\(event.home) – \(event.away)")
                .font(.headline)
                .lineLimit(1)

            HStack(spacing: 8) {
                ForEach(event.outcomes, id: \.self) { o in
                    if let best = event.best(o) {
                        HStack(spacing: 6) {
                            Text(o.short).font(.caption2).foregroundStyle(Theme.accent.opacity(0.6))
                            Spacer(minLength: 0)
                            Text(best.price.odds)
                                .font(.system(.subheadline, design: .monospaced).weight(.semibold))
                                .foregroundStyle(Theme.accent)
                            BookLogo(bookmaker: model.bookmaker(best.bookmaker), size: 18)
                        }
                        .padding(.horizontal, 10)
                        .frame(maxWidth: .infinity, minHeight: 38)
                        .background(Theme.accent.opacity(0.1), in: RoundedRectangle(cornerRadius: 10, style: .continuous))
                    }
                }
            }
        }
        .padding(14)
        .card()
        .accessibilityElement(children: .combine)
    }
}
