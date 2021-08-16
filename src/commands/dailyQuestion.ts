import { stripIndents } from "common-tags";
import { CommandInteraction, TextChannel } from "discord.js";
import { DateTime } from "luxon";
import { CommandExecutionError } from "../lib/errors/CommandExecutionError";
import { ApplicationCommandModule } from "../lib/handlers/ApplicationCommandModule";

export default class DailyQuestionCommand extends ApplicationCommandModule {
	constructor() {
		super({
			name: "daily-question",
			description: "Creates a new thread for the daily question",
			guild: true,
			options: [{
				name: "number",
				description: "Thread title value: Daily Question <number>",
				type: "STRING",
				required: true,
			}, {
				name: "question",
				description: "Question to be asked",
				type: "STRING",
				required: true,
			}],
		});
	}

	public async exec(interaction: CommandInteraction): Promise<void> {
		const number = interaction.options.getString("number");
		const question = interaction.options.getString("question");

		if (interaction.channel instanceof TextChannel) {
			try {
				const thread = await interaction.channel.threads.create({
					name: `Daily Question ${number}`,
					autoArchiveDuration: 1440,
				});

				const time = DateTime.now().setZone("UTC-6").toLocaleString(undefined, { locale: "en-US" });
				await thread.send(
					stripIndents`
						**__Daily Question #${number}: ${time}__** <@&870891266018271312>
						${question}`
				);

				interaction.reply({
					content: `New question thread created: ${thread}`,
				});
			} catch (e) {
				throw new CommandExecutionError(e.message);
			}
		}
	}
}
