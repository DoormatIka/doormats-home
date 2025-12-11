declare function animateCursor(): void;
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
declare const cursors: Array<Cursor>;
type Cursor = {
    div: HTMLDivElement | null;
    cursorX: number;
    cursorY: number;
    targetX: number;
    targetY: number;
    ease: number;
};
//# sourceMappingURL=global.d.ts.map