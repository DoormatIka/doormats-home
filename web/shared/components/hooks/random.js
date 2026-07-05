/**
 * @typedef {object} Link
 * @property {"a"} obj
 * @property {string} src
 * @property {string} msg
 */

/**
 * @typedef {object} Paragraph
 * @property {"p"} obj
 * @property {string} msg
 */

/**
 * @type {Array<Link | Paragraph>}
 */
const messages = [
	{
		obj: "a",
		src: "https://www.youtube.com/watch?v=xIF0Me8j0dg",
		msg: "Bubble pop, electric.",
	},
	{
		obj: "a",
		src: "https://www.youtube.com/watch?v=xIF0Me8j0dg",
		msg: "Who the heck is Naoya?",
	},
	{
		obj: "a",
		src: "https://www.youtube.com/watch?v=ddQ7YR0qQSo",
		msg: "our brains are WEEEIII!!",
	},
	{
		obj: "a",
		src: "https://www.youtube.com/watch?v=7h7bnYA1LXE",
		msg: "she's so funky!",
	},
	{
		obj: "a",
		src: "https://www.youtube.com/watch?v=qMCWZ8Pay9w",
		msg: "she's so merengue...",
	},
	{
		obj: "a",
		src: "https://mcsrranked.com/stats/yuyuqk",
		msg: "hop on mcsr ranked.",
	},
];

/**
 * @param {string} src
 * @param {string} msg
 */
function createLinkObject(src, msg) {
	return `<a href="${src}" target="_blank" rel="noopener noreferrer">${msg}</a>`;
}

/**
 * @param {string} msg
 */
function createParagraphObject(msg) {
	return `<p>${msg}</p>`;
}

/**
 * Gets a random item from an array.
 * @template T
 * @param {T[]} arr
 */
function getRandomItem(arr) {
	const randomIndex = Math.floor(Math.random() * arr.length);
	const item = arr[randomIndex];
	return item;
}

export const name = "random";
/**
 * Creates a random message.
 * @param {Element} _shell - The shell
 * @param {string[]} _params - Parameters from the router.
 * @param {string} _uri - e.g. "#/pictures/summer15/italy"
 * @returns {string} - a breadcrumb nav as an HTML string.
 */
export function fn(_shell, _params, _uri) {
	const { obj, ...others } = getRandomItem(messages);
	switch (obj) {
		case "a": {
			const { src, msg } = /** @type {{src: string, msg: string}} */ (others);
			return createLinkObject(src, msg);
		}
		case "p": {
			const { msg } = /** @type {{msg: string}} */ (others);
			return createParagraphObject(msg);
		}
		default:
			throw Error("what are we doing. obj in random not found!");
	}
}
