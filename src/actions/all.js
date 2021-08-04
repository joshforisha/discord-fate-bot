import * as Aspect from './aspect.js'
import * as Entity from './entity.js'
import * as FatePoint from './fate-point.js'
import * as Invoke from './invoke.js'
import * as Print from './print.js'
import * as Roll from './roll.js'
import * as Scene from './scene.js'
import * as Skill from './skill.js'
import * as Stress from './stress.js'
import * as Track from './track.js'

export default [
  ...Aspect.actions,
  ...Entity.actions,
  ...FatePoint.actions,
  ...Invoke.actions,
  ...Print.actions,
  ...Roll.actions,
  ...Scene.actions,
  ...Skill.actions,
  ...Stress.actions,
  ...Track.actions
]
