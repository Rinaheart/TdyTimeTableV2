# 📅 Phân Tích Lịch Giảng (Teaching Schedule Analytics)

[![Version](https://img.shields.io/badge/véion-0.016-blue.svg?style=flat-square)](https://github.com/your-username/your-repo-name)
[![Status](https://img.shields.io/badge/status-active-success.svg?style=flat-square)](https://github.com/your-username/your-repo-name)
[![License](https://img.shields.io/badge/license-MIT-green.svg?style=flat-square)](https://github.com/your-username/your-repo-name)

**Hệ thống phân tích và quản lý lịch trình giảng dạy thông minh.** *Công cụ hỗ trợ đắc lực dành cho Giảng viên Khối Cao đẳng - Trường Đại học Y Dược, Đại học Huế.*

---

## 📖 Giới thiệu (Introduction)

**Phân tích Lịch giảng** là một ứng dụng web (Client-side) hiện đại, giúp giảng viên chuyển đổi dữ liệu lịch giảng thô từ hệ thống UMS hoặc file Excel thành một **Dashboard trực quan**. 

Ứng dụng không chỉ dừng lại ở việc hiển thị thời khóa biểu mà còn cung cấp các chỉ số phân tích sâu (Analytics), tự động phát hiện xung đột, cảnh báo quá tải và hỗ trợ tối ưu hóa kế hoạch giảng dạy cá nhân.

---

## 📑 Mục lục (Table of Contents)
* [🚀 Tính năng nổi bật](#-tính-năng-nổi-bật-key-features)
* [🛠 Hướng dẫn sử dụng](#-hướng-dẫn-sử-dụng-usage)
* [🧠 Cấu trúc dữ liệu & Xử lý](#-cấu-trúc-dữ-liệu--xử-lý)
* [💻 Công nghệ sử dụng](#-công-nghệ-sử-dụng-tech-stack)
* [📦 Phiên bản & Cập nhật](#-phiên-bản--cập-nhật)
* [👨‍💻 Tác giả](#-tác-giả)

---

## 🚀 Tính năng nổi bật (Key Features)

### 1. Xử lý dữ liệu thông minh
* **Parser mạnh mẽ:** Tự động bóc tách dữ liệu từ file HTML lịch giảng cá nhân từ hệ thống đào tạo.
* **Phân loại tự động:** Nhận diện loại hình học phần (Lý thuyết/Thực hành) dựa trên mã môn học.
* **Lọc thông minh:** Tách biệt khối lượng công việc của Giảng viên chính và Giảng viên hỗ trợ.

### 2. Dashboard Phân tích chuyên sâu (v0.011)
Giao diện trực quan giúp nắm bắt toàn bộ tiến độ giảng dạy:
* **Biến động theo tuần:** Theo dõi khối lượng công việc qua biểu đồ đường (Line Chart).
* **Bản đồ nhiệt (Heatmap):** Xác định nhanh các "điểm nóng" và tuần cao điểm.
* **Cơ cấu học phần:** Phân tích tỷ trọng Lý thuyết/Thực hành và phân bổ Sáng/Chiều/Tối.
* **Trọng số môn học:** Sử dụng Treemap để trực quan hóa các học phần chiếm nhiều thời gian nhất.

### 3. Hệ thống Cảnh báo & Nhận định (Insights)
* **Cảnh báo thông minh:** Tự động phát hiện dạy quá giờ/tuần, dạy cuối tuần hoặc các ca dạy lẻ hiệu suất thấp.
* **Kết luận tự động:** Hệ thống tự sinh văn bản nhận định về xu hướng giảng dạy theo thời gian thực.

### 4. Quản lý Lịch trình linh hoạt
* **Chế độ xem đa dạng:** Hỗ trợ xem lịch theo Tuần (Dọc/Ngang) và lịch tổng quát Học kỳ.
* **Smart Focus:** Tự động chuyển đến tuần hiện tại ngay khi nạp dữ liệu.
* **Real-time Highlight:** Làm nổi bật buổi dạy đang diễn ra để giảng viên dễ dàng theo dõi.

### 5. Tiện ích & Bảo mật
* **Export iCal:** Xuất file `.ics` để đồng bộ nhanh vào Google Calendar/Apple Calendar.
* **Privacy First:** Xử lý dữ liệu hoàn toàn tại trình duyệt (Client-side), không lưu trữ thông tin trên máy chủ.
* **Dark Mode:** Giao diện tối ưu cho việc sử dụng vào ban đêm.

---

## 🛠 Hướng dẫn sử dụng (Usage)

1.  **Lấy dữ liệu:** Đăng nhập UMS -> Thời khóa biểu cá nhân -> Lưu trang web dưới dạng file `.html`.
2.  **Tải lên:** Kéo thả file vào màn hình khởi động của ứng dụng.
3.  **Theo dõi:** Hệ thống sẽ tự động phân tích và đưa bạn đến lịch giảng tuần hiện tại.

---

## 🧠 Cấu trúc dữ liệu & Xử lý
Ứng dụng sử dụng cơ chế **DOM Parsing** để đọc cấu trúc bảng đặc thù:
- **Input:** File HTML chứa class `.hitec-td-tkbTuan`.
- **Logic xử lý:** - Trích xuất Metadata (Tên GV, Học kỳ, Năm học).
    - Chuẩn hóa chuỗi dữ liệu (Tên môn - Nhóm - Lớp).
    - Kiểm tra xung đột (Conflict Check) dựa trên thời gian và phòng học.

---

## 💻 Công nghệ sử dụng (Tech Stack)

| Công nghệ | Mục đích |
| :--- | :--- |
| ![React](https://img.shields.io/badge/React_19-20232A?style=flat-square&logo=react&logoColor=61DAFB) | Thư viện giao diện chính (Hooks, Context) |
| ![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat-square&logo=typescript&logoColor=white) | Đảm bảo tính toàn vẹn và an toàn dữ liệu |
| ![Tailwind](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white) | Thiết kế giao diện Responsive & Darkmode |
| ![Recharts](https://img.shields.io/badge/Recharts-FF6384?style=flat-square&logo=d3.js&logoColor=white) | Trực quan hóa dữ liệu biểu đồ chuyên nghiệp |
| **Lucide React** | Bộ icon UI hiện đại |
| **Vite** | Công cụ Build tool tốc độ cao |

---

## 📦 Phiên bản & Cập nhật
**Current Version: v0.011 (15/01/2026)**
* ✨ **New:** Ra mắt Dashboard Thống kê hoàn toàn mới.
* ⚡ **Optimize:** Logic tự động xác định tuần hiện tại và hiệu ứng chuyển cảnh mượt mà.
* 🛠 **Fix:** Cải thiện độ chính xác khi bóc tách mã học phần phức tạp.

---

## 👨‍💻 Tác giả

© 2026 **TdyPhan** | Được hỗ trợ bởi **Google AI Studio**

Dự án được phát triển với mục đích cộng đồng, giúp giảng viên tối ưu hóa quy trình quản lý thời gian giảng dạy.

---
*Built with ❤️ and ☕ using Gemini 3 Pro Preview*