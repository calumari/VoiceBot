module.exports = client => {
    client.user.setPresence({ activity: { name: client.config.presence } });

    if (client.config.motd) {
        client.guilds.cache.forEach(guild => guild.sendAlert(client.config.motd))
    }
};
