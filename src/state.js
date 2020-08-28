import Fs from "fs";

export let entities = [];

export function addAspect(entityStart, type, name, freeInvokes = 0) {
  return entityIndexNamed(entityStart).then((e) => {
    entities[e].aspects.push({ name, freeInvokes, type });
  });
}

export function entityAspectIndexNamed(entityStart, aspectStart) {
  return entityIndexNamed(entityStart).then((e) => {
    const asp = aspectStart.toLowerCase();
    return new Promise((resolve, reject) => {
      const exactMatch = entities[e].aspects.findIndex(
        ({ name }) => name.toLowerCase() === asp
      );
      if (exactMatch > -1) return resolve([e, exactMatch]);

      const roughMatches = entities[e].aspects.reduce(
        (as, { name }, a) =>
          name.toLowerCase().startsWith(asp) ? [...as, a] : as,
        []
      );
      if (roughMatches.length > 1) {
        return reject(`I found multiple aspects starting with "${asp}"`);
      }
      if (roughMatches.length < 1) {
        return reject(`I couldn't find an aspect starting with "${asp}"`);
      }
      resolve([e, roughMatches[0]]);
    });
  });
}

export function entityIndexNamed(entityStart) {
  const ent = entityStart.toLowerCase();
  return new Promise((resolve, reject) => {
    const exactMatch = entities.findIndex(
      ({ name }) => name.toLowerCase() === ent
    );
    if (exactMatch > -1) return resolve(exactMatch);

    const roughMatches = entities.reduce(
      (es, { name }, e) =>
        name.toLowerCase().startsWith(ent) ? [...es, e] : es,
      []
    );
    if (roughMatches.length > 1) {
      return reject(`I found multiple entities starting with "${ent}"`);
    }
    if (roughMatches.length < 1) {
      return reject(`I couldn't find an entity starting with "${ent}"`);
    }
    resolve(roughMatches[0]);
  });
}

export function entityTrackIndexNamed(entityStart, trackStart) {
  return entityIndexNamed(entityStart).then((e) => {
    const trk = trackStart.toLowerCase();
    return new Promise((resolve, reject) => {
      if (!("tracks" in entities[e])) {
        return reject(`No tracks found for entity "${entities[e].name}"`);
      }

      const exactMatch = entities[e].tracks.findIndex(
        ({ name }) => name.toLowerCase() === trk
      );
      if (exactMatch > -1) return resolve([e, exactMatch]);

      const roughMatches = entities[e].tracks.reduce(
        (ts, { name }, t) =>
          name.toLowerCase().startsWith(trk) ? [...ts, t] : ts,
        []
      );
      if (roughMatches.length > 1) {
        return reject(`I found multiple tracks starting with "${trk}"`);
      }
      if (roughMatches.length < 1) {
        return reject(`I couldn't find a track starting with "${trk}"`);
      }
      resolve([e, roughMatches[0]]);
    });
  });
}

export function saveEntities() {
  Fs.writeFile("entities.json", JSON.stringify(entities), (err) => {
    if (err) throw err;
  });
}

if (Fs.existsSync("entities.json")) {
  Fs.readFile("entities.json", (err, data) => {
    if (err) throw err;
    entities = JSON.parse(data);
  });
} else {
  saveEntities();
}
