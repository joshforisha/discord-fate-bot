import { entities, entityAspectIndexNamed, saveEntities } from '../state.js'

export const actions = [
  {
    command: '|invoke+',
    shortcut: '|i',
    args: ['entity', 'aspect'],
    description: 'Add a free invoke to *aspect* on *entity*',
    gmOnly: true,
    run: ([entityStart, aspectStart], resolve, reject) => {
      entityAspectIndexNamed(entityStart, aspectStart)
        .then(([e, a]) => {
          entities[e].aspects[a].freeInvokes += 1
          resolve()
          saveEntities()
        })
        .catch(reject)
    }
  },
  {
    command: '|invoke=',
    shortcut: '|i=',
    args: ['count', 'entity', 'aspect'],
    description: 'Set free invokes to *count* on the *aspect* for *entity*',
    gmOnly: true,
    run: ([num, entityStart, aspectStart], resolve, reject) => {
      const count = parseInt(num, 10)
      if (Number.isNaN(count) || count < 0) {
        return reject('Invalid count number')
      }
      entityAspectIndexNamed(entityStart, aspectStart)
        .then(([e, a]) => {
          entities[e].aspects[a].freeInvokes = count
          resolve()
          saveEntities()
        })
        .catch(reject)
    }
  },
  {
    command: '|invoke-',
    shortcut: '|I',
    args: ['entity', 'aspect'],
    description: 'Remove a free invoke to *aspect* for *entity*',
    gmOnly: true,
    run: ([entityName, aspectName], resolve, reject) => {
      entityAspectIndexNamed(entityName, aspectName)
        .then(([e, a]) => {
          entities[e].aspects[a].freeInvokes = Math.max(
            0,
            entities[e].aspects[a].freeInvokes - 1
          )
          resolve()
          saveEntities()
        })
        .catch(reject)
    }
  }
]
