import { oneLine } from "common-tags";
import { Listener } from "discord-akairo";
import { GuildMember, MessageEmbed } from "discord.js";

export default class GuildMemberAddListener extends Listener {
  constructor() {
    super("guildMemberAdd", {
      emitter: "client",
      event: "guildMemberAdd",
    });
  }

  public async exec(member: GuildMember): Promise<void> {
    const guildID = member.guild.id;
    const { db } = this.client;

    member = await member.fetch();

    const logChannelDocument = await db?.collection("logChannels").findOne({ guildID });
    if (!logChannelDocument) return;

    const logChannel = this.client.channels.cache.get(logChannelDocument.channelID);
    if (!logChannel || !logChannel.isText()) return;

    const embed = new MessageEmbed()
      .setAuthor(`${member.user.tag} (${member.id})`, member.user.displayAvatarURL())
      .addField(`**• Created**`, oneLine`
          <t:${Math.round(member.user.createdTimestamp / 1000)}> 
          <t:${Math.round(member.user.createdTimestamp / 1000)}:R>`
      )
      .setFooter("User joined")
      .setTimestamp();

    if (member.joinedTimestamp) {
      embed.addField(`**• Joined**`, oneLine`
        <t:${Math.round(member.joinedTimestamp / 1000)}> 
        <t:${Math.round(member.joinedTimestamp / 1000)}:R>`
      );
    }

    logChannel.send({ embeds: [embed] });
  }
}
