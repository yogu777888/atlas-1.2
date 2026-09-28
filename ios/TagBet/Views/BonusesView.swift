import SwiftUI

struct BonusesView: View {
    @Environment(AppModel.self) private var model

    var body: some View {
        NavigationStack {
            ScrollView {
                LazyVStack(spacing: 12) {
                    Text("A bonus is only worth it if you were going to bet anyway. Never chase one.")
                        .font(.footnote)
                        .foregroundStyle(Theme.muted)
                        .frame(maxWidth: .infinity, alignment: .leading)
                    ForEach(model.bookmakers.filter(\.available)) { b in
                        BonusCardView(bookmaker: b, source: "bonuses")
                    }
                }
                .padding()
            }
            .background(Theme.bg)
            .navigationTitle("Bonuses")
            .refreshable { await model.bootstrap() }
            .overlay { if model.bookmakers.isEmpty { ProgressView() } }
        }
    }
}

struct BonusCardView: View {
    @Environment(AppModel.self) private var model
    let bookmaker: Bookmaker
    let source: String
    @State private var openURL: URL?
    @State private var copied = false

    var body: some View {
        VStack(alignment: .leading, spacing: 10) {
            HStack(spacing: 10) {
                BookLogo(bookmaker: bookmaker, size: 32)
                VStack(alignment: .leading, spacing: 0) {
                    Text(bookmaker.name).font(.subheadline.weight(.semibold))
                    Text(bookmaker.license).font(.caption2).foregroundStyle(Theme.subtle)
                }
            }
            Text(bookmaker.bonus.headline).font(.title3.bold())
            Text(bookmaker.bonus.detail).font(.subheadline).foregroundStyle(Theme.muted)
            if let code = bookmaker.bonus.code {
                Button {
                    UIPasteboard.general.string = code
                    copied = true
                } label: {
                    HStack(spacing: 6) {
                        Text("CODE").foregroundStyle(Theme.subtle)
                        Text(code)
                        Image(systemName: copied ? "checkmark" : "doc.on.doc").foregroundStyle(Theme.muted)
                    }
                    .font(.caption.monospaced())
                    .padding(.horizontal, 10)
                    .padding(.vertical, 6)
                    .overlay(RoundedRectangle(cornerRadius: 8).strokeBorder(style: StrokeStyle(lineWidth: 1, dash: [4])).foregroundStyle(Theme.line))
                }
                .buttonStyle(.plain)
                .sensoryFeedback(.success, trigger: copied)
            }
            if let url = model.outboundLink(for: bookmaker.slug, source: source) {
                Button("Claim offer") { openURL = url }
                    .buttonStyle(PrimaryButtonStyle())
                    .padding(.top, 4)
            }
            Text(bookmaker.bonus.terms).font(.caption2).foregroundStyle(Theme.subtle)
        }
        .padding(16)
        .background(alignment: .topTrailing) {
            Circle()
                .fill(Color(hex: bookmaker.color).opacity(0.25))
                .frame(width: 160, height: 160)
                .blur(radius: 50)
                .offset(x: 50, y: -60)
        }
        .clipShape(RoundedRectangle(cornerRadius: 18, style: .continuous))
        .card()
        .sheet(item: $openURL) { SafariView(url: $0).ignoresSafeArea() }
    }
}
