# BẢNG ĐẶC TẢ CHỨC NĂNG - ĐĂNG NHẬP

| **Thông tin**         | **Chi tiết**                                                    |
| --------------------- | --------------------------------------------------------------- |
| **Mã use case**       | UC001                                                           |
| **Tên use case**      | Đăng nhập                                                       |
| **Tác nhân**          | Khách                                                           |
| **Mô tả**             | Người dùng muốn đăng nhập vào hệ thống để sử dụng các chức năng |
| **Sự kiện kích hoạt** | Click vào button "Đăng nhập"                                    |
| **Tiền điều kiện**    | Người dùng đã có tài khoản trên hệ thống                        |

## Luồng sự kiện chính (Thành công)

| STT | Thực hiện bởi | Hành động                       |
| --- | ------------- | ------------------------------- |
| 1   | Khách         | Truy cập trang đăng nhập        |
| 2   | Hệ thống      | Hiển thị form đăng nhập         |
| 3   | Khách         | Nhập email/username và mật khẩu |
| 4   | Khách         | Click button "Đăng nhập"        |
| 5   | Hệ thống      | Validate thông tin đăng nhập    |
| 6   | Hệ thống      | Tạo JWT token                   |
| 7   | Hệ thống      | Trả về token và thông tin user  |
| 8   | Hệ thống      | Lưu token vào localStorage      |
| 9   | Hệ thống      | Chuyển hướng đến trang chủ      |

## Luồng sự kiện thay thế

| STT | Thực hiện bởi | Hành động                                                   |
| --- | ------------- | ----------------------------------------------------------- |
| 5a  | Hệ thống      | Hiển thị thông báo "Tên đăng nhập hoặc mật khẩu không đúng" |

## Hậu điều kiện

Người dùng đã đăng nhập thành công và có thể sử dụng các chức năng của hệ thống
