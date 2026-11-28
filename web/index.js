// derived from https://github.com/frentsel/eRouter/blob/master/eRouter.js
// thank you!

import { HashRouter } from "/shared/components/router.js";
import { positionScrollbar } from "/shared/components/scrollbar.js";
import { parseHTML } from "./shared/misc.js";

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
//
// Run this on the reverse proxy with the Caddyfile provided!

export class PageError extends Error {
	/**
	 * @param {number} status
	 * @param {string} statusText
	 * @param {string | undefined} url
	 */
	constructor(status, statusText, url) {
		super(`HTTP ${status} ${statusText} — ${url}`);
		this.name = "PageError";
		this.status = status;
		this.statusText = statusText;
		this.url = url;
	}

	toString() {
		return `${this.statusText} on ${this.url}`;
	}

	get isNotFound() {
		return this.status === 404;
	}
}

/**
 * Fetches file from path/url then returns text.
 * @param {string} path
 * @returns {Promise<string>}
 */
export async function loadHTMLFile(path) {
	const resp = await fetch(path);
	if (!resp.ok) {
		throw new PageError(resp.status, resp.statusText, resp.url || path);
	}
	return resp.text();
}

////////// APP CODE HERE ///////////

function makeLoadingDiv() {
	return `<span class="coming-soon">Loading…</span>`;
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
	if (dataErr) {
		dataErr.textContent = errMessage;
	}

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
			/*
			if (!(await isFileInRoutes(path))) {
				throw Error("DoesNotExist");
			}
			*/
			const html = await loadHTMLFile(path);
			const doc = parseHTML(html);
			shell.replaceChildren(...doc.childNodes);
		} catch (/** @type {any} */ err) {
			const documentObject = await getNotFoundHTML(err.toString());
			shell.replaceChildren(...documentObject.body.childNodes);
		}
		positionScrollbar();
	};
}

/**
 * @returns {import("/shared/components/router.js").RouteFunction}
 */
function notFound() {
	return async (shell) => {
		const doc = await getNotFoundHTML("This page does not exist!");
		shell.replaceChildren(...doc.body.childNodes);
	};
}

const router = new HashRouter();

router.add("index", pageRoute("room", { file: "room.html" }));
router.add("about", pageRoute("about"));
router.add("shrine", pageRoute("shrine"));
router.add("todo", pageRoute("todo"));
router.add("notFound", notFound());

/** @param {string} file */
async function addHookFromFile(file) {
	const { name, fn } = await import(file);
	router.addHook(name, fn);
}

/**
 * @param {string} folder
 * @param {string[]} files
 */
function addAllHooks(folder, files) {
	return Promise.all(
		files.map((file) => addHookFromFile(folder + file).catch(console.error)),
	);
}

addAllHooks("/shared/components/hooks/", [
	"breadcrumbs.js",
	"random.js",
	"ping.js",
	"md.js",
	"sotd.js",
]).then(() => router.activate());
