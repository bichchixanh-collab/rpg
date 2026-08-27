# Hành Giả · Vực Lam

Game browser 2D pixel-art kiếm hiệp, được xây dựng bằng React, Vite và Babylon.js. Bản mã nguồn này đã được chuẩn bị để **đẩy thẳng lên GitHub và triển khai trên Vercel** mà không phụ thuộc vào storage hay dịch vụ runtime của Manus.

## Chạy trên máy cá nhân

Yêu cầu tối thiểu là Node.js 22 và pnpm. Sau khi giải nén, mở terminal ngay tại thư mục dự án rồi chạy các lệnh dưới đây.

```bash
pnpm install --frozen-lockfile
pnpm dev
```

Truy cập địa chỉ Vite in trong terminal, thường là `http://localhost:3000`. Dùng `WASD` hoặc phím mũi tên trên PC; trên mobile, dùng touchpad góc dưới trái, chạm map để dẫn đường và nút **KIẾM** để đánh.

## Cấu trúc quan trọng

| Đường dẫn | Mục đích |
| --- | --- |
| `client/src/game/` | Toàn bộ game loop, input, combat, AI và asset manifest. |
| `client/public/assets/` | Tất cả PNG runtime. Các file này được bundle/copy cùng static site để Vercel phục vụ tại `/assets/...`. |
| `vercel.json` | Cấu hình lệnh cài đặt, build và output directory cho Vercel. |
| `DEPLOY_VERCEL.md` | Hướng dẫn đưa lên GitHub và triển khai từng bước. |

## Build production

```bash
pnpm run vercel-build
```

Kết quả static nằm trong `dist/public`. Không cần database, API key hoặc biến môi trường để chơi game.

Xem hướng dẫn triển khai đầy đủ tại [DEPLOY_VERCEL.md](./DEPLOY_VERCEL.md).
