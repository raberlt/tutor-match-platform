# BẢNG ĐẶC TẢ CHỨC NĂNG HỆ THỐNG TUTORMATCH

## UC001 - ĐĂNG NHẬP

| **Thông tin**         | **Chi tiết**                                                    |
| --------------------- | --------------------------------------------------------------- |
| **Mã use case**       | UC001                                                           |
| **Tên use case**      | Đăng nhập                                                       |
| **Tác nhân**          | Khách                                                           |
| **Mô tả**             | Người dùng muốn đăng nhập vào hệ thống để sử dụng các chức năng |
| **Sự kiện kích hoạt** | Click vào button "Đăng nhập"                                    |
| **Tiền điều kiện**    | Người dùng đã có tài khoản trên hệ thống                        |

### Luồng sự kiện chính (Thành công)

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

### Luồng sự kiện thay thế

| STT | Thực hiện bởi | Hành động                                                   |
| --- | ------------- | ----------------------------------------------------------- |
| 5a  | Hệ thống      | Hiển thị thông báo "Tên đăng nhập hoặc mật khẩu không đúng" |

### Hậu điều kiện

Người dùng đã đăng nhập thành công và có thể sử dụng các chức năng của hệ thống

---

## UC002 - ĐĂNG KÝ

| **Thông tin**         | **Chi tiết**                                    |
| --------------------- | ----------------------------------------------- |
| **Mã use case**       | UC002                                           |
| **Tên use case**      | Đăng ký                                         |
| **Tác nhân**          | Khách                                           |
| **Mô tả**             | Người dùng muốn tạo tài khoản mới trên hệ thống |
| **Sự kiện kích hoạt** | Click vào button "Đăng ký"                      |
| **Tiền điều kiện**    | Người dùng chưa có tài khoản trên hệ thống      |

### Luồng sự kiện chính (Thành công)

| STT | Thực hiện bởi | Hành động                                                           |
| --- | ------------- | ------------------------------------------------------------------- |
| 1   | Khách         | Truy cập trang đăng ký                                              |
| 2   | Hệ thống      | Hiển thị form đăng ký                                               |
| 3   | Khách         | Nhập thông tin cá nhân (firstName, lastName, email, password, role) |
| 4   | Khách         | Click button "Đăng ký"                                              |
| 5   | Hệ thống      | Validate form input                                                 |
| 6   | Hệ thống      | Kiểm tra email đã tồn tại chưa                                      |
| 7   | Hệ thống      | Tạo User entity                                                     |
| 8   | Hệ thống      | Encode password                                                     |
| 9   | Hệ thống      | Lưu User vào database                                               |
| 10  | Hệ thống      | Tạo TutorProfile nếu role = TUTOR                                   |
| 11  | Hệ thống      | Set educationLevel mặc định                                         |
| 12  | Hệ thống      | Trả về thông tin user đã tạo                                        |
| 13  | Hệ thống      | Hiển thị thông báo đăng ký thành công                               |
| 14  | Hệ thống      | Chuyển hướng đến trang đăng nhập                                    |

### Luồng sự kiện thay thế

| STT | Thực hiện bởi | Hành động                                  |
| --- | ------------- | ------------------------------------------ |
| 6a  | Hệ thống      | Hiển thị thông báo "Email đã được sử dụng" |

### Hậu điều kiện

Tài khoản mới đã được tạo thành công

---

## UC003 - CẬP NHẬT THÔNG TIN

| **Thông tin**         | **Chi tiết**                                      |
| --------------------- | ------------------------------------------------- |
| **Mã use case**       | UC003                                             |
| **Tên use case**      | Cập nhật thông tin cá nhân                        |
| **Tác nhân**          | Học sinh                                          |
| **Mô tả**             | Học sinh muốn cập nhật thông tin cá nhân của mình |
| **Sự kiện kích hoạt** | Click vào button "Cập nhật thông tin"             |
| **Tiền điều kiện**    | Học sinh đã đăng nhập vào hệ thống                |

### Luồng sự kiện chính (Thành công)

