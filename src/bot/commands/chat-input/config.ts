import type { API, APIChatInputApplicationCommandInteraction, RESTPostAPIChatInputApplicationCommandsJSONBody } from '@discordjs/core';
import { ApplicationCommandOptionType, ApplicationIntegrationType, ChannelType, InteractionContextType, PermissionFlagsBits } from '@discordjs/core';

export const data: RESTPostAPIChatInputApplicationCommandsJSONBody = {
	name: 'config',
	description: 'Modify lilyboard configuration options',
	contexts: [InteractionContextType.Guild],
	integration_types: [ApplicationIntegrationType.GuildInstall],
	options: [{
		type: ApplicationCommandOptionType.Subcommand,
		name: 'emoji',
		description: 'Change the emojis that trigger posting the message',
		options: [{
			name: 'positive',
			description: 'Change the "positive" emoji',
			type: ApplicationCommandOptionType.String
		}, {
			name: 'negative',
			description: 'Change the "negative" emoji',
			type: ApplicationCommandOptionType.String
		}, {
			name: 'premium',
			description: 'Change the "premium" emoji',
			type: ApplicationCommandOptionType.String
		}]
	}, {
		type: ApplicationCommandOptionType.Subcommand,
		name: 'channels',
		description: 'Change the channels that each emoji triggers posting to',
		options: [{
			name: 'positive',
			description: 'Change the "positive" channel',
			type: ApplicationCommandOptionType.Channel,
			channel_types: [ChannelType.GuildText]
		}, {
			name: 'negative',
			description: 'Change the "negative" channel',
			type: ApplicationCommandOptionType.Channel,
			channel_types: [ChannelType.GuildText]
		}, {
			name: 'premium',
			description: 'Change the "premium" channel',
			type: ApplicationCommandOptionType.Channel,
			channel_types: [ChannelType.GuildText]
		}]
	}, {
		type: ApplicationCommandOptionType.Subcommand,
		name: 'thresholds',
		description: 'Change the minimum reaction count for each emoji to trigger',
		options: [{
			name: 'positive',
			description: 'Change the "positive" threshold',
			type: ApplicationCommandOptionType.Integer,
			min_value: 1,

		}, {
			name: 'negative',
			description: 'Change the "negative" threshold',
			type: ApplicationCommandOptionType.Integer,
			min_value: 1
		}, {
			name: 'premium',
			description: 'Change the "premium" threshold',
			type: ApplicationCommandOptionType.Integer,
			min_value: 1
		}]
	}],
	default_member_permissions: PermissionFlagsBits.Administrator.toString(),
}

export const execute = async (api: API, interaction: APIChatInputApplicationCommandInteraction) => {

}