import { stages } from "/shared/components/backgrounds.js";

export async function onJoin() {
	const cleanup = await stages.shrine();
	return cleanup;
}
