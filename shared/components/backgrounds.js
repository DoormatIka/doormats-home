/**
 * @param {Array<Element>} cursors
 */
function showCursors(cursors) {
	for (const cursor of cursors) {
		cursor.classList.remove("hide");
	}
}

/**
 * @param {Array<Element>} cursors
 */
function hideCursors(cursors) {
	for (const cursor of cursors) {
		cursor.classList.add("hide");
	}
}

/**
 * @param {string} src
 */
async function createBackgroundStage(src) {
	const umbrellaBg = document.getElementById("umbrella-background");
	if (!umbrellaBg) {
		console.warn("No #umbrella-background found in DOM!");
		return () => {};
	}

	const cursors = Array.from(document.getElementsByClassName("cursor"));
	umbrellaBg.classList.remove("loaded");

	const img = new Image();

	await new Promise((resolve) => {
		if (img.complete) {
			resolve();
		} else {
			img.addEventListener("load", resolve, { once: true });
			img.addEventListener("error", resolve, { once: true }); // don't hang on broken img
		}
		img.src = src;
	});

	requestAnimationFrame(() => umbrellaBg.classList.add("loaded"));
	hideCursors(cursors);
	umbrellaBg.replaceChildren(img);

	return () => {
		umbrellaBg.classList.remove("loaded");
		showCursors(cursors);
	};
}

export const stages = {
	shrine: async () =>
		await createBackgroundStage("/shared/images/shrine/ufo-stage1.webp"),
	youmu: async () =>
		await createBackgroundStage(
			"/shared/images/shrine/Perfect Cherry Blossom - Stage 5 Background.webp",
		),
};
