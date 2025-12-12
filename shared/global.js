
// fouc

// letting the CSS load first.

import { CursorManager } from "/shared/components/cursor";

const man = new CursorManager();

const elements = {
	thumb: null,
	shell: null,
	container: null,
	line: null,
}

function positionScrollbar() {
	const thumb = document.getElementById("scrollbar-thumb");
	const shell = document.querySelector(".shell");
	const container = document.querySelector(".main-container");
	const line = document.querySelector("#scrollbar");

	const lineRect = line.getBoundingClientRect();
	const thumbStyle = window.getComputedStyle(thumb);
	const h_center = (parseFloat(thumbStyle.height) / 2) || 0;
	const w_center = (parseFloat(thumbStyle.width) / 2) || 0;
	console.log(thumbStyle.height, thumbStyle.width, lineRect.top, lineRect.left, thumbStyle.position)
	// WHY IS thumb.style NOT DOING ANYTHINGGGG OMSJKDFBAKJS
	const absoluteTop = lineRect.top - h_center;
	const absoluteLeft = lineRect.left - (w_center + 2.5);
	thumb.style.top = `${absoluteTop}px`;
	thumb.style.left = `${absoluteLeft}px`;
}

document.addEventListener("DOMContentLoaded", () => {
	document.fonts.ready.then(() => {
		document.documentElement.style.visibility = "visible";

		elements.thumb = document.getElementById("scrollbar-thumb");
		const shell = document.querySelector(".shell");
		const container = document.querySelector(".main-container");
		const line = document.querySelector("#scrollbar");

		man.initCursor();
		requestAnimationFrame(man.animateCursor);
		man.enableMouseMovement();

		positionScrollbar();
	})
})

window.addEventListener("resize", () => {
	positionScrollbar();
});

/*
	MAKE A CUSTOM SCROLLBAR!!
	- [/] how to position scroll thumb to the vertical divider no matter what size it is.
	- how to make that move up and down on the divider.
	- making it longer and shorter depending on the scroll size.
*/

