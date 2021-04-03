
const { Permissions } = require('discord.js')

module.exports.resolvePermissionOverwrites = (bitfield, invert = false) => {
    const permissionOverwrites = {}
    const permissions = new Permissions(bitfield)
    for (const flag in Permissions.FLAGS) {
        if (permissions.has(flag, false)) {
            permissionOverwrites[flag] = !invert
        }
    }
    return permissionOverwrites
}

