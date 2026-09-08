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

		var head = document.createElement('div');
		head.className = 'mobile-menu-head';
		head.innerHTML = '<span class="mobile-menu-title">Menu</span>' +
			'<button type="button" class="mobile-menu-close" aria-label="Đóng menu">' +
			'<i class="fa fa-times" aria-hidden="true"></i></button>';
		nav.insertBefore(head, nav.firstChild);
		var closeBtn = head.querySelector('.mobile-menu-close');

		var icon = trigger.querySelector('i');

		function setOpen(isOpen) {
			nav.classList.toggle('open', isOpen);
			overlay.classList.toggle('open', isOpen);
			document.body.classList.toggle('mobile-menu-locked', isOpen);
			if (icon) {
				icon.classList.toggle('fa-bars', !isOpen);
				icon.classList.toggle('fa-times', isOpen);
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
			var arrow = document.createElement('i');
			arrow.className = 'fa fa-chevron-down mobile-submenu-arrow';
			arrow.setAttribute('aria-hidden', 'true');
			link.appendChild(arrow);

			arrow.addEventListener('click', function (e) {
				e.preventDefault();
				e.stopPropagation();
				li.classList.toggle('open');
			});
		});
	});
})();
