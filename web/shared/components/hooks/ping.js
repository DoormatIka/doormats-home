import { isLocalHost } from "/shared/misc.js";
import { html } from "/shared/components/safe-html.js";

export const name = "ping";

/**
 * Hook function: Builds a breadcrumb nav element from a URI.
 * @param {Element} _shell - The shell
 * @param {string[]} _params - Parameters from the router.
 * @param {string} _uri - e.g. "#/pictures/summer15/italy"
 * @returns {Promise<string>} - a breadcrumb nav as an HTML string.
 */
export async function fn(_shell, _params, _uri) {
	const ip = isLocalHost()
		? "http://127.0.0.1:9980/api"
		: "https://home.mualice.dpdns.com/api";
	console.log(ip);
	try {
		const res = await fetch(ip + "/ping");
		if (res.status != 200) {
			return html`<p class="small-text light-color">
				Couldn't reach the server!
			</p>`;
		}
		// const json = await res.json();
		return html`<p class="small-text light-color">
			This message came from my server!
		</p>`;
	} catch (error) {
		return html`<p>${error}</p>`;
	}
}
