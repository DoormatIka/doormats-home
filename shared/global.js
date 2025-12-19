
// fouc

// letting the CSS load first.

import { CursorManager } from "/shared/components/cursor.js";
import { positionScrollbar, initializeScrollbar } from "/shared/components/scrollbar.js";

const man = new CursorManager();
const isReducedMotionEnabled = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

document.addEventListener("DOMContentLoaded", () => {
	document.fonts.ready.then(() => {
		document.documentElement.style.visibility = "visible";

		man.initCursor();
		if (!isReducedMotionEnabled) {
			requestAnimationFrame(man.animateCursor);
			man.enableMouseMovement();
		}

		initializeScrollbar();
		positionScrollbarOnBoxTransition();
	})
})

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
		bar.style.visibility = "visible";
	});
}

