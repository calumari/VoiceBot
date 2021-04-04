const { Permissions } = require('discord.js');

exports.run = (client, message, args) => {
    const roleIdOrName = args[0];
    if ((!roleIdOrName || roleIdOrName === 'clear') && message.guild.hasVoiceRole()) {
        const roleId = message.guild.voiceRoleId;
        message.guild.voiceRoleId = null;
        if (args[1] !== 'true') {
            return message.reply('voice role cleared.');
        }

        message.guild.members.cache
            .filter(member => member.roles.cache.find(r => r.id === message.guild.voiceRoleId))
            .forEach(member => member.roles.cache.remove(roleId));
        return message.reply('voice role cleared and role removed from users.');
    }
    if (!roleIdOrName) {
        return message.reply(
            `you didn't provide a role id or name, stupid. usage: \`${message.guild.prefix}voicerole <role id or name>\``
        );
    }

    const role = message.guild.roles.cache.find(r => r.id == roleIdOrName || r.name === roleIdOrName);
    if (!role) {
        return message.reply(`no role exists by that ID or name.`);
    }
    if (role.position > message.guild.me.roles.highest.position) {
        return message.reply(`I can't assign that role, buddy.`);
    }
    if (role.permissions.has(Permissions.FLAGS.ADMINISTRATOR)) {
        return message.reply(`you're either stupid or mistyped. ${role.name} has admin permission.`);
    }

    message.guild.voiceRoleId = role.id;
    message.reply(`voice role updated to "${role.name}".`);
};

exports.usage = {
    name: 'voicerole',
    aliases: ['setvoicerole'],
    userPermissions: [Permissions.FLAGS.ADMINISTRATOR],
};
