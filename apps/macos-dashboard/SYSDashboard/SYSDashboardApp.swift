import SwiftUI

@main
struct SYSDashboardApp: App {
    var body: some Scene {
        WindowGroup {
            ContentView(viewModel: DashboardViewModel())
        }
    }
}
