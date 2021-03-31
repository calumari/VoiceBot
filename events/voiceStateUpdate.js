const { Permissions } = require("discord.js");

async function handleLeave({ channel, guild }) {
    if (!guild.isManagedChannel(channel.id) || !channel.isEmpty(channel.client.config.ignoreBots)) return;
    if (!guild.me.hasPermission('MANAGE_CHANNELS')) {
        return guild.sendAlert({
            embed: {
                title: 'Oh dear...',
                description: `I ran into a little trouble while cleaning up a voice channel. Please ensure that I have permission to **Manage Channels**!`,
            },
        });
    }

    await channel.delete();
    guild.removeManagedChannel(channel.id);
}

async function handleJoin({ channel, guild, member }) {
    if (!guild.isTriggerChannel(channel.id)) return;
    if (!guild.me.hasPermission(['MANAGE_CHANNELS', 'MOVE_MEMBERS'])) {
        return guild.sendAlert({
            embed: {
                title: 'Oh dear...',
                description: `I ran into a little trouble while creating a voice channel for <@${member.id}>. Please ensure that I have permission to **Manage Channels** and **Move Members**!`,
            },
        });
    }
    if (!channel.parent) {
        return guild.sendAlert({
            embed: {
                title: 'Oh dear...',
                description: `I ran into a little trouble while creating a voice channel for <@${member.id}>. Please ensure that **${channel.name}** is under a category!`,
            },
        });
    }

    const preferences = channel.client.db.selectChannelPreferences(member.id, channel.parentID) || {};

    guild.channels
        .create(preferences.name || `${member.displayName}'s channel`, {
            type: 'voice',
            userLimit: channel.userLimit > 0 ? channel.userLimit : preferences['user_limit'],
            parent: channel.parentID,
            bitrate: preferences.bitrate,
        })
        .then(ch => ch.lockPermissions())
        .then(ch => ch.createOverwrite(member.id, { 'VIEW_CHANNEL': true, 'SPEAK': true, 'MANAGE_CHANNELS': true }))
        .then(ch => {
            preferences.permissions.forEach(permission => {
                ch.createOverwrite(permission['user_or_role_id'], {
                    ...resolvePermissionOverwrites(permission.allow, false),
                    ...resolvePermissionOverwrites(permission.deny, true)
                })
            })
            return ch
        })
        .then(ch => {
            guild.addManagedChannel(ch, member);
            member.voice.setChannel(ch);
        });
}

module.exports = (client, oldState, newState) => {
    try {
        if (oldState.channelID) handleLeave(oldState);
        if (newState.channelID) handleJoin(newState);
    } catch (err) {
        // todo: explain what happened to user/owner
        console.log(err);
    }
};

function resolvePermissionOverwrites(bitfield, invert = false) {
    const permissionOverwrites = {}
    const permissions = new Permissions(bitfield)
    for (const flag in Permissions.FLAGS) {
        if (permissions.has(flag, false)) {
            permissionOverwrites[flag] = !invert
        }
    }
    return permissionOverwrites
}

