const { Permissions, Collection } = require('discord.js');
const { resolvePermissionOverwrites } = require('../util/utils');

const cooldowns = new Collection();

function getChannelCreationCooldown(member) {
    if (!cooldowns.has(member.id) || member.client.config.botOwners.some(id => member.id === id)) return null;
    const now = Date.now();
    const expirationTime = cooldowns.get(member.id) + member.client.config.cooldowns.create;
    return { now, expirationTime, timeLeft: (expirationTime - now) / 1000 };
}

async function deleteManagedChannel({ channel, guild, member }) {
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

    const cooldown = getChannelCreationCooldown(member);
    if (cooldown && cooldown.now >= cooldown.expirationTime) {
        cooldowns.clear(member.id);
    }
}

async function createManagedChannel({ channel, guild, member }) {
    if (!guild.isTriggerChannel(channel.id)) return;

    const cooldown = getChannelCreationCooldown(member);
    if (cooldown && cooldown.now < cooldown.expirationTime) {
        member.user.send({
            embed: {
                description: `You're creating channels too fast, please try again in ${Math.round(
                    cooldown.timeLeft
                )} second(s)!`,
                timestamp: new Date(),
                author: {
                    name: guild.name,
                    icon_url: guild.iconURL({ dynamic: true }),
                },
            },
        });
        return member.voice.setChannel(null);
    }

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
            type: 'voice',
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
            member.voice.setChannel(ch).catch(() => deleteManagedChannel({ channel: ch, guild }));
        });

    cooldowns.set(member.id, Date.now());
}

async function removeVoiceRole({ guild, member }) {
    if (!member.hasVoiceRole()) return;
    const user = guild.client.db.getUser.get(member.id, guild.id);
    const now = Date.now();
    if (user && now - user['last_seen'] > guild.client.config.voiceRole.softThreshold) {
        guild.client.db.replaceUser.run(member.id, guild.id, now);
        return;
    }
    member.roles.remove(guild.voiceRoleId);
}

async function giveVoiceRole({ guild, member }) {
    if (!guild.hasVoiceRole() || member.hasVoiceRole()) return;
    guild.client.db.replaceUser.run(member.id, guild.id, Date.now());
    member.roles.add(guild.voiceRoleId);
}

module.exports = async (client, oldState, newState) => {
    if (newState.member.user.bot) return;
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
