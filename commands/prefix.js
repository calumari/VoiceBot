exports.run = (client, message, args) => {
    const prefix = args[0];
    if (!prefix || prefix.length > 1) return;
    client.db.updateGuildPrefix.run(prefix, message.guild.id);
    message.reply(`Prefix updated to "${prefix}"!`)
};

exports.usage = {
    name: 'prefix',
    aliases: ['setprefix'],
    userPermissions: ['ADMINISTRATOR'],
};
