/* ===== Stars ===== */
(function () {
	const container = document.getElementById('stars');
	if (!container) return;

	const count = window.innerWidth < 600 ? 60 : 120;

	for (let i = 0; i < count; i++) {
		const star = document.createElement('div');
		star.className = 'star';
		star.style.cssText = `
        left:${ Math.random() * 100 }%;
        top:${ Math.random() * 100 }%;
        --d:${ 2 + Math.random() * 4 }s;
        --delay:-${ Math.random() * 5 }s;
        opacity:${ .2 + Math.random() * .8 };
        width:${ Math.random() < .15 ? 3 : Math.random() < .5 ? 2 : 1 }px;
        height:${ Math.random() < .15 ? 3 : Math.random() < .5 ? 2 : 1 }px;
      `;
		container.appendChild(star);
	}
})();

const castGrid = document.getElementById('attending-cast-grid');
const emptyState = document.getElementById('attending-empty');
const lightbox = document.getElementById('lightbox');
const lbStage = document.getElementById('lb-stage');
const lbImgCur = document.getElementById('lb-img-cur');
const lbImgNext = document.getElementById('lb-img-next');
const lbClose = document.getElementById('lightbox-close');
const lbPrev = document.getElementById('lb-prev');
const lbNext = document.getElementById('lb-next');
let filteredCastData = [];
let currentCastIndex = 0;
let lastFocusedElement = null;
let lbAnimating = false;

function parseDateParam() {
	const searchParams = new URLSearchParams(window.location.search);
	return searchParams.get('date')?.trim() ?? '';
}

function getTodayString() {
	const now = new Date();
	const year = now.getFullYear();
	const month = String(now.getMonth() + 1).padStart(2, '0');
	const day = String(now.getDate()).padStart(2, '0');
	return `${ year }-${ month }-${ day }`;
}

function toDateValue(value) {
	const [yearText, monthText, dayText] = value.split('-');
	return new Date(
		Number.parseInt(yearText, 10),
		Number.parseInt(monthText, 10) - 1,
		Number.parseInt(dayText, 10)
	);
}

function isValidDateString(value) {
	if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
	const [yearText, monthText, dayText] = value.split('-');
	const year = Number.parseInt(yearText, 10);
	const month = Number.parseInt(monthText, 10);
	const day = Number.parseInt(dayText, 10);
	const parsed = toDateValue(value);
	return (
		!Number.isNaN(parsed.getTime()) &&
		parsed.getFullYear() === year &&
		parsed.getMonth() === month - 1 &&
		parsed.getDate() === day
	);
}

function setInvalidState() {
	castGrid.replaceChildren();
	emptyState.hidden = false;
}

function parseOrderParams() {
	const searchParams = new URLSearchParams(window.location.search);
	const rawValues = [
		...searchParams.getAll('orders'),
		...searchParams.getAll('order')
	];

	const parsedOrders = rawValues
		.flatMap(value => value.split(','))
		.map(value => Number.parseInt(value.trim(), 10))
		.filter(value => Number.isFinite(value));

	return [...new Set(parsedOrders)];
}

function createCastCard(cast) {
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
		placeholder.textContent = 'NO IMAGE';
		imageWrap.replaceChildren(placeholder);
	});
	imageWrap.appendChild(image);

	const info = document.createElement('div');
	info.className = 'cast-info';

	const name = document.createElement('div');
	name.className = 'cast-name';
	name.textContent = cast.name;

	info.appendChild(name);

	card.appendChild(imageWrap);
	card.appendChild(info);
	card.addEventListener('click', () => openLightbox(filteredCastData.indexOf(cast)));

	return card;
}

function stageW() {
	return lbStage ? (lbStage.offsetWidth || window.innerWidth) : window.innerWidth;
}

function openLightbox(index) {
	if (!filteredCastData[index] || !lightbox || !lbImgCur || !lbImgNext || !lbClose) return;

	currentCastIndex = index;
	lastFocusedElement = document.activeElement;
	const cast = filteredCastData[index];

	lbImgCur.src = cast.image;
	lbImgCur.alt = cast.name;
	lbImgCur.style.transition = 'none';
	lbImgCur.style.transform = 'translateX(0)';

	lbImgNext.src = '';
	lbImgNext.style.transition = 'none';
	lbImgNext.style.transform = 'translateX(100%)';

	lightbox.classList.add('open');
	document.body.style.overflow = 'hidden';
	lbClose.focus();
}

