
// THIS RUNS IN BUILD TIME //
import { readdirSync, writeFileSync } from "node:fs";

/**
	* @param {string} source 
	* @returns {string[]}
	*/
function getDirectories(source) {
	const allDirectories = [];

	for (const dir of readdirSync(source, { withFileTypes: true })) {
		if (!dir.isDirectory()) 
			continue;

		const directory = `${dir.parentPath}${dir.name}/`;
		const subDirs = getDirectories(directory);
		if (subDirs.length > 0) {
			allDirectories.push(...getDirectories(directory));
		}
		allDirectories.push(directory);
	}

	return allDirectories;
}

/**
	* @param {string[]} dirs
	*/
function getHTMLFiles(dirs) {
	const files = [];
	for (const inDir of dirs) {
		const items = readdirSync(inDir, { withFileTypes: true })
			.filter(v => v.isFile() && v.name.endsWith("html"));
		files.push(...items);
	}
	return files;
}

export function writeManifestToFile() {
	const dir = "pages/"
	const directories = getDirectories(dir);
	const files = getHTMLFiles(directories).map(v => `${v.parentPath}${v.name}`);
	console.log("refreshed manifest.json: ", files)

	writeFileSync("manifest.json", JSON.stringify(files, null, 4));
}


