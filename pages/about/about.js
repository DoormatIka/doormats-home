

export function onJoin() {
	console.log("from function");

	return () => {
		console.log("leaving route!")
	}
}