| STT | Thực hiện bởi | Hành động                                                                                                      |
| --- | ------------- | -------------------------------------------------------------------------------------------------------------- |
| 1   | Học sinh      | Truy cập trang cài đặt                                                                                         |
| 2   | Hệ thống      | Lấy thông tin user hiện tại                                                                                    |
| 3   | Hệ thống      | Hiển thị form với dữ liệu hiện tại                                                                             |
| 4   | Học sinh      | Chỉnh sửa thông tin (firstName, lastName, username, phoneNumber, dateOfBirth, gender, address, educationLevel) |
| 5   | Học sinh      | Click button "Cập nhật"                                                                                        |
| 6   | Hệ thống      | Validate form input                                                                                            |
| 7   | Hệ thống      | Validate JWT token                                                                                             |
| 8   | Hệ thống      | Kiểm tra username mới đã tồn tại chưa                                                                          |
| 9   | Hệ thống      | Cập nhật các trường User                                                                                       |
| 10  | Hệ thống      | Parse và validate các trường                                                                                   |
| 11  | Hệ thống      | Lưu User đã cập nhật                                                                                           |
| 12  | Hệ thống      | Trả về thông tin user đã cập nhật                                                                              |
| 13  | Hệ thống      | Hiển thị thông báo cập nhật thành công                                                                         |

### Luồng sự kiện thay thế

| STT | Thực hiện bởi | Hành động                                                         |
| --- | ------------- | ----------------------------------------------------------------- |
| 8a  | Hệ thống      | Hiển thị thông báo "Tên đăng nhập đã được sử dụng bởi người khác" |

### Hậu điều kiện

Thông tin cá nhân đã được cập nhật thành công

---

## UC004 - ĐÁNH GIÁ

| **Thông tin**         | **Chi tiết**                                    |
| --------------------- | ----------------------------------------------- |
| **Mã use case**       | UC004                                           |
| **Tên use case**      | Đánh giá gia sư                                 |
| **Tác nhân**          | Học sinh                                        |
| **Mô tả**             | Học sinh muốn đánh giá gia sư sau buổi học      |
| **Sự kiện kích hoạt** | Click vào button "Đánh giá"                     |
| **Tiền điều kiện**    | Học sinh đã đăng nhập và có buổi học hoàn thành |

### Luồng sự kiện chính (Thành công)

| STT | Thực hiện bởi | Hành động                              |
| --- | ------------- | -------------------------------------- |
| 1   | Học sinh      | Truy cập trang đánh giá                |
| 2   | Hệ thống      | Lấy thông tin session                  |
| 3   | Hệ thống      | Hiển thị form đánh giá                 |
| 4   | Học sinh      | Nhập điểm số và nhận xét               |
| 5   | Học sinh      | Click button "Gửi đánh giá"            |
| 6   | Hệ thống      | Validate dữ liệu đánh giá              |
| 7   | Hệ thống      | Lưu đánh giá vào database              |
| 8   | Hệ thống      | Trả về thông báo thành công            |
| 9   | Hệ thống      | Hiển thị thông báo đánh giá thành công |

### Luồng sự kiện thay thế

| STT | Thực hiện bởi | Hành động                                          |
| --- | ------------- | -------------------------------------------------- |
| 6a  | Hệ thống      | Hiển thị thông báo "Dữ liệu đánh giá không hợp lệ" |

### Hậu điều kiện

Đánh giá đã được lưu thành công

---

## UC005 - ĐẶT LỊCH HỌC

| **Thông tin**         | **Chi tiết**                              |
| --------------------- | ----------------------------------------- |
| **Mã use case**       | UC005                                     |
| **Tên use case**      | Đặt lịch học                              |
| **Tác nhân**          | Học sinh                                  |
| **Mô tả**             | Học sinh muốn đặt lịch học với gia sư     |
| **Sự kiện kích hoạt** | Click vào button "Đặt lịch học"           |
| **Tiền điều kiện**    | Học sinh đã đăng nhập và chọn được gia sư |

### Luồng sự kiện chính (Thành công)

| STT | Thực hiện bởi | Hành động                                              |
| --- | ------------- | ------------------------------------------------------ |
| 1   | Học sinh      | Truy cập trang đặt lịch                                |
| 2   | Hệ thống      | Lấy thông tin gia sư                                   |
| 3   | Hệ thống      | Hiển thị form đặt lịch                                 |
| 4   | Học sinh      | Chọn loại booking (single/package), môn học, thời gian |
| 5   | Học sinh      | Click button "Đặt lịch"                                |
| 6   | Hệ thống      | Validate booking data                                  |
| 7   | Hệ thống      | Lưu booking vào database                               |
| 8   | Hệ thống      | Trả về bookingId và thông tin thanh toán               |
| 9   | Hệ thống      | Chuyển hướng đến trang thanh toán                      |

### Luồng sự kiện thay thế

| STT | Thực hiện bởi | Hành động                                          |
| --- | ------------- | -------------------------------------------------- |
| 6a  | Hệ thống      | Hiển thị thông báo "Dữ liệu đặt lịch không hợp lệ" |

### Hậu điều kiện

Lịch học đã được đặt thành công

---

## UC006 - ĐỔI MẬT KHẨU

