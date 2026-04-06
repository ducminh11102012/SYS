import Foundation

struct Exam: Codable, Identifiable {
    let id: String
    let subject: String
    let sourceFileName: String
    let totalScore: Int
}

struct ExamsResponse: Codable {
    let exams: [Exam]
}
