const { Collection } = require('discord.js');
const message = require('./message');

const cooldowns = new Collection(); // todo: move to db

module.exports = (client, oldState, newState) => {
    if (oldState.channelID && oldState.guild.managed.includes(oldState.channelID)) {
        const channel = oldState.guild.channels.resolve(oldState.channelID);
        if (channel.members.size === 0) {
            channel
                .delete()
                .catch(error => {
                    // todo: send message why this failed
                })
                .finally(() => {
                    oldState.guild.removeManagedChannel(oldState.channelID);
                });
        }
    }

    if (!newState.channelID || !newState.guild.triggers.includes(newState.channelID)) return;
    newState.guild.channels
        .create(`${newState.member.displayName}'s channel`, {
            type: 'voice',
            userLimit: newState.channel.userLimit,
            parent: newState.channel.parentID,
            permissionOverwrites: [{ id: newState.member.id, allow: ['VIEW_CHANNEL', 'SPEAK'] }],
        })
        .then(channel => {
            newState.guild.addManagedChannel(channel, newState.member);
            newState.member.voice.setChannel(channel);
        })
        .catch(err => {
            console.log(err);
            // todo: send user a message?
        })
        .finally(() => {
            cooldowns.set(newState.member.id, Date.now());
        });
};
