
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
	* This is where animations of the cursor happen.
	* Make a div (or multiple divs) with a class of ".cursor", style it, and put it anywhere you like.
	* You can put [data-ease] inside that div to modify the strength of the easing (decimals only, e.g: 0.01, 0.005)
	*/
export class CursorManager {
	constructor() {
		/**
			* @type {Array<Cursor>}
			*/
		this._cursors = [];
		this.animateCursor = this.animateCursor.bind(this);
	}
	initCursor() {
		/** @type {NodeListOf<HTMLDivElement>} */
		const divCursors = document.querySelectorAll(".cursor");
		for (let i = 0; i < divCursors.length; i++) {
			const cursor = divCursors[i];
			const ease = parseFloat(cursor.getAttribute("data-ease"));
			const width = document.body.clientWidth / 2;
			const height = document.body.clientHeight / 2;

			if (typeof ease !== "number") {
				console.error(`[data-ease] is NOT a number: ${ease}`)
				continue;
			}
			this._cursors.push({ 
				div: cursor,
				ease: ease ?? 1/50,
				cursorX: width + (i * 15),
				cursorY: height + (i * 15),
				targetX: width,
				targetY: height,
			});
		}
	}
	animateCursor() {
		for (let cursor of this._cursors) {
			cursor.cursorX += (cursor.targetX - cursor.cursorX) * cursor.ease;
			cursor.cursorY += (cursor.targetY - cursor.cursorY) * cursor.ease;

			cursor.div.style.left = cursor.cursorX + "px";
			cursor.div.style.top = cursor.cursorY + "px";
		}
		requestAnimationFrame(this.animateCursor);
	}
	enableMouseMovement() {
		document.addEventListener("mousemove", (e) => {
			for (let cursor of this._cursors) {
				cursor.targetX = e.clientX;
				cursor.targetY = e.clientY;
			}
		});
	}
}
