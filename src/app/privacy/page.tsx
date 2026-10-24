export default function PrivacyPage() {
  return (
    <article className="mx-auto max-w-3xl px-4 py-12 space-y-6 text-gray-300 leading-relaxed">
      <h1 className="text-3xl font-bold text-white">Chính sách bảo mật dữ liệu</h1>
      <p>Bản thử nghiệm Tickticket phục vụ học tập và kiểm thử hệ thống bán vé. Chỉ dùng tài khoản, số điện thoại và thông tin thanh toán giả khi trải nghiệm.</p>
      <section className="space-y-2"><h2 className="text-xl font-semibold text-white">Dữ liệu và mục đích sử dụng</h2><p>Hệ thống lưu họ tên, email, số điện thoại, mật khẩu đã băm, sự kiện yêu thích, đơn hàng, vé và nhật ký thao tác. Dữ liệu được dùng để đăng nhập, quản lý đặt vé, kiểm tra vé và xử lý sự cố. Hệ thống không lưu số thẻ hoặc CVV; thanh toán hiện là mô phỏng.</p></section>
      <section className="space-y-2"><h2 className="text-xl font-semibold text-white">Quyền truy cập và bên nhận dữ liệu</h2><p>Khách hàng truy cập đơn hàng và vé của mình. Quản trị viên quản lý hệ thống; ban tổ chức kiểm tra vé của sự kiện được giao. Máy chủ MongoDB và hạ tầng do người triển khai cấu hình lưu dữ liệu. Trình duyệt có thể tải ảnh từ nhà cung cấp bên ngoài, khiến địa chỉ IP được gửi đến nhà cung cấp ảnh.</p></section>
      <section className="space-y-2"><h2 className="text-xl font-semibold text-white">Thời gian lưu và yêu cầu xử lý</h2><p>Dữ liệu thử nghiệm được giữ trong database đến khi người quản trị xóa hoặc khởi tạo lại. Hệ thống hiện chưa tự động xóa theo thời hạn. Không gửi dữ liệu cá nhân thật vào bản thử nghiệm. Người triển khai cần công bố thời hạn lưu phù hợp trước khi vận hành chính thức.</p></section>
      <section className="space-y-2"><h2 className="text-xl font-semibold text-white">Liên hệ và quyền của người dùng</h2><p>Liên hệ trực tiếp nhóm quản trị đã cung cấp bản thử nghiệm để yêu cầu xem, sửa hoặc xóa thông tin. Bản thử nghiệm chưa có kênh hỗ trợ công khai được xác nhận. Khi triển khai chính thức, đơn vị vận hành phải bổ sung thông tin liên hệ và quy trình tiếp nhận yêu cầu.</p></section>
    </article>
  );
}
