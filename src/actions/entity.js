import { entities, entityIndexNamed, saveEntities } from "../state.js";

export const actions = [
  {
    command: "|entity+",
    shortcut: "|e",
    args: ["...name"],
    description: "Create a new entity with *name*",
    gmOnly: true,
    run: (name, resolve) => {
      entities.push({ aspects: [], name: name.join(" ") });
      resolve();
      saveEntities();
    },
  },
  {
    command: "|entity-",
    shortcut: "|E",
    args: ["name"],
    description: "Deletes entity with *name*",
    gmOnly: true,
    run: ([entityStart], resolve, reject) => {
      entityIndexNamed(entityStart.toLowerCase())
        .then((e) => {
          entities.splice(e, 1);
          resolve();
          saveEntities();
        })
        .catch(reject);
    },
  },
];
