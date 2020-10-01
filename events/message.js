const prefix = '.voice'; // todo: per guild prefix

module.exports = (client, message) => {
    if (message.author.bot || message.channel.type === 'dm') return;

    const prefixRegex = new RegExp(`^(<@!?${client.user.id}>|${prefix.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})\\s*`);
    if (!prefixRegex.test(message.content)) return;

    const [, match] = message.content.match(prefixRegex);
    const args = message.content.slice(match.length).trim().split(/\\s+/g);
    const cmd = args.shift().toLowerCase();

    const command = client.commands.get(cmd) || client.aliases.get(cmd);
    if (!command) return; // todo: send help!

    // todo perm check

    command.run(client, message, args);
};
