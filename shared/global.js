
import { HashRoute } from "vanilla-routing";

const room = "../room/room.html"
// read file from a .html file.
// use a loading screen when the page is still loading!
document.addEventListener("DOMContentLoaded", () => {
	HashRoute([
		{ 
			pathname: "/",
			element: async () => {
				const container = document.createElement("div");
				const loading = makeLoadingDiv();
				container.append(loading);

				fetch(room)
					.then(resp => {
						if (!resp.ok) {
							throw new Error("Response!");
						}
						return resp.text();
					})
					.then(res => {
						container.innerHTML = res;
					})
					.error(err => {
						container.innerHTML = `<h1>Error: ${err}</h1>`
					})

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
