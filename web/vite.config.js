import { defineConfig } from "vite";
import { writeManifestToFile } from "./cli/createManifest.js";

/**
 * @type {() => import("vite").Plugin}
 */
function manifestFunction() {
	return {
		name: "manifest",
		handleHotUpdate(ctx) {
			writeManifestToFile();
		},
	};
}

export default defineConfig({
	appType: "spa",
	plugins: [manifestFunction()],
});
