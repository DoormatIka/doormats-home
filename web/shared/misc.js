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

/** @param {string} text */
export function dedent(text) {
	const lines = text.replace(/\r\n?/g, "\n").split("\n");
	while (lines.length && !lines[0].trim()) lines.shift();
	while (lines.length && !lines[lines.length - 1].trim()) lines.pop();

	const indent = Math.min(
		...lines
			.filter((l) => l.trim())
			.map((l) => l.length - l.trimStart().length),
	);
	return lines.map((l) => l.slice(indent)).join("\n");
}
