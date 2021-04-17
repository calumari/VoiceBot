const { Permissions } = require('discord.js');

exports.run = (client, message, label, args) => {
    const roleIdOrName = args[0];
    if ((!roleIdOrName || roleIdOrName === 'clear') && message.guild.hasVoiceManagerRole()) {
        message.guild.voiceManagerRoleId = null;
        return message.reply('voice manager role cleared.');
    }

    if (!roleIdOrName) {
        return message.reply(
            `you didn't provide a role id or name, stupid. usage: \`${message.guild.prefix}${label} <role id or name>\``
        );
    }

    const role = message.guild.roles.cache.find(
        r => r.id == roleIdOrName || r.name.toLowerCase() === roleIdOrName.toLowerCase()
    );
    if (!role) {
        return message.reply(`no role exists by that ID or name.`);
    }
    if (role.position > message.guild.me.roles.highest.position) {
        return message.reply(`I can't assign that role, buddy.`);
    }
    if (role.permissions.has(Permissions.FLAGS.ADMINISTRATOR)) {
        return message.reply(`you're either stupid or mistyped. ${role.name} has admin permission.`);
    }

    message.guild.voiceManagerRoleId = role.id;
    message.reply(`voice manager role updated to "${role.name}".`);
};

exports.usage = {
    name: 'voicemanager',
    aliases: ['setvoicemanager', 'voicemanagerole', 'setvoicemanagerrole'],
    userPermissions: [Permissions.FLAGS.ADMINISTRATOR],
};
