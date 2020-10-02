module.exports = async (client, oldState, newState) => {
    try {
        if (oldState.channel && oldState.guild.managed.includes(oldState.channel.id) && oldState.channel.isEmpty(client.config.ignoreBots)) {
            if (!oldState.guild.me.hasPermission('MANAGE_CHANNELS')) {
                return oldState.guild.sendAlert({
                    embed: {
                        title: 'Oh dear...',
                        description: `I ran into a little trouble while cleaning up a voice channel. Please ensure that I have permission to **Manage Channels**!`,
                    },
                });
            }

            await oldState.channel.delete();
            oldState.guild.removeManagedChannel(oldState.channelID);
        }

        if (newState.channel && newState.guild.triggers.includes(newState.channel.id)) {
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
