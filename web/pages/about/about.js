export async function onJoin() {
	const timeID = setTimeout(
		() => console.log("hii!! thank you for actually reading through this."),
		10_000,
	);
	return async () => {
		clearTimeout(timeID);
	};
}
