import SwiftUI

enum Theme {
    static let bg = Color(hex: "#07080a")
    static let surface = Color(hex: "#0e1013")
    static let surface2 = Color(hex: "#14171b")
    static let line = Color.white.opacity(0.08)
    static let muted = Color(hex: "#8b919a")
    static let subtle = Color(hex: "#5d636b")
    static let accent = Color(hex: "#c4ff3d")
    static let accentInk = Color(hex: "#0b0f00")
    static let danger = Color(hex: "#ff5c5c")
}

extension Color {
    init(hex: String) {
        let s = hex.trimmingCharacters(in: CharacterSet(charactersIn: "#"))
        var value: UInt64 = 0
        Scanner(string: s).scanHexInt64(&value)
        self.init(
            .sRGB,
            red: Double((value >> 16) & 0xff) / 255,
            green: Double((value >> 8) & 0xff) / 255,
            blue: Double(value & 0xff) / 255,
            opacity: 1
        )
    }
}

struct CardBackground: ViewModifier {
    func body(content: Content) -> some View {
        content
            .background(Theme.surface, in: RoundedRectangle(cornerRadius: 18, style: .continuous))
            .overlay(RoundedRectangle(cornerRadius: 18, style: .continuous).strokeBorder(Theme.line))
    }
}

extension View {
    func card() -> some View { modifier(CardBackground()) }
}

struct PrimaryButtonStyle: ButtonStyle {
    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .font(.subheadline.weight(.semibold))
            .foregroundStyle(Theme.accentInk)
            .frame(maxWidth: .infinity, minHeight: 44)
            .background(Theme.accent, in: Capsule())
            .scaleEffect(configuration.isPressed ? 0.97 : 1)
            .animation(.snappy(duration: 0.15), value: configuration.isPressed)
    }
}
