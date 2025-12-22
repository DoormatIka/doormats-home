
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
	/**
		* @param {TouchEvent} e 
		*/
	_touch(e) {
		for (const cursor of this._cursors) {
			cursor.targetX = e.touches[0].clientX;
			cursor.targetY = e.touches[0].clientY;
		}
	}
	/**
		* @param {MouseEvent} e 
		*/
	_mouse(e) {
		for (let cursor of this._cursors) {
			cursor.targetX = e.clientX;
			cursor.targetY = e.clientY;
		}
	}
	_mouseToCenter() {
		const middleWidth = document.body.clientWidth / 2;
		const middleHeight = document.body.clientHeight / 2;
		for (let cursor of this._cursors) {
			cursor.targetX = middleWidth;
			cursor.targetY = middleHeight;
		}
	}
	enableMouseMovement() {
		document.addEventListener("mousemove", (e) => this._mouse(e));

		let timeoutID;
		document.addEventListener("touchstart", (e) => {
			clearTimeout(timeoutID);
			this._touch(e);
		});
		document.addEventListener("touchmove", (e) => this._touch(e));
		document.addEventListener("touchend", () => {
			timeoutID = setTimeout(() => this._mouseToCenter(), 1000);
		})
	}
}


