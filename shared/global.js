
// fouc

// letting the CSS load first.

import { CursorManager } from "/shared/components/cursor";
import { positionScrollbar, initializeScrollbar, resizeScrollbar } from "/shared/components/scrollbar";

const man = new CursorManager();


document.addEventListener("DOMContentLoaded", () => {
	document.fonts.ready.then(() => {
		document.documentElement.style.visibility = "visible";

		man.initCursor();
		requestAnimationFrame(man.animateCursor);
		man.enableMouseMovement();

		initializeScrollbar();
		positionScrollbar();

		positionScrollbarOnBoxTransition();
	})
})

window.addEventListener("resize", () => {
	positionScrollbar();
});

function positionScrollbarOnBoxTransition() {
	const box = /** @type {HTMLElement} */ (document.querySelector(".big-box"));
	const bar = document.getElementById("scrollbar-thumb");

	box.addEventListener("transitionrun", (e) => {
		if (e.target !== box) return;
		if (!["width", "height"].includes(e.propertyName)) return;

		bar.style.visibility = "hidden";
	})
	box.addEventListener("transitionend", (e) => {
		if (e.target !== box) return;
		if (!["width", "height"].includes(e.propertyName)) return;

		positionScrollbar();
		resizeScrollbar();

		bar.style.visibility = "visible";
	});
}

