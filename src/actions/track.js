import { initialize } from '../utils.js'
import {
  entities,
  entityIndexNamed,
  entityTrackIndexNamed,
  saveEntities
} from '../state.js'

export const actions = [
  {
    command: '|track+',
    shortcut: '|t',
    args: ['entity', 'type', 'icon', 'points'],
    description:
      'Create a stress track for *entity* of *type* with *icon* and number of *points*',
    gmOnly: true,
    run: ([entityStart, type, icon, points], resolve, reject) => {
      entityIndexNamed(entityStart)
        .then((e) => {
          if (!('tracks' in entities[e])) entities[e].tracks = []
          entities[e].tracks.push({
            icon,
            ratings: initialize(points, () => true),
            type
          })
          resolve()
          saveEntities()
        })
        .catch(reject)
    }
  },
  {
    command: '|track-',
    shortcut: '|T',
    args: ['entity', 'type'],
    description: 'Remove the stress track of *type* for *entity*',
    gmOnly: true,
    run: ([entityStart, typeStart], resolve, reject) => {
      entityTrackIndexNamed(entityStart, typeStart)
        .then(([e, t]) => {
          entities[e].tracks.splice(t, 1)
          if (entities[e].tracks.length < 1) delete entities[e].tracks
          resolve()
          saveEntities()
        })
        .catch(reject)
    }
  }
]
