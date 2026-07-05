/**
 * @param {string} htmlString
 */
export function parseHTML(htmlString) {
	const parser = new DOMParser();
	const doc = parser.parseFromString(htmlString, "text/html");
	return doc.body;
}
