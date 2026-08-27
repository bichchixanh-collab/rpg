# Memory — Hành Giả: Vực Lam

- Bản game đầu tiên là game browser 2D top-down, không cần backend, tài khoản, lưu tiến trình hay âm thanh.
- Ba asset có sẵn tại sandbox là `jianxia_female_j2me_spritesheet_transparent.png`, `j2me_wuxia_tilemap.png`, và `j2me_wuxia_animals_spritesheet.png`.
- Hình nhận trong viewer thể hiện nền alpha bằng ô caro; khi upload cần dùng nguyên PNG để giữ trong suốt.
- Cần có chế độ `?demo` để chứng minh movement/AI trong ảnh kiểm thử.
- Đã upload ba spritesheet qua kho asset dự án; biểu tượng triện, sương pixel và ảnh định hướng cũng đã được tạo bằng công cụ hình ảnh và dùng URL storage trong code.
- Các spritesheet alpha hiển thị nền ô caro từ generator; `GameWorld` làm sạch vùng nền sáng nối với biên atlas trước khi vẽ vào DynamicTexture để không có ô nền trắng trong game.
- Camera orthographic giữ chiều cao world cố định 900 đơn vị và thu hẹp chiều ngang trên portrait, giúp map phủ kín viewport mobile mà không bị letterbox.
- Combat hiện dùng sword sweep theo hướng nhìn, một hit mỗi mục tiêu trong mỗi lần đánh, body collision, wolf HP/knockback/chase/contact damage và rabbit flee không gây hại. Chế độ `?demo` tự tấn công khi sói vào tầm để kiểm thử trực quan.
