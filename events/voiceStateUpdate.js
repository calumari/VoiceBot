const { Permissions, Constants } = require('discord.js');
const { resolvePermissionOverwrites } = require('../util/utils');

async function deleteManagedChannel({ channel, guild }) {
    if (!guild.isManagedChannel(channel.id) || !channel.isEmpty(channel.client.config.ignoreBots)) return;
    if (!guild.me.hasPermission(Permissions.FLAGS.MANAGE_CHANNELS)) {
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

async function createManagedChannel({ channel, guild, member }) {
    if (!guild.isTriggerChannel(channel.id)) return;
    if (!guild.me.hasPermission([Permissions.FLAGS.MANAGE_CHANNELS, Permissions.FLAGS.MOVE_MEMBERS])) {
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
            type: Constants.ChannelTypes.VOICE,
            userLimit: channel.userLimit > 0 ? channel.userLimit : preferences['user_limit'],
            parent: channel.parentID,
            bitrate: preferences.bitrate,
        })
        .then(ch => ch.lockPermissions())
        .then(ch => ch.createOverwrite(member.id, { VIEW_CHANNEL: true, SPEAK: true, MANAGE_CHANNELS: true }))
        .then(ch => {
            preferences.permissions.forEach(permission => {
                ch.createOverwrite(permission['user_or_role_id'], {
                    ...resolvePermissionOverwrites(permission.allow, false),
                    ...resolvePermissionOverwrites(permission.deny, true),
                });
            });
            return ch;
        })
        .then(ch => {
            guild.addManagedChannel(ch, member);
            member.voice.setChannel(ch);
        });
}

async function removeVoiceRole({ channel, guild, member }) {
    if (!member.hasVoiceRole()) return;

    const user = channel.client.db.getUser.get(member.id, guild.id);
    if (user && Date.now() - user['last_seen'] > guild.client.config.voiceRole.softThreshold) return;
    member.roles.remove(guild.voiceRoleId);
}

async function giveVoiceRole({ guild, member }) {
    guild.client.db.replaceUser.run(member.id, guild.id, Date.now());
    if (member.hasVoiceRole()) return;
    member.roles.add(guild.voiceRoleId);
}

module.exports = (client, oldState, newState) => {
    try {
        if (oldState.channelID) {
            deleteManagedChannel(oldState);
            if (!newState.channelID) {
                removeVoiceRole(oldState);
            }
        }
        if (newState.channelID) {
            createManagedChannel(newState);
            giveVoiceRole(newState);
        }
    } catch (err) {
        console.error(err); // todo: explain what happened to user/owner
    }
};
