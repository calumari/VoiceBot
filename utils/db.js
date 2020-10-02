const dir = './data';

const fs = require('fs');
!fs.existsSync(dir) && fs.mkdirSync(dir);

const db = require('better-sqlite3')(`${dir}/db.sqlite`);

db.prepare(
    `
    CREATE TABLE IF NOT EXISTS guild_settings (
        id TEXT PRIMARY KEY,
        prefix TEXT
    );
    `
).run();

db.prepare(
    `
    CREATE TABLE IF NOT EXISTS guild_channels (
        id TEXT PRIMARY KEY,
        owner_id TEXT NOT NULL,
        guild_id TEXT NOT NULL,
        FOREIGN KEY(guild_id) REFERENCES guild_settings(id)
    );
    `
).run();

db.prepare(
    `
    CREATE TABLE IF NOT EXISTS guild_triggers (
        id TEXT PRIMARY KEY,
        guild_id TEXT NOT NULL,
        FOREIGN KEY(guild_id) REFERENCES guild_settings(id)
    );
    `
).run();

module.exports = {
    insertGuild: db.prepare('INSERT INTO guild_settings (id) VALUES (?)'),
    selectGuildById: db.prepare('SELECT * FROM guild_settings WHERE id=?;'),

    selectGuildPrefix: db.prepare('SELECT prefix FROM guild_settings WHERE id=?;'),
    updateGuildPrefix: db.prepare('UPDATE guild_settings SET prefix=? WHERE id=?'),

    insertGuildChannel: db.prepare('INSERT INTO guild_channels (id, owner_id, guild_id) VALUES (?, ?, ?);'),
    selectGuildChannelsByGuild: db.prepare('SELECT id FROM guild_channels WHERE guild_id=?;'),
    deleteGuildChannel: db.prepare('DELETE FROM guild_channels WHERE id=?;'),

    insertGuildTrigger: db.prepare('INSERT INTO guild_triggers (id, guild_id) VALUES (?, ?)'),
    selectGuildTriggersByGuild: db.prepare('SELECT id FROM guild_triggers WHERE guild_id=?'),
};
