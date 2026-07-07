/**
 * @param {string} htmlString
 */
export function parseHTML(htmlString) {
	const template = document.createElement("template");
	template.innerHTML = htmlString;
	return template.content;
}

export function isLocalHost() {
	return (
		window.location.hostname === "localhost" ||
		window.location.hostname === "127.0.0.1" ||
		window.location.hostname.startsWith("192.168.") ||
		window.location.hostname.startsWith("10.") ||
		window.location.hostname.startsWith("172.")
	);
}
