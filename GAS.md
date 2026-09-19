# GAS.md — Guideline CMS Bảo Vệ Hải Long Sơn (hailongson.com)

> Nguồn quyết định CHỐT của dự án này. Đọc TOÀN BỘ file này trước khi sửa bất kỳ file nào
> trong `gas/`. Không tự suy đoán/bịa thêm field, quy tắc, tên biến ngoài những gì ghi ở đây.
> Sửa code xong phải cập nhật ngược lại file này trong CÙNG 1 lượt sửa.
>
> Playbook chung: skill `free-cms-static-site-pipeline`. Dự án mẫu: `xevip` (ưu tiên nhất —
> copy gần như nguyên văn, chỉ đổi giá trị riêng của dự án này).
>
> Xưng hô: chủ dự án = **Đại ca**. Agent xưng **em**. Áp dụng cho cả file này lẫn hội thoại.

## 0. Phạm vi (ĐÚNG 6 mục, không làm rộng hơn)

1. **Dịch vụ** — 14 trang `/dich-vu/<slug>/`.
2. **Tin tức** — 6 bài `/tin-tuc/<slug>/`.
3. **Thư viện ảnh** — trang `/thu-vien-anh/`.
4. **Tuyển dụng** — 4 tin `/tuyen-dung/<slug>/` (Đại ca bổ sung 19/09/2026).
5. **Liên hệ** — form công khai `/lien-he/`.
6. **Người dùng** — `root` / `admin` / `editor`.

**Thứ tự tab trong Admin — CHỐT**: Dịch vụ → Tin tức → Thư viện ảnh → **Tuyển dụng** → Liên hệ
→ Người dùng. Tuyển dụng nằm NGAY TRÊN Liên hệ (yêu cầu tường minh của Đại ca).

⛔ **Không đụng tới cấu trúc URL đã chốt.** Toàn site dùng `/slug/` (thư mục + `index.html`),
không đuôi `.html`, không số ID cuối slug, không file redirect thủ công — Cloudflare tự
chuyển `/slug` → `/slug/`. Quyết định của Đại ca 19/09/2026.

---

## I. Đăng nhập

1. Luồng: nhập email → gửi OTP qua email → nhập mã → vào Admin. Không mật khẩu, không phụ
   thuộc session Google (user thật không cùng Workspace domain với chủ script).
2. Chỉ email ĐÃ ĐĂNG KÝ (có trong sheet `Users`) mới được gửi OTP.
3. Account chủ GAS (người deploy) LUÔN hợp lệ + LUÔN là `root` ngầm định — không lưu trong
   sheet `Users`, không hiện/không quản lý được trong tab Người dùng.
   ⚠️ Bẫy bắt buộc né: `requestOtp()` phải kiểm tra `email === ownerEmail_()` SONG SONG với
   tra sheet `Users`, nếu không chính chủ script bị chặn ngay từ bước xin mã.
4. Phân quyền 3 cấp `root > admin > editor` (`ROLE_RANK = { editor: 1, admin: 2, root: 3 }`).
   Không có `viewer`. Ma trận quyền — CHỐT (Đại ca chốt 19/09/2026, giống xevip):

   | Chức năng | editor | admin | root |
   |---|---|---|---|
   | Dịch vụ (xem/thêm/sửa/xoá) | ✅ | ✅ | ✅ |
   | Tin tức (xem/thêm/sửa/xoá) | ✅ | ✅ | ✅ |
   | Thư viện ảnh (xem/thêm/xoá) | ✅ | ✅ | ✅ |
   | Tuyển dụng (xem/thêm/sửa/xoá) | ✅ | ✅ | ✅ |
   | Liên hệ (xem/đổi trạng thái/xoá) | ❌ | ✅ | ✅ |
   | Người dùng (thêm/đổi quyền/xoá) | ❌ | ✅ | ✅ |

   `editor` toàn quyền với NỘI DUNG site. Ranh giới duy nhất: không thấy thông tin khách hàng
   (tab Liên hệ) và không quản lý tài khoản. Chặn ở CẢ client (ẩn nav-item) LẪN server
   (`requireRole_`).

   Qua CMS chỉ gán được quyền `admin` / `editor` (`CMS_MANAGEABLE_ROLES`). Dòng `root` chỉ sửa
   tay trong Sheet. Chặn thêm: không tự thao tác lên chính mình.
5. OTP sống 10 phút, cooldown 60 giây/email, tối đa 5 lần nhập sai rồi phải xin mã mới.
   Token phiên sống 30 ngày, lưu `localStorage`.
6. Server tự `requireRole_` ở MỌI hàm — ẩn nút trên UI không phải là bảo mật.

---

## II. Tin tức (bài viết)

