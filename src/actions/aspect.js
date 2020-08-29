import { AspectType } from "../fate.js";
import {
  addAspect,
  entities,
  entityAspectIndexNamed,
  saveEntities,
} from "../state.js";

export const actions = [
  {
    command: "|aspect+",
    shortcut: "|a",
    args: ["entity", "...aspect"],
    description: "Add *aspect* to *entity*",
    gmOnly: true,
    run: ([entityStart, ...aspect], resolve, reject) => {
      addAspect(entityStart, AspectType.Aspect, aspect.join(" "))
        .then(resolve)
        .catch(reject);
    },
  },
  {
    command: "|aspect-",
    shortcut: "|A",
    args: ["entity", "aspect"],
    description: "Remove *aspect* (or boost) from *entity*",
    gmOnly: true,
    run: ([entityStart, aspectStart], resolve, reject) => {
      entityAspectIndexNamed(entityStart, aspectStart)
        .then(([e, a]) => {
          entities[e].aspects.splice(a, 1);
          resolve();
          saveEntities();
        })
        .catch(reject);
    },
  },
  {
    command: "|aspect+1",
    shortcut: "|a1",
    args: ["entity", "...aspect"],
    description: "Add *aspect* to *entity* with 1 free invoke",
    gmOnly: true,
    run: ([entityStart, ...aspect], resolve, reject) => {
      addAspect(entityStart, AspectType.Aspect, aspect.join(" "), 1)
        .then(resolve)
        .catch(reject);
    },
  },
  {
    command: "|aspect+2",
    shortcut: "|a2",
    args: ["entity", "...aspect"],
    description: "Add *aspect* to *entity* with 2 free invokes",
    gmOnly: true,
    run: ([entityStart, ...aspect], resolve, reject) => {
      addAspect(entityStart, AspectType.Aspect, aspect.join(" "), 2)
        .then(resolve)
        .catch(reject);
    },
  },
  {
    command: "|boost",
    shortcut: "|b",
    args: ["entity", "...boost"],
    description: "Add *boost* to *entity* with 1 free invoke",
    gmOnly: true,
    run: ([entityStart, ...boost], resolve, reject) => {
      addAspect(entityStart, AspectType.Boost, boost.join(" "), 1)
        .then(resolve)
        .catch(reject);
    },
  },
];
