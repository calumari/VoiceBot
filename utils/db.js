const dir = './data';

const fs = require('fs');
!fs.existsSync(dir) && fs.mkdirSync(dir);

const db = require('better-sqlite3')(`${dir}/db.sqlite`);

db.prepare(
    `
    CREATE TABLE IF NOT EXISTS guild_preferences (
        id TEXT PRIMARY KEY,
        prefix TEXT
    );
    `
).run();

db.prepare(
    `
    CREATE TABLE IF NOT EXISTS guild_channels (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        guild_id TEXT NOT NULL,
        FOREIGN KEY(guild_id) REFERENCES guild_preferences(id)
    );
    `
).run();

db.prepare(
    `
    CREATE TABLE IF NOT EXISTS guild_triggers (
        id TEXT PRIMARY KEY,
        guild_id TEXT NOT NULL,
        FOREIGN KEY(guild_id) REFERENCES guild_preferences(id)
    );
    `
).run();

db.prepare(
    `
    CREATE TABLE IF NOT EXISTS channel_preferences (
        user_id TEXT NOT NULL,
        parent_id TEXT NOT NULL,
        name TEXT NOT NULL,
        user_limit INTEGER,
        bitrate INTEGER
    );
    `
).run();
db.prepare(`CREATE UNIQUE INDEX IF NOT EXISTS idx_channel_preferences_user_parent ON channel_preferences(user_id, parent_id);`).run()

db.prepare(
    `
    CREATE TABLE IF NOT EXISTS channel_permissions (
        user_id TEXT NOT NULL,
        parent_id TEXT NOT NULL,
        user_or_role_id TEXT NOT NULL,
        allow INTEGER,
        deny INTEGER
    );
    `
).run();
db.prepare(`CREATE UNIQUE INDEX IF NOT EXISTS idx_channel_permissions_user_parent ON channel_permissions(user_id, parent_id, user_or_role_id);`).run()

module.exports = {
    insertGuild: db.prepare('INSERT OR IGNORE INTO guild_preferences (id) VALUES (?);'),
    selectGuildById: db.prepare('SELECT * FROM guild_preferences WHERE id=?;'),

    selectGuildPrefix: db.prepare('SELECT prefix FROM guild_preferences WHERE id=?;'),
    updateGuildPrefix: db.prepare('UPDATE guild_preferences SET prefix=? WHERE id=?;'),

    insertGuildChannel: db.prepare('INSERT INTO guild_channels (id, user_id, guild_id) VALUES (?, ?, ?);'),
    selectGuildChannelsByGuild: db.prepare('SELECT id, user_id FROM guild_channels WHERE guild_id=?;'),
    deleteGuildChannel: db.prepare('DELETE FROM guild_channels WHERE id=?;'),
    transferGuildChannel: db.prepare('UPDATE guild_channels SET user_id=? WHERE id=?'),

    insertGuildTrigger: db.prepare('INSERT INTO guild_triggers (id, guild_id) VALUES (?, ?);'),
    selectGuildTriggersByGuild: db.prepare('SELECT id FROM guild_triggers WHERE guild_id=?;'),
    deleteGuildTrigger: db.prepare('DELETE FROM guild_triggers WHERE id=?;'),

    selectChannelPreferences: (userId, parentId) => {
        return {
            ...db.prepare('SELECT * FROM channel_preferences WHERE user_id=? AND parent_id=?;').get(userId, parentId),
            permissions: db.prepare('SELECT user_or_role_id, allow, deny FROM channel_permissions WHERE user_id=? AND parent_id=?;').all(userId, parentId),
        }
    },
    insertChannelPreferences: db.prepare('INSERT OR REPLACE INTO channel_preferences (user_id, parent_id, name, user_limit, bitrate) VALUES (?, ?, ?, ?, ?);'),
    insertChannelPreferencePermissions: db.prepare('INSERT INTO channel_permissions (user_id, parent_id, user_or_role_id, allow, deny) VALUES (?, ?, ?, ?, ?);'),
    deleteChannelPreferencePermissions: db.prepare('DELETE FROM channel_permissions WHERE user_id=? AND parent_id=?;'),
};
