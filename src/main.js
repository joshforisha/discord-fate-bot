import actions from './actions/all.js'
import Dotenv from 'dotenv'
import { Client } from 'discord.js'
import { sendEntities, sendError } from './view.js'

Dotenv.config()

const discordClient = new Client()

const usageFields = actions
  .sort((a, b) => (a.command < b.command ? -1 : 1))
  .map(({ args, command, description, shortcut }) => {
    const argsText = args ? args.map((a) => `*${a}*`).join(' ') : ''
    return {
      name: `${command}${argsText.length ? ' ' : ''}${argsText}`,
      value: [description, shortcut ? `Shortcut: \`${shortcut}\`` : null]
    }
  })

process.on('SIGINT', () => {
  discordClient.destroy()
  console.log('Disconnected')
  process.exit(0)
})

function sendUsage (channel) {
  channel.send('', {
    embed: {
      color: 0xebcb8b,
      title: 'Commands',
      description: 'All commands are prefixed with `|` (the "pipe" character)',
      fields: usageFields
    }
  })
}

discordClient.on('message', ({ author, content, channel, guild, member }) => {
  if (author.bot || !content.startsWith('|')) return

  const gmRole = guild.roles.cache.find((role) => role.name === 'GM')
  if (!gmRole) return sendError(channel)('A "GM" role is required')
  const isGM = member._roles.some((roleId) => roleId === gmRole.id)

  const [cmd, ...tokens] = content.split(' ')
  const action = actions.find(
    ({ command, shortcut }) => command === cmd || shortcut === cmd
  )

  if (!action) return sendUsage(channel)

  if (action.gmOnly && !isGM) {
    return sendError(channel)('You need the "GM" role to do that!')
  }

  if ('args' in action) {
    if (action.args.some((a) => a.startsWith('...'))) {
      if (tokens.length < action.args.length) {
        return sendError(channel)('Not enough arguments')
      }
    } else if (tokens.length !== action.args.length) {
      return sendError(channel)('Not enough arguments')
    }
  }

  new Promise((resolve, reject) => action.run(tokens, resolve, reject))
    .then((send = sendEntities) => {
      send(channel)
    })
    .catch(sendError(channel))
})

discordClient.login(process.env.BOT_TOKEN)
