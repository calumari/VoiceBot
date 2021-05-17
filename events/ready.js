module.exports = async client => {
    for (const guild of client.guilds.cache.values()) {
        client.db.insertGuild.run(guild.id);
        if (client.config.motd) {
            guild.sendAlert(client.config.motd);
        }
    }

    client.setInterval(() => {
        client.user.setPresence({ activity: { name: client.config.presence.message } });
    }, client.config.presence.interval);

    client.setInterval(() => {
        for (const guild of client.guilds.cache.values()) {
            if (!guild.hasVoiceRole()) continue;

            const members = guild.members.cache
                .filter(member => member.roles.cache.some(r => !member.voice.channel && r.id === guild.voiceRoleId))
                .reduce((map, member) => {
                    map[member.id] = member;
                    return map;
                }, {});
            if (Object.keys(members).length === 0) continue;

            client.db.getUsers(Object.keys(members), guild.id).forEach(user => {
                const member = members[user.id];
                if (!member || Date.now() - user['last_seen'] < client.config.voiceRole.hardThreshold) return;
                member.roles.remove(guild.voiceRoleId);
            });
        }
    }, client.config.voiceRole.interval);
};
