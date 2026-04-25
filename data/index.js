/* ===== Hero background slideshow ===== */
(function () {
	const BASE     = 'images/bg/Felicia_Background_';
	const EXT      = '.jpg';
	const INTERVAL = 5000; // ms
	const DURATION = 1000;  // slide animation ms

	const hero  = document.getElementById('hero');
	const first = hero.firstChild;
	const logo  = document.querySelector('.hero-logo');

	/* BG1 ロード完了後にページを表示し、ロゴをフェードイン */
	function revealPage() {
		document.body.classList.remove('page-loading');
		setTimeout(function () {
			if (logo) logo.classList.add('logo-visible');
		}, 200);
	}

	/* index 以降の連番ファイルをバックグラウンドで探索 */
	function probeImages(index, urls, onDone) {
		const url = BASE + index + EXT;
		const img = new Image();
		img.onload  = function () { urls.push(url); probeImages(index + 1, urls, onDone); };
		img.onerror = function () { onDone(urls); };
		img.src     = url;
	}

	/* 2枚目以降の div を追加してスライドショーを起動 */
	function setupSlideshow(urls, firstDiv) {
		if (urls.length < 2) return;

		const divs = [firstDiv];
		for (let i = 1; i < urls.length; i++) {
			const div = document.createElement('div');
			div.className = 'hero-bg';
			div.setAttribute('aria-hidden', 'true');
			div.style.backgroundImage = 'url("' + urls[i] + '")';
			div.style.transform       = 'translateX(100%)';
			hero.insertBefore(div, first);
			divs.push(div);
		}

		let current = 0;

		function nextSlide() {
			const next = (current + 1) % divs.length;
			divs[next].style.transition = 'none';
			divs[next].style.transform  = 'translateX(100%)';
			divs[next].getBoundingClientRect(); // reflow
			divs[current].style.transition = 'transform ' + DURATION + 'ms ease-in-out';
			divs[current].style.transform  = 'translateX(-100%)';
			divs[next].style.transition    = 'transform ' + DURATION + 'ms ease-in-out';
			divs[next].style.transform     = 'translateX(0)';
			current = next;
		}

		setInterval(nextSlide, INTERVAL);
	}

	/* BG1 を最優先ロード：完了したらページを表示して残りを探索 */
	const bg1url = BASE + 1 + EXT;
	const bg1div = document.createElement('div');
	bg1div.className = 'hero-bg';
	bg1div.setAttribute('aria-hidden', 'true');
	bg1div.style.backgroundImage = 'url("' + bg1url + '")';
	bg1div.style.transform       = 'translateX(0)';
	hero.insertBefore(bg1div, first);

	const bg1probe = new Image();
	bg1probe.onload = function () {
		revealPage();
		probeImages(2, [bg1url], function (urls) {
			setupSlideshow(urls, bg1div);
		});
	};
	bg1probe.onerror = function () {
		/* BG1 が存在しない場合は div を除去してそのままページを表示 */
		if (bg1div.parentNode) bg1div.parentNode.removeChild(bg1div);
		revealPage();
	};
	bg1probe.src = bg1url;
})();

/* ===== Feathers ===== */
(function () {
	const container = document.getElementById('feathers');
	const count = window.innerWidth < 600 ? 35 : 65;

	for (let i = 0; i < count; i++) {
		const feather = document.createElement('img');
		feather.src = 'images/Felicia_Fur.png';
		feather.className = 'feather';
		feather.setAttribute('aria-hidden', 'true');
		feather.setAttribute('alt', '');

		const size        = 60 + Math.random() * 110;
		const startX      = Math.random() * 110 - 5;
		const duration    = 12 + Math.random() * 16;
		const delay       = -(Math.random() * 28);
		const drift       = (Math.random() - 0.5) * 240;
		const maxOpacity  = 0.35 + Math.random() * 0.45;

		feather.style.cssText = `
			left: ${ startX }vw;
			width: ${ size }px;
			height: auto;
			animation-duration: ${ duration }s;
			animation-delay: ${ delay }s;
			--drift: ${ drift }px;
			--max-opacity: ${ maxOpacity };
		`;

		container.appendChild(feather);
	}
})();

