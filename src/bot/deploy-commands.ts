import { readdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import { pathToFileURL } from "node:url";
import { Routes } from "@discordjs/core";
import type { REST } from "@discordjs/rest";

export const deployCommands = async (rest: REST) => {
	if (!process.env.CLIENT_ID) {
		throw new Error("Please set the CLIENT_ID environment variable first.")
	}

	const files = await readdir(join(dirname(process.argv[1]), 'commands'), { recursive: true })
		.then(files => files.filter(file => file.endsWith('.js')))
		.then(files => files.map(async file => {
			const { data } = await import(pathToFileURL(join(dirname(process.argv[1]), 'commands', file)).href)
			return data;
		}));

	const body = await Promise.all(files);

	await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), { body });
}