1. Field CÓ ô nhập trên giao diện (không tự ý thêm/bớt):
   - **Tiêu đề**
   - **URL bài viết (slug)** — tự sinh từ tiêu đề (bỏ dấu, gạch ngang); bất biến sau lần Lưu
     đầu (mục III). URL công khai: `https://hailongson.com/tin-tuc/<slug>/`.
     ⚠️ Slug KHÔNG được kết thúc bằng `-<số>` (quy ước URL đã chốt ở mục 0) — server tự cắt.
   - **Mô tả** — DUY NHẤT 1 field, dùng cho CẢ thẻ card ngoài `/tin-tuc/` LẪN
     `<meta name="description">` + `og:description`. Không tách "tóm tắt" và "mô tả SEO".
   - **Ngày đăng** — ô nhập `date`. Bài mới mặc định = hôm nay (giờ VN), sửa được.
     Lý do CÓ ô nhập (khác xevip): 6 bài hiện có ngày gốc lệch nhau (2018 → 2024), Đại ca cần
     sửa tay được khi migrate. Xem mục IX để biết ngày nào là thật.
   - **Ảnh bìa** — riêng 1-1 cho từng bài, tên đặt CỨNG theo slug:
     `html/upload/images/<slug>-cover.jpg`. Tải ảnh mới cho cùng bài = ghi đè đúng file cũ.
     Phải có slug (điền tiêu đề) TRƯỚC khi tải ảnh; tải xong thì slug tự khoá luôn.
   - **Nội dung** — TinyMCE: link, heading h2–h4, đậm/nghiêng/gạch chân, danh sách, bảng,
     **chèn ảnh nhanh** (nút `quickimage`, mở thẳng file picker, KHÔNG dùng dialog "Image"
     mặc định).
     ⚠️ **TinyMCE TỰ HOST tại `https://hailongson.com/vendor/tinymce/`, KHÔNG dùng CDN.**
     Bản 6.8.5, file nằm trong repo site (`html/vendor/tinymce/`), chỉ giữ phần đang dùng:
     theme silver, model dom, icon default, skin oxide, 5 plugin lists/link/autolink/table/code.
     TinyMCE tự suy ra chỗ lấy skin/plugin từ đường dẫn thẻ `<script>`, nên đổi 1 dòng đầu
     `js.html` là đổi hết.
     Lý do: trang quản trị được NHÚNG iframe vào `hailongson.com/admin/` — tài nguyên gọi từ
     miền lạ (cdn.jsdelivr.net) là nhóm nguyên nhân hay làm TinyMCE chết im lặng nhất. Yêu cầu
     tường minh của Đại ca 19/09/2026.
     ⚠️ **Thứ tự triển khai bắt buộc**: deploy site (để `/vendor/tinymce/` sống thật) TRƯỚC,
     rồi mới push CMS lên Apps Script. Làm ngược là CMS trỏ vào đường dẫn chưa tồn tại → mất
     trình soạn thảo.
2. Field KHÔNG có ô nhập — server tự suy lúc Lưu:
   - `seo_title` = Tiêu đề (nếu để trống). `breadcrumb` = Tiêu đề. `cover_alt` = Tiêu đề.
   - `updated_at` = thời điểm Lưu. Không hiển thị công khai.
3. Danh sách bài trong Admin: GAS đọc thẳng `data/posts.json` từ GitHub Contents API mỗi lần
   `boot()` — luôn mới nhất kể cả site chưa build xong. KHÔNG fetch file JSON đã deploy.
4. Ảnh (cả bìa lẫn ảnh trong nội dung):
   - Nén phía client bằng `<canvas>` TRƯỚC khi upload: cạnh dài tối đa 1600px, JPEG q=0.85
     (luôn ép JPEG — ảnh bìa đặt tên cứng đuôi `.jpg`).
   - Publish THẲNG lên GitHub ngay lúc chọn (không qua Drive). Hiện ảnh tạm ngay, upload chạy
     ngầm, không chặn thao tác.
   - Ảnh trong nội dung: `html/upload/images/<slug>-content-<N>.jpg`, số tăng dần bất biến.
   - ⚠️ **Đường dẫn ảnh trong content lưu dạng TUYỆT ĐỐI: `/upload/images/<file>`** — KHÔNG
     dùng `../`. Lý do: toàn site đã dùng đường dẫn tuyệt đối ở mọi trang (chốt 19/09/2026),
     và trang bài nằm ở `html/tin-tuc/<slug>/index.html` (2 cấp) nên đường dẫn tương đối rất
     dễ sai. Editor hiển thị ảnh qua URL tuyệt đối `raw.githubusercontent.com` (mục III), lưu
     xuống thì đổi ngược về `/upload/images/...`.
   - **Ảnh RIÊNG 1-1 theo slug** (Đại ca chốt 19/09/2026) → xoá bài được phép xoá kèm ảnh, xem
     mục IV. Ảnh thư viện (mục VI) nằm ở thư mục KHÁC, không bao giờ bị đụng tới.

---

## III. Sửa tin tức

- Giống viết bài, trừ: **slug bất biến** — chặn CẢ server (`throw` nếu slug gửi lên khác slug
  cũ) LẪN client (`disabled` ô slug). Mở form "Bài viết mới" ngay sau khi sửa bài phải BẬT LẠI
  `disabled = false` (form dùng lại chung DOM).
- Ảnh xem trong lúc sửa lấy qua URL tuyệt đối
  `https://raw.githubusercontent.com/tranquanghuy-rightsvn/hailongson/master/html/upload/images/<file>`
  — KHÔNG dùng domain thật (có thể chưa deploy bản mới → ảnh 404 gây hiểu nhầm).
