import { entities, entityTrackIndexNamed, saveEntities } from '../state.js'

export const actions = [
  {
    command: '|stress+',
    shortcut: '|s',
    args: ['entity', 'type', 'shifts'],
    description: 'Add *type* stress (consuming *shifts* boxes) on *entity*',
    gmOnly: true,
    run: ([entityStart, typeStart, shiftsString], resolve, reject) => {
      let shifts = parseInt(shiftsString, 10)
      if (Number.isNaN(shifts)) return reject(new Error('Invalid number of shifts'))
      entityTrackIndexNamed(entityStart, typeStart)
        .then(([e, t]) => {
          const availableBoxes = entities[e].tracks[t].ratings.filter(r => r === true)
          if (availableBoxes.length < shifts) {
            return reject(new Error('Not enough available stress boxes'))
          }
          for (const r in entities[e].tracks[t].ratings) {
            if (entities[e].tracks[t].ratings[r] === true) {
              entities[e].tracks[t].ratings[r] = false
              if (--shifts === 0) break
            }
          }
          resolve()
          saveEntities()
        })
        .catch(reject)
    }
  },
  {
    command: '|stress-',
    shortcut: '|S',
    args: ['entity', 'type', 'shifts'],
    description: 'Remove *type* stress (clearing *shifts* boxes) on *entity*',
    gmOnly: true,
    run: ([entityStart, typeStart, shiftsString], resolve, reject) => {
      let shifts = parseInt(shiftsString, 10)
      if (Number.isNaN(shifts)) return reject('Invalid number of shifts')
      entityTrackIndexNamed(entityStart, typeStart)
        .then(([e, t]) => {
          for (let r = entities[e].tracks[t].ratings.length - 1; r > -1; r--) {
            if (entities[e].tracks[t].ratings[r] === false) {
              entities[e].tracks[t].ratings[r] = true
              if (--shifts === 0) break
            }
          }
          resolve()
          saveEntities()
        })
        .catch(reject)
    }
  },
  {
    command: '|stress-clear',
    shortcut: '|SS',
    args: ['entity', 'type'],
    description: 'Clear all stress boxes of *type* on the *entity*',
    gmOnly: true,
    run: ([entityStart, typeStart], resolve, reject) => {
      entityTrackIndexNamed(entityStart, typeStart)
        .then(([e, t]) => {
          for (const r in entities[e].tracks[t].ratings) {
            entities[e].tracks[t].ratings[r] = true
          }
          resolve()
          saveEntities()
        })
        .catch(reject)
    }
  },
  {
    command: '|stress-clearall',
    shortcut: '|SSS',
    args: ['type'],
    description: 'Clear all stress boxes of *type* on all entities',
    gmOnly: true,
    run: ([typeStart], resolve) => {
      const trk = typeStart.toLowerCase()
      for (const e in entities) {
        if (!('tracks' in entities[e])) continue
        for (const t in entities[e].tracks) {
          if (entities[e].tracks[t].name.toLowerCase() !== trk) continue
          for (const r in entities[e].tracks[t].ratings) {
            entities[e].tracks[t].ratings[r] = true
          }
        }
      }
      resolve()
      saveEntities()
    }
  }
]
