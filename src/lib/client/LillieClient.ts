import { resolve } from "path";
import { AkairoClient, ListenerHandler } from "discord-akairo";
import { ClientOptions } from "discord.js";
import { Db } from "mongodb";
import queue from "p-queue";
import { connectDb } from "../../util/Database";
import { InteractionHandler } from "../handlers/CommandInteractionHandler";

interface ILillieClient {
  commands: InteractionHandler;
  events: ListenerHandler;
  reactionQueue: queue;
  db: Db | null;
}

declare module "discord.js" {
  interface Client extends ILillieClient { }
}

export class LillieClient extends AkairoClient {
  public reactionQueue: queue;
  public commands: InteractionHandler;
  public events: ListenerHandler;
  public db: Db | null;

  constructor(options: ClientOptions) {
    super({ ...options, ownerID: "122157285790187530" });

    this.reactionQueue = new queue({
      concurrency: 1,
      autoStart: true,
      intervalCap: 1,
      interval: 100,
    });

    this.commands = new InteractionHandler(this, {
      directory: resolve(__dirname, "..", "..", "commands"),
    });

    this.events = new ListenerHandler(this, {
      directory: resolve(__dirname, "..", "..", "events"),
    });

    this.db = null;
  }

  public async start(): Promise<void> {
    this.db = await connectDb();
    this.commands.loadAll();
    this.events.setEmitters({
      commandHandler: this.commands,
      websocket: this.ws,
    });
    this.events.loadAll();
    await this.login();
  }
}
