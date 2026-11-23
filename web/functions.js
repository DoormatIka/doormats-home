function onMaximize() {
	const btn = document.querySelector("#maximize-btn");
	if (btn === null) return;

	// decide the new state once, then apply it everywhere
	const isMax = !document.querySelector(".big-box")?.classList.contains("max");
	for (const el of document.querySelectorAll(".big-box, .nav")) {
		el.classList.toggle("max", isMax);
	}

	btn.setAttribute("aria-pressed", String(isMax));
	btn.setAttribute("aria-label", isMax ? "Restore window" : "Maximize window");
}

const btn = /** @type {HTMLButtonElement?} */ (
	document.querySelector("#maximize-btn")
);
btn?.addEventListener("click", onMaximize);
