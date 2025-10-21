# Hệ thống thanh toán Booking với Sepay

## Tổng quan

Hệ thống thanh toán đã được mở rộng để hỗ trợ thanh toán cho booking (đặt gói và đặt đơn) tương tự như nạp tín dụng, sử dụng Sepay QR code và webhook.

## Các API mới

### 1. BookingPaymentController

#### Tạo QR thanh toán Sepay cho booking

```
POST /api/booking-payment/{bookingId}/sepay-qr
Authorization: Bearer <token>
```

**Response:**

```json
{
  "success": true,
  "message": "Tạo QR thanh toán thành công. Vui lòng quét mã để thanh toán.",
  "bookingId": 123,
  "paymentId": 456,
  "transactionRef": "TX251018123456AB",
  "amount": 500000,
  "qrCodeUrl": "https://qr.sepay.vn/img?acc=VQRQAESPZ4646&bank=MBBank&amount=500000&des=TX251018123456AB"
}
```

#### Kiểm tra trạng thái thanh toán

```
GET /api/booking-payment/{bookingId}/status
Authorization: Bearer <token>
```

**Response:**

```json
{
  "success": true,
  "bookingId": 123,
  "paymentId": 456,
  "status": "PROCESSING",
  "amount": 500000,
  "paymentMethod": "SEPAY_QR",
  "transactionRef": "TX251018123456AB",
  "qrCodeUrl": "https://qr.sepay.vn/img?...",
  "paidAt": null,
  "createdAt": "2025-10-18T10:30:00Z"
}
```

#### Thanh toán bằng tín dụng

```
POST /api/booking-payment/{bookingId}/credit
Authorization: Bearer <token>
```

**Response:**

```json
{
  "success": true,
  "message": "Thanh toán thành công",
  "bookingId": 123,
  "paymentId": 456,
  "amount": 500000,
  "newBalance": 1000000
}
```

#### Mô phỏng thanh toán thành công (cho testing)

```
POST /api/booking-payment/{bookingId}/simulate-success
Authorization: Bearer <token>
```

**Response:**

```json
{
  "success": true,
  "message": "Mô phỏng thanh toán thành công",
  "bookingId": 123,
  "paymentId": 456,
  "transactionRef": "TX251018123456AB"
}
```

### 2. SepayWebhookController (đã cập nhật)

Webhook đã được cập nhật để xử lý cả nạp tín dụng và thanh toán booking:

```
POST /api/payment/sepay/webhook
```

**Xử lý webhook:**

- **DEPOSIT transaction**: Cộng tiền vào tài khoản user
- **PAYMENT transaction**: Trừ tiền từ tài khoản user và cập nhật payment/booking status

**Sepay webhook payload format:**

```json
{
  "id": 92704,
  "gateway": "Vietcombank",
  "transactionDate": "2023-03-25 14:02:37",
  "accountNumber": "0123499999",
  "code": null,
  "content": "chuyen tien mua iphone",
  "transferType": "in",
  "transferAmount": 2277000,
  "accumulated": 19077000,
  "subAccount": null,
  "referenceCode": "MBVCB.3278907687",
  "description": ""
}
```

## Luồng thanh toán

### 1. Thanh toán bằng Sepay QR

1. **Tạo QR**: Gọi API `POST /api/booking-payment/{bookingId}/sepay-qr`
2. **Hiển thị QR**: Frontend hiển thị QR code cho user quét
3. **User thanh toán**: User quét QR và chuyển tiền qua Sepay
4. **Webhook**: Sepay gửi webhook về `/api/payment/sepay/webhook`
5. **Cập nhật**: Hệ thống tự động cập nhật trạng thái payment và booking
6. **Kiểm tra**: Frontend có thể gọi API kiểm tra trạng thái

### 2. Thanh toán bằng tín dụng

1. **Kiểm tra số dư**: Hệ thống kiểm tra user có đủ tín dụng
2. **Trừ tín dụng**: Trừ số tiền từ tài khoản user
3. **Cập nhật**: Cập nhật trạng thái payment và booking ngay lập tức

## Cấu trúc Database

### Transaction Table

- `type`: DEPOSIT (nạp tín dụng) hoặc PAYMENT (thanh toán booking)
- `payment`: Liên kết với Payment entity (null cho DEPOSIT)
- `booking`: Liên kết với Booking entity (null cho DEPOSIT)
- `balanceBefore`: Số dư trước giao dịch
- `balanceAfter`: Số dư sau giao dịch

### Payment Table

- `sepayOrderId`: Mã giao dịch Sepay (transactionRef)
- `qrCodeUrl`: URL QR code
- `status`: PENDING → PROCESSING → COMPLETED

### Booking Table

- `paymentStatus`: Trạng thái thanh toán
- `status`: Trạng thái booking (PAYMENT_PENDING → PAYMENT_COMPLETED)

## Frontend Integration

### BookingPaymentPage Component

Component React mới để xử lý thanh toán booking:

```typescript
// Sử dụng component
<BookingPaymentPage />

// Routing
<Route path="/booking-payment/:bookingId" element={<BookingPaymentPage />} />
```

**Tính năng:**

- Hiển thị thông tin thanh toán
- Tạo QR code Sepay
- Thanh toán bằng tín dụng
- Kiểm tra trạng thái thanh toán
- Mô phỏng thanh toán (cho testing)

## Testing

### 1. Test với Sepay webhook

Sử dụng ngrok để expose local server:

```bash
ngrok http 8080
```

Cấu hình webhook URL trong Sepay:

```
https://your-ngrok-url.ngrok-free.app/api/payment/sepay/webhook
```

### 2. Test payload mẫu

```json
{
  "id": 12345,
  "gateway": "MBBank",
  "transactionDate": "2025-10-18 15:30:00",
  "accountNumber": "0123456789",
  "content": "Thanh toan booking",
  "transferType": "in",
  "transferAmount": 500000,
  "accumulated": 2000000,
  "referenceCode": "TUTOR_123_1234567890"
}
```

### 3. Test với Postman

1. Tạo booking và payment
2. Gọi API tạo QR: `POST /api/booking-payment/{bookingId}/sepay-qr`
3. Gửi webhook mô phỏng: `POST /api/payment/sepay/webhook`
4. Kiểm tra trạng thái: `GET /api/booking-payment/{bookingId}/status`

## Lưu ý quan trọng

1. **Transaction Type**: Hệ thống phân biệt DEPOSIT và PAYMENT transaction
2. **Balance Calculation**:
   - DEPOSIT: `balanceAfter = balanceBefore + amount`
   - PAYMENT: `balanceAfter = balanceBefore - amount`
3. **Webhook Processing**: Xử lý theo loại transaction để cập nhật đúng logic
4. **Error Handling**: Xử lý lỗi khi không tìm thấy transaction hoặc amount mismatch
5. **Security**: Kiểm tra quyền sở hữu booking trước khi cho phép thanh toán

## Các file đã thay đổi

### Backend

- `BookingPaymentController.java` (mới)
- `SepayWebhookController.java` (cập nhật)
- `TransactionRepository.java` (thêm method)
- `TransactionService.java` (thêm method)
- `TransactionServiceImpl.java` (implement method)

### Frontend

- `BookingPaymentPage.tsx` (mới)

## Kết luận

Hệ thống thanh toán đã được mở rộng thành công để hỗ trợ thanh toán booking với Sepay QR code và webhook, tương tự như nạp tín dụng. Webhook được xử lý thông minh để phân biệt giữa nạp tín dụng và thanh toán booking, đảm bảo logic nghiệp vụ chính xác.

