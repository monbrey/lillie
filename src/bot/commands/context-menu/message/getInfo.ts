import { inspect } from "node:util";
import type { API, APIMessageApplicationCommandInteraction, RESTPostAPIContextMenuApplicationCommandsJSONBody } from '@discordjs/core';
import { ApplicationCommandType, ApplicationIntegrationType } from '@discordjs/core';

export const data: RESTPostAPIContextMenuApplicationCommandsJSONBody = {
	name: 'get-info',
	type: ApplicationCommandType.Message,
	integration_types: [ApplicationIntegrationType.UserInstall]
}

export const execute = async (api: API, interaction: APIMessageApplicationCommandInteraction) => {
	await api.interactions.reply(interaction.id, interaction.token, {
		content: "Received",
		flags: 64
	});

	console.log(inspect(interaction.data.resolved.messages[interaction.data.target_id], { depth: 5 }))
}