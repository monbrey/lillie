import type { API, APIChatInputApplicationCommandGuildInteraction, APIUser, RESTPostAPIChatInputApplicationCommandsJSONBody, Snowflake } from "@discordjs/core";
import { ApplicationIntegrationType, InteractionContextType } from "@discordjs/core";
import { messageLink } from "@discordjs/formatters";
import { getTopAuthorsForGuild, getTopStarsForGuild } from "../../../database/models/stars.js";

export const data: RESTPostAPIChatInputApplicationCommandsJSONBody = {
	name: "top",
	description: "See the top posts and authors on the lilyboard",
	contexts: [InteractionContextType.Guild],
	integration_types: [ApplicationIntegrationType.GuildInstall],
};

export const execute = async (api: API, interaction: APIChatInputApplicationCommandGuildInteraction) => {
	// Defer while the fetching happens
	await api.interactions.defer(interaction.id, interaction.token);

	// Get the top lists by star count and author count
	const topPosts = await getTopStarsForGuild(interaction.guild_id);
	const topAuthors = await getTopAuthorsForGuild(interaction.guild_id);

	const users = new Map<Snowflake, APIUser>();

	const posts = await Promise.all(topPosts.map(async (star, index) => {
		const user = users.get(star.author_id) ?? await api.users.get(star.author_id);
		if (!users.has(star.author_id)) {
			users.set(star.author_id, user);
		}

		return `**${index + 1}.** ${messageLink(star.board_channel_id, star.board_message_id)} by ${user.username}  |  **${star.score} ⭐**`;
	}));

	const authors = await Promise.all(topAuthors.map(async (star, index) => {
		const user = users.get(star.author_id) ?? await api.users.get(star.author_id);
		if (!users.has(star.author_id)) {
			users.set(star.author_id, user);
		}

		return `**${index + 1}.** ${user.username} with **${star.score} ⭐**`;
	}));

	const embeds = [
		{
			title: "Top Posts",
			description: posts.join("\n"),
			// Gold
			color: 0xF1C40F,
		},
		{
			title: "Top Authors",
			description: authors.join("\n"),
			// Gold
			color: 0xF1C40F,
		},
	];

	await api.interactions.editReply(
		interaction.application_id,
		interaction.token,
		{ embeds },
	);
};
