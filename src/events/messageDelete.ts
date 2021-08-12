import { Listener } from "discord-akairo";
import { Message, MessageEmbed } from "discord.js";

export default class MessageDeleteListener extends Listener {
	constructor() {
		super("messageDelete", {
			emitter: "client",
			event: "messageDelete",
		});
	}

	public async exec(message: Message): Promise<void> {
		const guildID = message.guild?.id;
		if (!guildID || !message.author) return;

		const { db } = this.client;

		const logChannelDocument = await db?.collection("logChannels").findOne({ guildID });
		if (!logChannelDocument) return;

		const logChannel = this.client.channels.cache.get(logChannelDocument.channelID);
		if (!logChannel || !logChannel.isText()) return;

		const embeds = message.embeds;
		const attachments = message.attachments.map(a => a.proxyURL);

		const embed = new MessageEmbed()
			.setAuthor(`${message.author.tag} (${message.author.id})`, message.author.displayAvatarURL())
			.addField(`• Channel`, `${message.channel}`)
			.setFooter("Message Deleted")
			.setTimestamp();

		if (message.content?.length) {
			embed.addField(`• Message`, message.content);
		}

		if (embeds.length) {
			embed.addField(`• Additional Embeds`, "See below");
		}

		if (attachments.length) {
			embed.addField(`• Attachments`, attachments.join("\n"));
		}

		logChannel.send({ embeds: [embed, ...embeds] });
	}
}
