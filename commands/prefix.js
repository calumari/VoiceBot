const db = require('../utils/db');

exports.run = (client, message, args) => {
    const oldPrefix = client.db.selectGuildPrefix.pluck().get(message.guild.id);
    const prefix = args[0];
    if (!prefix) return;
    else if (prefix.length > 1) return;
    client.db.updateGuildPrefix.run(prefix, message.guild.id);
};

exports.usage = {
    name: 'prefix',
    aliases: ['setprefix']
};