| **Thông tin**         | **Chi tiết**                             |
| --------------------- | ---------------------------------------- |
| **Mã use case**       | UC006                                    |
| **Tên use case**      | Đổi mật khẩu                             |
| **Tác nhân**          | Học sinh                                 |
| **Mô tả**             | Học sinh muốn thay đổi mật khẩu của mình |
| **Sự kiện kích hoạt** | Click vào button "Đổi mật khẩu"          |
| **Tiền điều kiện**    | Học sinh đã đăng nhập vào hệ thống       |

### Luồng sự kiện chính (Thành công)

| STT | Thực hiện bởi | Hành động                                  |
| --- | ------------- | ------------------------------------------ |
| 1   | Học sinh      | Truy cập trang đổi mật khẩu                |
| 2   | Hệ thống      | Hiển thị form đổi mật khẩu                 |
| 3   | Học sinh      | Nhập mật khẩu hiện tại và mật khẩu mới     |
| 4   | Học sinh      | Click button "Đổi mật khẩu"                |
| 5   | Hệ thống      | Validate JWT token                         |
| 6   | Hệ thống      | Verify mật khẩu hiện tại                   |
| 7   | Hệ thống      | Encode mật khẩu mới                        |
| 8   | Hệ thống      | Cập nhật mật khẩu trong database           |
| 9   | Hệ thống      | Trả về thông báo thành công                |
| 10  | Hệ thống      | Hiển thị thông báo đổi mật khẩu thành công |

### Luồng sự kiện thay thế

| STT | Thực hiện bởi | Hành động                                         |
| --- | ------------- | ------------------------------------------------- |
| 6a  | Hệ thống      | Hiển thị thông báo "Mật khẩu hiện tại không đúng" |

### Hậu điều kiện

Mật khẩu đã được thay đổi thành công

---

## UC007 - THANH TOÁN

| **Thông tin**         | **Chi tiết**                                 |
| --------------------- | -------------------------------------------- |
| **Mã use case**       | UC007                                        |
| **Tên use case**      | Thanh toán                                   |
| **Tác nhân**          | Học sinh                                     |
| **Mô tả**             | Học sinh muốn thanh toán cho lịch học đã đặt |
| **Sự kiện kích hoạt** | Click vào button "Thanh toán ngay"           |
| **Tiền điều kiện**    | Học sinh đã đặt lịch học và chưa thanh toán  |

### Luồng sự kiện chính (Thành công)

| STT | Thực hiện bởi | Hành động                                  |
| --- | ------------- | ------------------------------------------ |
| 1   | Học sinh      | Truy cập trang thanh toán                  |
| 2   | Hệ thống      | Lấy thông tin booking                      |
| 3   | Hệ thống      | Hiển thị thông tin thanh toán và countdown |
| 4   | Học sinh      | Click "Thanh toán ngay"                    |
| 5   | Hệ thống      | Validate booking và payment                |
| 6   | Hệ thống      | Cập nhật trạng thái booking thành "PAID"   |
| 7   | Hệ thống      | Trả về thông báo thanh toán thành công     |
| 8   | Hệ thống      | Chuyển hướng đến trang booking success     |

### Luồng sự kiện thay thế

| STT | Thực hiện bởi | Hành động                                                 |
| --- | ------------- | --------------------------------------------------------- |
| 5a  | Hệ thống      | Hiển thị thông báo "Booking không hợp lệ hoặc đã hết hạn" |

### Hậu điều kiện

Thanh toán đã được thực hiện thành công

---

## UC008 - TÌM GIA SƯ

| **Thông tin**         | **Chi tiết**                          |
| --------------------- | ------------------------------------- |
| **Mã use case**       | UC008                                 |
| **Tên use case**      | Tìm gia sư                            |
| **Tác nhân**          | Học sinh                              |
| **Mô tả**             | Học sinh muốn tìm kiếm gia sư phù hợp |
| **Sự kiện kích hoạt** | Truy cập trang tìm gia sư             |
| **Tiền điều kiện**    | Học sinh đã đăng nhập vào hệ thống    |

### Luồng sự kiện chính (Thành công)

| STT | Thực hiện bởi | Hành động                                           |
| --- | ------------- | --------------------------------------------------- |
| 1   | Học sinh      | Truy cập trang tìm gia sư                           |
| 2   | Hệ thống      | Query tutors theo filters                           |
| 3   | Hệ thống      | Trả về danh sách tutors với pagination              |
| 4   | Hệ thống      | Hiển thị danh sách gia sư                           |
| 5   | Học sinh      | Áp dụng filters (môn học, thành phố, giá, đánh giá) |
| 6   | Hệ thống      | Query tutors với filters                            |
| 7   | Hệ thống      | Trả về kết quả tìm kiếm                             |
| 8   | Hệ thống      | Hiển thị danh sách gia sư đã filter                 |
| 9   | Học sinh      | Click vào gia sư để xem chi tiết                    |
| 10  | Hệ thống      | Lấy thông tin chi tiết gia sư                       |
| 11  | Hệ thống      | Hiển thị trang chi tiết gia sư                      |

