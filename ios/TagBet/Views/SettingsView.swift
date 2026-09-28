import SwiftUI

struct SettingsView: View {
    @Environment(AppModel.self) private var model
    @State private var openURL: URL?

    private var version: String {
        let v = Bundle.main.infoDictionary?["CFBundleShortVersionString"] as? String ?? "1.0"
        let b = Bundle.main.infoDictionary?["CFBundleVersion"] as? String ?? "1"
        return "\(v) (\(b))"
    }

    var body: some View {
        NavigationStack {
            List {
                Section("Play safe") {
                    link("Responsible gambling", "heart.text.square", model.config?.responsibleGamblingUrl ?? URL(string: "https://tag.bet/responsible-gambling")!)
                    link("Get help now", "phone.bubble", model.config?.helplineUrl ?? URL(string: "https://www.gamblingtherapy.org")!)
                }
                Section("About") {
                    link("How tag.bet makes money", "info.circle", model.config?.disclosureUrl ?? URL(string: "https://tag.bet/disclosure")!)
                    link("Privacy", "hand.raised", APIClient.shared.baseURL.appending(path: "privacy"))
                    link("Terms", "doc.text", APIClient.shared.baseURL.appending(path: "terms"))
                    LabeledContent("Version", value: version)
                    if let country = model.config?.country {
                        LabeledContent("Region", value: country)
                    }
                }
                Section {
                    EmptyView()
                } footer: {
                    Text("18+ only. tag.bet is an independent comparison service and does not accept bets. We may earn a commission when you join a bookmaker through our links — it never changes the odds or which price is tagged.")
                }
            }
            .scrollContentBackground(.hidden)
            .background(Theme.bg)
            .navigationTitle("More")
            .sheet(item: $openURL) { SafariView(url: $0).ignoresSafeArea() }
        }
    }

    private func link(_ title: String, _ icon: String, _ url: URL) -> some View {
        Button { openURL = url } label: {
            Label(title, systemImage: icon).foregroundStyle(.primary)
        }
        .listRowBackground(Theme.surface)
    }
}
