import { ApplicationCommandOptionType } from "discord-api-types";
import { CommandInteraction } from "discord.js";
import { CommandExecutionError } from "../lib/errors/CommandExecutionError";
import { ApplicationCommandModule } from "../lib/handlers/ApplicationCommandModule";

export default class LogCommand extends ApplicationCommandModule {
  constructor() {
    super({
      name: "logs",
      description: "Set the channel for logging output",
      guild: true,
      defaultPermission: false,
      options: [{
        name: "channel",
        description: "Channel to output logs to",
        type: ApplicationCommandOptionType.CHANNEL,
        required: true,
      }],
    });
  }

  public async exec(interaction: CommandInteraction): Promise<void> {
    const { db } = this.client;
    if (!db) {
      throw new CommandExecutionError("[LogCommand] Unable to connect to database");
    }

    const guildID = interaction.guildID;
    if (!guildID) {
      throw new CommandExecutionError("[LogCommand] This command must be run in a server");
    }

    const channelID = interaction.options.get("channel")?.channel?.id;
    if (!channelID) {
      throw new CommandExecutionError("[LogCommand] No channel option provided.");
    }

    const logChannels = db.collection("logChannels");

    try {
      await logChannels.findOneAndReplace({ guildID, channelID }, { guildID, channelID }, { upsert: true });
      await interaction.reply({ content: "Log channel configured", ephemeral: true });
    } catch (err) {
      console.error(err);
      throw new CommandExecutionError(`[LogCommand] Error writing to database: ${err.message}`);
    }
  }
}
