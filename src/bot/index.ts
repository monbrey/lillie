import { readdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import { pathToFileURL } from "node:url";
import { parseArgs } from "node:util";
import { Client, GatewayIntentBits } from "@discordjs/core";
import { REST } from "@discordjs/rest";
import { WebSocketManager } from "@discordjs/ws";
import { deployCommands } from "./deploy-commands.js";

if (!process.env.DISCORD_TOKEN) {
	throw new Error("Please set the DISCORD_TOKEN environment variable first.");
}

const args = parseArgs({
	options: {
		deploy: {
			type: "boolean",
			short: "d",
		},
	},
});

const rest = new REST().setToken(process.env.DISCORD_TOKEN);

if (args.values.deploy) {
	await deployCommands(rest);
}

const gateway = new WebSocketManager({
	token: process.env.DISCORD_TOKEN,
	intents: GatewayIntentBits.Guilds | GatewayIntentBits.GuildMessages | GatewayIntentBits.MessageContent | GatewayIntentBits.GuildMessageReactions,
	rest,
});

const client = new Client({
	rest,
	gateway,
});

const event_files = await readdir(join(dirname(process.argv[1]), "events")).then((dir) => dir.filter((file) => file.endsWith(".js")));
for (const file of event_files) {
	const { name, execute } = await import(pathToFileURL(join(dirname(process.argv[1]), "events", file)).href);
	client.on(name, execute);
}

void gateway.connect();
