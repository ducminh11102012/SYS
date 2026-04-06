import SwiftUI

struct ContentView: View {
    @StateObject var viewModel: DashboardViewModel

    var body: some View {
        VStack(alignment: .leading, spacing: 16) {
            Text("SYS Dashboard")
                .font(.largeTitle)
                .bold()

            HStack {
                Text("Backend URL")
                TextField("http://localhost:4000", text: $viewModel.backendURL)
                    .textFieldStyle(.roundedBorder)
                Button("Refresh") {
                    Task { await viewModel.loadExams() }
                }
            }

            Text(viewModel.statusMessage)
                .foregroundStyle(.secondary)

            List(viewModel.exams) { exam in
                VStack(alignment: .leading) {
                    Text(exam.subject).font(.headline)
                    Text("\(exam.sourceFileName) • /\(exam.totalScore)")
                        .font(.caption)
                        .foregroundStyle(.secondary)
                }
            }
        }
        .padding(20)
        .frame(minWidth: 760, minHeight: 500)
        .task {
            await viewModel.loadExams()
        }
    }
}
