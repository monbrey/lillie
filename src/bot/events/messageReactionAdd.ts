import type { APIEmbed, Client } from "@discordjs/core";
import { GatewayDispatchEvents } from "@discordjs/core";
import { messageLink } from "@discordjs/formatters";
import type { AsyncEventEmitterListenerForEvent } from "@vladfrangu/async_event_emitter";
import { getConfigForGuild } from "../../database/models/config.js";
import type { Star } from "../../database/models/stars.js";
import { createStar, getStarBySourceId, incrementScoreForStar } from "../../database/models/stars.js";

export const name = GatewayDispatchEvents.MessageReactionAdd;
export const execute: AsyncEventEmitterListenerForEvent<Client, typeof name> = async ({ data, api }) => {
	// Ignore DMs
	if (!data.guild_id) return;

	// Fetch and validate configuration exists
	const config = await getConfigForGuild(data.guild_id);
	if (!config) return;

	// Extract reaction emoji from the data (id for custom, name for unicode)
	const emoji = data.emoji.id ?? data.emoji.name;

	// Check if this emoji matches the config
	const star = emoji === config.standard_emoji;
	const premium = emoji === config.gold_emoji;
	if (!star && !premium) return;

	// Set the props for writing to a starboard
	const target_channel = premium ? config.gold_channel_id : config.standard_channel_id;
	const threshold = premium ? config.gold_threshold : config.standard_threshold;
	if (!target_channel) return;

	// Fetch the message details
	const { attachments, author, content, reactions } = await api.channels.getMessage(data.channel_id, data.message_id);

	// Check if the reaction count exceeds the threshold
	const count = reactions?.find(reac => (reac.emoji.id ?? reac.emoji.name) === emoji)?.count ?? 0;
	if (count < threshold) return;

	// Draft the embed
	const embeds: APIEmbed[] = [{
		author: {
			name: `${author.username}  |  ${count}${emoji}`,
			icon_url: author.avatar ? api.rest.cdn.avatar(author.id, author.avatar, { forceStatic: true }) : undefined,
		},
		color: 0xf1c40f, // Gold
		description: content,
		fields: [{
			name: "Link to message",
			value: messageLink(data.channel_id, data.message_id)
		}],
		timestamp: new Date().toISOString(),
		url: messageLink(data.channel_id, data.message_id)
	}];

	// Map attachments, using the embed multi-image trick
	if (attachments.length) {
		for (const att of attachments) {
			switch (att.content_type) {
				case 'image':
					embeds.push({ url: messageLink(data.channel_id, data.message_id), image: { url: att.url } });
					break;
				default:
					break;
			}
		}
	}

	// Check if this message already exists on a starboard
	const db_star = await getStarBySourceId(data.message_id);

	try {
		if (db_star) {
			// Update the existing message
			await api.channels.editMessage(db_star.board_channel_id, db_star.board_message_id, { embeds });
			await incrementScoreForStar(db_star.message_id, premium);
		} else {
			// Post and record a new message to the starboard
			const star_message = await api.channels.createMessage(target_channel, { embeds });
			const star_data: Star = {
				author_id: author.id,
				board_channel_id: target_channel,
				board_message_id: star_message.id,
				channel_id: data.channel_id,
				guild_id: data.guild_id,
				message_id: data.message_id,
				premium_score: premium ? count : 0,
				score: premium ? 0 : count
			};
			await createStar(star_data);
		}
	} catch (error) {
		console.error(error);
	}
};