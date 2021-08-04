import { entities, entityIndexNamed, saveEntities } from '../state.js'
import { sendNotice, sendSkills } from '../view.js'

export const actions = [
  {
    command: '|skill+',
    args: ['entity', 'skill', 'rating'],
    description: 'Add *skill* at *rating* for *entity*',
    gmOnly: true,
    run: ([entityStart, skill, num], resolve, reject) => {
      const rating = parseInt(num, 10)
      if (Number.isNaN(rating)) return reject('Invalid rating number')
      entityIndexNamed(entityStart)
        .then((e) => {
          if (!('skills' in entities[e])) entities[e].skills = []
          entities[e].skills.push({
            name: skill,
            rating
          })
          resolve(sendSkills(entities[e]))
          saveEntities()
        })
        .catch(reject)
    }
  },
  {
    command: '|skill-',
    args: ['entity', 'skill'],
    description: 'Remove *skill* from *entity*',
    gmOnly: true,
    run: ([entityStart, skillStart], resolve, reject) => {
      entityIndexNamed(entityStart)
        .then((e) => {
          if (!('skills' in entities[e])) {
            return reject(`No skills found for ${entities[e].name}`)
          }

          const ski = skillStart.toLowerCase()
          let s = entities[e].skills.findIndex(
            ({ name }) => name.toLowerCase() === ski
          )
          if (s < 0) {
            s = entities[e].skills.findIndex(({ name }) =>
              name.toLowerCase().startsWith(ski)
            )
            if (s < 0) {
              return reject(`No skill found matching "${skillStart}"`)
            }
          }
          entities[e].skills.splice(s, 1)
          if (entities[e].skills.length < 1) {
            delete entities[e].skills
            resolve(sendNotice(`Cleared skills for ${entities[e].name}`))
          } else resolve(sendSkills(entities[e]))
          saveEntities()
        })
        .catch(reject)
    }
  },
  {
    command: '|skills',
    shortcut: '|k',
    args: ['entity'],
    description: 'Print *skills* that are defined for *entity*',
    run: ([entityStart], resolve, reject) => {
      entityIndexNamed(entityStart)
        .then((e) => {
          if (!('skills' in entities[e])) {
            return reject(`No skills found for ${entities[e].name}`)
          }
          resolve(sendSkills(entities[e]))
        })
        .catch(reject)
    }
  }
]
