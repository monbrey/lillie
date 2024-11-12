import type { Client } from "@discordjs/core";
import { GatewayDispatchEvents } from "@discordjs/core";
import type { AsyncEventEmitterListenerForEvent } from "@vladfrangu/async_event_emitter";
import { getConfigForGuild } from "../../database/models/config.js";
import { updateScoreForStar, updatePremiumScoreForStar, deleteStarBySourceId, getStarBySourceId } from "../../database/models/stars.js";

export const name = GatewayDispatchEvents.MessageReactionRemove;
export const execute: AsyncEventEmitterListenerForEvent<Client, typeof name> = async ({ data, api }) => {
	// Ignore DMs
	if (!data.guild_id) {
		return;
	}

	// Fetch and validate configuration exists for this guild
	const config = await getConfigForGuild(data.guild_id);
	if (!config) {
		return;
	}

	// Extract reaction emoji from the data (id for custom, name for unicode)
	const emoji = data.emoji.id ?? data.emoji.name;

	// Check if this emoji matches the config
	const star = emoji === config.standard_emoji;
	const gold = emoji === config.gold_emoji;
	if (!star && !gold) {
		return;
	}

	// Determine thje relevant threshold
	const threshold = gold ? config.gold_threshold : config.standard_threshold;

	// Fetch any existing record for this message
	const db_star = await getStarBySourceId(data.message_id);
	if (!db_star) {
		return;
	}

	// Fetch the source message details
	const { reactions, author } = await api.channels.getMessage(data.channel_id, data.message_id);

	// Fetch the target message's embed
	const { embeds } = await api.channels.getMessage(db_star.board_channel_id, db_star.board_message_id);

	// Get reaction count
	const count = reactions?.find((reac) => (reac.emoji.id ?? reac.emoji.name) === emoji)?.count ?? 0;

	try {
		if (count >= threshold) {
			// If reaction is still at or above the threshold, just do an update
			embeds[0].author = { name: `${author.username}  |  ${count}${emoji}` };
			await api.channels.editMessage(db_star.board_channel_id, db_star.board_message_id, { embeds });
			await (gold ? updatePremiumScoreForStar : updateScoreForStar)(db_star.message_id, count);
		} else {
			// Otherwise, delete the message and it's db record
			await api.channels.deleteMessage(db_star.board_channel_id, db_star.board_message_id);
			await deleteStarBySourceId(data.message_id);
		}
	} catch (error) {
		console.error(error);
	}
};
