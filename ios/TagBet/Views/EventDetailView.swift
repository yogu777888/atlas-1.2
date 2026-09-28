import SwiftUI

struct EventDetailView: View {
    @Environment(AppModel.self) private var model
    let event: OddsEvent
    @State private var openURL: URL?

    private var sortedBooks: [BookPrices] {
        event.books.sorted {
            (OddsMath.bookMargin($0, outcomes: event.outcomes) ?? 1) < (OddsMath.bookMargin($1, outcomes: event.outcomes) ?? 1)
        }
    }

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 24) {
                header
                bestPrices
                allBooks
                if event.isSureBet { StakeSplitterView(event: event) }
                Text("Prices can change at any moment. Always check the final odds on the bookmaker's bet slip. 18+ · Bet responsibly.")
                    .font(.caption2)
                    .foregroundStyle(Theme.subtle)
            }
            .padding()
        }
        .background(Theme.bg)
        .navigationBarTitleDisplayMode(.inline)
        .toolbar {
            ToolbarItem(placement: .topBarTrailing) {
                Button {
                    model.toggleStar(event.id)
                } label: {
                    Image(systemName: model.isStarred(event.id) ? "star.fill" : "star")
                }
                .sensoryFeedback(.impact, trigger: model.isStarred(event.id))
                .accessibilityLabel(model.isStarred(event.id) ? "Unstar match" : "Star match")
            }
        }
        .sheet(item: $openURL) { SafariView(url: $0).ignoresSafeArea() }
    }

    private var header: some View {
        VStack(alignment: .leading, spacing: 6) {
            HStack {
                Text("\(event.league) · \(event.startDate.kickoff)")
                if event.isSureBet { Tag(text: "SURE BET +\((-event.bestMargin).percent(2))") }
            }
            .font(.caption)
            .foregroundStyle(Theme.subtle)
            Text(event.home).font(.largeTitle.bold())
            Text("vs").font(.title3).foregroundStyle(Theme.subtle)
            Text(event.away).font(.largeTitle.bold())
        }
    }

    private var bestPrices: some View {
        VStack(spacing: 10) {
            ForEach(event.best, id: \.outcome) { best in
                let book = model.bookmaker(best.bookmaker)
                HStack(spacing: 12) {
                    VStack(alignment: .leading, spacing: 4) {
                        Text(event.label(best.outcome)).font(.subheadline).foregroundStyle(Theme.muted)
                        Text(best.price.odds)
                            .font(.system(size: 32, weight: .semibold, design: .monospaced))
                            .foregroundStyle(Theme.accent)
                        HStack(spacing: 6) {
                            BookLogo(bookmaker: book, size: 18)
                            Text(book?.name ?? best.bookmaker)
                            if let fair = event.fair[best.outcome.rawValue], fair > 0 {
                                Text("· fair \((1 / fair).odds)")
                            }
                        }
                        .font(.caption)
                        .foregroundStyle(Theme.subtle)
                    }
                    Spacer()
                    if let url = model.outboundLink(for: best.bookmaker, source: "event") {
                        Button("Bet") { openURL = url }
                            .buttonStyle(PrimaryButtonStyle())
                            .frame(width: 88)
                    }
                }
                .padding(16)
                .card()
            }
        }
    }

    private var allBooks: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("All bookmakers").font(.headline)
            VStack(spacing: 0) {
                HStack {
                    Text("Book").frame(maxWidth: .infinity, alignment: .leading)
                    ForEach(event.outcomes, id: \.self) { Text($0.short).frame(width: 58) }
                    Text("Margin").frame(width: 52, alignment: .trailing)
                }
                .font(.caption2.monospaced())
                .foregroundStyle(Theme.subtle)
                .padding(12)

                ForEach(sortedBooks, id: \.bookmaker) { book in
                    Divider().overlay(Theme.line)
                    HStack {
                        HStack(spacing: 8) {
                            BookLogo(bookmaker: model.bookmaker(book.bookmaker), size: 22)
                            Text(model.bookmaker(book.bookmaker)?.name ?? book.bookmaker)
                                .font(.subheadline)
                                .lineLimit(1)
                                .minimumScaleFactor(0.8)
                        }
                        .frame(maxWidth: .infinity, alignment: .leading)
                        ForEach(event.outcomes, id: \.self) { o in
                            OddsPill(price: book.price(o), isBest: book.price(o) != nil && book.price(o) == event.best(o)?.price)
                        }
                        Text(OddsMath.bookMargin(book, outcomes: event.outcomes)?.percent() ?? "—")
                            .font(.caption.monospacedDigit())
                            .foregroundStyle(Theme.muted)
                            .frame(width: 52, alignment: .trailing)
                    }
                    .padding(.horizontal, 12)
                    .padding(.vertical, 8)
                }
            }
            .card()
        }
    }
}

struct StakeSplitterView: View {
    @Environment(AppModel.self) private var model
    let event: OddsEvent
    @State private var total: Double = 100

    var body: some View {
        let prices = event.best.map(\.price)
        let stakes = OddsMath.splitStakes(prices, total: total)
        let payout = (stakes.first ?? 0) * (prices.first ?? 0)

        VStack(alignment: .leading, spacing: 12) {
            HStack {
                VStack(alignment: .leading) {
                    Text("Stake splitter").font(.headline)
                    Text("Equal payout whatever the result.").font(.caption).foregroundStyle(Theme.muted)
                }
                Spacer()
                TextField("Stake", value: $total, format: .number)
                    .keyboardType(.decimalPad)
                    .multilineTextAlignment(.trailing)
                    .font(.body.monospacedDigit())
                    .padding(8)
                    .frame(width: 100)
                    .background(Theme.surface2, in: RoundedRectangle(cornerRadius: 10))
            }
            ForEach(Array(event.best.enumerated()), id: \.offset) { i, best in
                HStack {
                    Text(event.label(best.outcome))
                    Text("@ \(best.price.odds) · \(model.bookmaker(best.bookmaker)?.name ?? best.bookmaker)")
                        .foregroundStyle(Theme.subtle)
                    Spacer()
                    Text(String(format: "%.2f", stakes[i])).monospacedDigit()
                }
                .font(.subheadline)
            }
            HStack {
                Text("Return on any outcome")
                Spacer()
                Text(String(format: "%.2f (%+.2f)", payout, payout - total))
                    .font(.body.monospacedDigit().weight(.semibold))
            }
            .foregroundStyle(Theme.accent)
            .padding(12)
            .background(Theme.accent.opacity(0.1), in: RoundedRectangle(cornerRadius: 12))
        }
        .padding(16)
        .card()
    }
}
