import * as Aspect from "./aspect.js";
import * as Entity from "./entity.js";
import * as FatePoint from "./fate-point.js";
import * as Print from "./print.js";

const actions = [
  ...Aspect.actions,
  ...Entity.actions,
  ...FatePoint.actions,
  ...Print.actions,
];

export default actions;
