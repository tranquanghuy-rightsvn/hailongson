(function () {
	function ready(fn) {
		if (document.readyState !== 'loading') fn();
		else document.addEventListener('DOMContentLoaded', fn);
	}

	ready(function () {
		var nav = document.getElementById('menu_mobi');
		var trigger = document.querySelector('.hien_menu');
		if (!nav || !trigger) return;

		var overlay = document.createElement('div');
		overlay.className = 'mobile-menu-overlay';
		document.body.appendChild(overlay);

		var ICON_BARS = '<rect x="3" y="5" width="18" height="2" rx="1"/><rect x="3" y="11" width="18" height="2" rx="1"/><rect x="3" y="17" width="18" height="2" rx="1"/>';
		var ICON_TIMES = '<path d="M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>';

		var head = document.createElement('div');
		head.className = 'mobile-menu-head';
		head.innerHTML = '<span class="mobile-menu-title">Menu</span>' +
			'<button type="button" class="mobile-menu-close" aria-label="Đóng menu">' +
			'<svg class="icon" viewBox="0 0 24 24" aria-hidden="true">' + ICON_TIMES + '</svg></button>';
		nav.insertBefore(head, nav.firstChild);
		var closeBtn = head.querySelector('.mobile-menu-close');

		var icon = trigger.querySelector('svg.icon');

		function setOpen(isOpen) {
			nav.classList.toggle('open', isOpen);
			overlay.classList.toggle('open', isOpen);
			document.body.classList.toggle('mobile-menu-locked', isOpen);
			if (icon) {
				icon.innerHTML = isOpen ? ICON_TIMES : ICON_BARS;
			}
		}

		trigger.addEventListener('click', function (e) {
			e.preventDefault();
			setOpen(!nav.classList.contains('open'));
		});
		overlay.addEventListener('click', function () {
			setOpen(false);
		});
		closeBtn.addEventListener('click', function () {
			setOpen(false);
		});
		document.addEventListener('keydown', function (e) {
			if (e.key === 'Escape' && nav.classList.contains('open')) setOpen(false);
		});

		// Any top-level item whose nested <ul> actually has entries becomes an
		// expand/collapse accordion row instead of a plain link.
		var items = nav.querySelectorAll('ul > li');
		items.forEach(function (li) {
			var sub = li.querySelector('ul');
			if (!sub || !sub.querySelector('li')) return;

			li.classList.add('has-submenu');
			sub.classList.add('mobile-submenu');

			var link = li.querySelector('a');
			var arrow = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
			arrow.setAttribute('class', 'icon mobile-submenu-arrow');
			arrow.setAttribute('viewBox', '0 0 24 24');
			arrow.setAttribute('aria-hidden', 'true');
			arrow.innerHTML = '<path d="M7.41 8.59 12 13.17l4.59-4.58L18 10l-6 6-6-6z"/>';
			link.appendChild(arrow);

			arrow.addEventListener('click', function (e) {
				e.preventDefault();
				e.stopPropagation();
				li.classList.toggle('open');
			});
		});
	});
})();
