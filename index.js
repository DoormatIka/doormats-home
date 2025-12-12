
// derived from https://github.com/frentsel/eRouter/blob/master/eRouter.js
// thank you!

import { HashRouter } from "/shared/components/router.js";

/**
	* Loads file into text.
	* @param {string} path 
	*/
export function loadFile(path) {
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

////////// APP CODE HERE ///////////

function makeLoadingDiv() {
	return `<span class="coming-soon">Loading… <p style="color: red">Please enable JS.<p></span>`;
}
function formatErrors(err) {
	return `<p>An error occurred. ${err}</p>`;
}

const router = new HashRouter();
router.add("index", async (shell, params) => {
	shell.innerHTML = makeLoadingDiv();
	try {
		const html = await loadFile("/pages/room/room.html")
		shell.innerHTML = html;
	} catch (err) {
		shell.innerHTML = formatErrors(err);
	}

});
router.add("about", async (shell, params) => {
	shell.innerHTML = makeLoadingDiv();
	try {
		const html = await loadFile("/pages/about/index.html")
		shell.innerHTML = html;
	} catch (err) {
		shell.innerHTML = formatErrors(err);
	}
});
router.add("shrines", async (shell, params) => {
	shell.innerHTML = makeLoadingDiv();
	try {
		const html = await loadFile("/pages/shrines/shrines.html")
		shell.innerHTML = html;
	} catch (err) {
		shell.innerHTML = formatErrors(err);
	}
});
router.activate();

