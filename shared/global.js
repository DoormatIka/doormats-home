
// fouc

// letting the CSS load first.

import { CursorManager } from "/shared/components/cursor";

const man = new CursorManager();

/**
	* @type {HTMLDivElement | undefined}
	*/
let scrollThumb = undefined;

document.addEventListener("DOMContentLoaded", () => {
	document.fonts.ready.then(() => {
		document.documentElement.style.visibility = "visible";

		man.initCursor();
		requestAnimationFrame(man.animateCursor);
		man.enableMouseMovement();

		/**
			* @type {any}
			*/
		const bar = document.getElementById("scrollbar-thumb");
		scrollThumb = bar;
	})
})

/*

	MAKE A CUSTOM SCROLLBAR!!
	- how to position scroll thumb to the vertical divider no matter what size it is.
	- how to make that move up and down on the divider.
	- making it longer and shorter depending on the scroll size.

*/

