

export async function onJoin() {
	const time = setTimeout(() => console.log("setTimeout."), 3000);

	return () => {
		console.log(`closed ID: ${time}`);
		clearTimeout(time);
	}
}

