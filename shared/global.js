
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

		const divCursors = document.querySelectorAll(".cursor");
		for (let i = 0; i < divCursors.length; i++) {
			const cursor = divCursors[i];
			// shhh... it's fine. eval is fine.
			const ease = eval(cursor.getAttribute("data-ease"));
			if (typeof ease !== "number") {
				console.error(`[data-ease] is NOT a number: ${ease}`)
				continue;
			}
			console.log(document.body.scrollWidth / 2);
			cursors.push({ 
				div: cursor,
				ease: ease ?? 1/50,
				cursorX: 0,
				cursorY: 0,
				targetX: document.body.clientWidth / 2,
				targetY: document.body.clientHeight / 2,
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
