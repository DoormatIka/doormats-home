

export async function onJoin() {
	const time = setTimeout(() => console.log("heyaa!!"), 3000);

	return () => {
		clearTimeout(time);
	}
}

