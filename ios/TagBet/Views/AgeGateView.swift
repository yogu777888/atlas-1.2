import SwiftUI

struct AgeGateView: View {
    let onConfirm: () -> Void
    @State private var denied = false

    var body: some View {
        VStack(alignment: .leading, spacing: 16) {
            Spacer()
            RoundedRectangle(cornerRadius: 16, style: .continuous)
                .fill(Theme.accent)
                .frame(width: 56, height: 56)
                .overlay(Image(systemName: "tag.fill").font(.title2).foregroundStyle(Theme.accentInk))
            if denied {
                Text("Come back when you're 18").font(.largeTitle.bold())
                Text("tag.bet is only for adults of legal gambling age in their country.")
                    .foregroundStyle(Theme.muted)
            } else {
                Text("Are you 18 or older?").font(.largeTitle.bold())
                Text("tag.bet compares sports betting odds. You must be of legal gambling age in your country to continue.")
                    .foregroundStyle(Theme.muted)
                Spacer().frame(height: 12)
                Button("Yes, I'm 18+", action: onConfirm)
                    .buttonStyle(PrimaryButtonStyle())
                Button("No") { denied = true }
                    .frame(maxWidth: .infinity, minHeight: 44)
                    .foregroundStyle(.primary)
            }
            Spacer()
            Text("Gambling can be addictive. Please play responsibly.")
                .font(.footnote)
                .foregroundStyle(Theme.subtle)
        }
        .padding(24)
        .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .leading)
        .background(Theme.bg)
        .interactiveDismissDisabled()
    }
}
