import { resolve } from "path";
import { AkairoHandler, LoadPredicate } from "discord-akairo";
import { APIMessage } from "discord-api-types";
import { Collection, CommandInteraction, Message } from "discord.js";
import { ApplicationCommandModule } from "./ApplicationCommandModule";
import { LillieClient } from "../client/LillieClient";

export class InteractionHandler extends AkairoHandler {
  public modules: Collection<string, ApplicationCommandModule>;

  public client!: LillieClient;

  constructor(
    client: LillieClient,
    {
      directory,
      classToHandle = ApplicationCommandModule,
      extensions = [".js", ".ts"],
      automateCategories,
      loadFilter,
    }: InteractionHandlerOptions = {},
  ) {
    super(client, {
      directory,
      classToHandle,
      extensions,
      automateCategories,
      loadFilter,
    });

    this.modules = new Collection();
    this.setup();
  }

  setup(): void {
    this.client.once("ready", async () => {
      await this.fetch();

      this.client.on("interaction", i => {
        if (i.isCommand()) this.handle(i);
      });
    });
  }

  async handle(interaction: CommandInteraction): Promise<void | Message | APIMessage> {
    if (!interaction.module) {
      return interaction.reply({ content: `\`${interaction.commandName}\` is not yet implemented!`, ephemeral: true });
    }

    try {
      return await interaction.module.exec(interaction);
    } catch (err) {
      console.log(err);
      // this.client.logger.error(err);
      const method: keyof typeof interaction = interaction.replied ? "editReply" : "reply";
      return interaction[method]({
        content: `[${interaction.commandName}] ${err.message}`,
        ephemeral: true,
        code: true,
      });
    }
  }

  loadAll(directory = this.directory): this {
    const filepaths = AkairoHandler.readdirRecursive(directory);
    for (let filepath of filepaths) {
      filepath = resolve(filepath);
      this.load(filepath);
    }

    return this;
  }

  async fetch({ global = true, guild = true } = {}): Promise<this> {
    if (global && this.client.application) await this.client.application.commands.fetch();

    if (guild) await Promise.all(this.client.guilds.cache.map(g => g.commands.fetch()));

    return this;
  }

  async deploy({ global = true, guild = true } = {}): Promise<this> {
    // eslint-disable-next-line max-len
    const [guildCommands, globalcommands] = this.modules.partition((m: ApplicationCommandModule) => m.guild || Boolean(m.guilds.length));

    if (global && this.client.application) {
      await this.client.application.commands.set(globalcommands.array());
    }

    if (guild) {
      await Promise.all(
        this.client.guilds.cache.map((g, id) => {
          const commands = [...guildCommands.filter(c =>
            c.guild && (c.guilds.length === 0 || c.guilds.includes(id))
          ).values()];
          return g.commands.set(commands);
        })
      );
    }

    return this;
  }

  // async setAllPermissions(): Promise<this> {
  //   const guilds = this.modules.filter((m: ApplicationCommandModule) => Boolean(m.guilds?.length));
  //   // await Promise.all(guilds.map(command => command.updatePermissions()));
  //   return this;
  // }
}

export interface InteractionHandlerOptions {
  automateCategories?: boolean;
  classToHandle?: Function;
  directory?: string;
  extensions?: string[] | Set<string>;
  loadFilter?: LoadPredicate;
}
