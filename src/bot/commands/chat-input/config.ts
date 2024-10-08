import type { API, APIChatInputApplicationCommandInteraction, RESTPostAPIChatInputApplicationCommandsJSONBody, Snowflake } from "@discordjs/core";
import { ApplicationCommandOptionType, ApplicationIntegrationType, ChannelType, InteractionContextType, MessageFlags, PermissionFlagsBits } from "@discordjs/core";
import { isApplicationCommandGuildInteraction } from "discord-api-types/utils/v10";
import { updateConfigForGuild, type Config } from "../../../database/models/config.js";

export const data: RESTPostAPIChatInputApplicationCommandsJSONBody = {
	name: "config",
	description: "Modify lilyboard configuration options",
	contexts: [InteractionContextType.Guild],
	integration_types: [ApplicationIntegrationType.GuildInstall],
	options: [
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: "standard",
			description: "Change configurations for the standard board",
			options: [
				{
					name: "channel",
					description: "The new channel to post to",
					type: ApplicationCommandOptionType.Channel,
					channel_types: [ChannelType.GuildText],
				},
				{
					name: "emoji",
					description: "The new emoji to listen for",
					type: ApplicationCommandOptionType.String,
				},
				{
					name: "threshold",
					description: "The new minimum reaction count required for posting",
					type: ApplicationCommandOptionType.Integer,
					min_value: 1,
				},
			],
		},
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: "gold",
			description: "Change configurations for the gold board",
			options: [
				{
					name: "channel",
					description: "The new channel to post to",
					type: ApplicationCommandOptionType.Channel,
					channel_types: [ChannelType.GuildText],
				},
				{
					name: "emoji",
					description: "The new emoji to listen for",
					type: ApplicationCommandOptionType.String,
				},
				{
					name: "threshold",
					description: "The new minimum reaction count required for posting",
					type: ApplicationCommandOptionType.Integer,
					min_value: 1,
				},
			],
		},
	],
	default_member_permissions: PermissionFlagsBits.ManageGuild.toString(),
};

export const execute = async (api: API, interaction: APIChatInputApplicationCommandInteraction) => {
	// Ignore anything not from a guild
	if (!isApplicationCommandGuildInteraction(interaction)) {
		return;
	}

	const subcommand = interaction.data.options?.[0];
	if (!subcommand || subcommand.type !== ApplicationCommandOptionType.Subcommand) {
		return api.interactions.reply(
			interaction.id,
			interaction.token,
			{
				content: "Error executing this command - no subcommand selected",
				flags: MessageFlags.Ephemeral,
			},
		);
	}

	if (!subcommand.options) {
		return api.interactions.reply(
			interaction.id,
			interaction.token,
			{
				content: "Error executing this command - no configuration settings passed",
				flags: MessageFlags.Ephemeral,
			},
		);
	}

	// Prepare a config object for the update
	const config: Partial<Config> & { guild_id: Snowflake; } = { guild_id: interaction.guild_id };
	for (const option of subcommand.options) {
		if (option.name === "channel" && option.type === ApplicationCommandOptionType.Channel) {
			config[subcommand.name === "standard" ? "standard_channel_id" : "gold_channel_id"] = option.value;
		} else if (option.name === "emoji" && option.type === ApplicationCommandOptionType.String) {
			config[subcommand.name === "standard" ? "standard_emoji" : "gold_emoji"] = option.value;
		} else if (option.name === "threshold" && option.type === ApplicationCommandOptionType.Integer) {
			config[subcommand.name === "standard" ? "standard_threshold" : "gold_threshold"] = option.value;
		}
	}

	try {
		await updateConfigForGuild(config);
		await api.interactions.reply(
			interaction.id,
			interaction.token,
			{
				content: "Configuration updated successfully",
				flags: MessageFlags.Ephemeral,
			},
		);
	} catch (error) {
		await api.interactions.reply(
			interaction.id,
			interaction.token,
			{
				content: "Error updating configuration",
				flags: MessageFlags.Ephemeral,
			},
		);
		console.error(error);
	}
};