### Luồng sự kiện thay thế

| STT | Thực hiện bởi | Hành động                                          |
| --- | ------------- | -------------------------------------------------- |
| 2a  | Hệ thống      | Hiển thị thông báo "Không tìm thấy gia sư phù hợp" |

### Hậu điều kiện

Học sinh đã tìm được gia sư phù hợp

---

## UC009 - XEM BUỔI HỌC

| **Thông tin**         | **Chi tiết**                                      |
| --------------------- | ------------------------------------------------- |
| **Mã use case**       | UC009                                             |
| **Tên use case**      | Xem buổi học                                      |
| **Tác nhân**          | Học sinh                                          |
| **Mô tả**             | Học sinh muốn xem danh sách các buổi học của mình |
| **Sự kiện kích hoạt** | Click vào menu "Buổi học của tôi"                 |
| **Tiền điều kiện**    | Học sinh đã đăng nhập vào hệ thống                |

### Luồng sự kiện chính (Thành công)

| STT | Thực hiện bởi | Hành động                                            |
| --- | ------------- | ---------------------------------------------------- |
| 1   | Học sinh      | Truy cập trang "Buổi học của tôi"                    |
| 2   | Hệ thống      | Validate JWT token                                   |
| 3   | Hệ thống      | Query sessions của student                           |
| 4   | Hệ thống      | Trả về sessions data                                 |
| 5   | Hệ thống      | Hiển thị danh sách buổi học                          |
| 6   | Học sinh      | Áp dụng filters (trạng thái, loại booking, tìm kiếm) |
| 7   | Hệ thống      | Query sessions với filters                           |
| 8   | Hệ thống      | Trả về sessions đã filter                            |
| 9   | Hệ thống      | Hiển thị danh sách buổi học đã filter                |
| 10  | Học sinh      | Click "Xem chi tiết" booking                         |
| 11  | Hệ thống      | Lấy thông tin chi tiết booking                       |
| 12  | Hệ thống      | Hiển thị modal chi tiết booking                      |

### Luồng sự kiện thay thế

| STT | Thực hiện bởi | Hành động                                     |
| --- | ------------- | --------------------------------------------- |
| 3a  | Hệ thống      | Hiển thị thông báo "Bạn chưa có buổi học nào" |

### Hậu điều kiện

Học sinh đã xem được thông tin buổi học

---

## UC010 - CẬP NHẬT THÔNG TIN CÁ NHÂN

| **Thông tin**         | **Chi tiết**                                             |
| --------------------- | -------------------------------------------------------- |
| **Mã use case**       | UC010                                                    |
| **Tên use case**      | Cập nhật thông tin cá nhân                               |
| **Tác nhân**          | Gia sư                                                   |
| **Mô tả**             | Gia sư muốn cập nhật thông tin cá nhân và hồ sơ của mình |
| **Sự kiện kích hoạt** | Click vào menu "Quản lý hồ sơ"                           |
| **Tiền điều kiện**    | Gia sư đã đăng nhập vào hệ thống                         |

### Luồng sự kiện chính (Thành công)

| STT | Thực hiện bởi | Hành động                                                                                             |
| --- | ------------- | ----------------------------------------------------------------------------------------------------- |
| 1   | Gia sư        | Truy cập trang quản lý hồ sơ                                                                          |
| 2   | Hệ thống      | Lấy thông tin tutor profile                                                                           |
| 3   | Hệ thống      | Hiển thị form với dữ liệu hiện tại                                                                    |
| 4   | Gia sư        | Chỉnh sửa thông tin (bio, headline, experience, subjects, teaching audiences, schedule, certificates) |
| 5   | Gia sư        | Click button "Lưu nháp" hoặc "Gửi đăng ký"                                                            |
| 6   | Hệ thống      | Validate form input                                                                                   |
| 7   | Hệ thống      | Validate JWT token                                                                                    |
| 8   | Hệ thống      | Tìm/cập nhật ProfileApplication                                                                       |
| 9   | Hệ thống      | Trả về kết quả lưu                                                                                    |
| 10  | Hệ thống      | Hiển thị thông báo cập nhật thành công                                                                |

### Luồng sự kiện thay thế

| STT | Thực hiện bởi | Hành động                                 |
| --- | ------------- | ----------------------------------------- |
| 6a  | Hệ thống      | Hiển thị thông báo "Dữ liệu không hợp lệ" |

