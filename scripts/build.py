# -*- coding: utf-8 -*-
"""Dựng html/ từ data/ + templates/. Chạy bởi CI mỗi khi file index tổng trong data/ đổi.

NGUỒN CHÂN LÝ là data/ (CMS ghi). html/ sinh ra ở đây là SẢN PHẨM PHÁI SINH - đừng sửa tay
các trang do script này sinh, lần build sau ghi đè hết. Muốn đổi giao diện thì sửa templates/.

Trang do script này sinh đều mang dấu <!-- build.py:generated --> ngay sau <html> để:
  (a) biết trang nào của mình mà dọn khi bản ghi bị xoá qua CMS,
  (b) không bao giờ xoá nhầm trang viết tay (/, /gioi-thieu/, /lien-he/, /admin/).
"""
import os, re, json, html as H, datetime

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA = os.path.join(ROOT, "data")
TPL = os.path.join(ROOT, "templates")
OUT = os.path.join(ROOT, "html")

SITE = "https://hailongson.com"
BRAND = " | Hải Long Sơn"
ORG_NAME = "CÔNG TY TNHH DỊCH VỤ BẢO VỆ HẢI LONG SƠN"
ORG_SHORT = "Bảo vệ Hải Long Sơn"
GENERATED = "<!-- build.py:generated -->"

# PHẢI KHỚP hằng JOB_SECTIONS trong gas/Code.js và bảng ở GAS.md mục VI-B.
JOB_SECTIONS = [
    ("intro_html", ""),
    ("quantity_html", "Số lượng &amp; vị trí"),
    ("requirements_html", "Yêu cầu ứng viên"),
    ("location_html", "Khu vực làm việc"),
    ("salary_html", "Mức lương &amp; quyền lợi"),
    ("contact_html", "Liên hệ"),
]

def load(name, default=None):
    p = os.path.join(DATA, name)
    if not os.path.exists(p):
        return default if default is not None else []
    return json.load(open(p, encoding="utf-8"))

def tpl(name):
    return open(os.path.join(TPL, name), encoding="utf-8").read()

def esc(s):
    return H.escape(str(s or ""), quote=True)

def clip(s, n=160):
    s = re.sub(r"\s+", " ", H.unescape(re.sub(r"<[^>]+>", " ", str(s or "")))).strip()
    return s if len(s) <= n else s[:n].rsplit(" ", 1)[0].rstrip(" ,.;:-–") + "…"

def vn_date(iso):
    try:
        y, m, d = str(iso).split("-")
        return "%s.%s.%s" % (d, m, y)
    except Exception:
        return ""

def write(rel, content):
    p = os.path.join(OUT, rel)
    os.makedirs(os.path.dirname(p), exist_ok=True)
    old = open(p, encoding="utf-8").read() if os.path.exists(p) else None
    if old == content:
        return False
    open(p, "w", encoding="utf-8").write(content)
    return True

# ---------------- khối dùng chung ----------------

def nav_services_html(services):
    return "".join(
        '<li><a href="/dich-vu/%s/" title="%s">%s</a></li>' %
        (esc(s["slug"]), esc(s.get("nav_label") or s["title"]), esc(s.get("nav_label") or s["title"]))
        for s in services
    )

def gallery_sidebar_html(gallery, limit=8):
    out = []
    for g in gallery[:limit]:
        u = "/images/gallery/" + g["file"]
        out.append(
            '<div class="item_tv"><p><a class="swipebox" href="%s" title="%s">'
            '<img src="%s" alt="%s" /></a></p></div>' % (u, esc(g["alt"]), u, esc(g["alt"]))
        )
    return "".join(out)

def news_sidebar_html(posts, limit=4):
    return "".join(
        '<li><a href="/tin-tuc/%s/" title="%s">%s</a><p class="mota">%s</p></li>' %
        (esc(p["slug"]), esc(p["title"]), esc(p["title"]), esc(clip(p.get("description"), 110)))
        for p in posts[:limit]
    )

def other_items_html(items, base, current_slug, label="Các bài khác", date_key=None):
    li = []
    for it in items:
        if it["slug"] == current_slug:
            continue
        d = vn_date(it.get(date_key)) if date_key else ""
        li.append('<li><a href="/%s/%s/" title="%s">%s</a>%s</li>' %
                  (base, esc(it["slug"]), esc(it["title"]), esc(it["title"]),
                   (" (%s)" % d) if d else ""))
    return ('<div class="othernews"><div class="cactinkhac">%s</div><ul class="phantrang">%s</ul>'
            '<div class="pagination"></div></div>' % (label, "".join(li)))

