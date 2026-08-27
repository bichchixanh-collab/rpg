# Structure — Hành Giả: Vực Lam

## Mô hình thực thi

React chỉ tạo khung ứng dụng. `GameCanvas` sở hữu canvas, HUD DOM và vòng đời engine. Gameplay nằm trong `client/src/game/` và không gọi React state trực tiếp.

## Thành phần

| Vị trí | Trách nhiệm |
| --- | --- |
| `client/src/components/GameCanvas.tsx` | Khởi tạo/giải phóng Babylon engine một lần, gắn HUD khí lực/chiến tích và touch input. |
| `client/src/game/scene.ts` | Tạo scene orthographic, render loop và `GameHandle`. |
| `client/src/game/GameWorld.ts` | Sở hữu state player/animal; vẽ map/sprite lên DynamicTexture; xử lý map collision, body collision, hitbox kiếm, HP, knockback, AI chase/flee và HUD event. |
| `client/src/game/InputManager.ts` | Keyboard, pointer/touch target, virtual touchpad quy về input state và cung cấp vị trí triện mục tiêu. |
| `client/src/game/assets.ts` | Manifest các URL `/manus-storage/...` của spritesheet/logo. |

## Quy ước world

World có kích thước 32 × 20 ô logic. Lớp đất (cỏ/gạch/nước), object trang trí và sprite được vẽ trên một DynamicTexture canvas 1600 × 900 gắn vào plane Babylon orthographic. Bước tải asset loại nền ô caro nối với mép atlas bằng flood-fill, sau đó player và animal được cắt frame bằng sprite crop logic. Player dùng hitbox thân thể 32 px và quét kiếm 0,48 giây; sói có 3 HP, chase khi đến gần, cào theo cooldown và hồi sinh sau 5,2 giây; thỏ chỉ phản ứng sợ hãi và chạy trốn.