- Muốn đổi URL thật sự: xoá bài cũ, tạo bài mới.

---

## IV. Xoá tin tức

- Xoá đủ trong 1 thao tác: `data/posts/<slug>.json` + ảnh bìa `<slug>-cover.jpg` + mọi ảnh
  nội dung `<slug>-content-*.jpg` + gỡ khỏi `data/posts.json` (ghi SAU CÙNG).
  An toàn xoá ảnh vì ảnh đặt tên tất định theo slug, không dùng chung giữa các bài (mục II.4).
- `build.py` tự xoá thư mục `html/tin-tuc/<slug>/` mồ côi ở lần build kế tiếp — nhận ra trang
  của mình nhờ dấu `<!-- build.py:generated -->` đóng sẵn trong file HTML.
- Bắt buộc pop-up xác nhận trước khi xoá (không hoàn tác được).

---

## V. Dịch vụ

- 14 dịch vụ, mỗi dịch vụ 1 file riêng (KHÔNG gom hết vào `services.json` như xevip — nội dung
  dịch vụ ở đây dài, gom hết là chạm trần ~1MB của Contents API).
- `data/services.json` = index nhẹ. `data/services/<slug>.json` = nội dung đầy đủ.
- Field CÓ ô nhập: `title`, `slug`, `description` (meta description), `content_html`,
  `nav_label` (chữ hiện trong menu Dịch vụ), `order` (thứ tự trong menu), ảnh bìa.
- Field KHÔNG có ô nhập — server tự suy: `seo_title` (để trống = `title`), `created_at`,
  `updated_at`, `og_image` (= ảnh bìa, không có thì build tự lấy ảnh đầu trong nội dung).
- URL công khai: `https://hailongson.com/dich-vu/<slug>/`. Slug bất biến sau lần Lưu đầu.
- Ảnh: cùng cơ chế mục II.4 — `html/upload/images/<slug>-cover.jpg` và
  `<slug>-content-<N>.jpg`.
- Xoá: gỡ khỏi `data/services.json` + xoá `data/services/<slug>.json` + ảnh của nó.
- Quyền: `editor` trở lên, đầy đủ thêm/sửa/xoá.
- **Menu "DỊCH VỤ" trên toàn site tự cập nhật theo danh sách này** — `build.py` vá lại vùng
  giữa 2 mốc neo `<!-- NAV_SERVICES_START -->` / `<!-- NAV_SERVICES_END -->` (có ở cả menu
  desktop lẫn drawer mobile) trong MỌI file `html/**/index.html`. Đổi design header phải GIỮ
  NGUYÊN 2 mốc neo này, nếu không build sẽ log CẢNH BÁO và bỏ qua.

---

## VI. Thư viện ảnh

- Trang `/thu-vien-anh/`. Dữ liệu: `data/gallery.json` (1 file, index + metadata).
- Field mỗi ảnh: `file` (tên file), `alt`, `order`.
- Ảnh lưu ở **`html/images/gallery/<ten-file>.jpg`** — thư mục RIÊNG, **tách biệt hoàn toàn**
  với ảnh bài viết/dịch vụ ở `html/upload/images/` (Đại ca chốt 19/09/2026).
  ⚠️ Vì tách riêng nên xoá bài viết/dịch vụ KHÔNG BAO GIỜ đụng tới ảnh thư viện, và ngược lại.
- Thao tác trong CMS: thêm ảnh (upload nhiều ảnh 1 lượt), sửa `alt`, đổi thứ tự, xoá ảnh.
- Xoá ảnh thư viện = xoá file trên GitHub + gỡ khỏi `data/gallery.json` (ghi SAU CÙNG).
  An toàn vì ảnh thư viện không được dùng lại ở bài viết/dịch vụ.
- Quyền: `editor` trở lên.

---

## VI-B. Tuyển dụng

- 4 tin tuyển dụng, tách index/detail giống Dịch vụ và Tin tức.
  `data/jobs.json` = index nhẹ. `data/jobs/<slug>.json` = nội dung đầy đủ.
- URL công khai: `https://hailongson.com/tuyen-dung/<slug>/`. Slug bất biến sau lần Lưu đầu.
- Quyền: **`editor` trở lên** — đây là NỘI DUNG site, cùng nhóm Dịch vụ/Tin tức, không phải
  dữ liệu khách hàng. Suy từ ranh giới đã chốt ở mục I.4 (editor = toàn bộ nội dung site).
- Field CÓ ô nhập:
  - **Tiêu đề**, **slug**, **Mô tả** (meta description), **Ảnh bìa** (cơ chế mục II.1,
    `html/upload/images/<slug>-cover.jpg`).
  - **Ngày đăng** (`date_posted`) và **Hạn nộp** (`valid_through`) — dạng `yyyy-MM-dd`.
  - **Số lượng tuyển** (`openings`), **Lương từ** (`salary_min`), **Lương đến** (`salary_max`)
    — VND/tháng. `salary_max` để trống = chỉ có mức sàn ("từ X đồng").
  - **Nơi làm việc** (`locations`) — nhập nhiều dòng, mỗi dòng 1 tỉnh/thành.

