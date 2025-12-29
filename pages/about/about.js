export async function onJoin() {
	const timeID = setTimeout(
		() => console.log("hii!! thank you for actually reading through this."),
		10_000,
	);
	return async () => {
		clearTimeout(timeID);
	};
}

/**
 * @param {string} msg
 * @param {number} time - in milliseconds
 */
function timer(msg, time) {
	return new Promise((res, _) => {
		setTimeout(() => res(msg), time);
	});
}
