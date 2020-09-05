ĐỒ ÁN LẬP TRÌNH WEB 2 - SALA BANK ONLINE
Lớp 17CK1
Thành Viên:
1760016 - Mai Thiện Chí
1760026 - Hồ Quốc Đạt
1760068 - Võ Chí Hiếu
1760100 - Nguyễn Tài Lộc


Đồ án cuối kỳ
Lập trình Web 2 - 17K1
Mô tả
Xây dựng ứng dụng Internet Banking với các chức năng cơ bản của ngân hàng hàng bán lẻ dành cho người dùng là khách hàng cá nhân:
Tài khoản thanh toán (TKTT)
Tài khoản tiết kiệm (TKTK) có kỳ hạn
Chuyển khoản cùng ngân hàng
Chuyển khoản liên ngân hàng (* sẽ cập nhật yêu cầu và API)
Áp dụng các hạn mức chuyển khoản trên 1 giao dịch, trong ngày tùy loại/tình trạng tài khoản
Xác thực hai lớp khi chuyển khoản đến tài khoản khác
Thông báo thay đổi số dư tài khoản thanh toán hoặc đóng/mở tài khoản tiết kiệm qua email hoặc SMS
Ứng dụng viết bằng Node.js, có thể sử dụng các framework dựa trên Node.js như sail.js, express.js… với CSDL Postgres. Client sử dụng HTML, CSS, JS kết hợp bootstrap hoặc các framework khác kể cả React, Vue...
Chức năng
Khách hàng
Đăng ký tài khoản với email/username và mật khẩu
Các thông tin cá nhân: Họ tên, loại giấy tờ tùy thân, số giấy tờ, ngày cấp
Gửi yêu cầu xác thực tài khoản kèm hình ảnh CMND/CCCD/Hộ chiếu
Quản lý các tài khoản:
Số tài khoản (duy nhất trong một ngân hàng)
Số dư
Đơn vị tiền tệ: VND/USD
Lịch sử giao dịch: Theo khoảng thời gian được yêu cầu
Tình trạng: đóng/mở
Lãi suất/năm (TKTK)
Ngày mở
Ngày đóng (TKTK)
Kỳ hạn (TKTK)
Chuyển khoản (TKTT):
Số tiền
Nội dung
Ngân hàng thụ hưởng (*)
Tài khoản thụ hưởng (*)
Số tiền chuyển khoản không được quá các hạn mức cho trước
Nhân viên ngân hàng
Tìm kiếm thông tin khách hàng theo email/username, số tài khoản kèm các thông tin giao dịch khác
Cập nhật thông tin cá nhân, chấp nhận/từ chối yêu cầu xác thực tài khoản
Thay đổi tình trạng khách hàng: Chưa xác thực/Đã xác thực/Khóa
