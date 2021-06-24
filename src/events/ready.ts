import { Listener } from "discord-akairo";

export default class ReadyEventListener extends Listener {
  constructor() {
    super("ready", {
      emitter: "client",
      event: "ready",
    });
  }

  public async exec(): Promise<void> {
    const args = process.argv.slice(2);
    if (args.includes("--deploy")) {
      await this.client.commands.deploy();
      console.log("Commands deployed");
    }

    // await this.client.commands.fetchAll();
    console.log("Ready");
  }
}
