import SafariServices
import SwiftUI

struct BookLogo: View {
    let bookmaker: Bookmaker?
    var size: CGFloat = 32

    var body: some View {
        RoundedRectangle(cornerRadius: size * 0.3, style: .continuous)
            .fill(Color(hex: bookmaker?.color ?? "#333333"))
            .frame(width: size, height: size)
            .overlay(
                Text(bookmaker?.monogram ?? "?")
                    .font(.system(size: size * 0.34, weight: .bold))
                    .foregroundStyle(Color(hex: bookmaker?.ink ?? "#ffffff"))
                    .minimumScaleFactor(0.5)
                    .padding(2)
            )
            .overlay(RoundedRectangle(cornerRadius: size * 0.3, style: .continuous).strokeBorder(.white.opacity(0.1)))
            .accessibilityLabel(bookmaker?.name ?? "Bookmaker")
    }
}

struct OddsPill: View {
    let price: Double?
    var isBest = false

    var body: some View {
        Text(price?.odds ?? "—")
            .font(.system(.subheadline, design: .monospaced).weight(isBest ? .semibold : .regular))
            .monospacedDigit()
            .foregroundStyle(isBest ? Theme.accent : .primary)
            .frame(minWidth: 58, minHeight: 34)
            .background(isBest ? Theme.accent.opacity(0.12) : Theme.surface2, in: RoundedRectangle(cornerRadius: 10, style: .continuous))
            .overlay(
                RoundedRectangle(cornerRadius: 10, style: .continuous)
                    .strokeBorder(isBest ? Theme.accent.opacity(0.4) : Theme.line)
            )
    }
}

struct RatingBar: View {
    let value: Double

    var body: some View {
        HStack(spacing: 6) {
            Capsule().fill(.white.opacity(0.1))
                .frame(width: 44, height: 5)
                .overlay(alignment: .leading) {
                    Capsule().fill(Theme.accent).frame(width: 44 * value / 5, height: 5)
                }
            Text(String(format: "%.1f", value))
                .font(.caption.monospacedDigit())
        }
        .accessibilityLabel("Rated \(String(format: "%.1f", value)) out of 5")
    }
}

struct Tag: View {
    let text: String

    var body: some View {
        Text(text)
            .font(.system(size: 10, weight: .bold, design: .monospaced))
            .foregroundStyle(Theme.accentInk)
            .padding(.horizontal, 6)
            .padding(.vertical, 2)
            .background(Theme.accent, in: Capsule())
    }
}

/// Opens bookmaker links in an in-app Safari sheet so users come straight back.
struct SafariView: UIViewControllerRepresentable {
    let url: URL

    func makeUIViewController(context: Context) -> SFSafariViewController {
        let vc = SFSafariViewController(url: url)
        vc.preferredControlTintColor = UIColor(Theme.accent)
        vc.preferredBarTintColor = UIColor(Theme.bg)
        return vc
    }

    func updateUIViewController(_ vc: SFSafariViewController, context: Context) {}
}

extension URL: @retroactive Identifiable {
    public var id: String { absoluteString }
}

extension Date {
    var kickoff: String {
        let cal = Calendar.current
        let time = formatted(date: .omitted, time: .shortened)
        if cal.isDateInToday(self) { return "Today \(time)" }
        if cal.isDateInTomorrow(self) { return "Tomorrow \(time)" }
        return formatted(.dateTime.weekday(.abbreviated).day().month(.abbreviated).hour().minute())
    }
}