- **Nội dung chia SECTION CON, KHÔNG phải 1 ô nội dung duy nhất** (Đại ca chốt 19/09/2026).
  Bộ section CỐ ĐỊNH dưới đây, **tất cả đều TUỲ CHỌN** — để trống thì `build.py` bỏ qua hẳn
  cả tiêu đề lẫn khối, không in heading rỗng ra trang. Mỗi section là 1 ô TinyMCE riêng, cùng
  cấu hình mục II.1 (kể cả nút chèn ảnh nhanh).

  | Field | Tiêu đề in ra trang | Lý do có mặt (trích từ 4 tin thật) |
  |---|---|---|
  | `intro_html` | *(không in tiêu đề)* | "Do nhu cầu đáp ứng chất lượng dịch vụ…", "Công ty đang có nhu cầu tuyển dụng…" |
  | `quantity_html` | Số lượng & vị trí | "Số lượng: 01 nam - ca trưởng, 01 nam - ca phó…", "SỐ LƯỢNG 20" |
  | `requirements_html` | Yêu cầu ứng viên | "Yêu cầu:" / "Tiêu chuẩn:" + Nam/Nữ, sức khoẻ, lý lịch, hộ khẩu, trình độ |
  | `location_html` | Khu vực làm việc | "Khu vực làm việc: Tp.HCM, Bình Dương, Đồng Nai…" |
  | `salary_html` | Mức lương & quyền lợi | "Mức lương:" + bảng theo vị trí, "bao ăn - ở", "tuần nghỉ 01 ngày" |
  | `contact_html` | Liên hệ | "Mọi thông tin vui lòng liên hệ: 028 6257 3788" |

  ⚠️ **Vì sao section CỐ ĐỊNH chứ không phải mảng tự do**: 4 tin hiện có bộ section rất lệch
  nhau (tin nhà máy gộp hết vào 1 đoạn, tin bảo vệ có đủ 5 phần). Mảng tự do cho phép mỗi tin
  một kiểu tiêu đề → trang tuyển dụng mất tính nhất quán và không gom được `requirements_html`
  vào JSON-LD sau này. Bộ cố định + tất cả tuỳ chọn phủ được cả 4 tin mà không để ô trống thừa.
  Thêm/bớt section = sửa BẢNG NÀY trước, rồi sửa `JOB_SECTIONS` trong `gas/Code.js` và
  `scripts/build.py` (3 chỗ phải khớp — `gas/` không nằm trong git nên KHÔNG tự đồng bộ được).

  `description` (meta description) là field RIÊNG, không lấy tự động từ `intro_html` — mô tả
  SEO cần ngắn và khác giọng văn mở bài.

- Field KHÔNG có ô nhập — server tự suy: `seo_title` (= title nếu trống), `breadcrumb`,
  `cover_alt`, `employment_type` (CỐ ĐỊNH `"FULL_TIME"`), `created_at`, `updated_at`.
  `description` dùng cho JSON-LD `JobPosting.description`; nếu trống thì server ghép nội dung
  các section lại (Google bắt buộc có `description`, không được để rỗng).
- ⚠️ **Đây là nguồn sinh JSON-LD `JobPosting`** trong `build.py`. Google BẮT BUỘC có
  `datePosted`, `title`, `description`, `hiringOrganization`, `jobLocation`. Vì vậy:
  - `date_posted` và `locations` KHÔNG được để trống — server chặn.
  - `valid_through` khuyến nghị mạnh (thiếu thì tin không bao giờ hết hạn, Google hạ dần).
    Để trống thì build vẫn chạy nhưng bỏ trường đó khỏi JSON-LD.
  - ⛔ **Không bịa ngày.** Ngày đăng hiện tại của cả 4 tin = `2026-09-20`, hạn nộp
    `2026-12-19` (Đại ca chốt 19/09/2026 — "ngày đăng từ ngày mai"). Ngày gốc trong site cũ
    (2016–2017) đã cố ý bị ghi đè vì tin cũ đăng lại phải có ngày mới.
- Xoá: `data/jobs/<slug>.json` + ảnh bìa + ảnh nội dung + gỡ khỏi `data/jobs.json`
  (ghi SAU CÙNG). Có pop-up xác nhận.
- `build.py` tự xoá thư mục `html/tuyen-dung/<slug>/` mồ côi (theo dấu
  `<!-- build.py:generated -->`).

**Số liệu thật của 4 tin hiện có** (bóc từ chính nội dung trang, không suy đoán):

| slug | Số lượng | Lương (VND/tháng) | Nơi làm việc |
|---|---|---|---|
| `tuyen-dung-nhan-vien-bao-ve` | 6 | 7.000.000 – 9.000.000 | TP.HCM |
| `thong-bao-tuyen-dung-nhan-vien-bao-ve-chuyen-nghiep` | 20 | 5.000.000 – 6.000.000 | TP.HCM, Bình Dương, Đồng Nai, Long An |
| `thong-bao-tuyen-dung-nhan-vien-co-dong` | 5 | từ 7.000.000 | TP.HCM |
| `thong-bao-tuyen-nhan-vien-bao-ve-nha-may` | 20 | 5.500.000 – 7.000.000 | TP.HCM |

