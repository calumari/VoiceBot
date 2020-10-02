module.exports = async (client, oldState, newState) => {
    try {
        if (oldState.channelID && oldState.guild.managed.includes(oldState.channelID)) {
            if (!oldState.guild.me.hasPermission('MANAGE_CHANNELS')) {
                return oldState.guild.sendAlert({
                    embed: {
                        title: 'Oh dear...',
                        description: `I ran into a little trouble while cleaning up a voice channel. Please ensure that I have permission to **Manage Channels**!`,
                    },
                });
            }

            const channel = oldState.guild.channels.resolve(oldState.channelID);
            if (channel.members.size === 0) {
                await channel.delete();
                oldState.guild.removeManagedChannel(oldState.channelID);
            }
        }

        if (newState.channelID && newState.guild.triggers.includes(newState.channelID)) {
            if (!newState.guild.me.hasPermission(['MANAGE_CHANNELS', 'MOVE_MEMBERS'])) {
                return newState.guild.sendAlert({
                    embed: {
                        title: 'Oh dear...',
                        description: `I ran into a little trouble while creating a voice channel for <@${newState.member.id}>. Please ensure that I have permission to **Manage Channels** and **Move Members**!`,
                    },
                });
            }

            const channel = await newState.guild.channels.create(`${newState.member.displayName}'s channel`, {
                type: 'voice',
                userLimit: newState.channel.userLimit,
                parent: newState.channel.parentID,
                permissionOverwrites: [{ id: newState.member.id, allow: ['VIEW_CHANNEL', 'SPEAK'] }],
            });
            newState.guild.addManagedChannel(channel, newState.member);
            newState.member.voice.setChannel(channel);
        }
    } catch (err) {
        // todo: explain what happened to user/owner
        console.log(err);
    }
};