function closeLightbox() {
	if (!lightbox || !lbImgCur || !lbImgNext) return;
	lightbox.classList.remove('open');
	document.body.style.overflow = '';
	lbImgCur.src = '';
	lbImgNext.src = '';
	if (lastFocusedElement instanceof HTMLElement) {
		lastFocusedElement.focus();
	}
}

function slideAnimate(nextIndex, direction) {
	if (lbAnimating || !filteredCastData[nextIndex]) return;
	lbAnimating = true;

	const sw = stageW();
	const outX = direction === 'next' ? -sw : sw;
	const inX = direction === 'next' ? sw : -sw;
	const cast = filteredCastData[nextIndex];

	lbImgNext.src = cast.image;
	lbImgNext.alt = cast.name;
	lbImgNext.style.transition = 'none';
	lbImgNext.style.transform = `translateX(${ inX }px)`;

	lbImgNext.getBoundingClientRect();

	lbImgCur.style.transition = 'transform .25s ease';
	lbImgCur.style.transform = `translateX(${ outX }px)`;
	lbImgNext.style.transition = 'transform .25s ease';
	lbImgNext.style.transform = 'translateX(0)';

	setTimeout(() => {
		currentCastIndex = nextIndex;
		lbImgCur.style.transition = 'none';
		lbImgCur.style.transform = 'translateX(0)';

		const revealCur = () => {
			lbImgCur.onload = lbImgCur.onerror = null;
			lbImgNext.style.transition = 'none';
			lbImgNext.style.transform = `translateX(${ inX }px)`;
			lbImgNext.src = '';
			lbAnimating = false;
		};

		lbImgCur.onload = revealCur;
		lbImgCur.onerror = revealCur;
		lbImgCur.src = cast.image;
		lbImgCur.alt = cast.name;

		if (lbImgCur.complete) revealCur();
	}, 260);
}

function showPrev() {
	if (filteredCastData.length <= 1) return;
	slideAnimate((currentCastIndex - 1 + filteredCastData.length) % filteredCastData.length, 'prev');
}

function showNext() {
	if (filteredCastData.length <= 1) return;
	slideAnimate((currentCastIndex + 1) % filteredCastData.length, 'next');
}

function trapLightboxFocus(event) {
	if (!lbPrev || !lbNext || !lbClose) return;
	const focusable = [lbPrev, lbNext, lbClose]
		.filter(element => element && getComputedStyle(element).display !== 'none');

	if (focusable.length === 0) return;

	const first = focusable[0];
	const last = focusable[focusable.length - 1];

	if (event.shiftKey && document.activeElement === first) {
		event.preventDefault();
		last.focus();
		return;
	}

	if (!event.shiftKey && document.activeElement === last) {
		event.preventDefault();
		first.focus();
	}
}

function loadAttendingCast() {
	const targetOrders = parseOrderParams();
	const targetDate = parseDateParam();
	const today = getTodayString();

	if (
		!isValidDateString(targetDate) ||
		toDateValue(targetDate) < toDateValue(today) ||
		targetOrders.length === 0
	) {
		setInvalidState();
		return;
	}

	const castData = Array.isArray(window.CAST_DATA) ? [...window.CAST_DATA] : [];
	const castByOrder = [...castData]
		.sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
		.filter(cast => targetOrders.includes(cast.order));

	if (castByOrder.length === 0) {
		setInvalidState();
		return;
	}

	filteredCastData = castByOrder;
	const cards = castByOrder.map(createCastCard);
	castGrid.replaceChildren(...cards);
}

if (lightbox && lbImgCur && lbImgNext && lbClose && lbPrev && lbNext) {
	lbClose.addEventListener('click', closeLightbox);
	lbPrev.addEventListener('click', event => {
		event.stopPropagation();
		showPrev();
	});
	lbNext.addEventListener('click', event => {
		event.stopPropagation();
		showNext();
	});
	lbImgCur.addEventListener('click', closeLightbox);
	lightbox.addEventListener('click', event => {
		if (event.target === lightbox) closeLightbox();
	});
}

document.addEventListener('keydown', event => {
	if (!lightbox || !lightbox.classList.contains('open')) return;
	if (event.key === 'Escape') closeLightbox();
	if (event.key === 'ArrowLeft') showPrev();
	if (event.key === 'ArrowRight') showNext();
	if (event.key === 'Tab') trapLightboxFocus(event);
});

loadAttendingCast();