**Địa chỉ dùng trong MỌI tin tuyển dụng — CHỐT** (Đại ca 19/09/2026):
`101/1 Khu phố Đồng An 3, Phường Bình Hòa, Thành phố Hồ Chí Minh` — khớp địa chỉ chính ở
mục X. Tin `...-chuyen-nghiep` trước đây in địa chỉ cũ "42/2A Đường số 20, P.12, Q. Gò Vấp",
đã sửa ở cả HTML hiển thị lẫn JSON-LD.
Cùng lúc đó sửa số điện thoại `(84) 8- 6257 3788` → `028 6257 3788`: đầu số `8` là mã vùng CŨ
của TP.HCM (đã đổi thành `28`), viết như cũ là số không gọi được.

---

## VII. Liên hệ (form công khai `/lien-he/`)

- Nguồn DUY NHẤT: form `.frm` trong `html/lien-he/index.html`. Field thật của form hiện tại →
  map như sau:

  | Input trên form | Field lưu |
  |---|---|
  | `ten_lienhe` | `name` |
  | `diachi_lienhe` | `address` |
  | `dienthoai_lienhe` | `phone` |
  | `email_lienhe` | `email` |
  | `tieude_lienhe` | `subject` |
  | `noidung_lienhe` | `message` |

  KHÔNG thêm/bớt field so với bảng này.
- ⚠️ **Mã bảo vệ (captcha) ĐÃ GỠ** khỏi form ngày 19/09/2026 theo yêu cầu Đại ca — gỡ cả ô
  nhập, ảnh captcha, nút đổi mã, đoạn validate bắt buộc nhập mã và handler `#reset_capcha`.
  Đừng thêm lại.
- Honeypot: input ẩn tên `_hp`, thay cho captcha đã gỡ. Có giá trị → âm thầm trả `{ok:true}`,
  không lưu, không báo lỗi.
  ⚠️ Ô này CHỈ ẩn nhờ rule `.hp-field` trong `html/style.css`. Mất rule đó là **hỏng nghiệp vụ**
  chứ không phải chỉ xấu giao diện — xem mục X (bug thật đã xảy ra ở xevip).
- Rate-limit: 20 giây/lần theo số điện thoại (`CacheService`).
- Gọi từ site tĩnh (domain khác) bằng `fetch()` tới `CMS_URL` với
  `Content-Type: text/plain;charset=utf-8` để né CORS preflight (GAS không xử lý OPTIONS).
- Trong Admin: xem danh sách, đổi trạng thái, xoá — **chỉ `admin`/`root`** (mục I.4), `editor`
  không thấy tab này. `status` hợp lệ: `"Mới"` / `"Đã xử lý"`.
- **Mẫu email báo liên hệ: `gas/email.html`** (Đại ca chốt 19/09/2026 — yêu cầu email trông
  chuyên nghiệp, có logo). Quy ước BẮT BUỘC của file này, đừng "dọn cho gọn":
  - Bố cục bằng `<table>`, CSS viết INLINE từng thẻ. Outlook dùng engine Word (không hiểu
    flex/grid), Gmail cắt `<style>` ở nhiều ngữ cảnh.
  - Logo dùng **`html/images/logo-email.png`** (240×240, đã ghép sẵn nền navy `#0c1638`).
    KHÔNG dùng `logo-tron.webp` của site: Outlook không đọc WebP, và nền trong suốt hiển thị
    không ổn định giữa các client.
  - Khung ngoài 600px — chuẩn an toàn cho cả desktop lẫn điện thoại.
  - ⚠️ **`<?= ?>` của Apps Script TỰ ESCAPE. Tuyệt đối không đổi sang `<?!= ?>` cho field do
    người dùng nhập.** Chỗ duy nhất dùng `<?!= ?>` là `messageHtml` (cần đổi xuống dòng thành
    `<br>`), và `renderContactEmail_` trong `Code.js` đã tự escape TRƯỚC khi thay `\n`. Bỏ bước
    escape đó là mở đường cho người gửi form chèn HTML tuỳ ý vào hộp thư công ty.
  - Gửi kèm **cả bản chữ thuần** (`contactEmailText_`) — client không đọc HTML vẫn thấy đủ
    thông tin, và thư đỡ bị đánh dấu spam hơn so với chỉ có HTML.
  - Tên người gửi hiện là "Website Hải Long Sơn" (tham số `name` của `MailApp`).
- **Gửi qua `MailApp` tới `NOTIFY_EMAIL`** (Đại ca chốt 19/09/2026) —
  **KHÔNG có địa chỉ mặc định trong code**, Đại ca tự khai Script Property này. Chưa khai thì
  không gửi mail, nhưng liên hệ VẪN được lưu vào Sheet bình thường (`requireCfg_` nằm trong
  `try` của `sendNotificationEmail_`).
  ⚠️ Dùng CHUNG quota Gmail 100 mail/ngày với OTP đăng nhập. Gửi mail lỗi KHÔNG được làm hỏng
  việc đã lưu vào Sheet (chỉ `Logger.log`).
