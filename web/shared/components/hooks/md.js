import { dedent } from "/shared/misc.js";

import { md } from "/shared/libs/md.js";
md.core.ruler.push("list_classes", (state) => {
	let depth = 0;
	for (const t of state.tokens) {
		if (t.type === "bullet_list_open") {
			depth++;
			t.attrJoin("class", "list");
		} else if (t.type === "bullet_list_close") {
			depth--;
		} else if (t.type === "list_item_open") {
			if (depth > 1) t.attrJoin("class", "list-item lined-list-item");
		} else if (
			depth > 0 &&
			(t.type === "paragraph_open" || t.type === "paragraph_close")
		) {
			t.hidden = false;
		}
	}
});

export const name = "md";

/**
 * builds the markdown, placeholder for now. will not retain whitespace!!
 * @param {string} s - md text
 */
function renderMarkdown(s) {
	return md.render(s);
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
	} catch (/** @type {any} */ error) {
		div.innerHTML = error.toString();
	}
}
