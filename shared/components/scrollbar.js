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
	const line = document.querySelector("#scrollbar");

	const lineRect = line.getBoundingClientRect();
	const lineStyle = window.getComputedStyle(line);
	const thumbStyle = window.getComputedStyle(thumb);

	const thumbMargin =
		parseFloat(thumbStyle.marginLeft) + parseFloat(thumbStyle.marginRight);
	const lineWidth =
		lineRect.width +
		parseFloat(lineStyle.marginLeft) +
		parseFloat(lineStyle.marginRight);
	const absoluteTop = lineRect.top;
	const absoluteLeft = lineRect.left - (lineWidth / 2 - thumbMargin / 2) - 1.25;
	thumb.style.top = `${absoluteTop}px`;
	thumb.style.left = `${absoluteLeft}px`;
	thumb.style.transform = `translateY(0px)`;
}

export function initializeScrollbar() {
	const thumb = document.getElementById("scrollbar-thumb");
	const shell = /** @type {HTMLElement} */ (
		document.getElementsByClassName("shell")[0]
	);
	const line = document.getElementById("scrollbar");

	observeHeight(shell, (clientHeight, scrollHeight) => {
		positionScrollbar();
		transformScrollbar(clientHeight, scrollHeight);
	});
	window.addEventListener("resize", () => {
		positionScrollbar();
		transformScrollbar(shell.clientHeight, shell.scrollHeight);
	});

	// these scroll functions are not accurate to real scrollbars.
	// the mouse should click at any point inside the scroll thumb
	// 		and NOT move the thumb's middle to the cursor.
	thumb.addEventListener("pointerdown", (e) => {
		if (!thumb.hasPointerCapture(e.pointerId) || !glob.isScrollable) return;

		const lineTop = line.getBoundingClientRect().top;
		let middleY = e.clientY - lineTop - thumb.clientHeight / 2;
		scrollThumbTo(shell, thumb, line, middleY);
		thumb.setPointerCapture(e.pointerId);

		e.stopPropagation();
	});
	thumb.addEventListener("pointermove", (e) => {
		if (!thumb.hasPointerCapture(e.pointerId) || !glob.isScrollable) return;

		const lineTop = line.getBoundingClientRect().top;
		let middleY = e.clientY - lineTop - thumb.clientHeight / 2;
		scrollThumbTo(shell, thumb, line, middleY);

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

		const lineTop = line.getBoundingClientRect().top;
		let middleY = e.clientY - lineTop - thumb.clientHeight / 2;
		scrollThumbTo(shell, thumb, line, middleY);

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

	shell.addEventListener("scroll", (e) => {
		const shell = e.currentTarget;
		if (!(shell instanceof HTMLElement)) return;

		const thumbTop =
			(shell.scrollTop / (shell.scrollHeight - shell.clientHeight)) *
			(line.clientHeight - thumb.clientHeight);
		thumb.style.transform = `translateY(${thumbTop}px)`;
	});
}

/**
 * Makes the custom scrollbar scroll to y.
 * @param {HTMLElement} shell
 * @param {HTMLElement} thumb
 * @param {HTMLElement} line
 * @param {number} y
 */
function scrollThumbTo(shell, thumb, line, y) {
	const newY = Math.max(0, Math.min(y, line.clientHeight - thumb.clientHeight));

	thumb.style.transform = `translateY(${newY}px)`;
	const scrollRatio = newY / (line.clientHeight - thumb.clientHeight);
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

	const scrollRatio =
		shell.scrollTop / (shell.scrollHeight - shell.clientHeight);
	const newThumbY = scrollRatio * (line.clientHeight - thumb.clientHeight);
	thumb.style.transform = `translateY(${newThumbY}px)`;
}

/**
 * @param {number} clientHeight
 * @param {number} shellHeight
 */
export function transformScrollbar(clientHeight, shellHeight) {
	const thumb = document.getElementById("scrollbar-thumb");
	const line = document.querySelector("#scrollbar");

	const lineStyle = window.getComputedStyle(line);
	// decimal rounding is to avoid floating point errors.
	const ratio = roundToDecimal(clientHeight / shellHeight, 2);
	const lineHeight = parseFloat(lineStyle.height);
	const resultingScrollHeight = lineHeight * ratio;

	glob.isScrollable = ratio < 1;

	if (!glob.isScrollable) {
		// if shell has no scroll
		thumb.style.height = `7px`;
		thumb.style.backgroundColor = `var(--color-text-light)`;
	} else {
		thumb.style.height = `${resultingScrollHeight}px`;
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
