module.exports = (client, old, updated) => {
    const ownerId = updated.guild.getManagedChannelOwnerId(updated.id);
    if (!ownerId) return;
    client.db.insertUserPreference.run(ownerId, updated.name, updated.userLimit, updated.bitrate);
};