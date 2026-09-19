# -*- coding: utf-8 -*-
"""Sinh templates/ TỪ CHÍNH các trang đang chạy — chạy 1 lần lúc migrate.

Vì sao làm kiểu này thay vì viết template bằng tay: giao diện hiện tại đã chỉnh tay nhiều
vòng (SEO, slug, banner slider, bỏ captcha...). Gõ lại bằng tay chắc chắn lệch. Cách này giữ
NGUYÊN VĂN phần khung, chỉ khoét các vùng động thành placeholder.

Sau khi có templates/, ĐÂY LÀ CHỖ SỬA GIAO DIỆN. build.py chỉ đổ dữ liệu vào, không sửa khung.
"""
import os, re

ROOT = "/Users/nals_macbook_116/Desktop/clone-web/baovelonghai"
HTML = os.path.join(ROOT, "html")
TPL = os.path.join(ROOT, "templates")
os.makedirs(TPL, exist_ok=True)

TAG = re.compile(r"<(/?)div\b[^>]*?(/?)>", re.I)

def div_span(s, open_idx):
    """Trả về (đầu_nội_dung, vị_trí_thẻ_đóng_khớp) cho thẻ <div> bắt đầu ở open_idx.
    Đếm độ sâu thẻ div - trang này không có <div/> tự đóng nên đếm đơn giản là đủ."""
    m = TAG.match(s, open_idx)
    if not m:
        raise SystemExit("open_idx khong tro vao the <div: " + s[open_idx:open_idx + 40])
    depth, pos = 1, m.end()
    inner = m.end()
    for m2 in TAG.finditer(s, m.end()):
        depth += -1 if m2.group(1) else 1
        if depth == 0:
            return inner, m2.start()
    raise SystemExit("khong tim thay the dong khop")

ULTAG = re.compile(r"<(/?)ul\b[^>]*>", re.I)

def ul_span(s, open_idx):
    """(đầu_nội_dung, vị_trí_</ul>_khớp) cho thẻ <ul> mở tại open_idx.
    ⚠️ BẮT BUỘC đếm độ sâu: submenu Dịch vụ có <ul></ul> rỗng lồng trong từng <li> (chỗ dành
    cho menu cấp 3). Dùng regex non-greedy .*?</ul> sẽ dừng ở <ul> rỗng đầu tiên -> cắt sai,
    vỡ toàn bộ thanh menu (bug thật đã gặp lúc dựng)."""
    m = ULTAG.match(s, open_idx)
    if not m:
        raise SystemExit("open_idx khong tro vao <ul")
    depth, inner = 1, m.end()
    for m2 in ULTAG.finditer(s, m.end()):
        depth += -1 if m2.group(1) else 1
        if depth == 0:
            return inner, m2.start()
    raise SystemExit("khong tim thay </ul> khop")

def replace_div(s, class_name, placeholder, nth=0):
    """Thay TOÀN BỘ phần bên trong <div class="X"> bằng placeholder, giữ nguyên thẻ bao."""
    hits = [m.start() for m in re.finditer(r'<div class="%s"' % re.escape(class_name), s)]
    if len(hits) <= nth:
        raise SystemExit("khong thay <div class=%s> thu %d" % (class_name, nth))
    a, b = div_span(s, hits[nth])
    return s[:a] + placeholder + s[b:]

def drop_div(s, class_name, placeholder):
    """Thay cả thẻ bao lẫn nội dung bằng placeholder (dùng cho khối có thể vắng mặt)."""
    m = re.search(r'<div class="%s"' % re.escape(class_name), s)
    if not m:
        return s
    _, b = div_span(s, m.start())
    end = s.find(">", b) + 1
    return s[:m.start()] + placeholder + s[end:]