### Hậu điều kiện

Thông tin cá nhân đã được cập nhật thành công

---

## UC011 - XEM DANH SÁCH HỌC SINH

| **Thông tin**         | **Chi tiết**                                            |
| --------------------- | ------------------------------------------------------- |
| **Mã use case**       | UC011                                                   |
| **Tên use case**      | Xem danh sách học sinh                                  |
| **Tác nhân**          | Gia sư                                                  |
| **Mô tả**             | Gia sư muốn xem danh sách học sinh đã đặt lịch với mình |
| **Sự kiện kích hoạt** | Click vào menu "Quản lý học sinh"                       |
| **Tiền điều kiện**    | Gia sư đã đăng nhập vào hệ thống                        |

### Luồng sự kiện chính (Thành công)

| STT | Thực hiện bởi | Hành động                                               |
| --- | ------------- | ------------------------------------------------------- |
| 1   | Gia sư        | Truy cập trang quản lý học sinh                         |
| 2   | Hệ thống      | Validate JWT token                                      |
| 3   | Hệ thống      | Query students đã đặt lịch với tutor                    |
| 4   | Hệ thống      | Trả về danh sách students                               |
| 5   | Hệ thống      | Hiển thị danh sách học sinh                             |
| 6   | Gia sư        | Áp dụng filters (trạng thái booking, môn học, tìm kiếm) |
| 7   | Hệ thống      | Query students với filters                              |
| 8   | Hệ thống      | Trả về students đã filter                               |
| 9   | Hệ thống      | Hiển thị danh sách học sinh đã filter                   |
| 10  | Gia sư        | Click "Xem chi tiết" student                            |
| 11  | Hệ thống      | Lấy thông tin chi tiết bookings của student             |
| 12  | Hệ thống      | Hiển thị modal chi tiết học sinh                        |

### Luồng sự kiện thay thế

| STT | Thực hiện bởi | Hành động                                     |
| --- | ------------- | --------------------------------------------- |
| 3a  | Hệ thống      | Hiển thị thông báo "Bạn chưa có học sinh nào" |

### Hậu điều kiện

Gia sư đã xem được danh sách học sinh

---

## UC012 - XEM LỊCH DẠY

| **Thông tin**         | **Chi tiết**                                    |
| --------------------- | ----------------------------------------------- |
| **Mã use case**       | UC012                                           |
| **Tên use case**      | Xem lịch dạy                                    |
| **Tác nhân**          | Gia sư                                          |
| **Mô tả**             | Gia sư muốn xem lịch dạy và quản lý các booking |
| **Sự kiện kích hoạt** | Click vào menu "Lịch dạy"                       |
| **Tiền điều kiện**    | Gia sư đã đăng nhập vào hệ thống                |

### Luồng sự kiện chính (Thành công)

| STT | Thực hiện bởi | Hành động                                                |
| --- | ------------- | -------------------------------------------------------- |
| 1   | Gia sư        | Truy cập trang lịch dạy                                  |
| 2   | Hệ thống      | Validate JWT token                                       |
| 3   | Hệ thống      | Query bookings của tutor                                 |
| 4   | Hệ thống      | Trả về danh sách bookings                                |
| 5   | Hệ thống      | Hiển thị danh sách lịch dạy                              |
| 6   | Gia sư        | Áp dụng filters (trạng thái, loại booking, tìm kiếm)     |
| 7   | Hệ thống      | Query bookings với filters                               |
| 8   | Hệ thống      | Trả về bookings đã filter                                |
| 9   | Hệ thống      | Hiển thị danh sách lịch dạy đã filter                    |
| 10  | Gia sư        | Click "Xem chi tiết" booking                             |
| 11  | Hệ thống      | Lấy thông tin chi tiết booking                           |
| 12  | Hệ thống      | Hiển thị modal chi tiết booking                          |
| 13  | Gia sư        | Click "Chấp nhận" hoặc "Từ chối" (nếu booking chờ duyệt) |
| 14  | Hệ thống      | Cập nhật trạng thái booking                              |
| 15  | Hệ thống      | Hiển thị thông báo và refresh danh sách                  |

### Luồng sự kiện thay thế

| STT | Thực hiện bởi | Hành động                                     |
| --- | ------------- | --------------------------------------------- |
| 3a  | Hệ thống      | Hiển thị thông báo "Bạn chưa có lịch dạy nào" |

### Hậu điều kiện

Gia sư đã xem và quản lý được lịch dạy

---

## UC013 - CẬP NHẬT BOOKING