def seo_block(url, title, desc, image, page_type, extra_ld=None, published=None, modified=None):
    """Bộ meta + JSON-LD. Giữ đúng khuôn đã chuẩn hoá cho 31 trang trước đó."""
    graph = [
        {"@type": ["Organization", "LocalBusiness"], "@id": SITE + "/#organization",
         "name": ORG_NAME, "alternateName": ORG_SHORT, "url": SITE + "/",
         "logo": {"@type": "ImageObject", "@id": SITE + "/#logo",
                  "url": SITE + "/images/logo-tron.webp", "contentUrl": SITE + "/images/logo-tron.webp",
                  "caption": ORG_NAME},
         "image": [SITE + "/images/og/home.jpg"],
         "email": "baovehailongson@gmail.com",
         "telephone": ["+842743802205", "+84973026960"],
         "address": {"@type": "PostalAddress", "streetAddress": "101/1 Khu phố Đồng An 3",
                     "addressLocality": "Phường Bình Hòa", "addressRegion": "Thành phố Hồ Chí Minh",
                     "addressCountry": "VN"},
         "geo": {"@type": "GeoCoordinates", "latitude": 10.832400391963748, "longitude": 106.64280671597226},
         "areaServed": [{"@type": "AdministrativeArea", "name": a}
                        for a in ("Thành phố Hồ Chí Minh", "Bình Dương", "Đồng Nai")],
         "knowsLanguage": "vi", "sameAs": ["https://zalo.me/0973026960"]},
        {"@type": "WebSite", "@id": SITE + "/#website", "url": SITE + "/",
         "name": ORG_SHORT, "publisher": {"@id": SITE + "/#organization"}, "inLanguage": "vi-VN"},
    ]
    page = {"@type": page_type, "@id": url + "#webpage", "url": url, "name": title,
            "description": desc, "isPartOf": {"@id": SITE + "/#website"},
            "about": {"@id": SITE + "/#organization"}, "breadcrumb": {"@id": url + "#breadcrumb"},
            "primaryImageOfPage": {"@type": "ImageObject", "@id": url + "#primaryimage",
                                   "url": image, "contentUrl": image, "caption": title},
            "inLanguage": "vi-VN"}
    if published:
        page["datePublished"] = published
    if modified:
        page["dateModified"] = modified
    graph.append(page)
    if extra_ld:
        graph.extend(extra_ld)

    og_type = "article" if page_type == "ItemPage" and published else "website"
    meta = [
        GENERATED,
        '<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />',
        '<meta name="language" content="Vietnamese" />',
        '<meta name="geo.region" content="VN-SG" />',
        '<link rel="canonical" href="%s" />' % url,
        '<meta property="og:locale" content="vi_VN" />',
        '<meta property="og:type" content="%s" />' % og_type,
        '<meta property="og:site_name" content="%s" />' % esc(ORG_NAME),
        '<meta property="og:title" content="%s" />' % esc(title),
        '<meta property="og:description" content="%s" />' % esc(desc),
        '<meta property="og:url" content="%s" />' % url,
        '<meta property="og:image" content="%s" />' % image,
        '<meta property="og:image:secure_url" content="%s" />' % image,
        '<meta property="og:image:type" content="image/jpeg" />',
        '<meta property="og:image:width" content="1200" />',
        '<meta property="og:image:height" content="630" />',
        '<meta property="og:image:alt" content="%s" />' % esc(title),
        '<meta name="twitter:card" content="summary_large_image" />',
        '<meta name="twitter:title" content="%s" />' % esc(title),
        '<meta name="twitter:description" content="%s" />' % esc(desc),
        '<meta name="twitter:image" content="%s" />' % image,
        '<meta name="twitter:image:alt" content="%s" />' % esc(title),
    ]
    if published:
        meta.append('<meta property="article:published_time" content="%s" />' % published)
    meta.append('<script type="application/ld+json">\n%s\n</script>' %
                json.dumps({"@context": "https://schema.org", "@graph": graph}, ensure_ascii=False, indent=1))
    return "\n".join(meta)

def crumbs(url, trail):
    items = [{"@type": "ListItem", "position": 1, "name": "Trang chủ", "item": SITE + "/"}]
    for n, (name, link) in enumerate(trail, 2):
        items.append({"@type": "ListItem", "position": n, "name": name, "item": link})
    return {"@type": "BreadcrumbList", "@id": url + "#breadcrumb", "itemListElement": items}

