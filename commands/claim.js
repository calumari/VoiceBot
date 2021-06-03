const { resolvePermissionOverwrites } = require('../util/utils');

exports.run = (client, message, label, args) => {
    const voicestate = message.member.voice;
    if (!voicestate.channelID) {
        return message.reply(`you're not in a voice channel!`);
    }

    const channel = voicestate.channel;
    if (!channel.parent) {
        return guild.sendAlert({
            embed: {
                title: 'Oh dear...',
                description: `I ran into a little trouble while updating <@${member.id}>'s channel preferences. Please ensure that **${channel.name}** is under a category!`,
            },
        });
    }

    const ownerId = message.guild.getManagedChannelOwnerId(channel.id);
    if (!ownerId) {
        return message.reply(`you're not in a managed voice channel!`);
    } else if (ownerId == message.member.id) {
        return message.reply('you already own that channel!');
    } else if (channel.members.find(member => member.id === ownerId) && !message.member.hasVoiceManagerRole()) {
        return message.reply(
            `I think <@${ownerId}> might disagree with that. Maybe wait until they leave before claiming their channel?`
        );
    }

    const preferences = client.db.selectChannelPreferences(message.member.id, channel.parentID) || {};
    message.guild.transferManagedChannel(channel.id, message.member.id);

    channel
        .edit({
            name: preferences.name || `${message.member.displayName}'s channel`,
            userLimit: channel.parent.userLimit > 0 ? channel.parent.userLimit : preferences['user_limit'],
            parent: channel.parentID,
            bitrate: preferences.bitrate,
        })
        .then(ch => ch.lockPermissions())
        .then(ch => ch.createOverwrite(message.member.id, { VIEW_CHANNEL: true, SPEAK: true, MANAGE_CHANNELS: true }))
        .then(ch => {
            preferences.permissions.forEach(permission => {
                ch.createOverwrite(permission['user_or_role_id'], {
                    ...resolvePermissionOverwrites(permission.allow, false),
                    ...resolvePermissionOverwrites(permission.deny, true),
                });
            });
        })
        .then(message.react('👌'));
};

exports.usage = {
    name: 'claim',
};

exports.slashCommand = {
    name: 'claim',
    description: 'Claim your current voice channel if the owner is no longer present.'
}