| **Thông tin**         | **Chi tiết**                                                 |
| --------------------- | ------------------------------------------------------------ |
| **Mã use case**       | UC013                                                        |
| **Tên use case**      | Cập nhật booking                                             |
| **Tác nhân**          | Admin                                                        |
| **Mô tả**             | Admin muốn cập nhật thông tin booking của học sinh và gia sư |
| **Sự kiện kích hoạt** | Click vào button "Cập nhật" trong danh sách booking          |
| **Tiền điều kiện**    | Admin đã đăng nhập vào hệ thống                              |

### Luồng sự kiện chính (Thành công)

| STT | Thực hiện bởi | Hành động                               |
| --- | ------------- | --------------------------------------- |
| 1   | Admin         | Truy cập trang quản lý booking          |
| 2   | Hệ thống      | Validate JWT token và role ADMIN        |
| 3   | Hệ thống      | Query tất cả bookings                   |
| 4   | Hệ thống      | Hiển thị danh sách bookings             |
| 5   | Admin         | Click "Cập nhật" booking                |
| 6   | Hệ thống      | Validate admin permissions              |
| 7   | Hệ thống      | Cập nhật booking trong database         |
| 8   | Hệ thống      | Trả về thông báo thành công             |
| 9   | Hệ thống      | Hiển thị thông báo và refresh danh sách |

### Luồng sự kiện thay thế

| STT | Thực hiện bởi | Hành động                                    |
| --- | ------------- | -------------------------------------------- |
| 2a  | Hệ thống      | Hiển thị thông báo "Không có quyền truy cập" |

### Hậu điều kiện

Booking đã được cập nhật thành công

---

## UC014 - DUYỆT HỒ SƠ

| **Thông tin**         | **Chi tiết**                                       |
| --------------------- | -------------------------------------------------- |
| **Mã use case**       | UC014                                              |
| **Tên use case**      | Duyệt hồ sơ                                        |
| **Tác nhân**          | Admin                                              |
| **Mô tả**             | Admin muốn duyệt hoặc từ chối hồ sơ đăng ký gia sư |
| **Sự kiện kích hoạt** | Click vào button "Duyệt" hoặc "Từ chối"            |
| **Tiền điều kiện**    | Admin đã đăng nhập vào hệ thống                    |

### Luồng sự kiện chính (Thành công)

| STT | Thực hiện bởi | Hành động                                                     |
| --- | ------------- | ------------------------------------------------------------- |
| 1   | Admin         | Truy cập trang duyệt hồ sơ                                    |
| 2   | Hệ thống      | Validate JWT token và role ADMIN                              |
| 3   | Hệ thống      | Query ProfileApplications                                     |
| 4   | Hệ thống      | Hiển thị danh sách hồ sơ                                      |
| 5   | Admin         | Click "Xem chi tiết" application                              |
| 6   | Hệ thống      | Lấy thông tin chi tiết application                            |
| 7   | Hệ thống      | Hiển thị modal chi tiết hồ sơ                                 |
| 8   | Admin         | Click "Duyệt" hoặc "Từ chối"                                  |
| 9   | Hệ thống      | Validate admin permissions                                    |
| 10  | Hệ thống      | Cập nhật ApplicationStatus                                    |
| 11  | Hệ thống      | Copy data từ ProfileApplication sang TutorProfile (nếu duyệt) |
| 12  | Hệ thống      | Trả về thông báo thành công                                   |
| 13  | Hệ thống      | Hiển thị thông báo và refresh danh sách                       |

### Luồng sự kiện thay thế

| STT | Thực hiện bởi | Hành động                                    |
| --- | ------------- | -------------------------------------------- |
| 2a  | Hệ thống      | Hiển thị thông báo "Không có quyền truy cập" |

### Hậu điều kiện

Hồ sơ đã được duyệt hoặc từ chối thành công

---

## UC015 - MỞ KHÓA TÀI KHOẢN

| **Thông tin**         | **Chi tiết**                                      |
| --------------------- | ------------------------------------------------- |
| **Mã use case**       | UC015                                             |
| **Tên use case**      | Mở khóa tài khoản                                 |
| **Tác nhân**          | Admin                                             |
| **Mô tả**             | Admin muốn khóa hoặc mở khóa tài khoản người dùng |
| **Sự kiện kích hoạt** | Click vào button "Khóa" hoặc "Mở khóa"            |
| **Tiền điều kiện**    | Admin đã đăng nhập vào hệ thống                   |

### Luồng sự kiện chính (Thành công)

