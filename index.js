const Discord = require('discord.js');

const db = require('./db');
const config = require('./config');

const client = new Discord.Client();
const cooldowns = new Discord.Collection();

client.on('voiceStateUpdate', (oldState, newState) => {
    const { channel_id: channelId } = db.selectGuildById.get(newState.guild.id) || {};
    if (channelId === undefined) return;

    if (db.selectChannelById.get(oldState.channelID) !== undefined) {
        const channel = oldState.guild.channels.resolve(oldState.channelID);
        if (channel.members.size === 0) {
            channel
                .delete()
                .catch(error => {
                    // todo: send message why this failed
                })
                .finally(() => {
                    db.deleteChannel.run(oldState.channelID);
                });
        }
    }

    if (newState.channelID === channelId) {
        if (cooldowns.has(newState.member.id) && Date.now() - cooldowns.get(newState.member.id) < 5000) {
            newState.member.send('Quit creating channels so fast!');
            newState.member.voice.kick();
            return;
        }

        const prefs = db.selectUserPreferences(newState.member.id);

        newState.guild.channels
            .create(prefs.name || `${newState.member.displayName}'s channel`, {
                type: 'voice',
                position: newState.channel.position + 1,
                parent: newState.channel.parentID,
                permissionOverwrites: [...prefs.permissionOverwrites, { id: newState.member.id, allow: 300942864 }],
            })
            .then(channel => {
                newState.member.voice.setChannel(channel);
                db.insertChannel.run(channel.id, newState.member.id);
            })
            .catch(error => {
                // todo: send user a message?
            })
            .finally(() => {
                cooldowns.set(newState.member.id, Date.now()); // todo: move to db if/when sharding!!
            });
    }
});

client.on('channelUpdate', (old, updated) => {
    const { owner_id: ownerId } = db.selectChannelById.get(updated.id) || {};
    if (ownerId === undefined) return;

    db.deleteUserPreferences(ownerId);
    db.insertUserPreference.run(ownerId, updated.name, updated.userLimit, updated.bitrate);

    for (const overwrite of updated.permissionOverwrites.values()) {
        if (overwrite.id === ownerId && overwrite.type === 'member') continue;
        db.insertUserPreferencePermissions.run(
            overwrite.id,
            overwrite.type,
            overwrite.allow.bitfield,
            overwrite.deny.bitfield,
            ownerId
        );
    }
});

client.login(config.token);
