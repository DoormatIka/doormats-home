
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
		console.log("hash change event fired.")

		let uri = window.location.hash;
		let params;

		if (uri.indexOf(this._hash) === -1)
			return window.location.hash = this._hash;

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

const router = new HashRouter();
router.add("index", (shell, params) => {
	shell.innerHTML = makeLoadingDiv()
	loadFile("/pages/room/room.html")
		.then(s => shell.innerHTML = s)
		.catch(err => shell.innerHTML = `<p>An error occurred. ${err}</p>`)
	console.log("is in index", shell, params);
});
router.add("about", (shell, params) => {
	shell.innerHTML = makeLoadingDiv()
	loadFile("/pages/about/index.html")
		.then(s => shell.innerHTML = s)
		.catch(err => shell.innerHTML = `<p>An error occurred. ${err}</p>`)
	console.log("is in index", shell, params);
});
router.activate();

function makeLoadingDiv() {
	const d = document.createElement("div");
	d.innerHTML = `<p>Loading…</p>`;
	return d;
}
