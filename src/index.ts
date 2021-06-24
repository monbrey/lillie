import { Constants, Intents } from "discord.js";
import dotenv from "dotenv";
import { LillieClient } from "./lib/client/LillieClient";
dotenv.config();

import "./lib/structures/CommandInteraction";

const client = new LillieClient({
  intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_MESSAGE_REACTIONS],
  partials: [Constants.PartialTypes.MESSAGE, Constants.PartialTypes.REACTION, Constants.PartialTypes.USER],
});

client.start();
