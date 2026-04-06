# Kiến trúc hệ thống SYS (Luyện thi học sinh giỏi online)

## 1) Mục tiêu nghiệp vụ
- Upload đề dạng PDF/DOCX.
- AI phân tích đề, tách part giống luồng thi IELTS: trắc nghiệm, reading, tự luận/writing.
- Nếu đề có đáp án thì tái sử dụng; nếu chưa có, AI sinh đáp án gợi ý.
- Học sinh làm theo từng part.
- Chấm điểm tự động: trắc nghiệm máy chấm, writing AI chấm.
- Trả kết quả trên thang điểm /20 kèm chữa chi tiết.

## 2) Kiến trúc thành phần

### A. Backend Orchestrator (Node.js + Express)
- `POST /api/config`: cấu hình AI runtime (base URL, API key, model).
- `POST /api/exams/upload`: upload file đề, trích xuất text, gọi AI để chuẩn hóa đề.
- `POST /api/exams/submit`: nhận bài làm, chạy grading pipeline theo từng part.
- `GET /api/exams/grades/:submissionId`: trả điểm và feedback.

### B. AI Adapter
- Adapter gọi endpoint LLM tương thích kiểu chat completions.
- Fallback local khi chưa có AI config, đảm bảo hệ thống luôn chạy demo được.

### C. CLI vận hành
- Upload đề.
- Liệt kê đề.
- Nộp bài bằng JSON answers.
- Lấy điểm/chữa.

### D. SwiftUI macOS Dashboard
- Màn hình dashboard quản trị đề và trạng thái backend.
- Có thể mở rộng để theo dõi submission realtime.

### E. GitHub Actions + Cloudflared
- Manual trigger (`workflow_dispatch`) để dựng backend trên runner.
- Mở tunnel cloudflared và xuất URL `trycloudflare`.

## 3) Pipeline chấm điểm
1. Student submit answers map theo `partId`.
2. Với `multiple_choice`: so đáp án tuyệt đối.
3. Với `essay`/`short_answer`: AI scoring + normalize về maxScore của part.
4. Với `reading`: heuristic coverage (có thể thay bằng rubric AI ở bản production).
5. Cộng tổng và clamp điểm tối đa 20.

## 4) Gợi ý production hardening
- Thay in-memory store bằng Postgres + Redis queue.
- Tách worker grading bất đồng bộ (BullMQ).
- Audit log cho mọi lần chấm.
- Thêm chống gian lận (time-on-task, proctoring hooks).
- Fine-tune rubric theo từng môn chuyên (Toán, Văn, Anh, Lý, Hóa...).
