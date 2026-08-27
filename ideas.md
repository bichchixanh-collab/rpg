# Định hướng thiết kế — Hành Giả: Vực Lam

## Ba hướng phong cách

| Theme Name | Very Brief Intro | Probability |
| --- | --- | --- |
| **Mộc Bản Giang Hồ** | Thế giới pixel art được đặt trong khung giao diện gợi tranh khắc gỗ và sơn mài cổ; tập trung cảm giác phiêu lãng, gọn gàng và có chủ đích. | 0.07 |
| **Bút Mực Sương Đồi** | Bố cục tối giản như một cuộn tranh thủy mặc, ưu tiên khoảng thở và sắc xanh mờ của núi xa. | 0.04 |
| **Trấn Ven Hồ** | Nhịp điệu rộn ràng hơn với sắc đất nung, biển hiệu cũ và các mảng tile dày đặc của một thị trấn nhập vai cổ trang. | 0.09 |

## Hướng đã chọn: Mộc Bản Giang Hồ

### Design Movement

Thẩm mỹ **tranh khắc gỗ Á Đông kết hợp HUD game cầm tay đầu những năm 2000**. Game trường cảnh nhìn từ trên xuống, còn giao diện ôm lấy khung chơi như một tấm mộc bản có viền sơn mài.

### Core Principles

1. **Đọc được ngay:** nhân vật, sói, thỏ và vùng có thể di chuyển phải nổi bật ở kích thước màn hình nhỏ.
2. **Khung kể chuyện:** HUD chỉ là lớp viền hữu ích, không chiếm chỗ của map và không mô phỏng dashboard.
3. **Nét pixel có chủ đích:** hình khối rõ, màu tiết chế, không dùng hiệu ứng làm mờ làm mất chất sprite.
4. **Điều khiển là một phần cảnh chơi:** touchpad tròn và mục tiêu chạm xuất hiện như dấu ấn đỏ trên mặt đất.

### Color Philosophy

Nền cỏ và nước xanh rêu/xanh lam là bề mặt tự nhiên, tương phản với **đỏ son mài** dành riêng cho hành động và trạng thái người chơi. Màu đồng xỉn tạo khung thông tin ấm, trong khi than đậm giữ chữ và viền đủ sắc nét.

### Layout Paradigm

Màn chơi là một **bức địa đồ ngang** lấp đầy viewport; HUD nằm ở các góc như chi tiết đóng triện thay vì thanh điều hướng ở giữa. PC đặt chỉ dẫn phím ở dải chân màn hình, còn mobile có touchpad neo góc dưới trái và nút chạm/kiếm ở góc dưới phải.

### Signature Elements

- Viền sơn mài đỏ nâu có nét vàng đồng xỉn ở HUD và panel hướng dẫn.
- Hình triện đỏ ngắn cho mục tiêu chạm trên map.
- Dải sương pixel mảnh ở mép hồ, chỉ để gợi chiều sâu chứ không che gameplay.

### Interaction Philosophy

Nhấn giữ phím hoặc touchpad tạo chuyển động liên tục; chạm map đặt đích đến để nhân vật tự bước tới. Phản hồi phải trực tiếp: hướng nhìn đổi theo vector di chuyển và sói phản ứng bằng nhịp đi tuần độc lập.

### Animation

Chuyển động nhân vật dùng nhịp 3 frame rõ ràng, update 8–10 frame/giây. HUD chỉ nhún ở trạng thái nhấn; không dùng animation trang trí dài. Tôn trọng `prefers-reduced-motion` bằng cách giảm nhịp nhấp nháy mặt nước và vòng mục tiêu.

### Typography System

Tiêu đề dùng **Noto Serif SC** đậm, gợi nét thư pháp được khắc gọn; nhãn trạng thái và phím tắt dùng **JetBrains Mono** để đọc nhanh. Tiêu đề tránh viết toàn bộ chữ hoa; các nhãn ngắn, chữ cách vừa phải, giữ tương phản cao.

### Brand Essence

**Hành Giả: Vực Lam** là game phiêu lưu kiếm hiệp pixel dành cho người muốn khám phá một trấn ven hồ bằng thao tác chạm hoặc phím điều hướng — nhỏ gọn, trực tiếp và giàu không khí. Tính cách thương hiệu: **điềm tĩnh, lanh lợi, hoài cổ**.

### Brand Voice

Giọng điệu ngắn, giàu hình ảnh, dẫn đường thay vì hô hào. Headline là lời mời bước vào địa đồ; microcopy mô tả tình huống trong cảnh.

> “Dấu chân lướt qua lối gạch đỏ.”

> “Chạm vào đất trống để chọn đường đi.”

### Wordmark & Logo

Logo là một **mảnh triện vuông đỏ son** khắc đường kiếm cong màu kem, đính một chấm xanh hồ ở tâm; wordmark được đặt cạnh bằng Noto Serif SC với nét khắc nhẹ, không dùng chữ mặc định làm logo.

### Signature Brand Color

**Đỏ triện son — #A53B2A**.

## Style Decisions

- Viewport đầu tiên luôn phải cho thấy map đang hoạt động, player, một monster hoặc animal, và HUD góc có dấu triện son.
- Đỏ triện son `#A53B2A` dành riêng cho dấu triện, player/action/target state; nó luôn hiện diện như điểm nhấn trên nền xanh rêu, xanh hồ, đồng xỉn và than đậm.
- Biểu tượng triện đỏ có đường kiếm kem và chấm xanh hồ phải xuất hiện trong HUD cạnh wordmark Noto Serif SC ở mọi view game chính.
- Triện logo luôn đặt trong ô vuông đỏ son đặc có khung kem–than; không để nền trắng trở thành hình thức nhận diện chính.
- Cỏ, lối gạch và mép hồ lặp lại họa tiết khắc mộc tối giản như vân mây, vạch sóng hoặc dấu terrain để thế giới và HUD cùng một ngôn ngữ hình ảnh.
