import { AkairoModule } from "discord-akairo";
import {
	ApplicationCommandOptionData,
	Awaited,
	ChatInputApplicationCommandData,
	CommandInteraction,
	Snowflake,
} from "discord.js";

export interface ChatInputCommandModuleData extends ChatInputApplicationCommandData {
	guild?: boolean;
	guilds?: Snowflake[];
}

export abstract class ApplicationCommandModule extends AkairoModule implements ChatInputCommandModuleData {
	public name: string;
	public description: string;
	public guild: boolean;
	public guilds: Snowflake[];
	public defaultPermission: boolean;
	public options?: ApplicationCommandOptionData[];

	public constructor(options: ChatInputCommandModuleData) {
		super(options.name);
		this.name = options.name;
		this.description = options.description;
		this.defaultPermission = options.defaultPermission ?? true;
		this.options = options.options;

		this.guild = options.guild ?? Boolean(options.guilds?.length) ?? false;
		this.guilds = options.guilds ?? [];
	}

	abstract exec(interaction: CommandInteraction): Awaited<void>;
}
