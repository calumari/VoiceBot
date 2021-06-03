const Discord = require('discord.js');
const { readdirSync } = require('fs');

require('./extensions/ExtendedGuild');
require('./extensions/ExtendedGuildMember');
require('./extensions/ExtendedVoiceChannel');

const intents = new Discord.Intents();
intents.add(Discord.Intents.FLAGS.GUILD_MEMBERS, Discord.Intents.NON_PRIVILEGED);

const client = new Discord.Client({ fetchAllMembers: true, ws: { intents: intents } });

client.config = require('./config');
client.db = require('./util/db');

client.commands = new Discord.Collection();
client.aliases = new Discord.Collection();

readdirSync('./commands')
    .filter(f => f.endsWith('.js'))
    .forEach(f => {
        const command = require(`./commands/${f}`);
        client.commands.set(command.usage.name, command);
        if (command.usage.aliases) {
            for (const alias of command.usage.aliases) {
                client.aliases.set(alias, command);
            }
        }
        delete require.cache[require.resolve(`./commands/${f}`)];
    });

readdirSync('./events')
    .filter(f => f.endsWith('.js'))
    .forEach(f => {
        const name = f.substring(0, f.indexOf('.'));
        console.log(`Loading event: ${name}`);
        const event = require(`./events/${f}`);
        const listener = event.run.bind(null, client);
        if (event.once) {
            client.once(name, listener);
        } else {
            client.on(name, listener);
        }
        delete require.cache[require.resolve(`./events/${f}`)];
    });

client.login(client.config.token);
