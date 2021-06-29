import { Listener } from "discord-akairo";
import { MessageEmbed, MessageReaction, TextChannel, User } from "discord.js";

export default class MessageReactionAddListener extends Listener {
  constructor() {
    super("messageReactionAdd", {
      emitter: "client",
      event: "messageReactionAdd",
    });
  }

  public async exec(reaction: MessageReaction, user: User): Promise<void> {
    if (reaction.partial) await reaction.fetch();
    const { message, users, emoji, count } = reaction;
    if (message.partial) await message.fetch();

    if (!message.guild || !message.author) return;

    const starboard = await this.client.db?.collection("starboards").findOne({
      guildID: message.guild.id,
      emoji: emoji.toString(),
    });


    if (!starboard) return;
    if (message.channel.id === starboard.channelID) return;
    if (message.author.id === user.id) return;

    const month = `${new Date().getMonth()}:${new Date().getFullYear()}`;
    if (starboard.restricted) {
      const used = await this.client.db?.collection("starUsed").findOne({
        starboardID: starboard._id,
        userID: user.id,
        uses: month,
      });
      if (used) return;
    }

    const stars = users.cache.has(message.author.id) && count ? count - 1 : count ?? 0;
    if (stars < starboard.number) return;

    const starChannel = message.guild.channels.cache.get(starboard.channelID) as TextChannel;
    if (!starChannel) return;

    this.client.reactionQueue.add(
      async (): Promise<void> => {
        const existing = await this.client.db?.collection("starred").findOne({
          messageID: message.id,
          starChannelID: starboard.channelID,
        });
        const previous = existing
          ? await starChannel.messages.fetch(existing.starMessageID).catch(() => null)
          : null;

        const content = message.cleanContent;
        const [images, files] = message.attachments.partition(a => a.contentType?.includes("image") ?? false);
        const embeds = message.embeds.map(e => new MessageEmbed(e));

        if (!message.author) return;

        const embed = new MessageEmbed()
          .setColor(15844367)
          .setAuthor(message.author.tag, message.author?.displayAvatarURL())
          .setTimestamp(previous?.embeds[0]?.timestamp ?? undefined)
          .setFooter(`⭐ | ${message.id}`);


        if (starboard.restricted) {
          embed.addField("Immortalized by", `${user}`, true);
        } else {
          embed.addField(`Reactions`, `${stars}`, true);
        }
        embed.addField(`Channel`, `[<#${message.channel.id}>](${message.url})`, true);

        if (content) embed.setDescription(content);
        if (images.size) {
          if (images.size === 1) embed.setImage(`${images.first()?.url}`);
          else embed.addField("Images", images.map(i => `[${i.name}](${i.url})`).join("\n"));
        }
        if (files.size) embed.addField("Attached Files", files.map(i => `[${i.name}](${i.url})`).join("\n"));
        if (embeds.length) embed.addField("Additional Embeds", `${embeds.length} (attached below)`);

        if (previous) {
          await previous.edit({ embeds: [embed] });
        } else {
          const star = await starChannel.send({ embeds: [embed] });
          if (embeds.length) await starChannel.send({ embeds });
          await this.client.db?.collection("starred").insertOne({
            messageID: message.id,
            starChannelID: starboard.channelID,
            starMessageID: star.id,
          });
          if (starboard.restricted) {
            this.client.db?.collection("starUsed").updateOne(
              { starboardID: starboard._id, userID: user.id },
              { $addToSet: { uses: month } },
              { upsert: true });
          }
        }
      }
    );
  }
}
