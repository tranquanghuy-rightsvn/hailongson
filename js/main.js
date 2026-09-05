(function () {
  'use strict';

  /* ============ Mobile off-canvas menu ============ */
  var menuBtn = document.getElementById('menuOpenBtn');
  var closeBtn = document.getElementById('menuCloseBtn');
  var overlay = document.getElementById('menuOverlay');
  var mobileMenu = document.getElementById('menu_mobi');

  function openMenu() {
    mobileMenu.classList.add('open');
    overlay.classList.add('open');
  }
  function closeMenu() {
    mobileMenu.classList.remove('open');
    overlay.classList.remove('open');
  }
  if (menuBtn) menuBtn.addEventListener('click', openMenu);
  if (closeBtn) closeBtn.addEventListener('click', closeMenu);
  if (overlay) overlay.addEventListener('click', closeMenu);

  document.querySelectorAll('#menu_mobi .sub-toggle').forEach(function (btn) {
    btn.addEventListener('click', function () {
      btn.closest('li').classList.toggle('open');
    });
  });

  /* ============ Desktop submenu: show(300ms) + active2 ============ */
  document.querySelectorAll('#menu > li').forEach(function (li) {
    var sub = li.querySelector('.submenu');
    var link = li.querySelector(':scope > a');
    if (sub) {
      var t;
      li.addEventListener('mouseenter', function () {
        clearTimeout(t);
        t = setTimeout(function () { sub.style.display = 'block'; }, 300);
      });
      li.addEventListener('mouseleave', function () {
        clearTimeout(t);
        sub.style.display = 'none';
      });
    }
    if (link) {
      li.addEventListener('mouseenter', function () { link.classList.add('active2'); });
      li.addEventListener('mouseleave', function () { link.classList.remove('active2'); });
    }
  });
  (function markActive2() {
    var path = location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('#menu li').forEach(function (li) {
      var a = li.querySelector(':scope > a');
      if (a && a.getAttribute('href') === path && path !== 'index.html') a.classList.add('active2');
    });
  })();

  /* ============ Back to top ============ */
  var toTop = document.getElementById('toptop');
  window.addEventListener('scroll', function () {
    if (window.scrollY > 0) toTop.classList.add('visible');
    else toTop.classList.remove('visible');
  });
  toTop.addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  /* ============ Hero slider (flexslider-equivalent, slide mode, numbered dots) ============ */
  (function heroSlider() {
    var track = document.getElementById('heroSlides');
    var slides = track.querySelectorAll('.slide');
    var dotsWrap = document.getElementById('heroDots');
    var index = 0;
    var timer;

    slides.forEach(function (_, i) {
      var dot = document.createElement('li');
      var a = document.createElement('a');
      a.textContent = String(i + 1);
      a.href = '#';
      a.addEventListener('click', function (e) { e.preventDefault(); goTo(i); resetTimer(); });
      dot.appendChild(a);
      dotsWrap.appendChild(dot);
    });
    var dots = dotsWrap.querySelectorAll('li');

    function render() {
      track.style.transform = 'translateX(-' + (index * 100) + '%)';
      dots.forEach(function (d, i) { d.classList.toggle('active', i === index); });
    }
    function goTo(i) {
      index = (i + slides.length) % slides.length;
      render();
    }
    function next() { goTo(index + 1); }
    function resetTimer() {
      clearInterval(timer);
      timer = setInterval(next, 7000);
    }

    render();
    resetTimer();
  })();

  /* ============ Gallery carousel (2 cols x 2 rows, autoplay) ============ */
var GALLERY_DATA = [
    ["a4ef1426b34e5d10045f-6291.jpg","a4ef1426b34e5d10045f3087_280x195.jpg"],
    ["7a4c990a226dcc33957c-4483.jpg","7a4c990a226dcc33957c0708_280x195.jpg"],
    ["1a7f0e23b5445b1a0255-0333.jpg","1a7f0e23b5445b1a02559094_280x195.jpg"],
    ["ed9ed9f3-f023-4534-9a59-220471b8d17d-1910.jpeg","ed9ed9f3-f023-4534-9a59-220471b8d17d3754_280x195.jpeg"],
    ["df79711e-dc0c-449a-bc40-cd33249194ef-9722.jpeg","df79711e-dc0c-449a-bc40-cd33249194ef2404_280x195.jpeg"],
    ["d9049cbe-8b22-4c9d-b0b5-76f6b96051d8-5766.jpeg","d9049cbe-8b22-4c9d-b0b5-76f6b96051d87556_280x195.jpeg"],
    ["d16b096e-c67c-401a-8644-2a3ca0148077-8513.jpeg","d16b096e-c67c-401a-8644-2a3ca01480775251_280x195.jpeg"],
    ["c2384ab3-b8fc-493b-b267-40b40575087a-(1)-0533.jpeg","c2384ab3-b8fc-493b-b267-40b40575087a-(1)0779_280x195.jpeg"],
    ["59309e89-64db-415a-b8b1-c1050b6000b9-4220.jpeg","59309e89-64db-415a-b8b1-c1050b6000b96195_280x195.jpeg"],
    ["2220fa39-ec20-4944-beb1-6cf7b2ac87af-8156.jpeg","2220fa39-ec20-4944-beb1-6cf7b2ac87af9761_280x195.jpeg"],
    ["6a680802-489d-4186-8f76-a7809fb000ad-9077.jpeg","6a680802-489d-4186-8f76-a7809fb000ad0041_280x195.jpeg"],
    ["536407b4cf090d575418-9897.jpg","536407b4cf090d5754180087_280x195.jpg"],
    ["de37e6942d29ef77b638-4570.jpg","de37e6942d29ef77b6383908_280x195.jpg"],
    ["b8d9c6a69aa178ff21b0-4069.jpg","b8d9c6a69aa178ff21b09801_280x195.jpg"],
    ["03bc3fc363c4819ad8d5-0245.jpg","03bc3fc363c4819ad8d59169_280x195.jpg"],
    ["d069a9ef86f964a73de8-7186.jpg","d069a9ef86f964a73de81338_280x195.jpg"],
    ["ee129fefb0f952a70be8-8517.jpg","ee129fefb0f952a70be87722_280x195.jpg"],
    ["35765f32e024027a5b35-4111.jpg","35765f32e024027a5b352393_280x195.jpg"],
    ["c2c14ec5bd145e4a0705-4622.jpg","c2c14ec5bd145e4a07055605_280x195.jpg"],
    ["b0d480c17310904ec901-3361.jpg","b0d480c17310904ec9015592_280x195.jpg"],
    ["333ef13602e7e1b9b8f6-9542.jpg","333ef13602e7e1b9b8f66136_280x195.jpg"],
    ["e442b7067fb69ce8c5a7-0108.jpg","e442b7067fb69ce8c5a78585_280x195.jpg"],
    ["e297c3b4e002035c5a13-0937.jpg","e297c3b4e002035c5a134047_280x195.jpg"],
    ["phu-quoc-9009.jpg","phu-quoc1596_280x195.jpg"],
    ["5da10b060272e02cb963-5901.jpg","5da10b060272e02cb9638514_280x195.jpg"],
    ["8fda5d066cb983e7daa8-7873.jpg","8fda5d066cb983e7daa80407_280x195.jpg"],
    ["47174316_2216090081961465_8280312396791152640_o-7639.jpg","47174316_2216090081961465_8280312396791152640_o2575_280x195.jpg"],
    ["47194404_2216086801961793_3222442103090970624_n-6655.jpg","47194404_2216086801961793_3222442103090970624_n1860_280x195.jpg"],
    ["a8736294ebf805a65ce9-8650.jpg","a8736294ebf805a65ce98026_280x195.jpg"],
    ["0a1a1b471a32f46cad23-5487.jpg","0a1a1b471a32f46cad239871_280x195.jpg"],
    ["974c3c175562bb3ce273-1497.jpg","974c3c175562bb3ce2736558_280x195.jpg"],
    ["img_2612-0733.jpg","img_26128548_280x195.jpg"],
    ["img_2626-5155.JPG","img_26262787_280x195.jpg"],
    ["img_2623-4927.JPG","img_26233839_280x195.jpg"],
    ["img_2630-9333.JPG","img_26308453_280x195.jpg"],
    ["img_2631-3474.JPG","img_26313662_280x195.jpg"],
    ["img_2628-0085.JPG","img_26280269_280x195.jpg"],
    ["img_2621-2115.JPG","img_26210423_280x195.jpg"],
    ["img_2593-1155.jpg","img_25933937_280x195.jpg"],
    ["img_2601-6179.jpg","img_26019593_280x195.jpg"],
    ["img_2611-1708.jpg","img_26114548_280x195.jpg"],
    ["img_2587-4280.jpg","img_25873380_280x195.jpg"],
    ["img_2537.mov-9631.jpg","img_2537.mov7933_280x195.jpg"],
    ["img_2568-4197.jpg","img_25684670_280x195.jpg"],
    ["san-thong-nhat-phu-sac-do-fan-nu-xinh-het-minh-chao-don-u23-viet-nam-27710700_1996128347070541_1415626112_o--copy--1517742684-966-width660height400-3645.jpg","san-thong-nhat-phu-sac-do-fan-nu-xinh-het-minh-chao-don-u23-viet-nam-27710700_1996128347070541_1415626112_o--copy--1517742684-966-width660height4001486_280x195.jpg"],
    ["mbzx587xp3pqet0x-8014.jpg","mbzx587xp3pqet0x8743_280x195.jpg"],
    ["c949e2cee32f0c71553e-3163.jpg","c949e2cee32f0c71553e6365_280x195.jpg"],
    ["dc4654ebf00a1f54461b-5493.jpg","dc4654ebf00a1f54461b6671_280x195.jpg"],
    ["af4bb5fb111afe44a70b-7603.jpg","af4bb5fb111afe44a70b9382_280x195.jpg"],
    ["84350d81a960463e1f71-0775.jpg","84350d81a960463e1f716776_280x195.jpg"],
    ["721f78e43205dd5b8414-7390.jpg","721f78e43205dd5b84145621_280x195.jpg"],
    ["498a1cc983286c763539-4437.jpg","498a1cc983286c7635396628_280x195.jpg"],
    ["43c1b3cab72a5874013b-1144.jpg","43c1b3cab72a5874013b7486_280x195.jpg"],
    ["0211_u23_vieyyt_nam_trong_voyng_vayy_fan_sayi_goyn_22-(1)-5204.jpg","0211_u23_vieyyt_nam_trong_voyng_vayy_fan_sayi_goyn_22-(1)2557_280x195.jpg"],
    ["90ddcb337dd3928dcbc2-9351.jpg","90ddcb337dd3928dcbc29843_280x195.jpg"],
    ["26d05e042ee5c1bb98f4-2194.jpg","26d05e042ee5c1bb98f47141_280x195.jpg"],
    ["09fb30ad954c7a12235d-1653.jpg","09fb30ad954c7a12235d5396_280x195.jpg"],
    ["8f2e7c9fcb7e24207d6f-2890.jpg","8f2e7c9fcb7e24207d6f9045_280x195.jpg"],
    ["8buppiyevue7nltk-1050.jpg","8buppiyevue7nltk2110_280x195.jpg"],
    ["8_179239-2903.jpg","8_1792391989_280x195.jpg"],
    ["7b9ec73a7adc9582cccd-6186.jpg","7b9ec73a7adc9582cccd8096_280x195.jpg"],
    ["6d496ec86f298077d938-5839.jpg","6d496ec86f298077d9384887_280x195.jpg"],
    ["5_166555-5371.jpg","5_1665550252_280x195.jpg"],
    ["5a83bc39d3df3c8165ce-8247.jpg","5a83bc39d3df3c8165ce1132_280x195.jpg"],
    ["4_170815-9083.jpg","4_1708155111_280x195.jpg"],
    ["3c681238b7d9588701c8-9401.jpg","3c681238b7d9588701c88215_280x195.jpg"],
    ["2fdee227a8c647981ed7-8278.jpg","2fdee227a8c647981ed78578_280x195.jpg"],
    ["2f724b8a016bee35b77a-0275.jpg","2f724b8a016bee35b77a1734_280x195.jpg"],
    ["2_238906-5784.jpg","2_2389066561_280x195.jpg"],
    ["1w-2446.jpg","1w9672_280x195.jpg"],
    ["1b9feae0eb0604585d17-4337.jpg","1b9feae0eb0604585d176785_280x195.jpg"],
    ["1c885e2fface15904cdf-7949.jpg","1c885e2fface15904cdf5822_280x195.jpg"],
    ["1_197361-8294.jpg","1_1973610295_280x195.jpg"],
    ["1_62058-3730.jpg","1_620589623_280x195.jpg"],
    ["z730502517160_87b76ad1c056b08893381d64ef99ffc2-3513.jpg","z730502517160_87b76ad1c056b08893381d64ef99ffc29157_280x195.jpg"],
    ["z726822422051_da9bc1f71e78036b22e4c60e2b8b44eb-2147.jpg","z726822422051_da9bc1f71e78036b22e4c60e2b8b44eb3068_280x195.jpg"],
    ["z726822431463_a31a7d1f393b43b47864c2c411dec04e-2980.jpg","z726822431463_a31a7d1f393b43b47864c2c411dec04e8490_280x195.jpg"],
    ["z726822405489_8b66136fdb8ce2d17cc11a2e7fdfa5f6-7843.jpg","z726822405489_8b66136fdb8ce2d17cc11a2e7fdfa5f66808_280x195.jpg"],
    ["z726800194211_57ce8cc5524c84e1e0ca8015c32bd585-8419.jpg","z726800194211_57ce8cc5524c84e1e0ca8015c32bd5850039_280x195.jpg"],
    ["z618525851163_98358b678a5b2c58f22bf502898fcb1f-8878.jpg","z618525851163_98358b678a5b2c58f22bf502898fcb1f4987_280x195.jpg"],
    ["z618526158631_88575e32e1b2a72f2538e03d96ae078b-0129.jpg","z618526158631_88575e32e1b2a72f2538e03d96ae078b8137_280x195.jpg"],
    ["z693996134570_aa4ec7eb3c401b5f4d2e916a81d4ab62-3727.jpg","z693996134570_aa4ec7eb3c401b5f4d2e916a81d4ab623951_280x195.jpg"],
    ["z693995996590_601d17da18f6e636ded595d24037fdc2-6651.jpg","z693995996590_601d17da18f6e636ded595d24037fdc29212_280x195.jpg"],
    ["z693995913065_3de31f742a5904d4cfff62d0bf1f4f7a-9729.jpg","z693995913065_3de31f742a5904d4cfff62d0bf1f4f7a0658_280x195.jpg"],
    ["z693995796775_93eddc9c21d758db304f502331364b10-7927.jpg","z693995796775_93eddc9c21d758db304f502331364b109077_280x195.jpg"],
    ["z693995720166_40ad816bce00fd09d28127005043ddf0-6266.jpg","z693995720166_40ad816bce00fd09d28127005043ddf07619_280x195.jpg"],
    ["z693995655451_71ff0c20f5a10c06ccb40b944ebaa797-6409.jpg","z693995655451_71ff0c20f5a10c06ccb40b944ebaa7975417_280x195.jpg"],
    ["4-6513.jpg","42911_280x195.jpg"],
    ["3-6301.jpg","33146_280x195.jpg"],
    ["1-6082.jpg","16707_280x195.jpg"],
    ["untitled-2-5541.jpg","untitled-23181_280x195.jpg"],
    ["36-4242.jpg","369932_280x195.jpg"],
    ["34-4925.jpg","349908_280x195.jpg"],
    ["33-9902.jpg","339188_280x195.jpg"],
    ["32-7670.jpg","325022_280x195.jpg"],
    ["29-7197.jpg","294073_280x195.jpg"],
    ["21-1567.jpg","218499_280x195.jpg"],
    ["28-4164.jpg","285024_280x195.jpg"],
    ["17-6766.jpg","170763_280x195.jpg"],
    ["16-1772.jpg","160773_280x195.jpg"],
    ["15-1031.jpg","153946_280x195.jpg"],
    ["14-1127.jpg","142127_280x195.jpg"],
    ["13-0928.jpg","135462_280x195.jpg"],
    ["11-8022.jpg","115371_280x195.jpg"],
    ["10-3652.jpg","100347_280x195.jpg"],
    ["9-3142.jpg","97277_280x195.jpg"],
    ["8-3231.jpg","80205_280x195.jpg"],
    ["7-4075.jpg","79262_280x195.jpg"],
    ["6-1823.jpg","61395_280x195.jpg"],
    ["5-8914.jpg","58337_280x195.jpg"],
    ["4-9894.jpg","41150_280x195.jpg"],
    ["3-2340.jpg","39563_280x195.jpg"],
    ["2-6885.jpg","22446_280x195.jpg"],
    ["1-0548.jpg","15142_280x195.jpg"],
    ["img_0270-0653.JPG","img_02702978_280x195.jpg"],
    ["2-4656.jpg","21803_280x195.jpg"],
    ["1-3658.jpg","17434_280x195.jpg"],
    ["z695220420158_036478f5d3fe0d652f1254b08b41f7b7-5332.jpg","z695220420158_036478f5d3fe0d652f1254b08b41f7b76268_280x195.jpg"],
    ["z695220023303_f78d32663880f8dfd594457e38aa83a0-4555.jpg","z695220023303_f78d32663880f8dfd594457e38aa83a07189_280x195.jpg"],
    ["z695220015651_f65dd5bffb7c669543e4c60b57257534-8753.jpg","z695220015651_f65dd5bffb7c669543e4c60b572575342684_280x195.jpg"],
    ["z695220005977_3e8809684a5b5f676427ea9f1c3c7e79-6496.jpg","z695220005977_3e8809684a5b5f676427ea9f1c3c7e795533_280x195.jpg"],
    ["z695219987499_0a17d534fa2f9aa0cd80b219615a8093-2338.jpg","z695219987499_0a17d534fa2f9aa0cd80b219615a80930856_280x195.jpg"],
    ["z695219969733_2777099c4c97a562152aeeaeb82106d4-1770.jpg","z695219969733_2777099c4c97a562152aeeaeb82106d41163_280x195.jpg"],
    ["z695219959266_567b862f2d40e3a8a31cadb32808cc75-7332.jpg","z695219959266_567b862f2d40e3a8a31cadb32808cc754515_280x195.jpg"],
    ["z695219948562_3f7c7236be9e510166b0ec8223e1a16a-2844.jpg","z695219948562_3f7c7236be9e510166b0ec8223e1a16a9608_280x195.jpg"],
    ["z695219934108_eb8bdb2da71b842d059574d45752ffaa-1591.jpg","z695219934108_eb8bdb2da71b842d059574d45752ffaa1557_280x195.jpg"],
    ["z695219929186_a1ceff2bf46965d7e0594b1b416e1749-1219.jpg","z695219929186_a1ceff2bf46965d7e0594b1b416e17491167_280x195.jpg"],
    ["z695219912453_829dc2a08ff0963a8a26aa39c93699c1-9927.jpg","z695219912453_829dc2a08ff0963a8a26aa39c93699c12154_280x195.jpg"],
    ["z695219908252_5480a64837f22a3ceaec7876b281669c-0354.jpg","z695219908252_5480a64837f22a3ceaec7876b281669c7976_280x195.jpg"],
    ["z695219896981_d9b730d6a2458fcacd368299710fe5a6-1551.jpg","z695219896981_d9b730d6a2458fcacd368299710fe5a64445_280x195.jpg"],
    ["z623453185694_74eb6a0310a8cf84b25c2ced2ef17f91-6931.jpg","z623453185694_74eb6a0310a8cf84b25c2ced2ef17f910457_280x195.jpg"],
    ["z623453196808_0f32ef1bf7dcd1193ef0bf14bb8c4384-7505.jpg","z623453196808_0f32ef1bf7dcd1193ef0bf14bb8c43849576_280x195.jpg"],
    ["z623453204393_7f5dbc7922aa06f352c44f5c9581d766-1217.jpg","z623453204393_7f5dbc7922aa06f352c44f5c9581d7667458_280x195.jpg"],
    ["z606501763760_cdd1150771a6a37ea9e2e19e4cbfe387-7803.jpg","z606501763760_cdd1150771a6a37ea9e2e19e4cbfe3874668_280x195.jpg"],
    ["1-6222.jpg","12778_280x195.jpg"],
    ["z694932129012_b4c5a2be8fa75a7ec006f7cb79558c85-9807.jpg","z694932129012_b4c5a2be8fa75a7ec006f7cb79558c855472_280x195.jpg"],
    ["z694932129011_57d1113381701dbac25b41c389d13067-0649.jpg","z694932129011_57d1113381701dbac25b41c389d130672062_280x195.jpg"],
    ["z629526627241_7977363f6f0a70cb85ff2578a650a501-2994.jpg","z629526627241_7977363f6f0a70cb85ff2578a650a5013303_280x195.jpg"],
    ["z629526296383_2a4bbf739a0a55e1434159c61f45b70c-7818.jpg","z629526296383_2a4bbf739a0a55e1434159c61f45b70c8131_280x195.jpg"],
    ["z629526013969_43552c02e37ce8729538b250069df219-8979.jpg","z629526013969_43552c02e37ce8729538b250069df2191707_280x195.jpg"],
    ["z606664321826_92e14163178632069d70ea8e01d6429b-3172.jpg","z606664321826_92e14163178632069d70ea8e01d6429b0686_280x195.jpg"],
    ["z606664241056_3b65006200c7e58be5a4b1f09474fb56-6856.jpg","z606664241056_3b65006200c7e58be5a4b1f09474fb565358_280x195.jpg"],
    ["z606664202629_94984924f15834feb40875bb426d131a-6581.jpg","z606664202629_94984924f15834feb40875bb426d131a1145_280x195.jpg"],
    ["z606515891957_b066aeb77f70a12ba52177f9c82e9e1f-7039.jpg","z606515891957_b066aeb77f70a12ba52177f9c82e9e1f5508_280x195.jpg"],
    ["z606515395201_c038b4816e9f4b3900538d09676aa96e-1557.jpg","z606515395201_c038b4816e9f4b3900538d09676aa96e1231_280x195.jpg"],
    ["z606515230829_4e9ae81bd684c1a5c36dc46cafa4b50b-2218.jpg","z606515230829_4e9ae81bd684c1a5c36dc46cafa4b50b7247_280x195.jpg"],
    ["z606514857525_00d6af49ec9d99303c8ba3b0930b198c-3509.jpg","z606514857525_00d6af49ec9d99303c8ba3b0930b198c9815_280x195.jpg"],
    ["z606515071457_117d23608ca081668d5ecf80fd29770a-0861.jpg","z606515071457_117d23608ca081668d5ecf80fd29770a1926_280x195.jpg"],
    ["z606515070685_ac658bb6d23de030d81dc80a57df01ba-8754.jpg","z606515070685_ac658bb6d23de030d81dc80a57df01ba8784_280x195.jpg"],
    ["z606514857420_0bdd098115d00254c01f597e8559b7da-1682.jpg","z606514857420_0bdd098115d00254c01f597e8559b7da1983_280x195.jpg"],
    ["z606514855016_84965ddfece29a09a552979935bd7547-9687.jpg","z606514855016_84965ddfece29a09a552979935bd75478608_280x195.jpg"],
    ["z606514733906_bdd302cc0a696db0ff17a5c2bbad9dcc-9150.jpg","z606514733906_bdd302cc0a696db0ff17a5c2bbad9dcc1720_280x195.jpg"],
    ["z606514728670_2222b14f82af801eefe2ff9129b4939c-0593.jpg","z606514728670_2222b14f82af801eefe2ff9129b4939c7751_280x195.jpg"],
    ["z606514727490_d69ab33bfd028325a96a895220267f43-5620.jpg","z606514727490_d69ab33bfd028325a96a895220267f431944_280x195.jpg"],
    ["z606514855021_5d5a3f4e9171baf32d633cb36704afba-0307.jpg","z606514855021_5d5a3f4e9171baf32d633cb36704afba2283_280x195.jpg"],
    ["z606514855019_4bee2a8beb074128bff2be11a8bee723-5642.jpg","z606514855019_4bee2a8beb074128bff2be11a8bee7235734_280x195.jpg"],
    ["z606514495264_f029fdc8570f65f1d344926cbbffe800-3746.jpg","z606514495264_f029fdc8570f65f1d344926cbbffe8009571_280x195.jpg"],
    ["z606514451612_58fa1866a758b98253339caf4920bc02-4929.jpg","z606514451612_58fa1866a758b98253339caf4920bc027156_280x195.jpg"],
    ["z606514451526_85fca215d81857e3e5dbeb56fa1079dc-9084.jpg","z606514451526_85fca215d81857e3e5dbeb56fa1079dc4227_280x195.jpg"],
    ["z606513807838_4da84782f9ca592e3209c13108a8e2b0-8104.jpg","z606513807838_4da84782f9ca592e3209c13108a8e2b01851_280x195.jpg"],
    ["z606513739264_1eaff7a8b7b0084f733a651bc7f1ff68-4227.jpg","z606513739264_1eaff7a8b7b0084f733a651bc7f1ff684915_280x195.jpg"],
    ["z606513692106_f3866ad5d6af87628bc4198ae83a7588-5453.jpg","z606513692106_f3866ad5d6af87628bc4198ae83a75887703_280x195.jpg"],
    ["43-4053.jpg","437455_280x195.jpg"],
    ["42-0085.jpg","424024_280x195.jpg"],
    ["41-6628.jpg","413164_280x195.jpg"],
    ["39-0472.jpg","396184_280x195.jpg"],
    ["40-8942.jpg","406225_280x195.jpg"],
    ["38-7185.jpg","386216_280x195.jpg"],
    ["36-3015.jpg","361960_280x195.jpg"],
    ["34-0796.jpg","343086_280x195.jpg"],
    ["31-2812.jpg","312977_280x195.jpg"],
    ["30-9488.jpg","309137_280x195.jpg"],
    ["29-3324.jpg","292081_280x195.jpg"],
    ["27-4092.jpg","275602_280x195.jpg"],
    ["26-8043.jpg","260485_280x195.jpg"],
    ["25-9867.jpg","258525_280x195.jpg"],
    ["24-6739.jpg","241883_280x195.jpg"],
    ["23-8264.jpg","232819_280x195.jpg"],
    ["22-1982.jpg","227930_280x195.jpg"],
    ["20-8510.jpg","204602_280x195.jpg"],
    ["19-8822.jpg","191145_280x195.jpg"],
    ["18-9578.jpg","183770_280x195.jpg"],
    ["17-8105.jpg","178536_280x195.jpg"],
    ["16-3606.jpg","162940_280x195.jpg"],
    ["15-6001.jpg","153392_280x195.jpg"],
    ["13-7368.jpg","134768_280x195.jpg"],
    ["12-9234.jpg","128164_280x195.jpg"],
    ["11-2654.jpg","110790_280x195.jpg"],
    ["10-0231.jpg","109851_280x195.jpg"],
    ["9-9180.jpg","93180_280x195.jpg"],
    ["8-9596.jpg","82433_280x195.jpg"],
    ["7-4944.jpg","72385_280x195.jpg"],
    ["6-4288.jpg","61773_280x195.jpg"],
    ["5-9561.jpg","52304_280x195.jpg"],
    ["3-9283.jpg","39981_280x195.jpg"],
    ["2-4897.jpg","26818_280x195.jpg"],
    ["1-2430.jpg","17343_280x195.jpg"],
    ["z606732265049_80253c23760610e23d8253dd38aad18c-9119.jpg","z606732265049_80253c23760610e23d8253dd38aad18c8300_280x195.jpg"],
    ["z613086048581_efccceb9c8b25ad749e7053b7c9e8085-7709.jpg","z613086048581_efccceb9c8b25ad749e7053b7c9e80852318_280x195.jpg"],
    ["z606733325881_7d154977398f359f4a6032ae9b377982-9481.jpg","z606733325881_7d154977398f359f4a6032ae9b3779824919_280x195.jpg"],
    ["z606733014644_0a2effebfbca1cd0e4a8aa7e0aa0d318-3792.jpg","z606733014644_0a2effebfbca1cd0e4a8aa7e0aa0d3184000_280x195.jpg"],
    ["z620870674528_0c41fdbf35df0b2282e9a7b40e7ae820-4628.jpg","z620870674528_0c41fdbf35df0b2282e9a7b40e7ae8202008_280x195.jpg"],
    ["z606758160830_7beb24b6fe49a460f70008e6d2adc731-2041.jpg","z606758160830_7beb24b6fe49a460f70008e6d2adc7316467_280x195.jpg"],
    ["z606758156447_d4f27629fa0ac6d510d4d6b940ecf7e8-7140.jpg","z606758156447_d4f27629fa0ac6d510d4d6b940ecf7e82192_280x195.jpg"],
    ["z606758155721_d8bedfe3b8de7834f853593cfa4164e1-6009.jpg","z606758155721_d8bedfe3b8de7834f853593cfa4164e19992_280x195.jpg"],
    ["z606757609217_a86f0f4b9bcc8e293f1b78276d767e7f-1153.jpg","z606757609217_a86f0f4b9bcc8e293f1b78276d767e7f5842_280x195.jpg"],
    ["z606757603774_1cf6455e18ee0fed3a348d9bbb357e2d-9111.jpg","z606757603774_1cf6455e18ee0fed3a348d9bbb357e2d8505_280x195.jpg"],
    ["z606757596671_7b977f4ab4a54ab7c70c52a119507d38-2712.jpg","z606757596671_7b977f4ab4a54ab7c70c52a119507d383168_280x195.jpg"],
    ["img_20160609_103341-3443.jpg","img_20160609_1033414604_280x195.jpg"],
    ["img_20160423_090947-5855.jpg","img_20160423_0909477618_280x195.jpg"],
    ["24-1248.jpg","247726_280x195.jpg"],
    ["20-6765.jpg","209760_280x195.jpg"],
    ["19-1571.jpg","191004_280x195.jpg"],
    ["18-2197.jpg","189275_280x195.jpg"],
    ["17-3422.jpg","174139_280x195.jpg"],
    ["16-8168.jpg","162555_280x195.jpg"],
    ["15-7143.jpg","151083_280x195.jpg"],
    ["14-9761.jpg","143844_280x195.jpg"],
    ["13-9606.jpg","137667_280x195.jpg"],
    ["12-6677.jpg","124306_280x195.jpg"],
    ["11-3910.jpg","114782_280x195.jpg"],
    ["10-7690.jpg","106054_280x195.jpg"],
    ["9-9303.jpg","93482_280x195.jpg"],
    ["8-9973.jpg","80087_280x195.jpg"],
    ["6-4712.jpg","69426_280x195.jpg"],
    ["7-8256.jpg","72546_280x195.jpg"],
    ["4-8925.jpg","48626_280x195.jpg"],
    ["3-9772.jpg","34035_280x195.jpg"],
    ["1-4576.jpg","14473_280x195.jpg"],
    ["z812350541967_f66e5245fd8e4cc0124cdc4451396220-4627.jpg","z812350541967_f66e5245fd8e4cc0124cdc44513962203585_280x195.jpg"],
    ["z812362784505_35df6c4d6521eb49e2c86fa89ec03509-6594.jpg","z812362784505_35df6c4d6521eb49e2c86fa89ec035097920_280x195.jpg"],
    ["z779247409513_f125fcb9d86267878843373449db0f56-9786.jpg","z779247409513_f125fcb9d86267878843373449db0f560847_280x195.jpg"],
    ["z778675458712_ede89279882c4819b6b2a5ecb8852d6a-8781.jpg","z778675458712_ede89279882c4819b6b2a5ecb8852d6a4565_280x195.jpg"]
  ];

  (function gallerySlider() {
    var track = document.getElementById('galleryTrack');
    if (!track) return;
    var perSlide = 4;
    var pages = [];
    for (var i = 0; i < GALLERY_DATA.length; i += perSlide) {
      pages.push(GALLERY_DATA.slice(i, i + perSlide));
    }
    var inner = document.createElement('div');
    inner.className = 'thuvien-inner';
    pages.forEach(function (group) {
      var slide = document.createElement('div');
      slide.className = 'thuvien-slide';
      group.forEach(function (pair) {
        var item = document.createElement('div');
        item.className = 'item_tv';
        var p = document.createElement('p');
        var a = document.createElement('a');
        a.href = 'upload/hinhanh/' + pair[0];
        a.className = 'swipebox';
        var img = document.createElement('img');
        img.src = 'upload/hinhanh/' + pair[1];
        img.alt = 'Hình ảnh hoạt động Long Hải';
        img.loading = 'lazy';
        a.appendChild(img);
        p.appendChild(a);
        item.appendChild(p);
        slide.appendChild(item);
      });
      inner.appendChild(slide);
    });
    track.appendChild(inner);

    var box = document.getElementById('swipebox');
    var boxImg = document.getElementById('swipeboxImg');
    function openBox(src) {
      boxImg.src = src;
      box.classList.add('open');
      box.setAttribute('aria-hidden', 'false');
    }
    function closeBox() {
      box.classList.remove('open');
      box.setAttribute('aria-hidden', 'true');
      boxImg.src = '';
    }
    inner.addEventListener('click', function (e) {
      var a = e.target.closest('a.swipebox');
      if (!a) return;
      e.preventDefault();
      openBox(a.href);
    });
    document.getElementById('swipeboxClose').addEventListener('click', closeBox);
    box.addEventListener('click', function (e) { if (e.target === box) closeBox(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeBox(); });

    var idx = 0;
    function show(i) {
      idx = (i + pages.length) % pages.length;
      inner.style.transform = 'translateX(-' + (idx * 100) + '%)';
    }
    document.getElementById('galleryNext').addEventListener('click', function () { show(idx + 1); resetTimer(); });
    document.getElementById('galleryPrev').addEventListener('click', function () { show(idx - 1); resetTimer(); });

    var timer;
    function resetTimer() { clearInterval(timer); timer = setInterval(function () { show(idx + 1); }, 3000); }
    show(0);
    resetTimer();
  })();

  /* ============ News vertical carousel (3 visible, autoplay) ============ */
  var NEWS_ITEMS = [
    ["tin-tuc/cong-ty-long-hai-to-chuc-dao-tao-nang-cao-nghiep-vu-bao-ve-cho-nhan-vien-67.html","dao-tao-nghiep-vu-2024-16775_170x127.jpeg","Công ty Long Hải Tổ Chức Đào Tạo Nâng Cao Nghiệp Vụ Bảo Vệ Cho Nhân Viên"],
    ["tin-tuc/bao-ve-su-kien-49.html","4e72e6c97ede9180c8cf9857_170x128.jpg","Bảo vệ sự kiện"],
    ["tin-tuc/vai-tro-nha-lanh-dao-trong-viec-dan-dat-tap-the-48.html","27630_170x91.jpg","Vai trò nhà lãnh đạo trong việc dẫn dắt tập thể"],
    ["tin-tuc/nguoi-bao-ve-45.html","e2945f0af64f14114d5e9095_98x130.jpg","Người bảo vệ"],
    ["tin-tuc/binh-xit-hoi-cay-va-cach-bao-quan-63.html","images2624_130x130.jpg","BÌNH XỊT HƠI CAY VÀ CÁCH BẢO QUẢN"],
    ["tin-tuc/thong-tu-172018ttbca-59.html","tai-xuong-(1)0530_170x113.jpg","THÔNG TƯ 17/2018/TT-BCA"],
    ["tin-tuc/loi-khuyen-an-toan-phong-chay-chua-chay-danh-cho-cac-ban-o-chung-cu-58.html","huong-dan-an-toan-phong-chay-chua-chay-32079_157x130.jpg","Lời khuyên an toàn phòng cháy chữa cháy dành cho các bạn ở chung cư"],
    ["tin-tuc/khong-phai-chat-long-cung-chang-phai-chat-ran-hay-khi-lua-ton-tai-duoi-the-gi-55.html","photo-1-15510842340831735912341-crop-155108425548916483558800763_170x106.jpg","Không phải chất lỏng cũng chẳng phải chất rắn hay khí, lửa tồn tại dưới thể gì?"],
    ["tin-tuc/10-dieu-can-biet-de-an-toan-khi-xay-ra-chay-no-tai-chung-cu-54.html","114615_170x95.jpg","10 điều cần biết để an toàn khi xảy ra cháy nổ tại chung cư"],
    ["tin-tuc/canh-sat-pccc-khuyen-gi-ve-cach-thoat-nan-khi-chay-nha-cao-tang-53.html","88508_170x113.jpg","Cảnh sát PCCC khuyên gì về cách thoát nạn khi cháy nhà cao tầng?"],
    ["tin-tuc/nhung-bien-phap-phong-chay-chua-chay-co-ban-52.html","40144_170x106.jpg","Những biện pháp phòng cháy chữa cháy cơ bản"],
    ["tin-tuc/phuong-phap-phong-chay-chua-chay-doi-voi-ho-gia-dinh-51.html","39700_126x130.jpg","Phương pháp phòng cháy chữa cháy đối với hộ gia đình"],
    ["tin-tuc/nghi-dinh-962016-46.html","14538_170x113.jpg","Nghị định 96/2016"],
    ["tin-tuc/thu-cam-on-cua-khach-hang-33.html","images1189377_ca5835_170x65.jpg","Thư cảm ơn của khách hàng"],
    ["tin-tuc/huong-dan-hoi-suc-tim-phoi-32.html","22153353220720166469_170x114.png","Hướng dẫn hồi sức tim - phổi"],
    ["tin-tuc/so-cuu-soc-do-dien-giat-31.html","949_bong-do-dien-giat7438_170x128.jpg","Sơ cứu sốc do điện giật"],
    ["tin-tuc/so-cuu-va-cham-soc-vet-thuong-phan-mem-30.html","20153014220720161036_170x114.png","Sơ cứu và chăm sóc vết thương phần mềm"],
    ["tin-tuc/cach-ung-cuu-khi-bi-ngat-29.html","15152730220720163647_170x112.png","Cách ứng cứu khi bị ngạt"],
    ["tin-tuc/luat-kinh-doanh-dich-vu-bao-ve-so-522008ndcp-28.html","1135328200720160141_170x124.png","Luật kinh doanh dịch vụ bảo vệ số 52/2008/NĐ-CP"],
    ["tin-tuc/nghi-dinh-so-722009ndcp-26.html","3135435200720162821_170x116.png","Nghị định số 72/2009/NĐ-CP"],
    ["tin-tuc/thong-tu-so-452009ttbcac11-25.html","5135959200720168718_170x116.png","Thông tư số: 45/2009/TT-BCA(C11)"],
    ["tin-tuc/luat-so-402013qh13-sua-doi-bo-sung-mot-so-dieu-cua-luat-pccc-so-272001qh10-24.html","4135916200720166756_170x117.png","Luật số 40/2013/QH13: sửa đổi bổ sung một số điều của luật PCCC số 27/2001/QH10"],
    ["tin-tuc/nghi-dinh-chinh-phu-so-062013ndcp-ve-bao-ve-co-quan-doanh-nghiep-23.html","3135435200720160902_170x116.png","Nghị định Chính phủ số 06/2013/NĐ-CP về bảo vệ cơ quan doanh nghiệp"],
    ["tin-tuc/luat-kinh-doanh-dich-vu-bao-ve-so-522008ndcp-22.html","1135328200720161710_170x124.png","Luật kinh doanh dịch vụ bảo vệ số 52/2008/NĐ-CP"],
    ["tin-tuc/cach-su-dung-bo-dam-thong-dung-cach-sac-pin-21.html","9140728200720161143_170x112.png","Cách sử dụng bộ đàm thông dụng, cách sạc pin"],
    ["tin-tuc/luat-pccc-so-272001qh10-20.html","untitled135050200720160427_170x128.png","LUẬT PCCC SỐ 27/2001/QH10"],
    ["tin-tuc/thong-bao-dang-ky-danh-sach-can-bo-nhan-vien-di-du-lich-nam-2016-19.html","dc_150916_phanthiet175436130620166772_170x113.jpg","THÔNG BÁO ĐĂNG KÝ DANH SÁCH CÁN BỘ NHÂN VIÊN ĐI DU LỊCH NĂM 2016"]
  ];

  (function newsSlider() {
    var track = document.getElementById('newsTrack');
    if (!track) return;
    var itemHeight = 411 / 3;

    NEWS_ITEMS.forEach(function (item) {
      var li = document.createElement('li');
      li.className = 'news-item';
      li.style.height = itemHeight + 'px';
      li.innerHTML =
        '<a href="' + item[0] + '"><img src="upload/news/' + item[1] + '" alt="' + item[2] + '" loading="lazy"></a>' +
        '<h4><a href="' + item[0] + '">' + item[2] + '</a></h4>' +
        '<p class="mota">' + item[2] + '</p>';
      track.appendChild(li);
    });

    var items = track.querySelectorAll('.news-item');
    var start = 0;
    function render() {
      items.forEach(function (el, i) {
        var rel = (i - start + items.length) % items.length;
        if (rel < 3) {
          el.style.top = (rel * itemHeight) + 'px';
          el.classList.add('visible');
        } else {
          el.classList.remove('visible');
        }
      });
    }
    function step(dir) {
      start = (start + dir + items.length) % items.length;
      render();
    }
    document.getElementById('newsNext').addEventListener('click', function () { step(1); resetTimer(); });
    document.getElementById('newsPrev').addEventListener('click', function () { step(-1); resetTimer(); });

    var timer;
    function resetTimer() { clearInterval(timer); timer = setInterval(function () { step(1); }, 3000); }
    render();
    resetTimer();
  })();

  /* ============ Video pagination (5 real videos, no backend needed) ============ */
  var VIDEO_IDS = ['egiZ0Per37Q', '-tQ-TyVKAZY', 'cFQlaA12_os', 'uCEK_kfzmkw', 'RYB5_C5Gelw'];
  (function videoPaging() {
    var frame = document.getElementById('videoFrame');
    var paging = document.getElementById('videoPaging');
    if (!frame || !paging) return;
    var current = 1;
    var nums = paging.querySelectorAll('li[p]');

    function setPage(n) {
      current = Math.min(Math.max(n, 1), VIDEO_IDS.length);
      frame.src = 'https://www.youtube.com/embed/' + VIDEO_IDS[current - 1];
      nums.forEach(function (li) {
        var p = parseInt(li.getAttribute('p'), 10);
        var isNum = li.textContent.trim() === String(p);
        li.classList.toggle('actived', isNum && p === current);
        li.classList.toggle('active', !isNum || p !== current);
      });
    }
    paging.addEventListener('click', function (e) {
      var li = e.target.closest('li');
      if (!li || li.classList.contains('inactive')) return;
      var t = li.textContent.trim();
      if (t === 'First') setPage(1);
      else if (t === 'Prev') setPage(current - 1);
      else if (t === 'Next') setPage(current + 1);
      else if (t === 'End') setPage(VIDEO_IDS.length);
      else setPage(parseInt(li.getAttribute('p'), 10));
    });
  })();

  /* ============ Partners marquee ============ */
  var PARTNER_LOGOS = [
    "9-6760.jpg","3-0514.jpg","vtbd-4014.png","toyota-7830.png","thv-7164.jpg","6-0093.jpg",
    "vietcapital-0565.jpg","vd-5227.jpg","vtv-0055.jpg","11-5761.jpg","ntp-6923.jpg","ts-3112.jpg",
    "4-1184.jpg","cf-6333.jpg","ln-8809.png","redbull-0539.png","stp-8498.jpg","hm-3873.jpg",
    "12-8312.jpg","nct-9969.jpg","rv-6911.jpg","unicons-7536.png","8-6921.jpg","ldf-3367.jpg",
    "7-0440.jpg","5-4354.jpg","cgv-3874.png","10-9442.jpg","lalamove-3662.png","tl-8999.jpg",
    "2-9094.jpg","13-1506.jpg","lbm-2282.jpg","hkk-9591.jpg","vinamilk_logo-2123.png","bvhh-2950.jpg",
    "2-9939.jpg","sgf-2289.jpg","qp-0449.jpg","1-2603.jpg","l&t-5846.jpg","dx-6999.jpg",
    "bigc-6285.jpg","tqtd-8144.jpg","dadl_logo-3768.png","pt-4342.png","aset-8599.jpg","amg-9494.jpg",
    "ag-7619.jpg","11113-0786.png","cityland-6137.png","aaa-3643.jpg","fs-6407.jpg","nv-3134.jpg"
  ];
  (function partnersMarquee() {
    var track = document.getElementById('marqueeTrack');
    if (!track) return;
    var doubled = PARTNER_LOGOS.concat(PARTNER_LOGOS);
    doubled.forEach(function (file) {
      var img = document.createElement('img');
      img.src = 'upload/hinhanh/' + encodeURIComponent(file).replace(/%26/g, '&');
      img.alt = 'Đối tác khách hàng Long Hải';
      img.loading = 'lazy';
      track.appendChild(img);
    });
  })();

})();
