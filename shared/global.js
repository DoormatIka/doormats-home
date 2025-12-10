
// fouc

// letting the CSS load first.
document.addEventListener("DOMContentLoaded", () => {
	document.fonts.ready.then(() => {
		document.documentElement.style.visibility = "visible"
	})
})
