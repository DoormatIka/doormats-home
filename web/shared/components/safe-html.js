/** Wrap a string to mark it as already-safe HTML (e.g. output of another html`` call) */
class SafeString {
	/**
	 * @type {unknown}
	 */
	value;

	/**
	 * @param {string} value
	 */
	constructor(value) {
		this.value = value;
	}
	toString() {
		return this.value;
	}
}
/**
 * @param {string} str
 *
export function markSafe(str) {
	return new SafeString(str);
}

/**
 * Escapes special HTML characters in a string.
 * @param {string} str
 */
export function escapeHtml(str) {
	return String(str)
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&#39;");
}

/**
 * Tagged template: interpolated values are auto-escaped, static parts are not.
 * @param {TemplateStringsArray} strings
 * @param {unknown[]} values
 * @returns string
 */
export function html(strings, ...values) {
	return strings.reduce((result, str, i) => {
		const value = values[i - 1];
		const safe =
			value instanceof SafeString
				? value.toString()
				: escapeHtml(value.toString() ?? "");
		return result + safe + str;
	});
}
