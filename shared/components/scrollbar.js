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

/**
	* @param {Element} div 
	* @returns {boolean}
	*/
function isDivScrollable(div) {
	const ratio = div.clientHeight / div.scrollHeight;
	return ratio < 1;
}

// TODO: window.matchMedia("(max-width: x px)")

export function positionScrollbar() {
	const thumb = document.getElementById("scrollbar-thumb");
	const line = document.querySelector("#scrollbar");

	const lineRect = line.getBoundingClientRect();
	const thumbStyle = window.getComputedStyle(thumb);
	const marginWidth = parseFloat(thumbStyle.marginLeft) + parseFloat(thumbStyle.marginRight);
	const paddingWidth = parseFloat(thumbStyle.paddingLeft) + parseFloat(thumbStyle.paddingRight);
	const widthCenter = (parseFloat(thumbStyle.width) / 2) + (marginWidth / 2) + (paddingWidth / 2) || 0;
	const absoluteTop = lineRect.top;
	const absoluteLeft = lineRect.left - (widthCenter + 2);
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
		if (!thumb.hasPointerCapture(e.pointerId) || !isDivScrollable(shell))
			return;

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
		if (thumb.hasPointerCapture(e.pointerId) || !isDivScrollable(shell)) return;

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

export function resizeScrollbar() {
	const thumb = document.getElementById("scrollbar-thumb");
	const shell = document.querySelector(".shell");
	const line = document.querySelector("#scrollbar");

	const lineStyle = window.getComputedStyle(line);
	const ratio = shell.clientHeight / shell.scrollHeight;
	const lineHeight = parseFloat(lineStyle.height);
	const resultingScrollHeight = lineHeight * ratio;

	if (!isDivScrollable(shell)) { // if shell has no scroll
		thumb.style.height = `7px`;
	} else {
		thumb.style.height = `${resultingScrollHeight}px`
	}
}
