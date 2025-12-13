
/**
	* @param {Element} div 
	* @returns {boolean}
	*/
function isDivScrollable(div) {
	const ratio = div.clientHeight / div.scrollHeight;
	return ratio < 1;
}

export function positionScrollbar() {
	const thumb = document.getElementById("scrollbar-thumb");
	const line = document.querySelector("#scrollbar");
	const shell = document.querySelector(".shell");

	const lineRect = line.getBoundingClientRect();
	const thumbStyle = window.getComputedStyle(thumb);
	const widthCenter = (parseFloat(thumbStyle.width) / 2) || 0;
	const absoluteTop = lineRect.top;
	const absoluteLeft = lineRect.left - (widthCenter + 2);
	thumb.style.top = `${absoluteTop}px`;
	thumb.style.left = `${absoluteLeft}px`;
	thumb.style.transform = `translateY(0px)`;

	if (!isDivScrollable(shell)) { // if shell has no scroll
		thumb.style.height = `5px`;
	}
}

export function initializeScrollbar() {
	const thumb = document.getElementById("scrollbar-thumb");
	const shell = document.querySelector(".shell");
	const line = /** @type {HTMLElement} */ (document.querySelector("#scrollbar"));
	const lineRect = line.getBoundingClientRect();

	positionScrollbar();

	let dragOffsetY = 0;

	thumb.addEventListener("pointerdown", (e) => {
		const thumbRect = thumb.getBoundingClientRect();
		dragOffsetY = e.clientY - thumbRect.top;
		thumb.setPointerCapture(e.pointerId);

		e.stopPropagation();
	})
	thumb.addEventListener("pointermove", (e) => {
		if (!thumb.hasPointerCapture(e.pointerId) || !isDivScrollable(shell))
			return;

		let clampedScrollY = e.clientY - lineRect.top - dragOffsetY;

		clampedScrollY = Math.max(0, Math.min(clampedScrollY, line.clientHeight - thumb.clientHeight));
		thumb.style.transform = `translateY(${clampedScrollY}px)`;

		const scrollRatio = clampedScrollY / (line.clientHeight - thumb.clientHeight);
		shell.scrollTop = scrollRatio * (shell.scrollHeight - shell.clientHeight);

		e.stopPropagation();
	})
	thumb.addEventListener("pointerup", (e) => {
		thumb.releasePointerCapture(e.pointerId);
		e.stopPropagation();
	})

	line.addEventListener("click", (e) => {
		if (e.target === thumb || !isDivScrollable(shell)) return;

		const trackRect = line.getBoundingClientRect();
		let newY = e.clientY - trackRect.top - thumb.clientHeight / 2;
		newY = Math.max(0, Math.min(newY, line.clientHeight - thumb.clientHeight));

		thumb.style.transform = `translateY(${newY}px)`;
		const scrollRatio = newY / (line.clientHeight - thumb.clientHeight);
		shell.scrollTop = scrollRatio * (shell.scrollHeight - shell.clientHeight);
	})

	line.addEventListener("wheel", (e) => {
		e.preventDefault();

		shell.scrollTop += e.deltaY;

		const scrollRatio = shell.scrollTop / (shell.scrollHeight - shell.clientHeight);
		const newThumbY = scrollRatio * (line.clientHeight - thumb.clientHeight);
		thumb.style.transform = `translateY(${newThumbY}px)`;
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

function onPointerScroll() {
	
}

export function resizeScrollbar() {
	const thumb = document.getElementById("scrollbar-thumb");
	const shell = document.querySelector(".shell");
	const line = document.querySelector("#scrollbar");

	const lineStyle = window.getComputedStyle(line);
	const ratio = shell.clientHeight / shell.scrollHeight;
	const lineHeight = parseFloat(lineStyle.height);
	const resultingScrollHeight = lineHeight * ratio;

	thumb.style.height = `${resultingScrollHeight}px`
}
