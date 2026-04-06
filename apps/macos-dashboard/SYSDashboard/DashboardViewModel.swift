import Foundation

@MainActor
final class DashboardViewModel: ObservableObject {
    @Published var exams: [Exam] = []
    @Published var statusMessage = "Ready"
    @Published var backendURL = "http://localhost:4000"

    func loadExams() async {
        statusMessage = "Loading exams..."
        guard let url = URL(string: "\(backendURL)/api/exams") else {
            statusMessage = "Invalid URL"
            return
        }

        do {
            let (data, _) = try await URLSession.shared.data(from: url)
            let decoded = try JSONDecoder().decode(ExamsResponse.self, from: data)
            exams = decoded.exams
            statusMessage = "Loaded \(decoded.exams.count) exams"
        } catch {
            statusMessage = "Load failed: \(error.localizedDescription)"
        }
    }
}
