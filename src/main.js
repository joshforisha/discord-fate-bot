require("dotenv").config();

const { Client } = require("discord.js");
const Fs = require("fs");

const ensp = " ";

const AspectType = {
  Aspect: "ASPECT",
  Boost: "BOOST",
};

let entities = [];

const discordClient = new Client();

process.on("SIGINT", () => {
  discordClient.destroy();
  console.log("Disconnected");
  process.exit(0);
});

function addAspect(entityStart, type, name, freeInvokes = 0) {
  return entityIndexNamed(entityStart).then((e) => {
    entities[e].aspects.push({ name, freeInvokes, type });
  });
}

function aspectText({ freeInvokes, name, type }) {
  const sym = type === AspectType.Boost ? "*" : "";
  const fis = freeInvokes > 0 ? ` \`${freeInvokes}\`` : "";
  return `> ${sym}${name}${sym}${fis}`;
}

function die() {
  return Math.floor(Math.random() * 3) - 1;
}

function entityAspectIndexNamed(entityStart, aspectStart) {
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

function entityIndexNamed(entityStart) {
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

function entityTrackIndexNamed(entityStart, trackStart) {
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

function fateDieEmoji(num) {
  if (num < 0) return ":arrow_down_small:";
  if (num > 0) return ":arrow_up_small:";
  return ":record_button:";
}

function numberEmoji(num) {
  switch (num) {
    case 0:
      return ":zero:";
    case 1:
      return ":one:";
    case 2:
      return ":two:";
    case 3:
      return ":three:";
    case 4:
      return ":four:";
    case 5:
      return ":five:";
    case 6:
      return ":six:";
    case 7:
      return ":seven:";
    case 8:
      return ":eight:";
    case 9:
      return ":nine:";
  }
}

function ratingText(score) {
  switch (score) {
    case -4:
      return "Horrifying";
    case -3:
      return "Catastrophic";
    case -2:
      return "Terrible";
    case -1:
      return "Poor";
    case 0:
      return "Mediocre";
    case 1:
      return "Average";
    case 2:
      return "Fair";
    case 3:
      return "Good";
    case 4:
      return "Great";
    case 5:
      return "Superb";
    case 6:
      return "Fantastic";
    case 7:
      return "Epic";
    case 8:
      return "Legendary";
  }
}

function saveEntities() {
  Fs.writeFile("entities.json", JSON.stringify(entities), (err) => {
    if (err) throw err;
  });
}

function sendEntities(channel) {
  if (entities.length < 1) {
    return channel.send("***No entities***");
  }
  channel.send("", {
    embed: {
      color: 0x5e81ac,
      fields: entities.map(({ aspects, fatePoints, name, tracks }) => {
        const fp =
          typeof fatePoints === "number"
            ? `${ensp}${numberEmoji(fatePoints)}`
            : "";
        const st = tracks ? `${ensp}${tracks.map(trackSpan).join(ensp)}` : "";
        return {
          name: `${name}${fp}${st}`,
          value:
            aspects.length > 0 ? aspects.map(aspectText) : `***No aspects***`,
        };
      }),
    },
  });
  saveEntities();
}

function sendUsage(channel) {
  channel.send("", {
    embed: {
      color: 0xebcb8b,
      title: "Commands",
      description: 'All commands are prefixed with `|` (the "pipe" character)',
      fields: [
        {
          name: "|",
          value: "Output the current entities list",
        },
        {
          name: "|aspect- *entity* *aspect*",
          value: ["Remove *aspect* from *entity*", "Shortcut: `|A`"],
        },
        {
          name: "|aspect+ *entity* *aspect*",
          value: ["Add *aspect* to *entity*", "Shortcut: `|a`"],
        },
        {
          name: "|aspect+1 *entity* *aspect*",
          value: [
            "Add *aspect* to *entity* with 1 free invoke",
            "Shortcut: `|a1`",
          ],
        },
        {
          name: "|aspect+2 *entity* *aspect*",
          value: [
            "Add *aspect* to *entity* with 2 free invokes",
            "Shortcut: `|a2`",
          ],
        },
        {
          name: "|boost *entity* *aspect*",
          value: [
            "Add a boost *aspect* to *entity* (with 1 free invoke)",
            "Shortcut: `|b`",
          ],
        },
        {
          name: "|clear *entity* *type*",
          value: ["Clear stress of *type* on the *entity*", "Shortcut: `|C`"],
        },
        {
          name: "|clearall *type*",
          value: [
            "Clear all stress of *type* across all entities",
            "Shortcut: `|CC`",
          ],
        },
        {
          name: "|entity+ *entity*",
          value: ["Create a new *entity*", "Shortcut: `|e`"],
        },
        {
          name: "|entity- *entity*",
          value: ["Deletes *entity*", "Shortcut: `|E`"],
        },
        {
          name: "|fate+ *entity*",
          value: ["Give a fate point to *entity*", "Shortcut: `|f`"],
        },
        {
          name: "|fate= *points* *entity*",
          value: ["Set fate points for the *entity*", "Shortcut: `|f=`"],
        },
        {
          name: "|fate- *entity*",
          value: ["Take a fate point from *entity*", "Shortcut: `|F`"],
        },
        {
          name: "|invoke+ *entity* *aspect*",
          value: [
            "Add a free invoke to *aspect* on *entity*",
            "Shortcut: `|i`",
          ],
        },
        {
          name: "|invoke= *count* *entity* *aspect*",
          value: [
            "Set free invokes to *count* on the *aspect* for *entity*",
            "Shortcut: `|i=`",
          ],
        },
        {
          name: "|invoke- *entity* *aspect*",
          value: [
            "Remove a free invoke to *aspect* on *entity*",
            "Shortcut: `|I`",
          ],
        },
        {
          name: "|roll *rating*",
          value: [
            "Roll 4dF with *rating* of positive or negative number",
            "Shortcut: `|r`",
          ],
        },
        {
          name: "|stress+ *entity* *type* *number*",
          value: [
            "Add *type* stress (consuming a *number* box) on *entity*",
            "Shortcut: `|s`",
          ],
        },
        {
          name: "|stress- *entity* *type* *number*",
          value: [
            "Remove *type* stress (clearing a *number* box) on *entity*",
            "Shortcut: `|S`",
          ],
        },
        {
          name: "|track+ *entity* *type* *values*",
          value: [
            "Create a stress track for *entity* of *type* with *values* as a string of ratings (e.g., `123` for :one: :two: :three:)",
            "Shortcut: `|t`",
          ],
        },
        {
          name: "|track- *entity* *type*",
          value: [
            "Remove the stress track of *type* for *entity*",
            "Shortcut: `|T`",
          ],
        },
      ],
    },
  });
}

function sendError(channel) {
  return (err) => {
    channel.send("", {
      embed: {
        color: 0xbf616a,
        title: err,
      },
    });
  };
}

function trackSpan({ name, ratings }) {
  const emojis = ratings
    .map(({ clear, value }) => (clear ? numberEmoji(value) : ":x:"))
    .join(" ");
  return `${name} ${emojis}`;
}

discordClient.on("message", ({ author, content, channel, guild, member }) => {
  if (author.bot) return;

  const gmRole = guild.roles.cache.find((role) => role.name === "GM");
  if (!gmRole) return sendError(channel)('A "GM" role is required');
  const isGM = member._roles.some((roleId) => roleId === gmRole.id);

  function needGM() {
    sendError(channel)('You need the "GM" role to do that!');
  }

  if (content.startsWith("|")) {
    const tokens = content.split(" ");
    switch (tokens[0]) {
      case "|":
        sendEntities(channel);
        break;

      case "|a":
      case "|aspect+":
        if (!isGM) return needGM();
        if (tokens.length < 3) return sendUsage(channel);
        addAspect(tokens[1], AspectType.Aspect, tokens.slice(2).join(" "))
          .then(() => sendEntities(channel))
          .catch(sendError(channel));
        break;

      case "|A":
      case "|aspect-":
        if (!isGM) return needGM();
        if (tokens.length !== 3) return sendUsage(channel);
        entityAspectIndexNamed(tokens[1], tokens[2])
          .then(([e, a]) => {
            entities[e].aspects.splice(a, 1);
            sendEntities(channel);
          })
          .catch(sendError(channel));
        break;

      case "|a1":
      case "|aspect+1":
        if (!isGM) return needGM();
        if (tokens.length < 3) return sendUsage(channel);
        addAspect(tokens[1], AspectType.Aspect, tokens.slice(2).join(" "), 1)
          .then(() => sendEntities(channel))
          .catch(sendError(channel));
        break;

      case "|a2":
      case "|aspect+2":
        if (!isGM) return needGM();
        if (tokens.length < 3) return sendUsage(channel);
        addAspect(tokens[1], AspectType.Aspect, tokens.slice(2).join(" "), 2)
          .then(() => sendEntities(channel))
          .catch(sendError(channel));
        break;

      case "|b":
      case "|boost":
        if (!isGM) return needGM();
        if (tokens.length < 3) return sendUsage(channel);
        addAspect(tokens[1], AspectType.Boost, tokens.slice(2).join(" "), 1)
          .then(() => sendEntities(channel))
          .catch(sendError(channel));
        break;

      case "|C":
      case "|clear":
        if (!isGM) return needGM();
        if (tokens.length !== 3) return sendUsage(channel);
        entityTrackIndexNamed(tokens[1], tokens[2])
          .then(([e, t]) => {
            for (let r in entities[e].tracks[t].ratings) {
              entities[e].tracks[t].ratings[r].clear = true;
            }
            sendEntities(channel);
          })
          .catch(sendError(channel));
        break;

      case "|CC":
      case "|clearall": {
        if (!isGM) return needGM();
        if (tokens.length !== 2) return sendUsage(channel);
        const trk = tokens[1].toLowerCase();
        for (let e in entities) {
          if (!("tracks" in entities[e])) continue;
          for (let t in entities[e].tracks) {
            if (entities[e].tracks[t].name.toLowerCase() !== trk) continue;
            for (let r in entities[e].tracks[t].ratings) {
              entities[e].tracks[t].ratings[r].clear = true;
            }
          }
        }
        sendEntities(channel);
        break;
      }

      case "|e":
      case "|entity+":
        if (!isGM) return needGM();
        if (tokens.length < 2) return sendUsage(channel);
        entities.push({ aspects: [], name: tokens.slice(1).join(" ") });
        sendEntities(channel);
        break;

      case "|E":
      case "|entity-":
        if (!isGM) return needGM();
        if (tokens.length !== 2) return sendUsage(channel);
        entityIndexNamed(tokens[1].toLowerCase())
          .then((e) => {
            entities.splice(e, 1);
            sendEntities(channel);
          })
          .catch(sendError(channel));
        break;

      case "|f":
      case "|fate+":
        if (!isGM) return needGM();
        if (tokens.length !== 2) return sendUsage(channel);
        entityIndexNamed(tokens[1])
          .then((e) => {
            entities[e].fatePoints = (entities[e].fatePoints || 0) + 1;
            sendEntities(channel);
          })
          .catch(sendError(channel));
        break;

      case "|f=":
      case "|fate=":
        if (!isGM) return needGM();
        if (tokens.length !== 3) return sendUsage(channel);
        entityIndexNamed(tokens[2])
          .then((e) => {
            entities[e].fatePoints = parseInt(tokens[1]);
            sendEntities(channel);
          })
          .catch(sendError(channel));
        break;

      case "|F":
      case "|fate-":
        if (!isGM) return needGM();
        if (tokens.length !== 2) return sendUsage(channel);
        entityIndexNamed(tokens[1])
          .then((e) => {
            if ("fatePoints" in entities[e]) {
              if (entities[e].fatePoints === 0) {
                delete entities[e].fatePoints;
              } else {
                entities[e].fatePoints = entities[e].fatePoints - 1;
              }
            }
            sendEntities(channel);
          })
          .catch(sendError(channel));
        break;

      case "|i":
      case "|invoke+":
        if (!isGM) return needGM();
        if (tokens.length !== 3) return sendUsage(channel);
        entityAspectIndexNamed(tokens[1], tokens[2])
          .then(([e, a]) => {
            entities[e].aspects[a].freeInvokes += 1;
            sendEntities(channel);
          })
          .catch(sendError(channel));
        break;

      case "|i=":
      case "|invoke=":
        if (!isGM) return needGM();
        if (tokens.length !== 4) return sendUsage(channel);
        entityAspectIndexNamed(tokens[2], tokens[3])
          .then(([e, a]) => {
            entities[e].aspects[a].freeInvokes = tokens[1];
            sendEntities(channel);
          })
          .catch(sendError(channel));
        break;

      case "|I":
      case "|invoke-":
        if (!isGM) return needGM();
        if (tokens.length !== 3) return sendUsage(channel);
        entityAspectIndexNamed(tokens[1], tokens[2])
          .then(([e, a]) => {
            entities[e].aspects[a].freeInvokes = Math.max(
              0,
              entities[e].aspects[a].freeInvokes - 1
            );
            sendEntities(channel);
          })
          .catch(sendError(channel));
        break;

      case "|r":
      case "|roll": {
        if (tokens.length !== 2) return sendUsage(channel);
        const mod = parseInt(tokens[1]);
        if (Number.isNaN(mod)) return sendError(channel)("Invalid rating");
        const a = die();
        const b = die();
        const c = die();
        const d = die();
        const res = a + b + c + d + mod;
        channel.send({
          embed: {
            description: `${fateDieEmoji(a)} ${fateDieEmoji(b)} ${fateDieEmoji(
              c
            )} ${fateDieEmoji(d)}${ensp}${
              tokens[1]
            }${ensp}➤${ensp}**${res}**${ratingText(res)}`,
          },
        });
        break;
      }

      case "|s":
      case "|stress+": {
        if (!isGM) return needGM();
        if (tokens.length !== 4) return sendUsage(channel);
        const rating = parseInt(tokens[3], 10);
        if (Number.isNaN(rating)) {
          return sendError(channel)(`I need a number rating to mark stress`);
        }
        entityTrackIndexNamed(tokens[1], tokens[2])
          .then(([e, t]) => {
            const r = entities[e].tracks[t].ratings.findIndex(
              ({ clear, value }) => clear && value === rating
            );
            if (r < 0) {
              return sendError(channel)(`No available ${rating} boxes`);
            }
            entities[e].tracks[t].ratings[r].clear = false;
            sendEntities(channel);
          })
          .catch(sendError(channel));
        break;
      }

      case "|S":
      case "|stress-": {
        if (!isGM) return needGM();
        if (tokens.length !== 4) return sendUsage(channel);
        const rating = parseInt(tokens[3], 10);
        if (Number.isNaN(rating)) {
          return sendError(channel)(`I need a number rating to clear stress`);
        }
        entityTrackIndexNamed(tokens[1], tokens[2])
          .then(([e, t]) => {
            const ratings = [...entities[e].tracks[t].ratings];
            const r = ratings
              .reverse()
              .findIndex(({ clear, value }) => !clear && value === rating);
            if (r < 0) {
              return sendError(channel)(`No marked ${rating} boxes`);
            }
            entities[e].tracks[t].ratings[ratings.length - 1 - r].clear = true;
            sendEntities(channel);
          })
          .catch(sendError(channel));
        break;
      }

      case "|t":
      case "|track+":
        if (!isGM) return needGM();
        if (tokens.length !== 4) return sendUsage(channel);
        entityIndexNamed(tokens[1])
          .then((e) => {
            const ratings = [];
            for (let i = 0; i < tokens[3].length; i++) {
              const rating = parseInt(tokens[3][i], 10);
              if (Number.isNaN(rating)) {
                return sendError(channel)(
                  `Invalid ratings string "${tokens[3]}"`
                );
              }
              ratings.push(rating);
            }
            if (!("tracks" in entities[e])) entities[e].tracks = [];
            entities[e].tracks.push({
              name: tokens[2],
              ratings: ratings.map((value) => ({
                clear: true,
                value,
              })),
            });
            sendEntities(channel);
          })
          .catch(sendError(channel));
        break;

      case "|T":
      case "|track-":
        if (!isGM) return needGM();
        if (tokens.length !== 3) return sendUsage(channel);
        entityTrackIndexNamed(tokens[1], tokens[2])
          .then(([e, t]) => {
            entities[e].tracks.splice(t, 1);
            if (entities[e].tracks.length < 1) delete entities[e].tracks;
            sendEntities(channel);
          })
          .catch(sendError(channel));
        break;

      default:
        sendUsage(channel);
    }
  }
});

if (Fs.existsSync("entities.json")) {
  Fs.readFile("entities.json", (err, data) => {
    if (err) throw err;
    entities = JSON.parse(data);
  });
} else {
  saveEntities();
}

discordClient.login(process.env["BOT_TOKEN"]);
