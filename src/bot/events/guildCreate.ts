import type { Client } from "@discordjs/core";
import { GatewayDispatchEvents } from "@discordjs/core";
import type { AsyncEventEmitterListenerForEvent } from "@vladfrangu/async_event_emitter";
import { createConfigForGuild } from "../../database/models/config.js";

export const name = GatewayDispatchEvents.GuildCreate;
export const execute: AsyncEventEmitterListenerForEvent<Client, typeof name> = async ({ data }) => {
	try {
		await createConfigForGuild({ guild_id: data.id });
	} catch (error) {
		console.error(error);
	}
}