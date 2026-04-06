# SYS - Nền tảng luyện thi học sinh giỏi online

Hệ thống monorepo gồm:
- `apps/backend`: Backend orchestrator Node.js.
- `apps/cli`: CLI quản trị và thao tác pipeline.
- `apps/macos-dashboard`: SwiftUI macOS dashboard.
- `packages/shared`: Schema dùng chung.
- `.github/workflows/cloudflared-demo.yml`: chạy demo public qua cloudflared.

## Quick start

```bash
npm install
npm run build
npm run dev:backend
```

Mở web local: `http://localhost:4000` để cấu hình AI (`baseUrl`, `apiKey`, `model`).

## CLI

```bash
# upload đề
node apps/cli/dist/index.js upload --file ./sample.pdf

# list đề
node apps/cli/dist/index.js list

# nộp bài
node apps/cli/dist/index.js submit --exam <examId> --candidate hs001 --answers answers.json

# lấy kết quả
node apps/cli/dist/index.js grade --submission <submissionId>
```

## API chính
- `GET /health`
- `POST /api/config`
- `POST /api/exams/upload` (multipart `file`)
- `GET /api/exams`
- `GET /api/exams/:examId`
- `POST /api/exams/submit`
- `GET /api/exams/grades/:submissionId`

## GitHub Action cloudflared
Vào Actions -> **SYS Cloudflared Demo** -> Run workflow.
Sau khi chạy, artifact `cloudflared-session` chứa `cloudflared_url.txt` để mở web demo.

## Detailed architecture
Xem `docs/architecture.md`.