- Dữ liệu liên hệ CHỈ nằm trong Google Sheet, **KHÔNG bao giờ ghi vào repo GitHub** (repo chứa
  site công khai — thông tin khách hàng không được lọt ra đó).

---

## VIII. Người dùng

- Tab chỉ hiện với `admin`/`root` (server vẫn tự chặn `requireRole_(token, "admin")`).
- Thêm mới: nhập email + chọn quyền (`admin` / `editor`). Người đó tự đăng nhập bằng OTP gửi
  tới email đó — không cấp mật khẩu.
- Đổi quyền: chỉ đổi được giữa `admin` ↔ `editor`. Dòng `root` → từ chối, báo rõ "sửa trực
  tiếp trong Sheet".
- Không cho tự đổi quyền/xoá chính tài khoản đang đăng nhập (tránh tự khoá mình ra ngoài).
- Không hiện/không quản lý được account chủ GAS.

---

## IX. UX chung (áp dụng cho MỌI thao tác trong Admin)

- ⛔ **CẤM TUYỆT ĐỐI nhắc tới hạ tầng lưu trữ phía sau trong BẤT KỲ thứ gì gửi xuống trình
  duyệt** — chữ trên giao diện, gợi ý, thông báo lỗi, nút bấm, KỂ CẢ comment trong
  `app.html`/`js.html`/`index.html`/`css.html` (mở F12 là đọc được hết). Khách chỉ được biết
  tới "trang quản trị", không được biết bên dưới chạy bằng gì.
  Kiểm nhanh trước mỗi lần deploy:
  `grep -niE 'sheet|spreadsheet|drive' gas/app.html gas/js.html gas/index.html gas/css.html`
  phải KHÔNG ra kết quả nào.
  ⚠️ Cố ý KHÔNG chặn chữ `github` trong lệnh kiểm trên: `js.html` BẮT BUỘC dựng URL
  `raw.githubusercontent.com` để xem ảnh lúc soạn (editor chạy iframe khác origin, cần URL
  tuyệt đối — mục III). Đó là URL kỹ thuật trong code, không phải chữ hiện ra cho khách đọc.
  Luật vẫn áp dụng đầy đủ với mọi chữ HIỂN THỊ trên giao diện.
  `Code.js` chạy phía máy chủ — nhưng MỌI CHUỖI được `throw` ra ngoài thì hiện lên giao diện,
  nên chuỗi lỗi cũng phải theo luật này.
- 2 loại pop-up RIÊNG BIỆT, giữa màn hình, KHÔNG dùng `alert()`/`confirm()` native, KHÔNG toast:
  1. **Xác nhận** (Huỷ / Xoá) — hỏi TRƯỚC khi bắt đầu xử lý.
  2. **Thông báo kết quả** (1 nút Đóng) — hiện SAU khi xong, không tự ẩn.
- Mọi thao tác làm đổi nội dung site thật kèm dòng nhắc: *"Website sẽ được cập nhật sau 1-2
  phút!"*
- Mọi nút async: `disabled` + spinner trong lúc chờ, tự phục hồi kể cả khi lỗi (`finally`).
- Sau Lưu/Xoá thành công: quay lại đúng màn DANH SÁCH của chính entity đó, danh sách tự cập
  nhật ngay (không đợi F5), và F5 ngay sau đó cũng không hiện lại dữ liệu cũ.
- Chuyển tab chỉ là hiệu ứng giao diện — không tải lại trang, không gọi lại toàn bộ dữ liệu.
- Đăng nhập lần đầu: 1 round-trip `boot(token)` duy nhất lấy hết (me, appHtml, posts, services,
  gallery, jobs, github). Lần sau: hiện ngay từ cache localStorage rồi revalidate ngầm.
- Mọi key `localStorage` (TRỪ token đăng nhập) mang hậu tố `CLIENT_BUILD`, + hàm
  `purgeStaleCaches_()` tự dọn key khác phiên bản lúc tải script.
- **`CLIENT_BUILD` TỰ SINH, không ai phải nhớ bump.** Server băm MD5 nội dung `app.html` +
  `js.html` (`clientBuild_()` trong `Code.js`), bơm xuống client qua `index.html`
  (`window.CLIENT_BUILD`); `js.html` chỉ đọc lại. Sửa 1 trong 2 file = băm khác = cache cũ tự
  bị dọn. **Không thêm lại hằng số gõ tay dưới bất kỳ hình thức nào** (dự án khác đã dính bug
  thật vì có người quên tăng).
- TinyMCE chỉ `init` SAU KHI tab chứa nó đã `display:block` (init lúc còn ẩn → editor cao 0px).

---

## X. Kiến trúc lưu trữ

**Google Sheet "Hai Long Son CMS Data"** (tự tạo lần đầu, `SPREADSHEET_ID` tự lưu lại) — tên
sheet/cột CỐ ĐỊNH:
- `Users` — `email`, `role`.
- `Contacts` — `id`, `created_at`, `name`, `address`, `phone`, `email`, `subject`, `message`,
  `status`. Chỉ Admin xem, không bao giờ hiển thị công khai / không đẩy lên GitHub.

