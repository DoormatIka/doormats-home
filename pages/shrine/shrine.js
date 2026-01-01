export async function onJoin() {
	const umbrellaBg = document.getElementById("umbrella-background");
	umbrellaBg.classList.remove("loaded");

	const img = new Image();
	img.id = "img-bg";
	img.src = "/shared/images/shrine/ufo-stage1.webp";

	const onLoad = () => {
		requestAnimationFrame(() => {
			umbrellaBg.classList.add("loaded");
		});
	};

	img.addEventListener("load", onLoad, { once: true });
	if (img.complete) onLoad();

	umbrellaBg.replaceChildren(img);

	return async () => {
		umbrellaBg.classList.remove("loaded");
	};
}
