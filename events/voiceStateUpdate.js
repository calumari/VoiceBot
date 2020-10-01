const { Collection } = require('discord.js');

const cooldowns = new Collection(); // todo: move to db

module.exports = (client, oldState, newState) => {
    const { channel_id: channelId } = client.db.selectGuildById.get(newState.guild.id) || {};
    if (channelId === undefined) return;

    if (oldState.channel && client.db.selectChannelById.get(oldState.channelID) !== undefined) {
        const channel = oldState.guild.channels.resolve(oldState.channelID);
        if (channel.members.size === 0) {
            channel
                .delete()
                .catch(error => {
                    // todo: send message why this failed
                })
                .finally(() => {
                    client.db.deleteChannel.run(oldState.channelID);
                });
        }
    }

    if (newState.channelID !== channelId) return;
    if (cooldowns.has(newState.member.id) && Date.now() - cooldowns.get(newState.member.id) < 5000) {
        newState.member.send({
            embed: {
                title: 'Hey, slow down!',
                description: "You're creating channels too fast, please try again in 5 seconds!",
                footer: {
                    icon_url: newState.guild.iconURL(),
                    text: `${newState.guild.name}`,
                },
            },
        });
        newState.member.voice.kick();
        return;
    }

    const prefs = client.db.selectUserPreferences(newState.member.id);
    newState.guild.channels
        .create(prefs.name || `${newState.member.displayName}'s channel`, {
            type: 'voice',
            position: newState.channel.position + 1,
            parent: newState.channel.parentID,
            permissionOverwrites: [...prefs.permissionOverwrites, { id: newState.member.id, allow: 300942864 }],
        })
        .then(channel => {
            newState.member.voice.setChannel(channel);
            client.db.insertChannel.run(channel.id, newState.member.id);
        })
        .catch(error => {
            // todo: send user a message?
        })
        .finally(() => {
            cooldowns.set(newState.member.id, Date.now());
        });
};
