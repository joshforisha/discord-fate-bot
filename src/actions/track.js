import { entities, entityIndexNamed, entityTrackIndexNamed } from "../state.js";

export const actions = [
  {
    command: "|track+",
    shortcut: "|t",
    args: ["entity", "type", "values"],
    description:
      "Create a stress track for *entity* of *type* with *values* as a string of ratings (e.g., `123` for :one: :two: :three:)",
    gmOnly: true,
    run: ([entityStart, type, values], resolve, reject) => {
      entityIndexNamed(entityStart)
        .then((e) => {
          const ratings = [];
          for (let i = 0; i < values.length; i++) {
            const rating = parseInt(values[i], 10);
            if (Number.isNaN(rating)) {
              return reject(`Invalid ratings string "${values}"`);
            }
            ratings.push(rating);
          }
          if (!("tracks" in entities[e])) entities[e].tracks = [];
          entities[e].tracks.push({
            name: type,
            ratings: ratings.map((value) => ({
              clear: true,
              value,
            })),
          });
          resolve();
        })
        .catch(reject);
    },
  },
  {
    command: "|track-",
    shortcut: "|T",
    args: ["entity", "type"],
    description: "Remove the stress track of *type* for *entity*",
    gmOnly: true,
    run: ([entityStart, typeStart], resolve, reject) => {
      entityTrackIndexNamed(entityStart, typeStart)
        .then(([e, t]) => {
          entities[e].tracks.splice(t, 1);
          if (entities[e].tracks.length < 1) delete entities[e].tracks;
          resolve();
        })
        .catch(reject);
    },
  },
];
