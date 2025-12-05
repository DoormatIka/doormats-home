
import { HashRoute } from "vanilla-routing";

const room = "/room.html"
// read file from a .html file.
// use a loading screen when the page is still loading!
document.addEventListener("DOMContentLoaded", () => {
	console.log("loaded router");
	HashRoute([
		{ 
			pathname: "home/",
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
