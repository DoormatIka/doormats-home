export async function onJoin() {
	const umbrellaBg = document.getElementById("umbrella-background");
	const cursors = Array.from(document.getElementsByClassName("cursor"));
	umbrellaBg.classList.remove("loaded");

	const img = new Image();
	img.src = "/shared/images/shrine/ufo-stage1.webp";

	const onLoad = () => {
		requestAnimationFrame(() => {
			umbrellaBg.classList.add("loaded");
		});
		hideCursors(cursors);
	};
	const onExit = async () => {
		umbrellaBg.classList.remove("loaded");
		showCursors(cursors);
	};

	if (img.complete) {
		onLoad();
	} else {
		img.addEventListener("load", onLoad, { once: true });
	}

	umbrellaBg.replaceChildren(img);

	return onExit;
}

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
