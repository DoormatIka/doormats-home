
// derived from https://github.com/frentsel/eRouter/blob/master/eRouter.js
// thank you!
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
class HashRouter {
	constructor() {
		this._hash = "#/";
		this._routes = {};
	}
	/**
		* @param {string} route - The route of the website.
		* @param {function(Element, string[]): Promise} fn - Runs this function when it's on route.
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
	_onHashChange() {
		let uri = window.location.hash;
		let params;

		if (uri.indexOf(this._hash) === -1)
			return window.location.hash = this._hash;

		uri = cleanRoutes(uri);
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
		
		this._routes[hashRoute].apply(this, [shell, params]);
	}
	set(path) {
		// get previous path.
		window.location.hash = this._hash + path;
	}
}

// to dos: 
// - local route CSS takes precedence over global CSS
// - race conditions when the user clicks through links fast
//     - if the id is not 
// - eventListeners from previous JS routes persists. 
// 		add an exported join and clean up function per JS file.
// 		keep track of previous and current functions in the hash router.
/*
export func join() {
	return clean() {}
}	
*/

function cleanRoutes(route) {
	if (typeof route !== "string")
		throw new Error("route is not a string.");

	return route.replace(/^#\/*/, "")
		.replace(/\/+/g, "/");
}

/**
	* Loads file into text.
	* @param {string} path 
	*/
function loadFile(path) {
	return new Promise((res, rej) => {
		fetch(path)
			.then(resp => {
				if (!resp.ok) {
					rej(`Cannot load HTML file: "${path}"!`)
				}
				res(resp.text());
			})
			.catch(err => rej(err));
	})
}

function loadFileIntoHTML(shell, path) {
	loadFile(path)
		.then(res => setInnerHTML(shell, res));
}

/**
	* Runs JS in an element.
	* Please do not use this in user facing code.
	* 
	* @param {Element} elm 
	*/
function runJSinElement(elm) {
	for (const oldScriptEl of elm.querySelectorAll("script")) {
		// const newScriptEl = document.createElement("script");

		for (const attr of oldScriptEl.attributes) {
			if (attr.name === "src") {
				if (!attr.value.includes(".js"))
					continue;
				console.log(attr);
				
				import(/* @vite-ignore */ attr.value) 
					.then(v => v.onJoin())
					.catch(err => console.log(err));
			}

			// newScriptEl.setAttribute(attr.name, attr.value);
		}

		/*
		const scriptText = document.createTextNode(oldScriptEl.innerHTML);
		newScriptEl.appendChild(scriptText);

		oldScriptEl.parentNode.replaceChild(newScriptEl, oldScriptEl);
		*/
	}
}


// todo: make runJSinElement run *after* everything is done in this closure.
// please just use async/await, its supported in all browsers newer than 2017.
const router = new HashRouter();
router.add("index", (shell, params) => {
	shell.innerHTML = makeLoadingDiv();

	return new Promise((res, rej) => {
		loadFile("/pages/room/room.html")
			.then(s => {
				shell.innerHTML = s;
				runJSinElement(shell);
			})
			.catch(err => {
				shell.innerHTML = formatErrors(err);
			});
	})

});
router.add("about", (shell, params) => {
	shell.innerHTML = makeLoadingDiv();
	loadFile("/pages/about/index.html")
		.then(s => {
			shell.innerHTML = s;
			// runJSinElement(shell);
		})
		.catch(err => shell.innerHTML = formatErrors(err));

	console.log(shell);

	
});
router.activate();

function makeLoadingDiv() {
	return `<p>Loading…</p>`;
}
function formatErrors(err) {
	return `<p>An error occurred. ${err}</p>`;
}
