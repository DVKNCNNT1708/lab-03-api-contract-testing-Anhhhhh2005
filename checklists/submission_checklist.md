# Submission Checklist — Lab 03

Trước khi nộp, repo nhóm cần có các file sau. Bài này đã cấu hình theo service **Smart Campus AI Vision Detection API** từ Lab 02:

```text
contracts/ai-vision.openapi.yaml
contracts/camera-stream.openapi.yaml
postman/collections/FIT4110_lab03_ai_vision.postman_collection.json
postman/environments/FIT4110_lab03_mock.postman_environment.json
postman/environments/FIT4110_lab03_local.postman_environment.json
reports/newman-report.xml
reports/newman-report.html
reports/contract-lint-report.txt
checklists/reliability_checklist.md
templates/test-case-matrix.csv
templates/consumer-provider-handshake.md
```

## Trạng thái rà soát

- [x] Contract chính AI Vision đã thay bằng contract Lab 02.
- [x] Có mock contract cho service phụ thuộc Camera Stream.
- [x] Collection có đủ folder Functional/Auth/Negative/Boundary/Consumer-side/Local-only.
- [x] Collection không hardcode `baseUrl` hoặc `authToken`.
- [x] Mock environment và local environment đã export.
- [x] Contract lint pass.
- [x] Newman mock test pass và có XML/HTML report.
- [x] Test-case matrix đã điền.
- [x] Reliability checklist đã điền.
- [x] Consumer-provider handshake đã điền.
- [x] Local service thật đã chạy và `npm run test:local` pass.
- [ ] Có link GitHub Actions run sau khi push.

Ghi chú: Hai mục cuối chỉ hoàn tất được khi bạn có service thật local hoặc sau khi push lên GitHub.

## Quy ước commit

Gợi ý commit cuối:

```bash
git add .
git commit -m "lab03: add postman contract tests and newman report"
git push
```

## Link nộp LMS

Nộp link GitHub repo, không nộp file rời.