def head_and_chrome(s, heading_ph="{{PAGE_HEADING}}"):
    """Phần dùng chung cho mọi loại trang: head SEO, menu dịch vụ, tiêu đề, sidebar."""
    s = re.sub(r"<title>.*?</title>", "<title>{{TITLE}}</title>", s, count=1, flags=re.S)
    s = re.sub(r'<meta name="description" content="[^"]*"\s*/?>',
               '<meta name="description" content="{{DESCRIPTION}}" />', s, count=1)
    s = re.sub(r'<meta name="DC\.title" content="[^"]*"\s*/?>',
               '<meta name="DC.title" content="{{TITLE}}" />', s, count=1)
    i = s.find("<!-- ==== SEO / Social / Structured data ==== -->")
    j = s.find("</head>", i)
    s = s[:i] + "{{SEO_BLOCK}}\n" + s[j:]

    # Mốc neo để build.py vá danh sách dịch vụ. Có ĐÚNG 2 submenu "Dịch vụ" (menu máy tính
    # và menu điện thoại) - phải vá CẢ HAI, nếu không menu 2 bên lệch nhau.
    # ⚠️ Chèn vào BÊN TRONG <ul> của submenu, KHÔNG chèn sau <div id="wap_menu">: các thẻ <li>
    # nằm ngoài <ul> sẽ đổ thành chữ trần ở đầu trang (bug thật đã gặp lúc dựng).
    head = re.compile(r'<a[^>]*href="/dich-vu/"[^>]*>\s*Dịch vụ\s*</a>\s*(?=<ul)', re.S)
    hits = [m.end() for m in head.finditer(s)]
    if len(hits) != 2:
        raise SystemExit("Mong doi 2 submenu Dich vu, tim thay %d - kiem tra lai markup menu" % len(hits))
    ph = "<!-- NAV_SERVICES_START -->{{NAV_SERVICES}}<!-- NAV_SERVICES_END -->"
    for start in reversed(hits):          # sửa từ cuối lên để chỉ số phía trước không lệch
        a_, b_ = ul_span(s, start)
        s = s[:a_] + ph + s[b_:]

    s = re.sub(r'<div class="tieude_giua"><div>.*?</div><span></span></div>',
               '<div class="tieude_giua"><div>' + heading_ph + '</div><span></span></div>',
               s, count=1, flags=re.S)

    s = replace_div(s, "thuvien", "{{GALLERY_SIDEBAR}}")
    # Khối "Tin tức sự kiện" ở sidebar: <ul> ngay sau tiêu đề đó
    k = s.find("Tin tức sự kiện")
    if k > 0:
        u = s.find("<ul>", k)
        v = s.find("</ul>", u)
        s = s[:u + 4] + "{{NEWS_SIDEBAR}}" + s[v:]
    return s

def make(page, out, kind):
    s = open(os.path.join(HTML, page), encoding="utf-8").read()
    # ⚠️ Script này lấy khung TỪ html/. Nếu html/ đã là sản phẩm của build.py thì template
    # sinh ra sẽ dựa trên markup đã bị đổ dữ liệu vào -> hỏng dây chuyền (bug thật đã gặp:
    # menu bị cắt sai vì template lấy từ trang đã build lỗi). Chỉ chạy trên html/ bản gốc.
    if "build.py:generated" in s or "NAV_SERVICES_START" in s:
        raise SystemExit("DUNG: %s la san pham cua build.py. Khoi phuc html/ ban goc truoc "
                         "khi sinh lai template." % page)
    s = head_and_chrome(s)
    if kind == "detail":
        # Khối "Các bài khác" nằm BÊN TRONG .content (đã kiểm: content 22613 < othernews
        # 23898 < đóng 24418). Nên phải khoét 2 vùng riêng, không cắt cả .content một lượt -
        # cắt một lượt là nuốt luôn khối bài khác và build.py không dựng lại được.
        open_tag = '<div class="content">'
        start = s.find(open_tag)
        i = start + len(open_tag)
        # Mốc kết thúc phần thân bài: khối chia sẻ hoặc khối "Các bài khác", tuỳ trang nào có.
        # ⚠️ Trang tin tức KHÔNG có div addthis -> find() trả -1; dùng thẳng -1 làm chỉ số là
        # cắt ngược và template mất nguyên phần sau. Phải lọc bỏ -1 TRƯỚC khi lấy min.
        cands = [s.find('<div class="addthis', i), s.find('<div class="othernews"', i)]
        cands = [c for c in cands if c > 0]
        if not cands:
            _, close = div_span(s, start)
            cands = [close]
        j = min(cands)
        s = s[:i] + "{{CONTENT}}" + s[j:]
        s = drop_div(s, "othernews", "{{OTHER_ITEMS}}")
    else:
        s = replace_div(s, "box_container", "{{LIST_ITEMS}}")
    open(os.path.join(TPL, out), "w", encoding="utf-8").write(s)
    print("  %-20s <- %-46s %s" % (out, page, ",".join(sorted(set(re.findall(r"\{\{(\w+)\}\}", s))))))

print("Sinh template tu trang that:")
make("dich-vu/bao-ve-ho-tong/index.html", "service.html", "detail")
make("tin-tuc/nguoi-bao-ve/index.html", "post.html", "detail")
make("tuyen-dung/tuyen-dung-nhan-vien-bao-ve/index.html", "job.html", "detail")
make("dich-vu/index.html", "service-list.html", "list")
make("tin-tuc/index.html", "post-list.html", "list")
make("tuyen-dung/index.html", "job-list.html", "list")
make("thu-vien-anh/index.html", "gallery.html", "list")
