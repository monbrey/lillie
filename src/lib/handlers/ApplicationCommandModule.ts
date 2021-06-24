import { AkairoModule } from "discord-akairo";
import { ApplicationCommandData, ApplicationCommandOptionData, CommandInteraction, Snowflake } from "discord.js";

export interface ApplicationCommandModuleData extends ApplicationCommandData {
  guild?: boolean;
  guilds?: Snowflake[];
}

export abstract class ApplicationCommandModule extends AkairoModule implements ApplicationCommandModuleData {
  public name: string;
  public description: string;
  public guild: boolean;
  public guilds: Snowflake[];
  public defaultPermission: boolean;
  public options?: ApplicationCommandOptionData[];

  public constructor(options: ApplicationCommandModuleData) {
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
