import { html } from "/shared/components/safe-html.js";

export const name = "sotd";

/**
 * @typedef {Object} YtdlpThumbnailEntry
 * @property {string} url
 * @property {number} height
 * @property {number} width
 */

/**
 * @typedef {Object} YtdlpPlaylistEntry
 * @property {string} id
 * @property {string} _type
 * @property {string} url
 * @property {string} title
 * @property {YtdlpThumbnailEntry[]} thumbnails
 * @property {number} duration
 * @property {number} view_count
 * @property {number|null} timestamp
 * @property {string|null} live_status
 * @property {string|null} availability
 * @property {string} channel_url
 * @property {string} uploader_url
 * @property {any[]} creators
 * @property {string} channel
 * @property {string} channel_id
 * @property {string} uploader
 * @property {string} uploader_id
 * @property {string} ie_key
 */

/**
 * Hook function: Builds a breadcrumb nav element from a URI.
 * @param {Element} _shell - The shell
 * @param {HTMLElement} div - The [data-breadcrumb] element being filled.
 * @param {string[]} _params - Parameters from the router.
 * @param {string} _uri - e.g. "#/pictures/summer15/italy"
 */
export async function fn(_shell, div, _params, _uri) {
	try {
		const res = await fetch("/api/random-playlist", { method: "POST" });

		if (res.status != 200) {
			div.innerHTML = html`<p>
				Error ${res.status}! Couldn't get the data from the server!
			</p>`;
			return;
		}

		/** @type {YtdlpPlaylistEntry} */
		const obj = await res.json();
		const title = obj.title;
		const uploader = obj.uploader || obj.channel;
		const uploader_url = obj.uploader_url || obj.channel_url;
		const video_url = obj.url;
		const thumbnail = obj.thumbnails[obj.thumbnails.length - 1];
		div.innerHTML = html` <div class="sotd-main-container">
			<h3>song of the day</h3>
			<div class="sotd-playlist-container">
				<img src="${thumbnail.url}" class="thumbnail cover" />
				<div>
					<a href="${video_url}" target="_blank" rel="noopener noreferrer"
						>${title}</a
					>
					<br />
					<a href="${uploader_url}" target="_blank" rel="noopener noreferrer"
						>@${uploader}</a
					>
				</div>
			</div>
		</div>`;
	} catch (error) {
		div.innerHTML = html`<p>${error}</p>`;
	}
}
