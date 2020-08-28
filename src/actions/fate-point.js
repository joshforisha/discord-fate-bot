import { entities, entityIndexNamed } from "../state.js";

export const actions = [
  {
    command: "|fate+",
    shortcut: "|f",
    args: ["entity"],
    description: "Give a fate point to *entity*",
    gmOnly: true,
    run: ([entityStart], resolve, reject) => {
      entityIndexNamed(entityStart)
        .then((e) => {
          entities[e].fatePoints = (entities[e].fatePoints || 0) + 1;
          resolve();
        })
        .catch(reject);
    },
  },
  {
    command: "|fate=",
    shortcut: "|f=",
    args: ["points", "entity"],
    description: "Set fate points to *points* for *entity*",
    gmOnly: true,
    run: ([num, entityStart], resolve, reject) => {
      const points = parseInt(num, 10);
      if (Number.isNaN(points) || points < 0 || points > 9) {
        return reject("Invalid number of fate points");
      }
      entityIndexNamed(entityStart)
        .then((e) => {
          entities[e].fatePoints = points;
          resolve();
        })
        .catch(reject);
    },
  },
  {
    command: "|fate-",
    shortcut: "|F",
    args: ["entity"],
    description: "Take a fate point from *entity*",
    gmOnly: true,
    run: ([entityStart], resolve, reject) => {
      entityIndexNamed(entityStart)
        .then((e) => {
          if ("fatePoints" in entities[e]) {
            if (entities[e].fatePoints === 0) {
              delete entities[e].fatePoints;
            } else {
              entities[e].fatePoints = entities[e].fatePoints - 1;
            }
          }
          resolve();
        })
        .catch(reject);
    },
  },
];
