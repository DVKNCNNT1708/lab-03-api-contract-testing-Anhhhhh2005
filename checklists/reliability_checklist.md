# Reliability Checklist — FIT4110 Lab 03

## 1. Functional tests

- [x] Có test cho endpoint health.
- [x] Có test happy path cho endpoint chính `POST /vision/detect`.
- [x] Có kiểm tra status code 2xx.
- [x] Có kiểm tra field quan trọng trong response: `detectionId`, `objects`, `overallConfidence`, `riskLevel`.
- [x] Có test đọc dữ liệu chi tiết và danh sách: `GET /vision/detections/{detectionId}` và `GET /vision/detections/recent`.

## 2. Auth tests

- [x] Có test thiếu token.
- [x] Có test sai token hoặc token rỗng.
- [x] Endpoint public `/health` được khai báo `security: []`.
- [x] Test thể hiện đúng expected status `401/403` trên local service.

Ghi chú: Prism mock có thể kiểm tra thiếu token, nhưng không chứng minh token value thật. Test token sai được skip có kiểm soát trên `mock`, và phải reject `401/403` khi chạy với `local`.

## 3. Negative tests

- [x] Có test thiếu field bắt buộc `cameraId`.
- [x] Có test payload không hợp lệ cho `imageUrl` và `checksumSha256`.
- [x] Có test sai giá trị ngoài miền `limit=101`.
- [x] Lỗi trả về theo cùng một error model `Problem`.

## 4. Boundary tests

- [x] Có test dữ liệu sát ngưỡng qua `limit=1`.
- [x] Có test limit/pagination cho endpoint danh sách.
- [x] Có test response hợp đồng cho payload quá lớn `413`.
- [x] Có ghi chú kỳ vọng xử lý detection bất đồng bộ `202`.

## 5. Reliability tests cơ bản

- [x] Có kiểm tra response time cho local service.
- [x] Có mô tả timeout mong muốn: local `POST /vision/detect` dưới 1000 ms.
- [x] Có ghi chú idempotency qua header `Idempotency-Key`.
- [x] Có consumer-side smoke test với Camera Stream mock.

## 6. Evidence

- [x] Collection export JSON.
- [x] Environment mock export JSON.
- [x] Environment local export JSON.
- [x] Newman report XML/HTML.
- [x] Newman local report XML.
- [x] Contract lint report.
- [x] Test-case matrix đã điền.
- [x] Biên bản handshake đã điền.
