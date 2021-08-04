import { AspectType } from './fate.js'
import { entities } from './state.js'

export function aspectText ({ freeInvokes, name, type }) {
  const sym = type === AspectType.Boost ? '*' : ''
  const fis = freeInvokes > 0 ? ` \`${freeInvokes}\`` : ''
  return `> ${sym}${name}${sym}${fis}`
}

export const ensp = ' '

export function numberEmoji (num) {
  switch (num) {
    case 0:
      return ':zero:'
    case 1:
      return ':one:'
    case 2:
      return ':two:'
    case 3:
      return ':three:'
    case 4:
      return ':four:'
    case 5:
      return ':five:'
    case 6:
      return ':six:'
    case 7:
      return ':seven:'
    case 8:
      return ':eight:'
    case 9:
      return ':nine:'
  }
}

export function sendEntities (channel) {
  if (entities.length < 1) {
    return channel.send('***No entities***')
  }
  channel.send('', {
    embed: {
      color: 0x5e81ac,
      fields: entities.map(({ aspects, fatePoints, name, tracks }) => {
        const fp =
          typeof fatePoints === 'number'
            ? `${ensp}${numberEmoji(fatePoints)}`
            : ''
        const st = tracks ? `${ensp}${tracks.map(trackSpan).join(ensp)}` : ''
        return {
          name: `${name}${fp}${st}`,
          value:
            aspects.length > 0 ? aspects.map(aspectText) : '***No aspects***'
        }
      })
    }
  })
}

export function sendError (channel) {
  return (err) => {
    channel.send('', {
      embed: {
        color: 0xbf616a,
        description: err.message
      }
    })
  }
}

export function sendNotice (message) {
  return (channel) => {
    channel.send('', {
      embed: {
        color: 0x81a1c1,
        description: message
      }
    })
  }
}

export function sendSkills ({ name, skills }) {
  return (channel) => {
    channel.send('', {
      embed: {
        title: name,
        color: 0xb48ead,
        description: skills
          .sort((a, b) => (a.name < b.name ? -1 : 1))
          .sort((a, b) => (a.rating > b.rating ? -1 : 1))
          .map(
            ({ name, rating }) => `${rating > -1 ? '+' : ''}${rating} ${name}`
          )
          .join('\n')
      }
    })
  }
}

export function trackSpan ({ icon, ratings }) {
  return ratings
    .map(valid => (valid ? icon : ':x:'))
    .join(' ')
}
