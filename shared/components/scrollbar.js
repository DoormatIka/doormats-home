/*
	Hii, this is where the main scrollbar logic is located.
	All this does is track the scroll position and size of the "shell" div (where the content lives)
		and scales that into the smaller scroll line.
	Whenever the scroll position changes on the "shell" div,
		it also changes the position on the scrollbar.
	
	Very simple, all of the stuff below is math to calculate them.
	I don't animate things manually on this script, please look at functional.css.

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

	el.querySelectorAll("img")
		.forEach(img => {
			if (!img.complete) {
				img.addEventListener("load", emit, { once: true });
			}
		});
	el.querySelectorAll("video")
		.forEach(vid => {
			vid.addEventListener("loadstart", emit, { once: true });
		})

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
	const thumbStyle = window.getComputedStyle(thumb);
	const marginWidth = parseFloat(thumbStyle.marginLeft) + parseFloat(thumbStyle.marginRight);
	const paddingWidth = parseFloat(thumbStyle.paddingLeft) + parseFloat(thumbStyle.paddingRight);
	const widthCenter = (parseFloat(thumbStyle.width) / 2) + (marginWidth / 2) + (paddingWidth / 2) || 0;
	const absoluteTop = lineRect.top;
	const absoluteLeft = lineRect.left - (widthCenter + 1.5);
	thumb.style.top = `${absoluteTop}px`;
	thumb.style.left = `${absoluteLeft}px`;
	thumb.style.transform = `translateY(0px)`;
}

export function initializeScrollbar() {
	const thumb = document.getElementById("scrollbar-thumb");
	const shell = /** @type {HTMLElement} */ (document.getElementsByClassName("shell")[0]);
	const line = document.getElementById("scrollbar");
	const lineRect = line.getBoundingClientRect();

	positionScrollbar();

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
		let middleY = e.clientY - lineRect.top - thumb.clientHeight / 2;
		scrollThumbTo(shell, thumb, line, middleY);
		thumb.setPointerCapture(e.pointerId);

		e.stopPropagation();
	})
	thumb.addEventListener("pointermove", (e) => {
		if (!thumb.hasPointerCapture(e.pointerId) || !glob.isScrollable) return;

		let middleY = e.clientY - lineRect.top - thumb.clientHeight / 2;
		scrollThumbTo(shell, thumb, line, middleY);

		e.stopPropagation();
	})
	thumb.addEventListener("pointerup", (e) => {
		thumb.releasePointerCapture(e.pointerId);
		e.stopPropagation();
	})
	thumb.addEventListener("wheel", (e) => {
		e.preventDefault();
		onWheel(shell, thumb, line, e.deltaY);
		// i could not be bothered to make shell div have smooth scroll on this.
	})

	line.addEventListener("pointerdown", (e) => {
		if (thumb.hasPointerCapture(e.pointerId) || !glob.isScrollable) return;

		let middleY = e.clientY - lineRect.top - thumb.clientHeight / 2;
		scrollThumbTo(shell, thumb, line, middleY);

		thumb.setPointerCapture(e.pointerId);
	})
	line.addEventListener("wheel", (e) => {
		e.preventDefault();
		onWheel(shell, thumb, line, e.deltaY);
	});

	shell.addEventListener("scroll", (e) => {
		const shell = e.currentTarget;
		if (!(shell instanceof HTMLElement)) 
			return;

		const thumbTop = (shell.scrollTop 
			/ (shell.scrollHeight - shell.clientHeight)) 
			* (line.clientHeight - thumb.clientHeight);
		thumb.style.transform = `translateY(${thumbTop}px)`;
	})
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

	const scrollRatio = shell.scrollTop / (shell.scrollHeight - shell.clientHeight);
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
	const ratio = clientHeight / shellHeight;
	const lineHeight = parseFloat(lineStyle.height);
	const resultingScrollHeight = lineHeight * ratio;
	glob.isScrollable = ratio < 1;

	if (!glob.isScrollable) { // if shell has no scroll
		thumb.style.height = `7px`;
		thumb.style.backgroundColor = `var(--color-text-light)`;
	} else {
		thumb.style.height = `${resultingScrollHeight}px`;
		thumb.style.backgroundColor = `var(--color-base)`;
	}
}
