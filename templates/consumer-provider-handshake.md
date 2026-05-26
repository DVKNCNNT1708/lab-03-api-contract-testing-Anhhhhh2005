# Consumer–Provider Handshake

## Thông tin chung

- Lab: FIT4110 Lab 03
- Ngày: 2026-05-26
- Provider team: Camera Stream A2
- Consumer team: AI Vision A4 / Nhom 4
- Provider service: Camera Stream callback mock
- Consumer service: Smart Campus AI Vision Detection API

## Contract

- Contract file: `contracts/camera-stream.openapi.yaml`
- Mock base URL: `{{cameraStreamMockUrl}}` (`http://localhost:4011` trong mock/local environment)
- Auth method: Bearer token qua `Authorization: Bearer {{authToken}}`
- Endpoint được test: `POST /callbacks/vision`

## Smoke test

### Request

```http
POST /callbacks/vision
Authorization: Bearer <token>
Content-Type: application/json
```

```json
{
  "detectionId": "det_01HY6AIVISION0000000001",
  "cameraId": "CAM-A2-001",
  "motionEventId": "motion-20260518-0001",
  "status": "COMPLETED",
  "riskLevel": "HIGH",
  "overallConfidence": 1,
  "completedAt": "2026-05-18T06:10:17Z",
  "correlationId": "corr-20260518-vision-0001"
}
```

### Expected response

```json
{
  "accepted": true,
  "receivedAt": "2026-05-18T06:10:18Z",
  "correlationId": "corr-20260518-vision-0001"
}
```

## Kết quả

- [x] Consumer gọi mock thành công.
- [x] Consumer parse được field cần dùng: `accepted`, `receivedAt`, `correlationId`.
- [x] Consumer hiểu lỗi 4xx/5xx provider trả về qua `ProblemDetails`.
- [x] Có Newman report trong `reports/newman-report.xml` và `reports/newman-report.html`.

## Ghi chú thay đổi hợp đồng

| Nội dung | Trước | Sau | Người đồng ý |
|---|---|---|---|
| Callback smoke contract | Chưa có trong Lab 2 | Bổ sung mock tối thiểu `POST /callbacks/vision` cho Lab 3 | AI Vision A4, Camera Stream A2 |

## Xác nhận

- Provider representative: Camera Stream A2
- Consumer representative: Nguyen Duc Anh - 1771020050 - Nhom 4
