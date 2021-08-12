import { Listener } from "discord-akairo";
import { Awaited } from "discord.js";

export default class DebugListener extends Listener {
	constructor() {
		super("debug", {
			emitter: "client",
			event: "debug",
		});
	}

	public exec(data: unknown): Awaited<void> {
		if (process.env.NODE_ENV === "development") {
			console.debug(data);
		}
	}
}
