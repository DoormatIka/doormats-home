/**
 * @param {string} htmlString
 */
export function parseHTML(htmlString) {
	const template = document.createElement("template");
	template.innerHTML = htmlString;
	return template.content;
}
