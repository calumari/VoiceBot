const Discord = require('discord.js');

const db = require('./db');
const config = require('./config');

const client = new Discord.Client();

client.on('voiceStateUpdate', (oldState, newState) => {
    const { channel_id: channelID } = db.selectGuildById.get(newState.guild.id);
    if (channelID === undefined) return;
    // todo: user cooldown

    if (newState.channelID === channelID) {
        const prefs = db.selectUserPreferences(newState.member.id);

        const defaultOverwrites = [{ id: newState.member.id, allow: 300942864 }];
        const permissionOverwrites = prefs.permissionOverwrites.map(o1 =>
            Object.assign(
                o1,
                defaultOverwrites.find(o2 => o1.id === o2.id)
            )
        );

        newState.guild.channels
            .create(prefs.name || `${newState.member.displayName}'s channel`, {
                type: 'voice',
                position: newState.channel.position + 1,
                parent: newState.channel.parentID,
                permissionOverwrites,
            })
            .then(channel => {
                newState.member.voice.setChannel(channel);
                db.insertChannel.run(channel.id, newState.member.id);
            })
            .catch(error => {
                // todo: send user a message?
            });
    }

    if (db.selectChannelById.get(oldState.channelID) !== undefined) {
        const channel = oldState.guild.channels.resolve(oldState.channelID);
        if (channel.members.size > 0) return;
        channel
            .delete()
            .catch(error => {
                // todo: send message why this failed
            })
            .finally(() => {
                db.deleteChannel.run(oldState.channelID);
            });
    }
});

client.on('channelUpdate', (old, updated) => {
    const channel = db.selectChannelById.get(updated.id);
    if (channel === undefined) return;

    db.deleteUserPreferences(channel['owner_id']);
    db.insertUserPreference.run(channel['owner_id'], updated.name, updated.userLimit, updated.bitrate);

    for (const overwrite of updated.permissionOverwrites.values()) {
        db.insertUserPreferencePermissions.run(
            overwrite.id,
            overwrite.type,
            overwrite.allow.bitfield,
            overwrite.deny.bitfield,
            channel['owner_id']
        );
    }
});

client.login(config.token);
