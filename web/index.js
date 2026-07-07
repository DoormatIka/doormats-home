// derived from https://github.com/frentsel/eRouter/blob/master/eRouter.js
// thank you!

import { HashRouter } from "/shared/components/router.js";
import { positionScrollbar } from "/shared/components/scrollbar.js";
import { parseHTML } from "./shared/misc.js";

/**
 * @typedef {"NetworkError" | "DoesNotExist"} PageError
 */
// Welcome to the website! This file is filled with router code.
//
// Some important comments about the code:
// These workarounds are only to detect routes that do not have a .html reliably.
// Due to fetch() mirroring the current index.html
//         when it can't find the requested file,
//         I'm forced to make messy workarounds.
// Of course, I can rework the router to depend on manifest.json,
//         to move the routing from client-side to the build step.
// However, I'd like to focus on the design of the website first.

/** @type {string[]} */
let pagesManifest;
/**
 * A very ad-hoc patch to detect if a file is in a route or not.
 * This is not for security purposes.
 * Please do not solely use this, have a reverse proxy to avoid path traversal attacks.
 *
 * Not a pure function.
 *
 * Details:
 * `cli/createManifest.js` gets called by Vite on dev time. A function there
 * 	writes to `manifest.json` that contains every navigatable route in `/routes`
 * This function grabs routes from there and compares it to the filepath.
 *
 * @param {string} filepath - include the full directory of this please
 * @returns {Promise<boolean>}
 */
async function isFileInRoutes(filepath) {
	if (!pagesManifest) {
		const v = await fetch("/manifest.json");
		const text = await v.text();
		/** @type {string[]} */
		pagesManifest = JSON.parse(text);
	}
	const splitPath = filepath.split("/").filter(Boolean);
	for (const p of pagesManifest) {
		const spl = p.split("/").filter(Boolean);
		if (arraysMatch(spl, splitPath)) return true;
	}
	return false;
}

/**
 * @param {string[]} arr1
 * @param {string[]} arr2
 */
function arraysMatch(arr1, arr2) {
	if (arr1.length !== arr2.length) {
		return false;
	}
	return arr1.every((element, index) => {
		return element === arr2[index];
	});
}

/**
 * Loads file into text.
 * @param {string} path
 * @returns {Promise<string>}
 */
export function loadHTMLFile(path) {
	return new Promise(
		/** @param {function(PageError): void} rej */ (res, rej) => {
			fetch(path)
				.then((resp) => {
					if (!resp.ok) {
						rej("NetworkError");
					}
					isFileInRoutes(path)
						.then((isFile) => {
							if (!isFile) {
								rej("DoesNotExist");
							}
							resp.text().then((v) => res(v));
						})
						.catch(rej);
				})
				.catch(rej);
		},
	);
}

////////// APP CODE HERE ///////////

function makeLoadingDiv() {
	return `<span class="coming-soon">Loading…</span>`;
}
/**
 * @param {PageError} err
 */
function formatErrors(err) {
	let formattedError = "";
	switch (err) {
		case "NetworkError":
			formattedError = "Can't contact the server!";
			break;
		case "DoesNotExist":
			formattedError = "This page does not exist!";
			break;
		default:
			break;
	}
	return formattedError;
}

/**
 * @param {string} errMessage
 * @returns {Promise<Document>}
 */
async function getNotFoundHTML(errMessage) {
	const parser = new DOMParser();

	const html = await loadHTMLFile("/pages/notFound/index.html");
	const doc = parser.parseFromString(html, "text/html");
	const dataErr = doc.querySelector("[data-error]");
	dataErr.textContent = errMessage;

	return doc;
}

/**
 * @param {string} page
 * @param {{ file?: string, maxDepth?: number }} [options={ file="index.html", maxDepth=2 }]
 * @returns {import("/shared/components/router.js").RouteFunction}
 */
function pageRoute(page, options = { file: "index.html", maxDepth: 2 }) {
	const { file, maxDepth } = options;
	return async (shell, params) => {
		shell.innerHTML = makeLoadingDiv();
		try {
			const cutParams = params.slice(0, maxDepth);
			const path = ["pages", page, ...cutParams, file].join("/");
			const html = await loadHTMLFile(path);
			const doc = parseHTML(html);
			shell.replaceChildren(...doc.childNodes);
		} catch (err) {
			const documentObject = await getNotFoundHTML(formatErrors(err));
			shell.replaceChildren(...documentObject.body.childNodes);
		}
		positionScrollbar();
	};
}

/**
 * @param {string} file
 * @returns {Promise<import("/shared/components/router.js").RouteFunction>}
 */
async function grabHookFromFolder(file) {
	const hook = await import(file);
	const name = hook.name;
	const fn = hook.fn;

	return async (el, params, uri) => {
		const shell = document.querySelector(`[data-${name}]`);
		if (!shell) return;

		const nodes = parseHTML(await fn(el, params, uri)).children;
		for (const node of nodes) {
			shell.replaceChildren(node);
		}
	};
}

/**
 * @returns {import("/shared/components/router.js").RouteFunction}
 */
function notFound() {
	return async (shell) => {
		const doc = await getNotFoundHTML(formatErrors("DoesNotExist"));
		for (const node of doc.body.childNodes) {
			shell.appendChild(node);
		}
	};
}

const router = new HashRouter();

router.add("index", pageRoute("room", { file: "room.html" }));
router.add("about", pageRoute("about"));
router.add("shrine", pageRoute("shrine"));
router.add("todo", pageRoute("todo"));
router.add("notFound", notFound());

/**
 * @param {string} folder
 * @param {string[]} files
 */
function addAllHooks(folder, files) {
	for (const file of files) {
		grabHookFromFolder(folder + file)
			.then((c) => router.addAfterHook(c))
			.catch(console.error);
	}
}
addAllHooks("/shared/components/hooks/", [
	"breadcrumbs.js",
	"random.js",
	"ping.js",
]);

router.activate();
