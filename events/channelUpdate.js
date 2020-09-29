const db = require('../utils/db');

module.exports = (old, updated) => {
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
};
