
// fouc

// letting the CSS load first.
/**
	* @typedef {Object} Cursor
	* @property {HTMLDivElement | null} div
	* @property {number} cursorX
	* @property {number} cursorY
	* @property {number} targetX
	* @property {number} targetY
	* @property {number} ease
	*/

/**
	* @type {Array<Cursor>}
	*/
const cursors = [];

document.addEventListener("DOMContentLoaded", () => {
	document.fonts.ready.then(() => {
		document.documentElement.style.visibility = "visible";

		/** @type {NodeListOf<HTMLDivElement>} */
		const divCursors = document.querySelectorAll(".cursor");
		for (let i = 0; i < divCursors.length; i++) {
			const cursor = divCursors[i];
			// shhh... it's fine. eval is fine.
			const ease = eval(cursor.getAttribute("data-ease"));
			const width = document.body.clientWidth / 2;
			const height = document.body.clientHeight / 2;

			if (typeof ease !== "number") {
				console.error(`[data-ease] is NOT a number: ${ease}`)
				continue;
			}
			cursors.push({ 
				div: cursor,
				ease: ease ?? 1/50,
				cursorX: width + (i * 15),
				cursorY: height + (i * 15),
				targetX: width,
				targetY: height,
			});
		}

		requestAnimationFrame(animateCursor);
	})
})


function animateCursor() {
	for (let cursor of cursors) {
		cursor.cursorX += (cursor.targetX - cursor.cursorX) * cursor.ease;
		cursor.cursorY += (cursor.targetY - cursor.cursorY) * cursor.ease;

		cursor.div.style.left = cursor.cursorX + "px";
		cursor.div.style.top = cursor.cursorY + "px";
	}
	requestAnimationFrame(animateCursor);
}


document.addEventListener("mousemove", (e) => {
	for (let cursor of cursors) {
		cursor.targetX = e.clientX;
		cursor.targetY = e.clientY;
	}
});
