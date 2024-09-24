import type { APIContextMenuInteraction, APIMessageApplicationCommandInteraction, Client } from "@discordjs/core";
import { ApplicationCommandType, GatewayDispatchEvents, InteractionType } from "@discordjs/core";
import type { AsyncEventEmitterListenerForEvent } from "@vladfrangu/async_event_emitter";
import { isChatInputApplicationCommandInteraction } from "discord-api-types/utils";
import { handleChatInputCommand } from "../handlers/chatInputCommand.js";
import { handleMessageContextMenuCommand } from "../handlers/messageContextMenuCommand.js";

const isMessageContextMenuApplicationCommandInteraction = (interaction: APIContextMenuInteraction): interaction is APIMessageApplicationCommandInteraction =>
	interaction.data.type === ApplicationCommandType.Message;

export const name = GatewayDispatchEvents.InteractionCreate;
export const execute: AsyncEventEmitterListenerForEvent<Client, typeof name> = async ({ data, api }) => {
	switch (data.type) {
		case InteractionType.Ping:
			break;
		case InteractionType.ApplicationCommand:
			if (isChatInputApplicationCommandInteraction(data))
				await handleChatInputCommand(api, data);
			else if (isMessageContextMenuApplicationCommandInteraction(data))
				await handleMessageContextMenuCommand(api, data)
			break;
		case InteractionType.MessageComponent:
			// await Handlers.messageComponentInteraction(api, data);
			break;
		case InteractionType.ApplicationCommandAutocomplete:
			// await handleApplicationCommandAutocompleteInteraction(api, data);
			break;
		case InteractionType.ModalSubmit:
			// await handleModalSubmitInteraction(api, data);
			break;
	}
}