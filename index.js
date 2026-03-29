// derived from https://github.com/frentsel/eRouter/blob/master/eRouter.js
// thank you!

import { HashRouter } from "/shared/components/router.js";
import { positionScrollbar } from "/shared/components/scrollbar.js";

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
 */
export function loadHTMLFile(path) {
	return new Promise((res, rej) => {
		fetch(path)
			.then((resp) => {
				if (!resp.ok) {
					rej(`Cannot load HTML file: "${path}"!`);
				}
				isFileInRoutes(path)
					.then((isFile) => {
						if (!isFile) {
							rej(`HTML file does not exist in routes.`);
						}
						resp.text().then((v) => res(v));
					})
					.catch(rej);
			})
			.catch(rej);
	});
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
			const path = ["pages", page, ...cutParams, file].join("/");
			const html = await loadHTMLFile(path);
			shell.innerHTML = html; // unsafe! please sanitize this beforehand.
		} catch (err) {
			shell.innerHTML = formatErrors(err);
		}
		positionScrollbar();
	};
}

/**
 * @returns {import("/shared/components/router.js").RouteFunction}
 */
function notFound() {
	return async (shell, _) => {
		shell.innerHTML = makeLoadingDiv();
		try {
			const html = await loadHTMLFile("/pages/notFound/index.html");
			shell.innerHTML = html;
		} catch (err) {
			shell.innerHTML = formatErrors(err);
		}
		positionScrollbar();
	};
}

const router = new HashRouter();

router.add("index", pageRoute("room", "room.html"));
router.add("about", pageRoute("about"));
router.add("shrine", pageRoute("shrine"));
router.add("todo", pageRoute("todo"));
router.add("notFound", notFound());

router.addAfterHook(async (_, __, uri) => {
	const shell = document.querySelector("[data-breadcrumb]");
	if (!shell) return;

	// uri is something like "#/pictures/summer15/italy"
	const segments = uri.replace("#/", "").split("/").filter(Boolean);

	const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1);

	const items = [
		`<li><a href="#/">Home</a></li>`,
		...segments.map((segment, i) => {
			const href = "#/" + segments.slice(0, i + 1).join("/");
			const label = capitalize(segment);
			const isLast = i === segments.length - 1;

			if (isLast) {
				return `<li aria-current="page"><span class="coming-soon">${label}</span></li>`;
			}
			return `<li><a href="${href}">${label}</a></li>`;
		}),
	];

	shell.innerHTML = `
        <nav aria-label="breadcrumb">
            <ol class="breadcrumb">
                ${items.join("\n")}
            </ol>
        </nav>
    `;
});

/**
 * @param {any[]} arr
 */
function getRandomItem(arr) {
	const randomIndex = Math.floor(Math.random() * arr.length);
	const item = arr[randomIndex];
	return item;
}

router.addAfterHook(async () => {
	const shell = document.querySelector("[data-random]");
	if (!shell) return;

	const messages = [
		`
		<a
			href="https://www.youtube.com/watch?v=xIF0Me8j0dg"
			target="_blank"
			rel="noopener noreferrer"
		>Bubble pop, electric.</a>`,
		`
		<a
			href="https://www.youtube.com/watch?v=xIF0Me8j0dg"
			target="_blank"
			rel="noopener noreferrer"
		>Who the heck is Naoya?</a>`,
		`
		<a 
			href="https://www.youtube.com/watch?v=ddQ7YR0qQSo"
			target="_blank"
			rel="noopener noreferrer"
	 	>our brains are WEEEIII!!</a>`,
		`
		<a
			href="https://www.youtube.com/watch?v=7h7bnYA1LXE",
			target="_blank"
			rel="noopener noreferrer"
		>she's so funky!</a>`,
		`
		<a
			href="https://www.youtube.com/watch?v=qMCWZ8Pay9w",
			target="_blank"
			rel="noopener noreferrer"
		>she's so merengue...</a>`,
		`
		<a
			href="https://mcsrranked.com/stats/yuyuqk",
			target="_blank"
			rel="noopener noreferrer"
		>hop on mcsr ranked.</a>`,
	];

	shell.innerHTML = getRandomItem(messages);
});

router.activate();
