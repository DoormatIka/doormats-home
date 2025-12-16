
// derived from https://github.com/frentsel/eRouter/blob/master/eRouter.js
// thank you!

import { HashRouter } from "/shared/components/router.js";
import { resizeScrollbar, positionScrollbar } from "/shared/components/scrollbar";

/**
	* Loads file into text.
	* @param {string} path 
	*/
export function loadFile(path) {
	return new Promise((res, rej) => {
		fetch(path)
			.then(resp => {
				if (!resp.ok) {
					rej(`Cannot load HTML file: "${path}"!`)
				}
				// this returns true for any path put into it, oh my god.
				res(resp.text());
			})
			.catch(err => rej(err));
	})
}

////////// APP CODE HERE ///////////

function makeLoadingDiv() {
	return `<span class="coming-soon">Loading…</span>`;
}
/**
	* @param {string} err 
	*/
function formatErrors(err) {
	return `<p>An error occurred. ${err}</p>`;
}

/**
	* @param {string} page 
	* @param {number} [maxDepth=2] 
	* @param {string} [file="index.html"] 
	* @returns {import("/shared/components/router.js").RouteFunction}
	*/
function pageRoute(page, file = "index.html", maxDepth = 2) {
	return async (shell, params) => {
		shell.innerHTML = makeLoadingDiv();
		try {
			const cutParams = params.slice(0, maxDepth);
			const path = ["pages", page, ...cutParams, file].join("/")
			console.log(path);
			const html = await loadFile(path);
			console.log(html);
			shell.innerHTML = html;
		} catch (err) {
			shell.innerHTML = formatErrors(err);
		}

		resizeScrollbar();
		positionScrollbar();
	}
}

const router = new HashRouter();

router.add("index", pageRoute("room", "room.html"));
router.add("about", pageRoute("about"));
router.add("shrines", pageRoute("shrines"));
router.add("todo", pageRoute("todo"));
router.add("notFound", pageRoute("notFound"));

router.activate();