/* ===== Image fallbacks ===== */
document.querySelectorAll('.js-hide-on-error').forEach(img => {
	img.addEventListener('error', () => {
		img.style.display = 'none';
	});
});

/* ===== Scroll reveal ===== */
const observer = new IntersectionObserver(entries => {
	entries.forEach(entry => {
		if (entry.isIntersecting) {
			entry.target.classList.add('visible');
			observer.unobserve(entry.target);
		}
	});
}, { threshold: 0.12 });

/* ===== Lightbox (汎用) ===== */
const lightbox  = document.getElementById('lightbox');
const lbStage   = document.getElementById('lb-stage');
const lbImgCur  = document.getElementById('lb-img-cur');
const lbImgNext = document.getElementById('lb-img-next');
const lbClose   = document.getElementById('lightbox-close');
const lbPrev    = document.getElementById('lb-prev');
const lbNext    = document.getElementById('lb-next');

/* 現在開いているデータセットと取得関数 */
let lbDataset          = [];
let lbSrcFn            = function (item) { return item.image; };
let lbAltFn            = function (item) { return ''; };
let lbIndex            = 0;
let lbAnimating        = false;
let lastFocusedElement = null;

function stageW() {
	return lbStage.offsetWidth || window.innerWidth;
}

/* 前後の画像をブラウザキャッシュに先読みする */
function preloadAdjacent(index) {
	if (lbDataset.length < 2) return;
	const prevIdx = (index - 1 + lbDataset.length) % lbDataset.length;
	const nextIdx = (index + 1) % lbDataset.length;
	[prevIdx, nextIdx].forEach(i => {
		const img = new Image();
		img.src = lbSrcFn(lbDataset[i]);
	});
}

function openLightboxWith(dataset, srcFn, altFn, index) {
	lbDataset = dataset;
	lbSrcFn   = srcFn;
	lbAltFn   = altFn;
	lbIndex   = index;
	lastFocusedElement = document.activeElement;

	lbImgCur.src = lbSrcFn(lbDataset[lbIndex]);
	lbImgCur.alt = lbAltFn(lbDataset[lbIndex]);
	lbImgCur.style.transition = 'none';
	lbImgCur.style.transform  = 'translateX(0)';

	lbImgNext.src = '';
	lbImgNext.style.transition = 'none';
	lbImgNext.style.transform  = 'translateX(100%)';

	preloadAdjacent(lbIndex);

	lightbox.classList.add('open');
	document.body.style.overflow = 'hidden';
	lbClose.focus();
}

function closeLightbox() {
	lightbox.classList.remove('open');
	document.body.style.overflow = '';
	lbImgCur.src  = '';
	lbImgNext.src = '';
	if (lastFocusedElement instanceof HTMLElement) {
		lastFocusedElement.focus();
	}
}

function slideAnimate(nextIndex, direction) {
	if (lbAnimating) return;
	lbAnimating = true;

	const sw   = stageW();
	const outX = direction === 'next' ? -sw : sw;
	const inX  = direction === 'next' ?  sw : -sw;
	const item = lbDataset[nextIndex];

	lbImgNext.src = lbSrcFn(item);
	lbImgNext.alt = lbAltFn(item);
	lbImgNext.style.transition = 'none';
	lbImgNext.style.transform  = `translateX(${ inX }px)`;

	lbImgNext.getBoundingClientRect();

	lbImgCur.style.transition  = 'transform .25s ease';
	lbImgCur.style.transform   = `translateX(${ outX }px)`;
	lbImgNext.style.transition = 'transform .25s ease';
	lbImgNext.style.transform  = 'translateX(0)';

	setTimeout(() => {
		lbIndex = nextIndex;

		/* lbImgCur はまだオフスクリーン（outX）にいる状態で src を差し替え
		   → 画面外での変更なのでフラッシュが発生しない */
		lbImgCur.style.transition = 'none';
		lbImgCur.onload = lbImgCur.onerror = null;

		const finalize = () => {
			lbImgCur.onload = lbImgCur.onerror = null;
			/* 新画像ロード完了後に 0 へ移動 & lbImgNext を退避 */
			lbImgCur.style.transform   = 'translateX(0)';
			lbImgNext.style.transition = 'none';
			lbImgNext.style.transform  = `translateX(${ inX }px)`;
			lbImgNext.src = '';
			lbAnimating   = false;
			preloadAdjacent(lbIndex);
		};

		lbImgCur.onload  = finalize;
		lbImgCur.onerror = finalize;
		lbImgCur.src = lbSrcFn(item);
		lbImgCur.alt = lbAltFn(item);

		if (lbImgCur.complete) finalize();
	}, 260);
}

