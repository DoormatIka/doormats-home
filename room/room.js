
import { HashRoute } from "vanilla-routing";

const room = "/index.html"
// read file from a .html file.
// use a loading screen when the page is still loading!
document.addEventListener("DOMContentLoaded", () => {
	HashRoute([
		{ 
			"pathname": "/room",
			element: () => {}
		}
	])
});

// routeConfig
// https://github.com/jscodelover/vanilla-routing/blob/main/src/app/common/routeConfig.ts#L57
//
// hash routing example
// https://github.com/jscodelover/vanilla-routing/tree/main/example/hash-route
//
