module.exports = (client, guild) => {
    const { channel_id: channelId } = client.db.selectGuildById.get(guild.id) || {};
    if (channelId && guild.channels.resolve(channelId)) return;

    client.db.insertGuild.run(guild.id);

    const channel = guild.defaultChannel;
    if (!channel) return; // conditional chaining when?
    channel.send({
        embed: {
            title: 'Hey! :wave:',
            description: `Thanks for adding me to your server! To get started, use \`.setup\`.
            
            If you have any questions or need help, please contact **calumari#0001** or [click here](https://github.com/calumari/VoiceBoy/issues) to visit us on GitHub.`,
        },
    });
};
