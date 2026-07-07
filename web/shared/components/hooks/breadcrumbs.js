import { html } from "/shared/components/safe-html.js";

/**
 * Capitalizes the first letter of a string.
 * @param {string} s - any string to capitalize
 */
const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1);

/**
 * Converts a URI into an array of segments.
 * @param {string} uri - e.g. "#/pictures/summer15/italy"
 * @returns {string[]} - e.g. ["pictures", "summer15", "italy"]
 */
function uriToSegments(uri) {
	return uri.replace("#/", "").split("/").filter(Boolean);
}

/**
 * Converts a segment into a breadcrumb list item.
 * @param {string} segment - the current segment, e.g. "summer15"
 * @param {number} index - the index of the segment in the array
 * @param {string[]} segments - the full array of segments
 * @returns {string} - a breadcrumb list item as an HTML string
 */
function segmentToItem(segment, index, segments) {
	const href = "#/" + segments.slice(0, index + 1).join("/");
	const label = capitalize(segment);
	const isLast = index === segments.length - 1;

	if (isLast) {
		return html`<li aria-current="page">
			<span class="coming-soon">${label}</span>
		</li>`;
	}
	return html`<li><a href="${href}">${label}</a></li>`;
}

export const name = "breadcrumb";
/**
 * Hook function: Builds a breadcrumb nav element from a URI.
 * @param {Element} _shell - The shell
 * @param {string[]} _params - Parameters from the router.
 * @param {string} uri - e.g. "#/pictures/summer15/italy"
 * @returns {string} - a breadcrumb nav as an HTML string.
 */
export function fn(_shell, _params, uri) {
	const segments = uriToSegments(uri);
	const divs = segments.map(segmentToItem);
	const items = [`<li><a href="#/">Home</a></li>`, ...divs];
	return `
		<nav aria-label="breadcrumb">
			<ol class="breadcrumb">
				${items.join("\n")}
			</ol>
		</nav>
	`;
}
