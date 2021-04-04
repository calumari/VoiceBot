module.exports = (client, old, updated) => {
    if (updated.type !== 'voice' || updated.members.size === 0) return;

    const ownerId = updated.guild.getManagedChannelOwnerId(updated.id);
    if (!ownerId) return;
    if (!updated.parent) {
        return guild.sendAlert({
            embed: {
                title: 'Oh dear...',
                description: `I ran into a little trouble while updating <@${member.id}>'s channel preferences. Please ensure that **${channel.name}** is under a category!`,
            },
        });
    }

    client.db.insertChannelPreferences.run(ownerId, updated.parentID, updated.name, updated.userLimit, updated.bitrate);
    client.db.deleteChannelPreferencePermissions.run(ownerId, updated.parentID);

    for (const overwrite of updated.permissionOverwrites.values()) {
        if (updated.parent.permissionOverwrites.find(ow => ow.id === overwrite.id)) continue;
        client.db.insertChannelPreferencePermissions.run(
            ownerId,
            updated.parentID,
            overwrite.id,
            overwrite.allow.bitfield,
            overwrite.deny.bitfield
        );
    }
};
