/*
	Hii, this is where the main scrollbar logic is located.
	All this does is track the scroll position and size of the "shell" div (where the content lives)
		and scales that into the smaller scroll line.
	Whenever the scroll position changes on the "shell" div,
		it also changes the position on the scrollbar.
	
	Very simple, all of the stuff below is math to calculate them.
	I don't animate things manually on this script, please look at functional.css.

	Also, this is *extremely* messy and not flexible. I have no clue how to refactor this.

	Technical notes: I use style.top to set the position of the scroll bar,
		and style.transform as an offset from that position.
		Scrolling changes style.transform.

	Orientation: the bar is vertical on desktop and horizontal on phones.
		The shell always scrolls vertically, only the bar's axis changes.
		The axis-dependent math lives in the small helpers below.
*/

/*

	Cache scrollable thing here and update it according to events.
	Use window.addEventListener("load") to update the scroll, this is when all things load.
		While eventListener("load") still hasn't fired, use the fast ratio calculation.

	You can't just push it to the "pointerdown" events, it doesn't work like that.

*/

const glob = {
	isScrollable: false,
};

// keep this in sync with the max-width breakpoint in media-queries.css.
const mobileQuery = window.matchMedia("(max-width: 50rem)");
const isHorizontal = () => mobileQuery.matches;

/**
 * Length of an element along the scrollbar's axis.
 * @param {Element} el
 */
function axisLength(el) {
	return isHorizontal() ? el.clientWidth : el.clientHeight;
}

/**
 * How far the thumb can travel along the line.
 * @param {Element} line
 * @param {Element} thumb
 */
function travel(line, thumb) {
	return axisLength(line) - axisLength(thumb);
}

/**
 * Offsets the thumb along the scrollbar's axis.
 * @param {HTMLElement} thumb
 * @param {number} px
 */
function setThumbOffset(thumb, px) {
	thumb.style.transform = isHorizontal()
		? `translateX(${px}px)`
		: `translateY(${px}px)`;
}

/**
 * Where the pointer is along the line, measured to the thumb's middle.
 * @param {PointerEvent} e
 * @param {Element} line
 * @param {Element} thumb
 */
function pointerOffset(e, line, thumb) {
	const rect = line.getBoundingClientRect();
	return isHorizontal()
		? e.clientX - rect.left - thumb.clientWidth / 2
		: e.clientY - rect.top - thumb.clientHeight / 2;
}

/**
 * Moves the thumb to match the shell's current scroll position.
 * @param {HTMLElement} shell
 * @param {HTMLElement} thumb
 * @param {Element} line
 */
function syncThumb(shell, thumb, line) {
	const max = shell.scrollHeight - shell.clientHeight;
	const ratio = max > 0 ? shell.scrollTop / max : 0;
	setThumbOffset(thumb, ratio * travel(line, thumb));
}

/**
 * Observe height changes of an element.
 * @param {Element} el
 * @param {(clientHeight: number, scrollHeight: number) => void} onChange
 * @returns {() => void} cleanup function
 */
function observeHeight(el, onChange) {
	const emit = () => {
		const clientHeight = el.getBoundingClientRect().height;
		const scrollHeight = el.scrollHeight;
		onChange(clientHeight, scrollHeight);
	};

	const ro = new ResizeObserver(emit);
	const mo = new MutationObserver(emit);

	el.querySelectorAll("img").forEach((img) => {
		if (!img.complete) {
			img.addEventListener("load", emit, { once: true });
		}
	});
	el.querySelectorAll("video").forEach((vid) => {
		vid.addEventListener("loadstart", emit, { once: true });
	});

	ro.observe(el);
	mo.observe(el, { childList: true, subtree: true, characterData: true });

	emit();

	return () => {
		ro.disconnect();
		mo.disconnect();
	};
}

export function positionScrollbar() {
	const thumb = document.getElementById("scrollbar-thumb");
	const line = document.getElementById("scrollbar");
	const shell = document.getElementsByClassName("shell")[0];

	if (!line || !thumb) {
		return;
	}

	const lineRect = line.getBoundingClientRect();

	if (isHorizontal()) {
		// center the thumb on the horizontal line
		thumb.style.margin = "0"; // to remove extra offsets from the thumb
		thumb.style.left = `${lineRect.left}px`;
		thumb.style.top = `${lineRect.top + lineRect.height / 2 - thumb.offsetHeight / 2}px`;
	} else {
		thumb.style.margin = "";

		const lineStyle = window.getComputedStyle(line);
		const thumbStyle = window.getComputedStyle(thumb);

		const thumbMargin =
			parseFloat(thumbStyle.marginLeft) + parseFloat(thumbStyle.marginRight);
		const lineWidth =
			lineRect.width +
			parseFloat(lineStyle.marginLeft) +
			parseFloat(lineStyle.marginRight);
		const absoluteTop = lineRect.top;
		const absoluteLeft =
			lineRect.left - (lineWidth / 2 - thumbMargin / 2) - 1.25;
		thumb.style.top = `${absoluteTop}px`;
		thumb.style.left = `${absoluteLeft}px`;
	}

	if (shell instanceof HTMLElement) {
		syncThumb(shell, thumb, line);
	} else {
		setThumbOffset(thumb, 0);
	}
}

