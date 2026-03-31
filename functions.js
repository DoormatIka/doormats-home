function onMaximize() {
	const toResize = [
		...document.querySelectorAll(".big-box"),
		...document.querySelectorAll(".nav"),
	];
	const btn = document.querySelector("#maximize-btn");
	for (const div of toResize) {
		const t = div.classList.toggle("max");
		if (t) {
			btn.innerHTML = "MMM";
		} else {
			btn.innerHTML = "---";
		}
	}
}

const btn = /** @type {HTMLButtonElement?} */ (
	document.querySelector("#maximize-btn")
);
btn?.addEventListener("click", onMaximize);
