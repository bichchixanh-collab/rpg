# Game Plan: Hành Giả: Vực Lam

## Risk Tasks

### 1. Điều hướng đa nền tảng và chuyển trạng thái sprite
- **Why isolated:** Bản chơi thử nhận phím, touchpad ảo và đích chạm; mỗi nguồn input phải cho ra hướng di chuyển và frame sprite đúng mà không gây dính phím hoặc giật trạng thái.
- **Approach:** Chuẩn hóa toàn bộ input thành vector `x/y`; player giữ hướng cuối khi đứng yên, di chuyển theo vector đã chuẩn hóa và thay frame theo nhịp thời gian. Đích chạm chuyển thành vector tới target và tự hủy trong bán kính hoàn tất.
- **Verify:** WASD/phím mũi tên, giữ touchpad, và chạm map đều làm nhân vật đi đúng hướng; idle → walk → idle không giật frame, hướng mặt thay đổi đúng; `?demo` cho thấy hành trình tự động lặp lại.

### 2. Monster tự đi tuần trên map
- **Why isolated:** Sói cần chuyển động độc lập, tránh vật cản đơn giản và không trôi ra ngoài map trong khi người chơi có thể cùng di chuyển.
- **Approach:** Mỗi sói có danh sách waypoint cố định, state đi tới waypoint tiếp theo, đảo chiều khi gần điểm đích hoặc bị chặn bởi vùng không thể đi. Thỏ dùng chu kỳ hop ngắn gần bụi cỏ.
- **Verify:** Sói liên tục tuần tra trong vùng cỏ/đường, đổi hướng hợp lý, không đi xuyên hồ/nhà/đá và không ra ngoài map; frame locomotion khớp với hướng di chuyển.

## Main Build

Xây dựng một world top-down duy nhất bằng canvas đầy màn hình. Map gồm cỏ, gạch, hồ, nhà, cây và đá được render theo tile/procedural pattern lấy màu và texture tham chiếu từ spritesheet tilemap. Player nữ là sprite có sprite-sheet crop; thỏ, sói là sprite có hành vi đơn giản. DOM overlay cung cấp tiêu đề ngắn, thanh năng lượng, chỉ dẫn điều khiển, touchpad và nút kiếm trang trí.

- **Assets needed:** 3 spritesheet do người dùng tạo trước đó; logo triện, ảnh mục tiêu art direction và texture trấn/hồ làm tham chiếu giao diện.
- **Verify:**
  - Bàn phím, touchpad và chạm map đều điều khiển được player trên PC/mobile.
  - Player và monster luôn nằm đúng layer, không đi qua hồ/cấu trúc/đá.
  - Ít nhất một con sói tự tuần tra, một con thỏ hop theo chu kỳ.
  - HUD đọc được trên desktop và viewport mobile, không che mất vùng chơi chính.
  - Không thiếu ảnh, không lỗi console, không có overflow hoặc thao tác cuộn ngoài ý muốn.
  - `?demo` hiển thị trạng thái gameplay không cần input khi chụp màn hình.
  - Bố cục giữ đúng định hướng Mộc Bản Giang Hồ: map toàn màn hình, khung HUD sơn mài, sắc xanh–đỏ son, mật độ rõ ràng.

## Combat Extension

Player có thể vung kiếm bằng nút **KIẾM** trên touch UI. Đòn quét chỉ tính một hit cho mỗi mục tiêu, đẩy lùi sói và làm thỏ hoảng sợ. Sói có ba nấc HP, sẽ chase khi player tới gần, gây 8 sát thương khi chạm theo cooldown và hồi sinh sau khi bị đánh bại. HUD phản ánh khí lực, số sói còn tuần tra và chiến tích hạ gục.
