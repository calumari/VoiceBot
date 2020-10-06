async function handleLeave({ channel, guild }) {
    if (!guild.managed.includes(channel.id) || !channel.isEmpty(channel.client.config.ignoreBots)) return;
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
    if (!guild.triggers.includes(channel.id)) return;
    if (!guild.me.hasPermission(['MANAGE_CHANNELS', 'MOVE_MEMBERS'])) {
        return guild.sendAlert({
            embed: {
                title: 'Oh dear...',
                description: `I ran into a little trouble while creating a voice channel for <@${member.id}>. Please ensure that I have permission to **Manage Channels** and **Move Members**!`,
            },
        });
    }

    const managed = await guild.channels.create(`${member.displayName}'s channel`, {
        type: 'voice',
        userLimit: channel.userLimit,
        parent: channel.parentID,
        permissionOverwrites: [{ id: member.id, allow: ['VIEW_CHANNEL', 'SPEAK', 'MANAGE_CHANNELS'] }],
    });
    guild.addManagedChannel(managed, member);
    member.voice.setChannel(managed);
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
