
// derived from https://github.com/frentsel/eRouter/blob/master/eRouter.js
// thank you!
class HashRouter {
	constructor() {
		this._hash = "#/";
		this._routes = {};
	}
	add(route, fn) {
		this._routes[route] = fn;
	}
	activateHashRouter() {
		window.addEventListener("hashchange", () => this.onHashChangeInternal(), false);
		document.addEventListener("DOMContentLoaded", () => {
			console.log("dom content loaded.")
			// handles switching from normal route to hash route
			const isSpa = document.querySelector("[data-router]") !== null
			if (isSpa) {
				console.log("is spa page!")
				if (!window.location.hash) {
					window.location.hash = "#/"
				}
				this.onHashChangeInternal();
			}
		})
	}
	onHashChangeInternal() {
		// i need to handle normal paths with hash paths too.
		// e.g: localhost:8000/normalpath/#/hashroutetoo
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
				if (!resp.ok)
					console.error(`Cannot load HTML file: "${path}"!`);
				res(resp.text());
			})
			.catch(err => rej(err));
	})
}

const router = new HashRouter();
router.add("index", (shell, params) => {
	shell.innerHTML = "<p>Loading.</p>"
	loadFile("/room/room.html")
		.then(s => shell.innerHTML = s)
		.catch(err => shell.innerHTML = "<p>An error occurred.</p>")
	console.log("is in index", shell, params);
});
router.add("about", (params) => {
	shell.innerHTML = "<p>Loading.</p>"
	/*
	loadFile("/about/index.html")
		.then(s => shell.innerHTML = s)
		.catch(err => shell.innerHTML = "<p>An error occurred.</p>")
	*/
	console.log("is in index", shell, params);
});
router.activateHashRouter();

function makeLoadingDiv() {
	const d = document.createElement("div");
	d.innerHTML = `<p>Loading…</p>`;
	return d;
}
