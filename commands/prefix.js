const { Permissions } = require('discord.js');

exports.run = (client, message, label, args) => {
    const prefix = args[0];
    if (!prefix || prefix.length > 1) return;
    message.guild.prefix = prefix;
    message.reply(`Prefix updated to "${prefix}"!`);
};

exports.usage = {
    name: 'prefix',
    aliases: ['setprefix'],
    userPermissions: [Permissions.FLAGS.ADMINISTRATOR],
};