function showPrev() {
	slideAnimate((lbIndex - 1 + lbDataset.length) % lbDataset.length, 'prev');
}

function showNext() {
	slideAnimate((lbIndex + 1) % lbDataset.length, 'next');
}

lbClose.addEventListener('click', closeLightbox);
lbPrev.addEventListener('click', event => { event.stopPropagation(); showPrev(); });
lbNext.addEventListener('click', event => { event.stopPropagation(); showNext(); });
lbImgCur.addEventListener('click', closeLightbox);
lightbox.addEventListener('click', event => {
	if (event.target === lightbox) closeLightbox();
});

document.addEventListener('keydown', event => {
	if (!lightbox.classList.contains('open')) return;
	if (event.key === 'Escape')      closeLightbox();
	if (event.key === 'ArrowLeft')   showPrev();
	if (event.key === 'ArrowRight')  showNext();
	if (event.key === 'Tab')         trapLightboxFocus(event);
});

function trapLightboxFocus(event) {
	const focusable = [lbPrev, lbNext, lbClose].filter(
		el => el && getComputedStyle(el).display !== 'none'
	);
	if (focusable.length === 0) return;
	const first = focusable[0];
	const last  = focusable[focusable.length - 1];
	if (event.shiftKey && document.activeElement === first) {
		event.preventDefault(); last.focus(); return;
	}
	if (!event.shiftKey && document.activeElement === last) {
		event.preventDefault(); first.focus();
	}
}

/* ===== Touch swipe (lightbox) ===== */
let touchStartX      = 0;
let touchStartY      = 0;
let swipeDir         = null;
let swipePreparedDir = null;
let swipeNextIndex   = -1;

lightbox.addEventListener('touchstart', event => {
	if (lbAnimating) return;
	touchStartX      = event.touches[0].clientX;
	touchStartY      = event.touches[0].clientY;
	swipeDir         = null;
	swipePreparedDir = null;
	swipeNextIndex   = -1;
	lbImgCur.style.transition  = 'none';
	lbImgNext.style.transition = 'none';
}, { passive: true });

lightbox.addEventListener('touchmove', event => {
	if (!lightbox.classList.contains('open') || lbAnimating) return;
	const dx = event.touches[0].clientX - touchStartX;
	const dy = event.touches[0].clientY - touchStartY;
	if (swipeDir === null && (Math.abs(dx) > 8 || Math.abs(dy) > 8)) {
		swipeDir = Math.abs(dx) >= Math.abs(dy) ? 'h' : 'v';
	}
	if (swipeDir !== 'h') return;
	const sw    = stageW();
	const dxDir = dx <= 0 ? 'next' : 'prev';
	if (swipePreparedDir !== dxDir) {
		swipePreparedDir = dxDir;
		swipeNextIndex   = dxDir === 'next'
			? (lbIndex + 1) % lbDataset.length
			: (lbIndex - 1 + lbDataset.length) % lbDataset.length;
		const ni = lbDataset[swipeNextIndex];
		lbImgNext.src = lbSrcFn(ni);
		lbImgNext.alt = lbAltFn(ni);
		lbImgNext.style.transform = `translateX(${ dxDir === 'next' ? sw : -sw }px)`;
	}
	lbImgCur.style.transform  = `translateX(${ dx }px)`;
	lbImgNext.style.transform = dxDir === 'next'
		? `translateX(${ sw + dx }px)`
		: `translateX(${ -sw + dx }px)`;
}, { passive: true });

