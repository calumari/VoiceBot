const dir = './data';

const fs = require('fs');
!fs.existsSync(dir) && fs.mkdirSync(dir);

const db = require('better-sqlite3')(`${dir}/db.sqlite`);

db.prepare(
    `
    CREATE TABLE IF NOT EXISTS guilds (
        id TEXT PRIMARY KEY,
        channel_id TEXT NOT NULL
    );
    `
).run();

db.prepare(
    `
    CREATE TABLE IF NOT EXISTS channels (
        id TEXT PRIMARY KEY,
        owner_id TEXT NOT NULL
    );
    `
).run();

db.prepare(
    `
    CREATE TABLE IF NOT EXISTS user_prefs (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        user_limit INTEGER,
        bitrate INTEGER
    );
    `
).run();

db.prepare(
    `
    CREATE TABLE IF NOT EXISTS user_pref_permissions (
        id TEXT PRIMARY KEY,
        type TEXT STRING NOT NULL,
        allow INTEGER,
        deny INTEGER,
        user_id TEXT NOT NULL,
        FOREIGN KEY(user_id) REFERENCES user_prefs(id)
    );
    `
).run();

module.exports = {
    insertGuild: db.prepare('INSERT INTO guilds (id, channel_id) VALUES (?, ?)'),
    selectChannels: db.prepare('SELECT * FROM channels;'),
    selectChannelById: db.prepare('SELECT owner_id FROM channels WHERE id=?;'),
    selectChannelByOwnerId: db.prepare('SELECT id FROM channels WHERE owner_id=?;'),
    insertChannel: db.prepare('INSERT INTO channels (id, owner_id) VALUES (?, ?);'),
    deleteChannel: db.prepare('DELETE FROM channels WHERE id=?;'),
    selectGuildById: db.prepare('SELECT channel_id FROM guilds WHERE id=?;'),
    selectUserPreferences: id => {
        return {
            ...db.prepare('SELECT * FROM user_prefs WHERE id=?').get(id),
            permissionOverwrites: db
                .prepare('SELECT id, type, allow, deny FROM user_pref_permissions WHERE user_id=?')
                .all(id),
        };
    },
    insertUserPreference: db.prepare('INSERT INTO user_prefs (id, name, user_limit, bitrate) VALUES (?, ?, ?, ?)'),
    insertUserPreferencePermissions: db.prepare(
        'INSERT INTO user_pref_permissions (id, type, allow, deny, user_id) VALUES (?, ?, ?, ?, ?)'
    ),
    deleteUserPreferences: id => {
        db.prepare('DELETE FROM user_pref_permissions WHERE user_id=?;').run(id);
        db.prepare('DELETE FROM user_prefs WHERE id=?;').run(id);
    },
};
