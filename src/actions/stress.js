import { entities, entityTrackIndexNamed } from "../state.js";

export const actions = [
  {
    command: "|clear",
    shortcut: "|C",
    args: ["entity", "type"],
    description: "Clear all stress boxes of *type* on the *entity*",
    gmOnly: true,
    run: ([entityStart, typeStart], resolve, reject) => {
      entityTrackIndexNamed(entityStart, typeStart)
        .then(([e, t]) => {
          for (let r in entities[e].tracks[t].ratings) {
            entities[e].tracks[t].ratings[r].clear = true;
          }
          resolve();
        })
        .catch(reject);
    },
  },
  {
    command: "|clearall",
    shortcut: "|CC",
    args: ["type"],
    description: "Clear all stress boxes of *type* on all entities",
    gmOnly: true,
    run: ([typeStart], resolve) => {
      const trk = typeStart.toLowerCase();
      for (let e in entities) {
        if (!("tracks" in entities[e])) continue;
        for (let t in entities[e].tracks) {
          if (entities[e].tracks[t].name.toLowerCase() !== trk) continue;
          for (let r in entities[e].tracks[t].ratings) {
            entities[e].tracks[t].ratings[r].clear = true;
          }
        }
      }
      resolve();
    },
  },
  {
    command: "|stress+",
    shortcut: "|s",
    args: ["entity", "type", "number"],
    description: "Add *type* stress (consuming a *number* box) on *entity*",
    gmOnly: true,
    run: ([entityStart, typeStart, num], resolve, reject) => {
      const rating = parseInt(num, 10);
      if (Number.isNaN(rating)) return reject("Invalid stress rating");
      entityTrackIndexNamed(entityStart, typeStart)
        .then(([e, t]) => {
          const r = entities[e].tracks[t].ratings.findIndex(
            ({ clear, value }) => clear && value === rating
          );
          if (r < 0) {
            return reject(`No available ${rating} boxes`);
          }
          entities[e].tracks[t].ratings[r].clear = false;
          resolve();
        })
        .catch(reject);
    },
  },
  {
    command: "|stress-",
    shortcut: "|S",
    args: ["entity", "type", "number"],
    description: "Remove *type* stress (clearing a *number* box) on *entity*",
    gmOnly: true,
    run: ([entityStart, typeStart, num], resolve, reject) => {
      const rating = parseInt(num, 10);
      if (Number.isNaN(rating)) {
        return reject(`I need a number rating to clear stress`);
      }
      entityTrackIndexNamed(entityStart, typeStart)
        .then(([e, t]) => {
          const ratings = [...entities[e].tracks[t].ratings];
          const r = ratings
            .reverse()
            .findIndex(({ clear, value }) => !clear && value === rating);
          if (r < 0) {
            return reject(`No marked ${rating} boxes`);
          }
          entities[e].tracks[t].ratings[ratings.length - 1 - r].clear = true;
          resolve();
        })
        .catch(reject);
    },
  },
];
