import { html } from "/shared/components/safe-html.js";
import { dedent } from "/shared/misc.js";

export const name = "md";

/**
 * builds the markdown, placeholder for now. will not retain whitespace!!
 * @param {string} s - md text
 */
function renderMarkdown(s) {
	return `<p>${s}</p>`;
}

/**
 * Hook function: Builds a breadcrumb nav element from a URI.
 * @param {Element} _shell - The shell
 * @param {HTMLElement} div - The [data-breadcrumb] element being filled.
 * @param {string[]} _params - Parameters from the router.
 * @param {string} _uri - e.g. "#/pictures/summer15/italy"
 */
export async function fn(_shell, div, _params, _uri) {
	try {
		const dedented = dedent(div.textContent ?? "");
		const out = document.createElement("div");
		out.className = div.className; // keep any classes you put on the tag
		out.innerHTML = renderMarkdown(dedented);
		div.replaceWith(out);

		console.log(`|||||`, dedented, `||||`);

		return html``;
	} catch (error) {
		return html``;
	}
}
