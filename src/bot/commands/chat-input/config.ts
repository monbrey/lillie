import type { API, APIChatInputApplicationCommandGuildInteraction, RESTPostAPIChatInputApplicationCommandsJSONBody, Snowflake } from "@discordjs/core";
import { ApplicationCommandOptionType, ApplicationIntegrationType, ChannelType, InteractionContextType, MessageFlags, PermissionFlagsBits } from "@discordjs/core";
import { isApplicationCommandGuildInteraction } from "discord-api-types/utils/v10";
import { updateConfigForGuild, type Config } from "../../../database/models/config.js";

const parseEmoji = (text: string) => {
	let val = text;
	if (val.includes("%")) {
		val = decodeURIComponent(text);
	}

	if (!val.includes(":")) {
		return {
			animated: false,
			name: text,
			id: undefined,
		};
	}

	const match = /<?(?:(?<animated>a):)?(?<name>\w{2,32}):(?<id>\d{17,19})?>?/.exec(val);
	console.log(match);

	return match && {
		animated: Boolean(match[1]),
		name: match[2],
		id: match[3],
	};
};

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

export const execute = async (api: API, interaction: APIChatInputApplicationCommandGuildInteraction) => {
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
			const emoji = parseEmoji(option.value);
			if (!emoji) {
				return api.interactions.reply(
					interaction.id,
					interaction.token,
					{
						content: "Error updating configuration - invalid emoji",
						flags: MessageFlags.Ephemeral,
					},
				);
			}

			config[subcommand.name === "standard" ? "standard_emoji" : "gold_emoji"] = emoji?.id ?? emoji?.name;
		} else if (option.name === "threshold" && option.type === ApplicationCommandOptionType.Integer) {
			config[subcommand.name === "standard" ? "standard_threshold" : "gold_threshold"] = option.value;
		}
	}

	try {
		console.log(config);
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
