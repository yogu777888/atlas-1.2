import SwiftUI

@main
struct TagBetApp: App {
    @State private var model = AppModel()
    @AppStorage("ageConfirmed") private var ageConfirmed = false

    var body: some Scene {
        WindowGroup {
            RootView()
                .environment(model)
                .preferredColorScheme(.dark)
                .tint(Theme.accent)
                .fullScreenCover(isPresented: Binding(get: { !ageConfirmed }, set: { _ in })) {
                    AgeGateView { ageConfirmed = true }
                }
                .task { await model.bootstrap() }
        }
    }
}
