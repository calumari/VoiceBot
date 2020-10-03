module.exports = (client, guild) => {
    client.db.insertGuild.run(guild.id);
    for (const channel of guild.managed) {
        if (!guild.channels.resolve(channel)) guild.removeManagedChannel(channel);
    }
    for (const channel of guild.triggers) {
        if (!guild.channels.resolve(channel)) guild.removeTriggerChannel(channel);
    }

    guild.sendAlert({
        embed: {
            title: 'Hey! :wave:',
            description: `Thanks for adding me to your server! To get started, use \`.setup\`.
            
            If you have any questions or need help, please contact **calumari#0001** or [click here](https://github.com/calumari/VoiceBoy/issues) to visit us on GitHub.`,
        },
    });
};
