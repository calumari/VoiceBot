const { CronJob } = require('cron');

module.exports = async client => {
    for (const guild of client.guilds.cache.values()) {
        client.db.insertGuild.run(guild.id);
        if (client.config.motd) {
            guild.sendAlert(client.config.motd);
        }
    }

    client.user.setPresence({ activity: { name: client.config.presence } });

    new CronJob(
        client.config.voiceRole.cronTime,
        function () {
            for (const guild of client.guilds.cache.values()) {
                if (!guild.hasVoiceRole()) continue;

                const memberIds = guild.members.cache
                    .filter(member => member.roles.cache.some(r => !member.voice.channel && r.id === guild.voiceRoleId))
                    .map(member => member.id);
                if (memberIds.length === 0) continue;

                client.db.getUsers.all(memberIds, guild.id).forEach(user => {
                    if (user && Date.now() - user['last_seen'] < guild.client.config.voiceRole.hardThreshold) return;
                    guild.members.resolve(id)?.roles?.remove(guild.voiceRoleId);
                });
            }
        },
        null,
        true,
        'Europe/London'
    );
};