**GitHub (Contents API)** — repo `tranquanghuy-rightsvn/hailongson`, branch `master`. Đường
dẫn CỐ ĐỊNH, đổi phải sửa luôn `scripts/build.py` + CI:
- `data/posts.json` — index nhẹ mọi bài. **Commit CHỐT** của Lưu/Xoá bài → trigger CI.
- `data/posts/<slug>.json` — nội dung đầy đủ 1 bài.
- `data/services.json` — index nhẹ mọi dịch vụ. **Commit CHỐT** của Lưu/Xoá dịch vụ.
- `data/services/<slug>.json` — nội dung đầy đủ 1 dịch vụ.
- `data/gallery.json` — toàn bộ thư viện ảnh. **Commit CHỐT** của Lưu/Xoá ảnh thư viện.
- `data/jobs.json` — index nhẹ mọi tin tuyển dụng. **Commit CHỐT** của Lưu/Xoá tin tuyển dụng.
- `data/jobs/<slug>.json` — nội dung đầy đủ 1 tin tuyển dụng.
- `html/upload/images/<slug>-cover.jpg`, `html/upload/images/<slug>-content-<N>.jpg` — ảnh bài
  viết + dịch vụ.
- `html/images/gallery/<ten>.jpg` — ảnh thư viện (tách riêng, mục VI).
- `html/images/logo-email.png` — logo dùng trong email báo liên hệ (mục VII). Sửa logo site
  thì nhớ tạo lại file này, email KHÔNG tự lấy logo mới.

**File index tổng LUÔN ghi SAU CÙNG** trong 1 thao tác (nó là file trigger CI).

**Ai ghi / ai sửa được:**

| Thư mục | Ai ghi | Sửa tay được? |
|---|---|---|
| `data/**` | GAS (CMS) | ❌ (build lại sẽ mất) |
| `html/tin-tuc/<slug>/`, `html/tin-tuc/`, `html/dich-vu/<slug>/`, `html/dich-vu/`, `html/thu-vien-anh/` | `build.py` (CI) | ❌ (CI ghi đè) |
| `html/tuyen-dung/<slug>/`, `html/tuyen-dung/` | `build.py` (CI) | ❌ (CI ghi đè) |
| `html/index.html`, `html/gioi-thieu/`, `html/lien-he/` | Người | ✅ (CI chỉ vá vùng NAV_SERVICES) |
| `templates/*.html` | Người | ✅ — đây chính là chỗ sửa design |
| `html/images/**`, `html/upload/**` | GAS | không cần |

**Trang quản trị**: `https://hailongson.com/admin/` — file `html/admin/index.html`, NHÚNG CMS
thẳng vào domain (iframe + cắt 25px thanh cảnh báo của Google bằng CSS), nên thanh địa chỉ luôn
là hailongson.com. Yêu cầu tường minh của Đại ca 19/09/2026.
⚠️ File này phải giữ GIỐNG HỆT cấu trúc + logic bản mẫu xevip, chỉ đổi 5 giá trị riêng:
`<title>`, favicon, 2 mã màu, `CMS_URL`. Đã đối chiếu: 81 dòng code cả hai bên, khác đúng 5
dòng đó. Đừng "cải tiến" phần tạo iframe khi chưa có bằng chứng THẬT là bản mẫu sai.
File TĨNH, `build.py` cố ý KHÔNG sinh lại. Có `noindex, nofollow` và KHÔNG nằm trong sitemap.

**TinyMCE tự host**: `html/vendor/tinymce/` — bản **6.8.5**, 1.2MB, chỉ giữ phần đang dùng
(theme silver, model dom, icon default, skin oxide, 5 plugin lists/link/autolink/table/code).
Đã test thật trên trình duyệt: init xong, tạo được iframe soạn thảo, 6 nhóm nút trên thanh công
cụ, skin CSS nạp từ `/vendor/tinymce/skins/`, editor cao đúng 460px.
**Đường lui**: bản nhúng tự phát hiện treo sau 12 giây và hiện link thoát mở thẳng URL `/exec`
— KHÔNG tạo trang/route riêng cho việc này.

⚠️ Bản nhúng KHÔNG chạy trên trình duyệt đang đăng nhập tài khoản Google Workspace của tổ chức
(Google chuyển hướng sang `/a/macros/<domain>/` rồi treo vĩnh viễn) — luôn cần giữ link thoát.

**Hosting**: Cloudflare (Đại ca chốt — KHÔNG dùng Vercel, đã xoá `vercel.json`). CI GitHub
Actions build `html/` rồi commit; Cloudflare tự deploy khi có commit mới. Độ trễ từ lúc bấm Lưu
tới lúc thấy trên site: khoảng 1–2 phút.

⚠️ **`html/` hiện CHƯA được track git** (`git ls-files html` trả rỗng) — phải commit `html/`
trước khi CI chạy lần đầu, nếu không build không có gì để ghi đè lên.

