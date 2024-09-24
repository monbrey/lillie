import type { Client } from "@discordjs/core";
import { GatewayDispatchEvents } from "@discordjs/core";
import type { AsyncEventEmitterListenerForEvent } from "@vladfrangu/async_event_emitter";

const prepareInsert = (col: string) =>
	`INSERT INTO starred_messages(message_id, channel_id, ${col}) VALUES (?, ?, 1) ON CONFLICT(message_id) DO UPDATE SET ${col} = ${col} - 1`

const prepareSelect = "SELECT * FROM starred_messages WHERE message_id = ?";

export const name = GatewayDispatchEvents.MessageReactionAdd;
export const execute: AsyncEventEmitterListenerForEvent<Client, typeof name> = async ({ data, api }) => {
	// const { attachments, author, content } = await api.channels.getMessage(data.channel_id, data.message_id);
	// const emoji = data.emoji.name ?? data.emoji.id ?? null;

	// if (!emoji || !Object.values(config.emoji).includes(emoji)) return;

	// const col = emoji === config.emoji.positive ? 'positive_count' : 'negative_count';
	// db.prepare(prepareInsert(col)).run(data.message_id, data.channel_id)

	// const row = db.prepare<unknown[], StarredMessageRow>(prepareSelect).get(data.message_id);
	// if (!row) throw new Error("Failed to insert row");

	// if (row.positive_count > config.threshold.positive) {
	// 	const embeds: APIEmbed[] = [{
	// 		author: {
	// 			name: `${author.username}  |  ${row.positive_count}${emoji}`,
	// 			icon_url: author.avatar ? api.rest.cdn.avatar(author.id, author.avatar, { forceStatic: true }) : undefined,
	// 		},
	// 		description: content,
	// 		fields: [{
	// 			name: "Link to message",
	// 			value: messageLink(data.channel_id, data.message_id)
	// 		}],
	// 		timestamp: new Date().toISOString(),
	// 		url: messageLink(data.channel_id, data.message_id)
	// 	}];

	// 	if (attachments.length) {
	// 		for (const att of attachments) {
	// 			embeds.push({ url: messageLink(data.channel_id, data.message_id), image: { url: att.url } })
	// 		}
	// 	}

	// 	if (row.sb_channel_id && row.sb_message_id) {
	// 		await api.channels.editMessage(row.sb_channel_id, row.sb_message_id, { embeds });
	// 	} else {
	// 		const sb = await api.channels.createMessage(config.channel.positive, { embeds });
	// 		const stmnt = db.prepare("UPDATE starred_messages SET sb_channel_id = ?, sb_message_id = ? WHERE message_id = ?");
	// 		stmnt.run(sb.channel_id, sb.id, data.message_id);
	// 	}
	// }
};