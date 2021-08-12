import { stripIndents } from "common-tags";
import { CommandInteraction, TextChannel } from "discord.js";
import { CommandExecutionError } from "../lib/errors/CommandExecutionError";
import { ApplicationCommandModule } from "../lib/handlers/ApplicationCommandModule";

export default class DailyQuestionCommand extends ApplicationCommandModule {
	constructor() {
		super({
			name: "daily-question",
			description: "Creates a new thread for the daily question",
			guild: true,
			options: [{
				name: "question",
				description: "Question to be asked",
				type: "STRING",
				required: true,
			}],
		});
	}

	public async exec(interaction: CommandInteraction): Promise<void> {
		await interaction.deferReply({ ephemeral: true });

		const { db } = this.client;
		if (!db) {
			throw new CommandExecutionError("[LogCommand] Unable to connect to database");
		}

		const { value } = await db.collection("counters").findOneAndUpdate(
			{ name: "daily-questions" },
			{ $inc: { count: 1 } }
		);

		const count = value?.count;

		const question = interaction.options.getString("question");

		if (interaction.channel instanceof TextChannel) {
			const thread = await interaction.channel.threads.create({
				name: `Daily Question ${count}`,
				autoArchiveDuration: 1440,
			});

			await thread.send(stripIndents`
			**__Daily Question #${count}: ${new Date().toLocaleDateString("en-US")}__** <@&870891266018271312>
			${question}`);

			interaction.editReply({
				content: `New question thread created: ${thread}`,
			});
		}
	}
}
