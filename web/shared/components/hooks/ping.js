import { isLocalHost } from "/shared/misc.js";
import { html } from "/shared/components/safe-html.js";

export const name = "ping";

/**
 * Hook function: Builds a breadcrumb nav element from a URI.
 * @param {Element} _shell - The shell
 * @param {string[]} _params - Parameters from the router.
 * @param {string} uri - e.g. "#/pictures/summer15/italy"
 * @returns {Promise<string>} - a breadcrumb nav as an HTML string.
 */
export async function fn(_shell, _params, uri) {
	const ip = isLocalHost()
		? "http://127.0.0.1:8980"
		: "https://home.yuyuqk.com/api";
	try {
		await fetch(ip + "/ping");
		// const json = await res.json();
		return html`<p>This message came from my server!</p>`;
	} catch (error) {
		return html`<p>${error}</p>`;
	}
}
