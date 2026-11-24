import { html } from "/shared/components/safe-html.js";

export const name = "ping";

/**
 * Hook function: Builds a breadcrumb nav element from a URI.
 * @param {Element} _shell - The shell
 * @param {HTMLElement} div - The [data-breadcrumb] element being filled.
 * @param {string[]} _params - Parameters from the router.
 * @param {string} _uri - e.g. "#/pictures/summer15/italy"
 */
export async function fn(_shell, div, _params, _uri) {
	try {
		const res = await fetch("/api/ping");
		if (res.status != 200) {
			div.innerHTML = html`<p class="small-text light-color">
				Couldn't reach the server!
			</p>`;
			return;
		}
		div.innerHTML = html`<p class="small-text light-color">
			This message came from my server!
		</p>`;
	} catch (error) {
		div.innerHTML = html`<p>${error}</p>`;
	}
}
