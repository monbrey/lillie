import type { APIEmbed, Client } from "@discordjs/core";
import { GatewayDispatchEvents } from "@discordjs/core";
import { messageLink } from "@discordjs/formatters";
import type { AsyncEventEmitterListenerForEvent } from "@vladfrangu/async_event_emitter";
import { getConfigForGuild } from "../../database/models/config.js";
import { getLastGoldsForUser, insertGoldForUser } from "../../database/models/golds.js";
import { createStar, getStarBySourceId, incrementScoreForStar, type Star } from "../../database/models/stars.js";

export const name = GatewayDispatchEvents.MessageReactionAdd;
export const execute: AsyncEventEmitterListenerForEvent<Client, typeof name> = async ({ data, api }) => {
	// Ignore DMs
	if (!data.guild_id) {
		return;
	}

	// Fetch and validate configuration exists
	const config = await getConfigForGuild(data.guild_id);
	if (!config) {
		return;
	}

	// Extract reaction emoji from the data (id for custom, name for unicode)
	const emoji = data.emoji.id ?? data.emoji.name;
	if (!emoji) {
		console.error(`[${Date.now()}] ${name} | Reaction emoji data missing both id and name for ${data.channel_id}/${data.message_id}`);
		return;
	}

	// Check if this emoji matches the config
	if (![config.standard_emoji, config.gold_emoji].includes(emoji)) {
		return;
	}

	// Check if this is the gold emoji
	const gold = emoji === config.gold_emoji;

	// Check if this message already exists on a starboard
	const db_star = await getStarBySourceId(data.message_id);

	if (gold) {
		// If it's the gold emoji, check how many theyre entitled to
		const member = await api.guilds.getMember(data.guild_id, data.user_id);
		const quota = member.premium_since ? 2 : 1;
		// validate that the quota isnt exceeded by comparing dates
		const lastGold = await getLastGoldsForUser(data.user_id, quota);
		if (lastGold.length) {
			const dates = lastGold.map((gold) => new Date(gold.timestamp));
			const today = new Date();
			if (dates.every((date) => date.getFullYear() === today.getFullYear() && date.getMonth() === today.getMonth())) {
				// If the quota is exceeded, send a DM to the user
				try {
					const dm = await api.users.createDM(data.user_id);
					await api.channels.createMessage(dm.id, { content: "You've already used your gold reaction(s) this month. Try again next month!" });
					return;
				} catch (error) {
					// Probably a DM's closed error, need to review error codes
					console.log(error);
				}
			}
		} else {
			// Otherwise, record the gold reaction usage for future quota tracking
			await insertGoldForUser(data.user_id);
		}
	}

	// Set the target starboard props
	const target_channel = gold ? config.gold_channel_id : config.standard_channel_id;
	const threshold = gold ? config.gold_threshold : config.standard_threshold;
	if (!target_channel) {
		return;
	}

	// Fetch the message details
	const { attachments, author, content, reactions, embeds } = await api.channels.getMessage(data.channel_id, data.message_id);

	// Check if the reaction count exceeds the threshold
	const count = reactions?.find((reac) => (reac.emoji.id ?? reac.emoji.name) === emoji)?.count ?? 0;
	if (count < threshold) {
		return;
	}

	// Draft the embed
	const _embeds: APIEmbed[] = [
		{
			author: {
				name: `${author.username}  |  ${count}${emoji}`,
				icon_url: author.avatar ? api.rest.cdn.avatar(author.id, author.avatar, { forceStatic: true }) : undefined,
			},
			// Gold
			color: 0xF1C40F,
			description: content,
			fields: [
				{
					name: "Link to message",
					value: messageLink(data.channel_id, data.message_id),
				},
			],
			timestamp: new Date().toISOString(),
			url: messageLink(data.channel_id, data.message_id),
		},
	];

	// Map attachments, using the embed multi-image trick
	if (attachments.length) {
		for (const att of attachments) {
			switch (att.content_type) {
				case "image":
					_embeds.push({
						url: messageLink(data.channel_id, data.message_id),
						image: { url: att.url },
					});
					break;
				default:
					break;
			}
		}
	}

	try {
		if (db_star) {
			// Update the existing message
			await api.channels.editMessage(db_star.board_channel_id, db_star.board_message_id, { embeds: _embeds });
			await incrementScoreForStar(db_star.message_id, gold);
		} else {
			// Post and record a new message to the starboard
			const star_message = await api.channels.createMessage(target_channel, { embeds: _embeds });
			const star_data: Star = {
				author_id: author.id,
				board_channel_id: target_channel,
				board_message_id: star_message.id,
				channel_id: data.channel_id,
				guild_id: data.guild_id,
				message_id: data.message_id,
				premium_score: gold ? count : 0,
				score: gold ? 0 : count,
			};
			await createStar(star_data);
		}
	} catch (error) {
		console.error(error);
	}
};
