import SwiftUI

struct BookmakersView: View {
    @Environment(AppModel.self) private var model

    var body: some View {
        NavigationStack {
            List {
                Section {
                    ForEach(Array(model.bookmakers.enumerated()), id: \.element.id) { index, b in
                        NavigationLink(value: b) {
                            HStack(spacing: 12) {
                                Text(String(format: "%02d", index + 1))
                                    .font(.caption.monospaced())
                                    .foregroundStyle(Theme.subtle)
                                BookLogo(bookmaker: b, size: 36)
                                VStack(alignment: .leading, spacing: 2) {
                                    Text(b.name).font(.headline)
                                    Text(b.bonus.headline).font(.caption).foregroundStyle(Theme.muted).lineLimit(1)
                                }
                                Spacer()
                                RatingBar(value: b.rating)
                            }
                            .opacity(b.available ? 1 : 0.45)
                        }
                        .listRowBackground(Theme.surface)
                    }
                } footer: {
                    Text("Ranked on price quality, payout speed, markets and how they treat winners. Commissions never change the order.")
                }
            }
            .scrollContentBackground(.hidden)
            .background(Theme.bg)
            .navigationTitle("Bookmakers")
            .navigationDestination(for: Bookmaker.self) { BookmakerDetailView(bookmaker: $0) }
            .refreshable { await model.bootstrap() }
            .overlay { if model.bookmakers.isEmpty { ProgressView() } }
        }
    }
}

struct BookmakerDetailView: View {
    @Environment(AppModel.self) private var model
    let bookmaker: Bookmaker

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 20) {
                HStack(spacing: 14) {
                    BookLogo(bookmaker: bookmaker, size: 56)
                    VStack(alignment: .leading) {
                        Text(bookmaker.name).font(.title.bold())
                        Text(bookmaker.features.joined(separator: " · ")).font(.caption).foregroundStyle(Theme.muted)
                    }
                }

                LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())], spacing: 10) {
                    fact("Avg. margin", "~" + bookmaker.avgMargin.percent())
                    fact("Payout", bookmaker.payout)
                    fact("Min. deposit", bookmaker.minDeposit)
                    fact("License", bookmaker.license)
                }

                BonusCardView(bookmaker: bookmaker, source: "review")

                list("What we like", items: bookmaker.pros, symbol: "plus", color: Theme.accent)
                list("Watch out for", items: bookmaker.cons, symbol: "minus", color: Theme.danger)
            }
            .padding()
        }
        .background(Theme.bg)
        .navigationBarTitleDisplayMode(.inline)
    }

    private func fact(_ k: String, _ v: String) -> some View {
        VStack(alignment: .leading, spacing: 4) {
            Text(k).font(.caption).foregroundStyle(Theme.subtle)
            Text(v).font(.subheadline.monospaced()).lineLimit(1).minimumScaleFactor(0.7)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(12)
        .card()
    }

    private func list(_ title: String, items: [String], symbol: String, color: Color) -> some View {
        VStack(alignment: .leading, spacing: 10) {
            Text(title).font(.headline).foregroundStyle(color)
            ForEach(items, id: \.self) { item in
                Label { Text(item).foregroundStyle(Theme.muted) } icon: { Image(systemName: symbol).foregroundStyle(color) }
                    .font(.subheadline)
            }
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(16)
        .card()
    }
}
