import { ApplicationCommandOptionType } from "discord-api-types";
import { CommandInteraction } from "discord.js";
import { CommandExecutionError } from "../lib/errors/CommandExecutionError";
import { ApplicationCommandModule } from "../lib/handlers/ApplicationCommandModule";

export default class StarboardCommand extends ApplicationCommandModule {
  constructor() {
    super({
      name: "starboard",
      description: "Create or edit a starboard for the guild",
      guild: true,
      defaultPermission: false,
      options: [{
        name: "channel",
        description: "Channel to log messages to",
        type: ApplicationCommandOptionType.CHANNEL,
        required: true,
      }, {
        name: "emoji",
        description: "Reaction emoji to watch for on message (default ⭐)",
        type: ApplicationCommandOptionType.STRING,
      }, {
        name: "number",
        description: "Number of reactions required to be logged (default 3)",
        type: ApplicationCommandOptionType.INTEGER,
      }, {
        name: "restricted",
        description: "Make this a time-restricted starboard (one per month)",
        type: ApplicationCommandOptionType.BOOLEAN,
      }],
    });
  }

  public async exec(interaction: CommandInteraction): Promise<void> {
    const { db } = this.client;
    if (!db) {
      throw new CommandExecutionError("[StarboardCommand] Unable to connect to database");
    }

    const guildID = interaction.guildID;
    if (!guildID) {
      throw new CommandExecutionError("[StarboardCommand] This command must be run in a server");
    }

    const channelID = interaction.options.get("channel")?.channel?.id;
    if (!channelID) {
      throw new CommandExecutionError("[StarboardCommand] No channel option provided.");
    }

    const emoji = interaction.options.get("emoji")?.value ?? "⭐";
    const number = interaction.options.get("number")?.value ?? 3;
    const restricted = interaction.options.get("restricted")?.value ?? false;

    const starboards = db.collection("starboards");
    const starboard = {
      guildID,
      channelID,
      emoji,
      number,
      restricted,
    };
    try {
      await starboards.findOneAndReplace({ guildID, channelID }, starboard, { upsert: true });
      await interaction.reply({ content: "Starboard created/updated", ephemeral: true });
    } catch (err) {
      console.error(err);
      throw new CommandExecutionError(`[StarboardCommand] Error writing to database: ${err.message}`);
    }
  }
}
