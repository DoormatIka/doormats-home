
/**
	* @callback RouteFunction
	* @param {Element} el
	* @param {string[]} params
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
	activate() {
		window.addEventListener("hashchange", () => this._onHashChange(), false);
		document.addEventListener("DOMContentLoaded", () => {
			console.log("dom content loaded.")
			// handles switching from normal route to hash route
			const isSpa = document.querySelector("[data-router]") !== null
			if (isSpa) {
				console.log("is spa page!")
				if (!window.location.hash) {
					window.location.hash = "#/"
				}
				this._onHashChange();
			}
		})
	}
	async _onHashChange() {
		let uri = window.location.hash;
		let params;

		await Promise.all(this._previousPageCleanupFunction.map(c => c()));

		if (uri.indexOf(this._hash) === -1)
			return window.location.hash = this._hash;

		uri = cleanRoute(uri);
		let hashRoute = uri.split(this._hash).pop();

		if (hashRoute.length <= 0) 
			hashRoute = "index";
		if (!this._routes[hashRoute]) 
			hashRoute = "notFound";

		if (hashRoute.indexOf('/') > -1) {
			params = hashRoute.split('/');
			hashRoute = params.shift();
		}

		const shell = document.querySelector("[data-router]");
		if (!shell) {
			console.warn("No [data-router] in HTML object found!")
		}
		if (!shell.classList.contains("shell")) {
			shell.classList.add("shell");
		}
		
		await this._routes[hashRoute].apply(this, [shell, params]);
		
		this._previousPageCleanupFunction = await runJSinElement(shell);
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
	if (typeof route !== "string")
		throw new Error("route is not a string.");

	return route.replace(/^#\/*/, "")
		.replace(/\/+/g, "/");
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

    for (const oldScript of scripts) {
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
    if (!src) 
		return defaultFn;

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

    for (const { name, value } of script.attributes) {
        newScript.setAttribute(name, value);
    }

	if (!new Boolean(script.dataset.nowarn)) {
		console.warn("From the hash router: " +
			"Please do NOT put event listeners on inline scripts. " +
			"It will cause a memory leak. " +
			"Put them on JS files instead with onJoin()."
		)
	}

    newScript.textContent = script.textContent;
    script.replaceWith(newScript);
}
