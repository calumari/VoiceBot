module.exports = async client => {
    for (const guild of client.guilds.cache.values()) {
        client.db.insertGuild.run(guild.id);
        for (const channel of guild.managed) {
            if (!guild.channels.resolve(channel)) guild.removeManagedChannel(channel);
        }
        for (const channel of guild.triggers) {
            if (!guild.channels.resolve(channel)) guild.removeTriggerChannel(channel);
        }
    }
};