**Ngày đăng thật của 6 bài tin** (bóc từ block "Các bài khác" của chính site cũ — chỉ 2 bài có
ngày thật, 4 bài còn lại lấy ngày relaunch 2026-09-20 theo quyết định của Đại ca):
- `cong-ty-long-hai-to-chuc-dao-tao-nang-cao-nghiep-vu-bao-ve-cho-nhan-vien` → 2024-11-08
- `bao-ve-su-kien-ton-vinh-doi-tuyen-u23-viet-nam` → 2018-02-05
- 4 bài còn lại → 2026-09-20

---

## XI. Checklist bug phải né (đúc kết từ dự án thật cùng playbook)

- **Đăng nhập được nhưng không vào được Admin** → thường do `requestOtp` quên ngoại lệ chủ
  script (mục I.3), hoặc so email chưa `trim().toLowerCase()`.
- **Trình soạn thảo không chạy, ô nội dung trống, Console sạch trơn** → loại trừ lần lượt:
  (a) `tinymce.init` gọi lúc tab còn ẩn (mục IX); (b) `resetEditors_` quên gọi `tinymce.remove()`
  nên instance cũ giữ chỗ, init lần sau bị bỏ qua im lặng; (c) CMS bị nhúng iframe lồng nhiều
  tầng, tài nguyên CDN bị chặn — đã né bằng cách tự host TinyMCE (mục II.1).
  Phải có khung báo lỗi đỏ `#fatal-error` + đồng hồ 10 giây để 3 ca này hiện lỗi ra màn hình
  chứ không hỏng im lặng.
- **Sửa code, deploy đúng, F5 vẫn thấy giao diện CŨ** → cache `localStorage` giữ `appHtml` cũ.
  Fix ĐỦ 2 lớp: (1) `CLIENT_BUILD` tự băm + `purgeStaleCaches_()`; (2) revalidate ngầm so
  `appHtml` mới ≠ cũ thì vẽ lại DOM (giữ đúng tab đang xem, KHÔNG vẽ đè khi đang mở form soạn).
  ⛔ Không bao giờ "chữa" bằng cách bảo khách tự xoá localStorage.
- **[bug thật ở xevip] Gửi form Liên hệ mà không gì được lưu, cũng không báo lỗi** → rule CSS
  `.hp-field` (ẩn honeypot `_hp`) bị mất khi merge `style.css`. Ô bẫy hiện ra như ô nhập bình
  thường, khách thật/autofill điền vào là server coi như bot, ÂM THẦM bỏ qua và vẫn trả
  `{ok:true}` — mất khách mà không ai biết.
  Cách né: sau MỌI lần merge/đổi `style.css`, kiểm
  `curl -s https://hailongson.com/style.css | grep -c hp-field` phải khác 0.
- **GitHub 422 "sha wasn't supplied"** khi publish nhiều file liên tiếp nhanh → eventual
  consistency. Vá: retry-once + `Utilities.sleep(500)` trong PUT.
- **`isNew` tính bằng `!rec.id`/`!rec.slug`** → sai khi client đã có slug từ trước lúc Lưu lần
  đầu (chèn ảnh cần slug). Phải xác định bằng "slug đã có trong index chưa".
- **CI trigger theo `data/**`** → build ở commit dở dang. Chỉ trigger đúng 3 file index tổng
  (`posts.json`, `services.json`, `gallery.json`, `jobs.json`).
- **Sheets tự convert `"YYYY-MM-DD"` thành Date** → luôn `Utilities.formatDate` khi đọc ra.
- **Đặt tên ảnh ghép 2 slug bằng dấu `-`** → tiền tố ảnh bản ghi này lọt vào tiền tố bản ghi
  khác, `deleteContentImages_` xoá nhầm. Ghép bằng `__`.
- **Thêm tab mới mà quên khai trong `revalidateBootInBackground_`** → `getElementById(...)` trả
  `null`, `.style` ném `TypeError`, cả nhánh revalidate chết im lặng và người dùng KẸT VĨNH
  VIỄN ở giao diện cũ. Mọi truy cập DOM trong hàm chạy ngầm phải null-safe.

---

## XII. Script Properties (Project Settings > Script Properties) — TÊN CỐ ĐỊNH

- `GITHUB_TOKEN` — bắt buộc. PAT có quyền ghi repo `hailongson`.
- `GITHUB_OWNER` — bắt buộc (`tranquanghuy-rightsvn`).
- `GITHUB_REPO` — bắt buộc (`hailongson`).
- `GITHUB_BRANCH` — bắt buộc (`master`).
- `NOTIFY_EMAIL` — **bắt buộc nếu muốn nhận mail báo liên hệ**; không có giá trị mặc định trong
  code. Để trống = không gửi mail (liên hệ vẫn lưu vào Sheet bình thường).
- `SPREADSHEET_ID` — KHÔNG cần điền, code tự tạo Sheet lần đầu và tự lưu lại.

**Web app URL (deploy hiện tại)**:
`https://script.google.com/macros/s/AKfycbxSjRdOvHlg8T5fE1VkPd6BaLL9PQuy9kUzD6_p6esZRR7JFrB6Iy6BgfvxSx7llPIuDw/exec`
— dùng làm `CMS_URL` trong `html/admin/index.html` (iframe) và trong đoạn submit form
`/lien-he/`.
