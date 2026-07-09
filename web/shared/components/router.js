/**
 * @callback RouteFunction
 * @param {Element} el - The shell element.
 * @param {string[]} params
 * @param {string} uri
 * @returns {Promise<any>}
 */

/**
 * @callback OnJoinFunction
 * @returns {Promise<() => Promise<void>>}
 */

/**
	* The router that handles hash-based routes.
	* ```js
	* const router = new HashRouter();
	* router.add("/route", (shellHTML, params) => {
		shellHTML.innerHTML = "<h1>Hello!</h1>"
	* ])
	* ```
	* `shell` - the developer can inject HTML in.
	* `params` - extra parameters from the route
	* Note: Any hash gets intercepted by this router, please use with caution.
	*
	* Special routes: `index` for the root route. `notFound` for an unknown route.
	*/
export class HashRouter {
	constructor() {
		/**
		 * The hash to be used in the website.
		 * @type {string}
		 */
		this._hash = "#/";
		/**
		 *
		 * @type {{ [key: string]: RouteFunction }}
		 */
		this._routes = {};
		/**
		 *
		 * @type {RouteFunction[]}
		 */
		this._afterHooks = [];
		/**
		 *
		 * @type {Array<() => Promise<void>>}
		 */
		this._previousPageCleanupFunction = [];
	}
	/**
	 * @param {string} route - The route of the website.
	 * @param {RouteFunction} fn - Runs this function when it's on route.
	 */
	add(route, fn) {
		this._routes[route] = fn;
		return this;
	}
	/**
	 * @param {RouteFunction} fn - Runs this function when that mode is reached.
	 */
	addAfterHook(fn) {
		this._afterHooks.push(fn);
		return this;
	}
	activate() {
		window.addEventListener("hashchange", () => this._onHashChange(), false);
		document.addEventListener("DOMContentLoaded", () => {
			// handles switching from normal route to hash route
			const isSpa = document.querySelector("[data-router]") !== null;
			if (isSpa) {
				if (!window.location.hash) {
					window.location.hash = "#/";
				}
				this._onHashChange();
			}
		});
	}
	/**
	 * @param {string} uri
	 * @returns {{ hashRoute: string, params: string[], cleanedUri: string }}
	 */
	_resolveRoute(uri) {
		const cleaned = cleanRoute(uri);
		const segment = cleaned.split(this._hash).pop();

		if (!segment || segment.length === 0) {
			return { hashRoute: "index", params: [], cleanedUri: cleaned };
		}

		if (segment.indexOf("/") === -1) {
			const hashRoute = this._routes[segment] ? segment : "notFound";
			return { hashRoute, params: [], cleanedUri: cleaned };
		}

		const parts = segment.split("/");
		const hashRoute = parts.shift();
		return {
			hashRoute: this._routes[hashRoute] ? hashRoute : "notFound",
			params: parts,
			cleanedUri: cleaned,
		};
	}
	async _onHashChange() {
		let uri = window.location.hash;

		await Promise.all(this._previousPageCleanupFunction.map((c) => c()));

		if (uri.indexOf(this._hash) === -1)
			return (window.location.hash = this._hash);

		const { hashRoute, params, cleanedUri } = this._resolveRoute(uri);

		const shell = document.querySelector("[data-router]");
		if (!shell) {
			console.warn("No [data-router] in HTML object found!");
			return;
		}
		if (!shell.classList.contains("shell")) {
			shell.classList.add("shell");
		}

		await this._routes[hashRoute].apply(this, [shell, params, cleanedUri]);

		this._previousPageCleanupFunction = await runJSinElement(shell);

		for (const hook of this._afterHooks) {
			hook(shell, params, cleanedUri).catch(console.error);
		}
	}
	/**
	 * @param {string} path
	 */
	set(path) {
		window.location.hash = this._hash + path;
	}
}

// to dos:
// - local route CSS should take precedence over global CSS

/**
 * @param {string} route
 */
function cleanRoute(route) {
	if (typeof route !== "string") throw new Error("route is not a string.");

	return route.replace(/^#\/*/, "").replace(/\/+/g, "/");
}

/**
 * Runs <script> elements inside an element by replacing them
 * so the browser executes them again.
 *
 * @param {Element} elm
 */
async function runJSinElement(elm) {
	const scripts = elm.querySelectorAll("script");
	/** @type {Array<() => Promise<void>>} */
	const cleanupFunctions = [];

	for (let i = 0; i < scripts.length; i++) {
		const oldScript = scripts[i];
		const isFileScript = oldScript.src;

		if (isFileScript) {
			cleanupFunctions.push(await handleExternalScript(oldScript));
		} else {
			executeInlineScript(oldScript);
		}
	}

	return cleanupFunctions;
}

/**
 * Handles external scripts from src.
 * Returns a cleanup function. TODO1: CONNECT THIS.
 *
 * @param {HTMLScriptElement} script
 * @returns {Promise<() => Promise<void>>}
 */
async function handleExternalScript(script) {
	const src = script.getAttribute("src");
	const defaultFn = async () => {};
	if (!src) return defaultFn;

	try {
		const mod = await import(/* @vite-ignore */ src);
		/** @type {OnJoinFunction | null} */
		const onJoin = mod?.onJoin;

		if (typeof onJoin === "function") {
			return await onJoin();
		}
	} catch (err) {
		console.error("Error importing", src, err);
	}

	return defaultFn;
}

/**
 * Handles inline scripts.
 *
 * @param {HTMLScriptElement} script
 */
function executeInlineScript(script) {
	const newScript = document.createElement("script");

	for (let i = 0; i < script.attributes.length; i++) {
		const { name, value } = script.attributes[i];
		newScript.setAttribute(name, value);
	}

	if (!new Boolean(script.dataset.nowarn)) {
		console.warn(
			"From the hash router: " +
				"Please do NOT put event listeners on inline scripts. " +
				"It will cause a memory leak. " +
				"Put them on JS files instead with onJoin().",
		);
	}

	newScript.textContent = script.textContent;
	script.replaceWith(newScript);
}
