import { Structures } from "discord.js";
import { LillieClient } from "../client/LillieClient";
import { ApplicationCommandModule } from "../handlers/ApplicationCommandModule";

declare module "discord.js" {
  interface CommandInteraction {
    readonly module: ApplicationCommandModule | null;
  }
}

// eslint-disable-next-line @typescript-eslint/naming-convention
Structures.extend("CommandInteraction", CommandInteraction => class extends CommandInteraction {
  public client!: LillieClient;

  public get module(): ApplicationCommandModule | null {
    return this.client.commands.modules.get(this.commandName) ?? null;
  }
});
