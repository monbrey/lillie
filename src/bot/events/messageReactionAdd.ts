import type { APIEmbed, Client } from "@discordjs/core";
import { GatewayDispatchEvents } from "@discordjs/core";
import { messageLink } from "@discordjs/formatters";
import type { AsyncEventEmitterListenerForEvent } from "@vladfrangu/async_event_emitter";
import { getConfigForGuild } from "../../database/models/config.js";

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
	const star = emoji === config.board_emoji;
	const premium = emoji === config.premium_emoji;
	if (!star && !premium) return;

	// Set the props for writing to a starboard
	const target_channel = premium ? config.premium_channel_id : config.board_channel_id;
	const threshold = premium ? config.premium_threshold : config.board_threshold;
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

	if (attachments.length) {
		for (const att of attachments) {
			embeds.push({ url: messageLink(data.channel_id, data.message_id), image: { url: att.url } })
		}
	}

	// if (row.sb_channel_id && row.sb_message_id) {
	// 	await api.channels.editMessage(row.sb_channel_id, row.sb_message_id, { embeds });
	// } else {
	const sb = await api.channels.createMessage(target_channel, { embeds });
	// const stmnt = db.prepare("UPDATE starred_messages SET sb_channel_id = ?, sb_message_id = ? WHERE message_id = ?");
	// stmnt.run(sb.channel_id, sb.id, data.message_id);
	// }
};