# Hướng dẫn triển khai GitHub + Vercel

> **Mục tiêu:** Đưa toàn bộ thư mục này lên một repository GitHub, sau đó để Vercel tự build và phục vụ game dưới dạng static site.

## 1. Kiểm tra nhanh trước khi upload

Bạn nên giải nén ZIP và chạy thử local để xác nhận môi trường máy đã có Node.js 22+ và pnpm. Game không cần khai báo secret hay cơ sở dữ liệu.

```bash
pnpm install --frozen-lockfile
pnpm run vercel-build
```

Nếu lệnh hoàn tất, thư mục `dist/public` sẽ được tạo. Đây là thư mục static mà Vercel sử dụng theo cấu hình `vercel.json`.

## 2. Đưa project lên GitHub

Trên [GitHub](https://github.com/new), tạo repository mới, chọn **Private** nếu bạn chưa muốn chia sẻ công khai, và không khởi tạo thêm README hoặc `.gitignore` vì source đã có sẵn. Sau đó, trong terminal tại thư mục project, chạy:

```bash
git init
git add .
git commit -m "Initial Vercel-ready game build"
git branch -M main
git remote add origin https://github.com/<GITHUB_USERNAME>/<REPOSITORY_NAME>.git
git push -u origin main
```

Thay `<GITHUB_USERNAME>` và `<REPOSITORY_NAME>` bằng giá trị của bạn. Nếu GitHub yêu cầu xác thực, dùng phương thức đăng nhập bạn đã thiết lập, chẳng hạn GitHub Desktop, SSH hoặc token cá nhân.

## 3. Import repository vào Vercel

Đăng nhập [Vercel](https://vercel.com/new), chọn **Add New → Project**, sau đó import repository GitHub vừa tạo. Vercel sẽ đọc `vercel.json`; hãy xác nhận các giá trị sau trước khi bấm **Deploy**.

| Mục | Giá trị |
| --- | --- |
| Framework Preset | Vite |
| Install Command | `pnpm install --frozen-lockfile` |
| Build Command | `pnpm run vercel-build` |
| Output Directory | `dist/public` |
| Node.js | 22.x hoặc mới hơn |
| Environment Variables | Không cần |

Sau khi Vercel build xong, game sẽ có một URL `*.vercel.app`. Mỗi lần bạn push commit mới lên nhánh `main`, Vercel sẽ tự triển khai phiên bản production mới.[1]

## 4. Gắn tên miền riêng (tùy chọn)

Trong project Vercel, mở **Settings → Domains**, nhập tên miền, rồi thực hiện bản ghi DNS mà Vercel hiển thị. Sau khi DNS hoàn tất, Vercel sẽ tự cấp HTTPS cho domain đó.[2]

## 5. Khi chỉnh sửa game sau này

Các PNG gameplay nằm trong `client/public/assets/`; dùng tên file ổn định và cập nhật `client/src/game/assets.ts` khi bạn thay asset. Nếu thay đổi code, kiểm tra với `pnpm check` và `pnpm run vercel-build` trước khi `git commit` và `git push`.

## Xử lý lỗi thường gặp

| Hiện tượng | Cách xử lý |
| --- | --- |
| Vercel báo không tìm thấy output | Xác nhận `vercel.json` còn `outputDirectory: "dist/public"` và Build Command là `pnpm run vercel-build`. |
| Ảnh hoặc spritesheet bị 404 | Kiểm tra file có trong `client/public/assets/`, không đổi tên sai và URL trong `client/src/game/assets.ts` bắt đầu bằng `/assets/`. |
| Game chạy local nhưng asset không hiện trên Vercel | Kiểm tra đã commit toàn bộ `client/public/assets/` lên GitHub; không dùng đường dẫn `/manus-storage/`. |
| Lỗi Node/pnpm trong build | Chọn Node 22.x trong phần Project Settings của Vercel và dùng `pnpm install --frozen-lockfile`. |

## References

[1]: https://vercel.com/docs/git "Vercel Docs — Git integration"
[2]: https://vercel.com/docs/domains "Vercel Docs — Domains"