| STT | Thực hiện bởi | Hành động                               |
| --- | ------------- | --------------------------------------- |
| 1   | Admin         | Truy cập trang quản lý người dùng       |
| 2   | Hệ thống      | Validate JWT token và role ADMIN        |
| 3   | Hệ thống      | Query tất cả users                      |
| 4   | Hệ thống      | Hiển thị danh sách người dùng           |
| 5   | Admin         | Click "Khóa" hoặc "Mở khóa" user        |
| 6   | Hệ thống      | Validate admin permissions              |
| 7   | Hệ thống      | Toggle enable status của user           |
| 8   | Hệ thống      | Trả về thông báo thành công             |
| 9   | Hệ thống      | Hiển thị thông báo và refresh danh sách |

### Luồng sự kiện thay thế

| STT | Thực hiện bởi | Hành động                                    |
| --- | ------------- | -------------------------------------------- |
| 2a  | Hệ thống      | Hiển thị thông báo "Không có quyền truy cập" |

### Hậu điều kiện

Trạng thái tài khoản đã được thay đổi thành công

---

## UC016 - QUẢN LÝ COUPON

| **Thông tin**         | **Chi tiết**                              |
| --------------------- | ----------------------------------------- |
| **Mã use case**       | UC016                                     |
| **Tên use case**      | Quản lý coupon                            |
| **Tác nhân**          | Admin                                     |
| **Mô tả**             | Admin muốn tạo và quản lý các mã giảm giá |
| **Sự kiện kích hoạt** | Click vào button "Tạo coupon mới"         |
| **Tiền điều kiện**    | Admin đã đăng nhập vào hệ thống           |

### Luồng sự kiện chính (Thành công)

| STT | Thực hiện bởi | Hành động                                                  |
| --- | ------------- | ---------------------------------------------------------- |
| 1   | Admin         | Truy cập trang quản lý coupon                              |
| 2   | Hệ thống      | Validate JWT token và role ADMIN                           |
| 3   | Hệ thống      | Query tất cả coupons                                       |
| 4   | Hệ thống      | Hiển thị danh sách coupons                                 |
| 5   | Admin         | Click "Tạo coupon mới"                                     |
| 6   | Hệ thống      | Hiển thị form tạo coupon                                   |
| 7   | Admin         | Nhập thông tin coupon (code, discount, expiry, usageLimit) |
| 8   | Hệ thống      | Validate admin permissions                                 |
| 9   | Hệ thống      | Lưu coupon vào database                                    |
| 10  | Hệ thống      | Trả về thông báo thành công                                |
| 11  | Hệ thống      | Hiển thị thông báo và refresh danh sách                    |

### Luồng sự kiện thay thế

| STT | Thực hiện bởi | Hành động                                    |
| --- | ------------- | -------------------------------------------- |
| 2a  | Hệ thống      | Hiển thị thông báo "Không có quyền truy cập" |

### Hậu điều kiện

Coupon đã được tạo thành công

---

## UC017 - THÊM NGƯỜI DÙNG

| **Thông tin**         | **Chi tiết**                                |
| --------------------- | ------------------------------------------- |
| **Mã use case**       | UC017                                       |
| **Tên use case**      | Thêm người dùng                             |
| **Tác nhân**          | Admin                                       |
| **Mô tả**             | Admin muốn thêm người dùng mới vào hệ thống |
| **Sự kiện kích hoạt** | Click vào button "Thêm người dùng"          |
| **Tiền điều kiện**    | Admin đã đăng nhập vào hệ thống             |

### Luồng sự kiện chính (Thành công)

| STT | Thực hiện bởi | Hành động                                                                          |
| --- | ------------- | ---------------------------------------------------------------------------------- |
| 1   | Admin         | Truy cập trang quản lý người dùng                                                  |
| 2   | Hệ thống      | Hiển thị danh sách users hiện tại                                                  |
| 3   | Admin         | Click "Thêm người dùng"                                                            |
| 4   | Hệ thống      | Hiển thị form thêm user                                                            |
| 5   | Admin         | Chọn loại user (Student/Tutor)                                                     |
| 6   | Hệ thống      | Hiển thị form fields tương ứng                                                     |
| 7   | Admin         | Nhập thông tin cơ bản (firstName, lastName, email, password, role, educationLevel) |
| 8   | Hệ thống      | Validate admin permissions                                                         |
| 9   | Hệ thống      | Kiểm tra email đã tồn tại chưa                                                     |
| 10  | Hệ thống      | Tạo User entity                                                                    |
| 11  | Hệ thống      | Encode password                                                                    |
| 12  | Hệ thống      | Lưu User vào database                                                              |
| 13  | Hệ thống      | Tạo TutorProfile nếu role = TUTOR                                                  |
| 14  | Hệ thống      | Trả về thông báo thành công                                                        |
| 15  | Hệ thống      | Hiển thị thông báo và refresh danh sách                                            |

