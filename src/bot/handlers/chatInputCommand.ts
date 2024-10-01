import { readdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import { pathToFileURL } from "node:url";
import type { API } from "@discordjs/core";
import type { APIChatInputApplicationCommandInteraction } from "discord-api-types/v10";

const command_path = join(dirname(process.argv[1]), 'commands', 'chat-input');
const command_files = await readdir(command_path).then(dir => dir.filter(file => file.endsWith('.js')));
const commands = new Map<string, (api: API, interaction: APIChatInputApplicationCommandInteraction) => Promise<void>>();

for (const file of command_files) {
	const { data, execute } = await import(pathToFileURL(join(command_path, file)).href);
	commands.set(data.name, execute);
}

export const handleChatInputCommand = async (api: API, interaction: APIChatInputApplicationCommandInteraction) => {
	const command = commands.get(interaction.data.name);
	if (!command) {
		await api.interactions.reply(interaction.id, interaction.token, { content: `No command \`${interaction.data.name} was found.\`` });
		return;
	}

	await command(api, interaction);
}