module.exports = client => {
    for (const guild of client.guilds.cache.values()) {
        client.db.insertGuild.run(guild.id)
        if (client.config.motd) {
            guild.sendAlert(client.config.motd)
        }
    }

    client.user.setPresence({ activity: { name: client.config.presence } });
};
