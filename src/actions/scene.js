import { AspectType } from '../fate.js'
import { entities, saveEntities } from '../state.js'

export const actions = [
  {
    command: '|endscene',
    shortcut: '|X',
    args: [],
    description: 'Clear boosts and stress boxes on all entities',
    gmOnly: true,
    run: (_, resolve) => {
      for (const e in entities) {
        if ('tracks' in entities[e]) {
          for (const t in entities[e].tracks) {
            for (const r in entities[e].tracks[t].ratings) {
              if (entities[e].tracks[t].ratings[r] === false) {
                entities[e].tracks[t].ratings[r] = true
              }
            }
          }
        }
        if ('aspects' in entities[e]) {
          entities[e].aspects = entities[e].aspects
            .filter(aspect => aspect.type !== AspectType.Boost)
        }
      }
      resolve()
      saveEntities()
    }
  }
]