### Luồng sự kiện thay thế

| STT | Thực hiện bởi | Hành động                                  |
| --- | ------------- | ------------------------------------------ |
| 9a  | Hệ thống      | Hiển thị thông báo "Email đã được sử dụng" |

### Hậu điều kiện

Người dùng mới đã được tạo thành công

---

## UC018 - XEM DANH SÁCH HỒ SƠ ĐĂNG KÝ

| **Thông tin**         | **Chi tiết**                                      |
| --------------------- | ------------------------------------------------- |
| **Mã use case**       | UC018                                             |
| **Tên use case**      | Xem danh sách hồ sơ đăng ký                       |
| **Tác nhân**          | Admin                                             |
| **Mô tả**             | Admin muốn xem danh sách các hồ sơ đăng ký gia sư |
| **Sự kiện kích hoạt** | Truy cập trang duyệt hồ sơ                        |
| **Tiền điều kiện**    | Admin đã đăng nhập vào hệ thống                   |

### Luồng sự kiện chính (Thành công)

| STT | Thực hiện bởi | Hành động                                       |
| --- | ------------- | ----------------------------------------------- |
| 1   | Admin         | Truy cập trang duyệt hồ sơ                      |
| 2   | Hệ thống      | Validate JWT token và role ADMIN                |
| 3   | Hệ thống      | Query ProfileApplications với filters           |
| 4   | Hệ thống      | Trả về danh sách applications                   |
| 5   | Hệ thống      | Hiển thị danh sách hồ sơ                        |
| 6   | Admin         | Áp dụng filters (trạng thái, vai trò, tìm kiếm) |
| 7   | Hệ thống      | Query applications với filters                  |
| 8   | Hệ thống      | Trả về applications đã filter                   |
| 9   | Hệ thống      | Hiển thị danh sách hồ sơ đã filter              |
| 10  | Admin         | Click "Xem chi tiết" application                |
| 11  | Hệ thống      | Lấy thông tin chi tiết application              |
| 12  | Hệ thống      | Hiển thị modal chi tiết hồ sơ                   |

### Luồng sự kiện thay thế

| STT | Thực hiện bởi | Hành động                                    |
| --- | ------------- | -------------------------------------------- |
| 2a  | Hệ thống      | Hiển thị thông báo "Không có quyền truy cập" |

### Hậu điều kiện

Admin đã xem được danh sách hồ sơ đăng ký

---

## UC019 - XEM DANH SÁCH NGƯỜI DÙNG

| **Thông tin**         | **Chi tiết**                                                  |
| --------------------- | ------------------------------------------------------------- |
| **Mã use case**       | UC019                                                         |
| **Tên use case**      | Xem danh sách người dùng                                      |
| **Tác nhân**          | Admin                                                         |
| **Mô tả**             | Admin muốn xem và quản lý danh sách người dùng trong hệ thống |
| **Sự kiện kích hoạt** | Truy cập trang quản lý người dùng                             |
| **Tiền điều kiện**    | Admin đã đăng nhập vào hệ thống                               |

### Luồng sự kiện chính (Thành công)

| STT | Thực hiện bởi | Hành động                                    |
| --- | ------------- | -------------------------------------------- |
| 1   | Admin         | Truy cập trang quản lý người dùng            |
| 2   | Hệ thống      | Validate JWT token và role ADMIN             |
| 3   | Hệ thống      | Query tất cả users                           |
| 4   | Hệ thống      | Trả về danh sách users                       |
| 5   | Hệ thống      | Hiển thị danh sách người dùng                |
| 6   | Admin         | Áp dụng filters (role, trạng thái, tìm kiếm) |
| 7   | Hệ thống      | Query users với filters                      |
| 8   | Hệ thống      | Trả về users đã filter                       |
| 9   | Hệ thống      | Hiển thị danh sách người dùng đã filter      |
| 10  | Admin         | Click "Sửa" user                             |
| 11  | Hệ thống      | Lấy thông tin chi tiết user                  |
| 12  | Hệ thống      | Hiển thị form chỉnh sửa user                 |
| 13  | Admin         | Cập nhật thông tin user                      |
| 14  | Hệ thống      | Cập nhật user trong database                 |
| 15  | Hệ thống      | Trả về thông báo thành công                  |
| 16  | Hệ thống      | Hiển thị thông báo và refresh danh sách      |

### Luồng sự kiện thay thế

| STT | Thực hiện bởi | Hành động                                    |
| --- | ------------- | -------------------------------------------- |
| 2a  | Hệ thống      | Hiển thị thông báo "Không có quyền truy cập" |

### Hậu điều kiện

Admin đã xem và quản lý được danh sách người dùng