def cover_html(d):
    """Ảnh bìa vẽ ở ĐẦU nội dung. Lúc migrate, ảnh đầu đã được gỡ khỏi content_html và chuyển
    thành ảnh bìa riêng (tên tất định theo slug) - nếu build không vẽ lại thì trang mất hẳn
    ảnh minh hoạ so với bản cũ."""
    if not d.get("cover"):
        return ""
    return ('<p class="anh-bia"><img src="/upload/images/%s" alt="%s" /></p>'
            % (esc(d["cover"]), esc(d.get("cover_alt") or d.get("title"))))

def render(template, **kw):
    s = tpl(template)
    for k, v in kw.items():
        s = s.replace("{{%s}}" % k, v)
    left = re.findall(r"\{\{(\w+)\}\}", s)
    if left:
        raise SystemExit("Template %s con placeholder chua thay: %s" % (template, set(left)))
    # Dấu nhận biết trang do build sinh - đặt ngay sau <html ...>
    return re.sub(r"(<html[^>]*>)", r"\1\n" + GENERATED, s, count=1)


# ---------------- dựng từng loại trang ----------------

def build():
    services = sorted(load("services.json"), key=lambda x: int(x.get("order") or 0))
    posts = sorted(load("posts.json"), key=lambda x: str(x.get("date") or ""), reverse=True)
    jobs = sorted(load("jobs.json"), key=lambda x: str(x.get("date_posted") or ""), reverse=True)
    gallery = sorted(load("gallery.json"), key=lambda x: int(x.get("order") or 0))

    NAV = nav_services_html(services)
    GAL = gallery_sidebar_html(gallery)
    NEWS = news_sidebar_html(posts)
    common = dict(NAV_SERVICES=NAV, GALLERY_SIDEBAR=GAL, NEWS_SIDEBAR=NEWS)
    changed, kept = [], set()

    def og(slug):
        return SITE + "/images/og/" + slug + ".jpg"

    # ---- Dịch vụ: chi tiết ----
    for s in services:
        d = json.load(open(os.path.join(DATA, "services", s["slug"] + ".json"), encoding="utf-8"))
        url = "%s/dich-vu/%s/" % (SITE, d["slug"])
        title = d.get("seo_title") or (d["title"] + BRAND)
        desc = clip(d.get("description"))
        img = og("dich-vu-" + d["slug"])
        svc = {"@type": "Service", "@id": url + "#service", "name": d["title"],
               "serviceType": d["title"], "description": desc, "url": url,
               "image": img, "provider": {"@id": SITE + "/#organization"},
               "areaServed": [{"@type": "AdministrativeArea", "name": a}
                              for a in ("Thành phố Hồ Chí Minh", "Bình Dương", "Đồng Nai")],
               "mainEntityOfPage": {"@id": url + "#webpage"}}
        page = render("service.html", TITLE=esc(title), DESCRIPTION=esc(desc),
                      PAGE_HEADING=esc(d["title"]), CONTENT=cover_html(d) + d.get("content_html", ""),
                      OTHER_ITEMS=other_items_html(services, "dich-vu", d["slug"], "Dịch vụ khác"),
                      SEO_BLOCK=seo_block(url, title, desc, img, "ItemPage",
                                          [crumbs(url, [("Dịch vụ", SITE + "/dich-vu/"), (d["title"], url)]), svc],
                                          modified=d.get("updated_at", "")[:10]),
                      **common)
        rel = "dich-vu/%s/index.html" % d["slug"]
        kept.add(rel)
        if write(rel, page):
            changed.append(rel)

    # ---- Tin tức: chi tiết ----
    for p in posts:
        d = json.load(open(os.path.join(DATA, "posts", p["slug"] + ".json"), encoding="utf-8"))
        url = "%s/tin-tuc/%s/" % (SITE, d["slug"])
        title = d.get("seo_title") or (d["title"] + BRAND)
        desc = clip(d.get("description"))
        img = og("tin-tuc-" + d["slug"])
        art = {"@type": "Article", "@id": url + "#article", "headline": d["title"][:110],
               "description": desc, "image": [img], "author": {"@id": SITE + "/#organization"},
               "publisher": {"@id": SITE + "/#organization"},
               "mainEntityOfPage": {"@id": url + "#webpage"}, "inLanguage": "vi-VN",
               "datePublished": d.get("date", ""), "dateModified": d.get("updated_at", "")[:10]}
        page = render("post.html", TITLE=esc(title), DESCRIPTION=esc(desc),
                      PAGE_HEADING=esc(d["title"]), CONTENT=cover_html(d) + d.get("content_html", ""),
                      OTHER_ITEMS=other_items_html(posts, "tin-tuc", d["slug"], "Các bài khác", "date"),
                      SEO_BLOCK=seo_block(url, title, desc, img, "ItemPage",
                                          [crumbs(url, [("Tin tức", SITE + "/tin-tuc/"), (d["title"], url)]), art],
                                          published=d.get("date"), modified=d.get("updated_at", "")[:10]),
                      **common)
        rel = "tin-tuc/%s/index.html" % d["slug"]
        kept.add(rel)
        if write(rel, page):
            changed.append(rel)

    # ---- Tuyển dụng: chi tiết (nội dung ghép từ các section con) ----
    for j in jobs:
        d = json.load(open(os.path.join(DATA, "jobs", j["slug"] + ".json"), encoding="utf-8"))
        url = "%s/tuyen-dung/%s/" % (SITE, d["slug"])
        title = d.get("seo_title") or (d["title"] + BRAND)
        desc = clip(d.get("description"))
        img = og("tuyen-dung-" + d["slug"])

        body = []
        for key, heading in JOB_SECTIONS:
            block = (d.get(key) or "").strip()
            if not block:
                continue          # section trống -> bỏ qua HẲN, không in heading rỗng
            if heading:
                body.append("<h2>%s</h2>" % heading)
            body.append(block)

        val = {"@type": "QuantitativeValue", "minValue": d.get("salary_min") or 0, "unitText": "MONTH"}
        if d.get("salary_max"):
            val["maxValue"] = d["salary_max"]
        job_ld = {"@type": "JobPosting", "@id": url + "#jobposting", "title": d["title"],
                  "description": d.get("description") or desc,
                  "datePosted": d.get("date_posted", ""), "employmentType": d.get("employment_type", "FULL_TIME"),
                  "hiringOrganization": {"@id": SITE + "/#organization"},
                  "jobLocation": [{"@type": "Place", "address": {"@type": "PostalAddress",
                                   "addressLocality": loc, "addressCountry": "VN"}}
                                  for loc in d.get("locations", [])],
                  "baseSalary": {"@type": "MonetaryAmount", "currency": "VND", "value": val},
                  "industry": "Dịch vụ bảo vệ", "inLanguage": "vi-VN",
                  "mainEntityOfPage": {"@id": url + "#webpage"}}
        if d.get("valid_through"):
            job_ld["validThrough"] = d["valid_through"]
        if d.get("openings"):
            job_ld["totalJobOpenings"] = d["openings"]

        page = render("job.html", TITLE=esc(title), DESCRIPTION=esc(desc),
                      PAGE_HEADING=esc(d["title"]), CONTENT=cover_html(d) + "\n".join(body),
                      OTHER_ITEMS=other_items_html(jobs, "tuyen-dung", d["slug"], "Tin khác", "date_posted"),
                      SEO_BLOCK=seo_block(url, title, desc, img, "ItemPage",
                                          [crumbs(url, [("Tuyển dụng", SITE + "/tuyen-dung/"), (d["title"], url)]), job_ld],
                                          published=d.get("date_posted"), modified=d.get("updated_at", "")[:10]),
                      **common)
        rel = "tuyen-dung/%s/index.html" % d["slug"]
        kept.add(rel)
        if write(rel, page):
            changed.append(rel)

    # ---- Các trang danh sách ----
    def item_list_ld(url, rows, base):
        return {"@type": "ItemList", "@id": url + "#itemlist",
                "itemListOrder": "https://schema.org/ItemListOrderAscending",
                "numberOfItems": len(rows),
                "itemListElement": [{"@type": "ListItem", "position": i + 1, "name": r["title"],
                                     "url": "%s/%s/%s/" % (SITE, base, r["slug"])}
                                    for i, r in enumerate(rows)]}

    def card(base, r, date_key=None):
        d = vn_date(r.get(date_key)) if date_key else ""
        return (
            '<div class="box_news">'
            '<a href="/%s/%s/" title="%s"><img src="/upload/images/%s" alt="%s" /></a>'
            '<h4><a href="/%s/%s/" title="%s">%s</a></h4>'
            '%s<p class="mota">%s</p></div>'
            % (base, esc(r["slug"]), esc(r["title"]), esc(r["cover"]), esc(r.get("cover_alt") or r["title"]),
               base, esc(r["slug"]), esc(r["title"]), esc(r["title"]),
               ('<p class="ngay">%s</p>' % d) if d else "", esc(clip(r.get("description"), 150)))
        )

    LISTS = [
        ("service-list.html", "dich-vu", "Dịch vụ", services, None,
         "Danh mục dịch vụ bảo vệ của Hải Long Sơn: bảo vệ tòa nhà, nhà máy, công trường, siêu thị, sự kiện, hộ tống yếu nhân và áp tải hàng hóa 24/24."),
        ("post-list.html", "tin-tuc", "Tin tức", posts, "date",
         "Tin tức, hoạt động đào tạo nghiệp vụ và các sự kiện an ninh do Công ty Dịch vụ Bảo vệ Hải Long Sơn thực hiện."),
        ("job-list.html", "tuyen-dung", "Tuyển dụng", jobs, "date_posted",
         "Thông báo tuyển dụng nhân viên bảo vệ, nhân viên cơ động tại TP.HCM và các tỉnh lân cận. Mức lương 5,5 – 9 triệu/tháng, bao ăn ở, xét tuyển liên tục."),
    ]
    for template, base, heading, rows, date_key, desc in LISTS:
        url = "%s/%s/" % (SITE, base)
        title = heading + BRAND
        img = og(base)
        body = '<div class="wap_box_new">%s</div>' % "".join(card(base, r, date_key) for r in rows)
        page = render(template, TITLE=esc(title), DESCRIPTION=esc(desc), PAGE_HEADING=esc(heading),
                      LIST_ITEMS=body,
                      SEO_BLOCK=seo_block(url, title, desc, img, "CollectionPage",
                                          [crumbs(url, [(heading, url)]), item_list_ld(url, rows, base)]),
                      **common)
        rel = "%s/index.html" % base
        kept.add(rel)
        if write(rel, page):
            changed.append(rel)

    # ---- Thư viện ảnh ----
    url = SITE + "/thu-vien-anh/"
    title = "Thư Viện Ảnh Hoạt Động" + BRAND
    desc = ("Hình ảnh thực tế đội ngũ bảo vệ Hải Long Sơn tại các mục tiêu: nhà máy, tòa nhà, "
            "công trường, diễn tập PCCC và huấn luyện nghiệp vụ.")
    items = "".join(
        '<div class="item_tv" data-p="%d"><a class="swipebox" href="/images/gallery/%s" title="%s">'
        '<img src="/images/gallery/%s" alt="%s" /></a></div>'
        % (i + 1, esc(g["file"]), esc(g["alt"]), esc(g["file"]), esc(g["alt"]))
        for i, g in enumerate(gallery)
    )
    page = render("gallery.html", TITLE=esc(title), DESCRIPTION=esc(desc),
                  LIST_ITEMS='<div class="wap_item2">%s</div>' % items,
                  SEO_BLOCK=seo_block(url, title, desc, SITE + "/images/og/thu-vien-anh.jpg", "ImageGallery",
                                      [crumbs(url, [("Thư viện ảnh", url)])]),
                  **common)
    kept.add("thu-vien-anh/index.html")
    if write("thu-vien-anh/index.html", page):
        changed.append("thu-vien-anh/index.html")

    # ---- Dọn trang mồ côi (bản ghi đã bị xoá qua CMS) ----
    removed = []
    for base in ("dich-vu", "tin-tuc", "tuyen-dung"):
        d = os.path.join(OUT, base)
        if not os.path.isdir(d):
            continue
        for name in sorted(os.listdir(d)):
            sub = os.path.join(d, name, "index.html")
            rel = "%s/%s/index.html" % (base, name)
            if not os.path.isfile(sub) or rel in kept:
                continue
            # CHỈ xoá trang do chính build.py sinh - không bao giờ đụng trang viết tay.
            if GENERATED in open(sub, encoding="utf-8").read():
                os.remove(sub)
                try:
                    os.rmdir(os.path.join(d, name))
                except OSError:
                    pass
                removed.append(rel)

    print("Build xong: %d trang, %d trang đổi nội dung, %d trang mồ côi đã dọn"
          % (len(kept), len(changed), len(removed)))
    for r in changed[:10]:
        print("   cập nhật:", r)
    for r in removed:
        print("   đã dọn  :", r)
    return len(kept)

if __name__ == "__main__":
    build()
