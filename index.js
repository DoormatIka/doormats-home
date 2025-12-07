
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

// Source - https://stackoverflow.com/a
// Posted by allenhwkim, modified by community. See post 'Timeline' for change history
// Retrieved 2025-12-08, License - CC BY-SA 4.0
/**
	* Embed HTML into an element, JS runs in this.
	* Please do not use this in user facing code.
	*/
function setInnerHTML(elm, html) {
  elm.innerHTML = html;
  
  Array.from(elm.querySelectorAll("script"))
    .forEach( oldScriptEl => {
      const newScriptEl = document.createElement("script");
      
      Array.from(oldScriptEl.attributes).forEach( attr => {
        newScriptEl.setAttribute(attr.name, attr.value) 
      });
      
      const scriptText = document.createTextNode(oldScriptEl.innerHTML);
      newScriptEl.appendChild(scriptText);
      
      oldScriptEl.parentNode.replaceChild(newScriptEl, oldScriptEl);
  });
}


const router = new HashRouter();
router.add("index", (shell, params) => {
	setInnerHTML(shell, makeLoadingDiv())
	loadFile("/pages/room/room.html")
		.then(s => setInnerHTML(shell, s))
		.catch(err => setInnerHTML(shell, `<p>An error occurred. ${err}</p>`))
	console.log("is in index", shell, params);
});
router.add("about", (shell, params) => {
	shell.innerHTML = makeLoadingDiv()
	loadFile("/pages/about/index.html")
		.then(s => setInnerHTML(shell, s))
		.catch(err => setInnerHTML(shell, `<p>An error occurred. ${err}</p>`))
	console.log("is in index", shell, params);
});
router.activate();

function makeLoadingDiv() {
	return `<p>Loading…</p>`;
}