lightbox.addEventListener('touchend', event => {
	if (!lightbox.classList.contains('open') || lbAnimating) return;
	const dx = event.changedTouches[0].clientX - touchStartX;
	if (swipeDir === 'h' && Math.abs(dx) > 50 && swipePreparedDir !== null) {
		lbAnimating = true;
		const sw        = stageW();
		const outX      = dx < 0 ? -sw : sw;
		const inX       = dx < 0 ?  sw : -sw;
		const finalIdx  = swipeNextIndex;
		const finalItem = lbDataset[finalIdx];
		lbImgCur.style.transition  = 'transform .2s ease';
		lbImgCur.style.transform   = `translateX(${ outX }px)`;
		lbImgNext.style.transition = 'transform .2s ease';
		lbImgNext.style.transform  = 'translateX(0)';
		setTimeout(() => {
			lbIndex = finalIdx;

			lbImgCur.style.transition = 'none';
			lbImgCur.onload = lbImgCur.onerror = null;

			const finalize = () => {
				lbImgCur.onload = lbImgCur.onerror = null;
				lbImgCur.style.transform   = 'translateX(0)';
				lbImgNext.style.transition = 'none';
				lbImgNext.style.transform  = `translateX(${ inX }px)`;
				lbImgNext.src    = '';
				swipePreparedDir = null;
				swipeNextIndex   = -1;
				lbAnimating      = false;
				preloadAdjacent(lbIndex);
			};

			lbImgCur.onload  = finalize;
			lbImgCur.onerror = finalize;
			lbImgCur.src = lbSrcFn(finalItem);
			lbImgCur.alt = lbAltFn(finalItem);
			if (lbImgCur.complete) finalize();
		}, 220);
	} else {
		lbImgCur.style.transition = 'transform .2s ease';
		lbImgCur.style.transform  = 'translateX(0)';
		if (swipePreparedDir !== null) {
			const sw    = stageW();
			const backX = swipePreparedDir === 'next' ? sw : -sw;
			lbImgNext.style.transition = 'transform .2s ease';
			lbImgNext.style.transform  = `translateX(${ backX }px)`;
			setTimeout(() => {
				lbImgNext.src    = '';
				swipePreparedDir = null;
				swipeNextIndex   = -1;
			}, 220);
		}
	}
}, { passive: true });

/* ===== Cast data load & render ===== */
let castData = [];

function castDetailSrc(cast) {
	return cast.detailImage || cast.image;
}

function loadCast() {
	castData = Array.isArray(window.CAST_DATA) ? [...window.CAST_DATA] : [];
	castData.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
	renderCast();
}

function renderCast() {
	const grid = document.getElementById('cast-grid');
	grid.innerHTML = '';

	castData.forEach((cast, i) => {
		const card = document.createElement('div');
		card.className = 'cast-card reveal visible';

		const imageWrap = document.createElement('div');
		imageWrap.className = 'cast-image';

		const image = document.createElement('img');
		image.src = cast.image;
		image.alt = cast.name;
		image.loading = 'lazy';
		image.decoding = 'async';
		image.addEventListener('error', () => {
			const placeholder = document.createElement('div');
			placeholder.className = 'cast-image-placeholder';
			placeholder.textContent = cast.name;
			imageWrap.replaceChildren(placeholder);
		});
		imageWrap.appendChild(image);

		card.appendChild(imageWrap);
		card.addEventListener('click', () => openLightboxWith(
			castData,
			castDetailSrc,
			c => c.name,
			i
		));
		grid.appendChild(card);
	});
}

loadCast();

/* ===== Gallery data load & render ===== */
let galleryData = [];

function loadGallery() {
	galleryData = Array.isArray(window.GALLERY_DATA) ? [...window.GALLERY_DATA] : [];
	renderGallery();
}

function renderGallery() {
	const grid = document.getElementById('gallery-grid');
	if (!grid) return;
	grid.innerHTML = '';

	galleryData.forEach((item, i) => {
		const wrap = document.createElement('div');
		wrap.className = 'gallery-item reveal visible';

		const img = document.createElement('img');
		img.src     = item.image;
		img.alt     = 'ギャラリー画像 ' + (i + 1);
		img.loading = 'lazy';
		img.decoding = 'async';

		wrap.appendChild(img);
		wrap.addEventListener('click', () => openLightboxWith(
			galleryData,
			g => g.image,
			() => 'ギャラリー画像',
			i
		));
		grid.appendChild(wrap);
	});
}

loadGallery();

document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
