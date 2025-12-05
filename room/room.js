
const room = "/room.html"
// derived from https://github.com/frentsel/eRouter/blob/master/eRouter.js
// thank you!
class HashRouter {
	constructor() {
		this.hash = "#/";
		this.routes = {};
	}
	add(route, fn) {
		this.routes[route] = fn;
	}
	onHashChange() {
		window.addEventListener("hashchange", this.onHashChangeInternal, false);
	}
	onHashChangeInternal() {
		// i need to handle normal paths with hash paths too.
		// e.g: localhost:8000/normalpath/#/hashroutetoo
		let uri = window.location.hash;
		let params;

		if (uri.indexOf(this.hash) === -1)
			return window.location.hash = this.hash;

		uri = uri.split(hash).pop();

		if (!uri.length) return this.routes.index();

		if (uri.indexOf('/') > -1) {
			params = uri.split('/');
			uri = params.shift();
		}

		if (!this.routes[uri])
			return this.routes.notFound(uri);
		this.routes[uri].apply(this, params);
	}
	set(path) {
		// get previous path.
		window.location.hash = this.hash + path;
	}
}
// read file from a .html file.
// use a loading screen when the page is still loading!
/*
document.addEventListener("DOMContentLoaded", () => {
	console.log("loaded router");
	HashRoute([
		{ 
			pathname: "home",
			element: () => {
				console.log("loading path / into router")
				const container = document.createElement("div");
				const loading = makeLoadingDiv();
				container.append(loading);

				console.log(`container made: ${container}`)

				fetch(room)
					.then(resp => {
						if (!resp.ok) {
							console.log("errored out: hii")
						}
						return resp.text();
					})
					.then(res => {
						container.innerHTML = res;
					})
					.catch(err => {
						container.innerHTML = `<h1>Error: ${err}</h1>`
						console.log(err);
					});

				return container;
			}
		}
	])
});
*/

function makeLoadingDiv() {
	const d = document.createElement("div");
	d.innerHTML = `<p>Loading…</p>`;
	return d;
}

// routeConfig
// https://github.com/jscodelover/vanilla-routing/blob/main/src/app/common/routeConfig.ts#L57
//
// hash routing example
// https://github.com/jscodelover/vanilla-routing/tree/main/example/hash-route
//