export function initializeScrollbar() {
	const thumb = document.getElementById("scrollbar-thumb");
	const shell = /** @type {HTMLElement} */ (
		document.getElementsByClassName("shell")[0]
	);
	const line = document.getElementById("scrollbar");

	if (!line || !thumb) {
		return;
	}

	// size the thumb first then position
	observeHeight(shell, (clientHeight, scrollHeight) => {
		transformScrollbar(clientHeight, scrollHeight);
		positionScrollbar();
	});
	const refresh = () => {
		transformScrollbar(shell.clientHeight, shell.scrollHeight);
		positionScrollbar();
	};
	window.addEventListener("resize", refresh);
	mobileQuery.addEventListener("change", refresh);

	// these scroll functions are not accurate to real scrollbars.
	// the mouse should click at any point inside the scroll thumb
	// 		and NOT move the thumb's middle to the cursor.
	thumb.addEventListener("pointerdown", (e) => {
		if (!thumb.hasPointerCapture(e.pointerId) || !glob.isScrollable) return;

		scrollThumbTo(shell, thumb, line, pointerOffset(e, line, thumb));
		thumb.setPointerCapture(e.pointerId);

		e.stopPropagation();
	});
	thumb.addEventListener("pointermove", (e) => {
		if (!thumb.hasPointerCapture(e.pointerId) || !glob.isScrollable) return;

		scrollThumbTo(shell, thumb, line, pointerOffset(e, line, thumb));
		thumb.setPointerCapture(e.pointerId);

		e.stopPropagation();
	});
	thumb.addEventListener("pointerup", (e) => {
		thumb.releasePointerCapture(e.pointerId);
		e.stopPropagation();
	});
	thumb.addEventListener(
		"wheel",
		(e) => {
			e.preventDefault();
			onWheel(shell, thumb, line, e.deltaY);
			// i could not be bothered to make shell div have smooth scroll on this.
		},
		{ passive: false },
	);

	line.addEventListener("pointerdown", (e) => {
		if (thumb.hasPointerCapture(e.pointerId) || !glob.isScrollable) return;

		scrollThumbTo(shell, thumb, line, pointerOffset(e, line, thumb));

		thumb.setPointerCapture(e.pointerId);
	});
	line.addEventListener(
		"wheel",
		(e) => {
			e.preventDefault();
			onWheel(shell, thumb, line, e.deltaY);
		},
		{ passive: false },
	);

	shell.addEventListener("scroll", () => syncThumb(shell, thumb, line));
}

/**
 * Makes the custom scrollbar scroll to a position along the line.
 * @param {HTMLElement} shell
 * @param {HTMLElement} thumb
 * @param {HTMLElement} line
 * @param {number} pos
 */
function scrollThumbTo(shell, thumb, line, pos) {
	const range = travel(line, thumb);
	if (range <= 0) return;

	const newPos = Math.max(0, Math.min(pos, range));

	setThumbOffset(thumb, newPos);
	const scrollRatio = newPos / range;
	shell.scrollTop = scrollRatio * (shell.scrollHeight - shell.clientHeight);
}

/**
 * Is used to abstract wheel inputs.
 * @param {HTMLElement} shell
 * @param {HTMLElement} thumb
 * @param {HTMLElement} line
 * @param {number} deltaY
 */
function onWheel(shell, thumb, line, deltaY) {
	shell.scrollTop += deltaY;
	syncThumb(shell, thumb, line);
}

/**
 * @param {number} clientHeight
 * @param {number} shellHeight
 */
export function transformScrollbar(clientHeight, shellHeight) {
	const thumb = document.getElementById("scrollbar-thumb");
	const line = document.querySelector("#scrollbar");

	if (!line || !thumb) {
		return;
	}

	const horizontal = isHorizontal();
	const lengthProp = horizontal ? "width" : "height";
	const thicknessProp = horizontal ? "height" : "width";

	const lineStyle = window.getComputedStyle(line);
	// decimal rounding is to avoid floating point errors.
	const ratio = roundToDecimal(clientHeight / shellHeight, 2);
	const lineLength = parseFloat(
		horizontal ? lineStyle.width : lineStyle.height,
	);
	const resultingScrollLength = lineLength * ratio;

	glob.isScrollable = ratio < 1;

	// length is set here, thickness comes from the CSS (cleared so a stale value from the other axis can't stick).
	thumb.style[thicknessProp] = "";

	if (!glob.isScrollable) {
		// if shell has no scroll
		thumb.style[lengthProp] = `7px`;
		thumb.style.backgroundColor = `var(--color-text-light)`;
	} else {
		thumb.style[lengthProp] = `${resultingScrollLength}px`;
		thumb.style.backgroundColor = `var(--color-base)`;
	}
}

/**
 * @param {number} num
 * @param {number} decimalPlaces
 */
function roundToDecimal(num, decimalPlaces) {
	const factor = Math.pow(10, decimalPlaces); // or 10 ** decimalPlaces in modern JS
	return Math.round(num * factor) / factor;
}
