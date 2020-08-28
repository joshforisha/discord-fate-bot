import actions from "./actions/all.js";
import Dotenv from "dotenv";
import { aspectText, ensp, numberEmoji, trackSpan } from "./view.js";
import { Client } from "discord.js";
import { entities, saveEntities } from "./state.js";

Dotenv.config();

const discordClient = new Client();

const usageFields = actions
  .sort((a, b) => (a.command < b.command ? -1 : 1))
  .map(({ args, command, description, shortcut }) => {
    const argsText = args ? args.map((a) => `*${a}*`).join(" ") : "";
    return {
      name: `${command}${argsText.length ? " " : ""}${argsText}`,
      value: [description, shortcut ? `Shortcut: \`${shortcut}\`` : null],
    };
  });

process.on("SIGINT", () => {
  discordClient.destroy();
  console.log("Disconnected");
  process.exit(0);
});

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

function sendUsage(channel) {
  channel.send("", {
    embed: {
      color: 0xebcb8b,
      title: "Commands",
      description: 'All commands are prefixed with `|` (the "pipe" character)',
      fields: usageFields,
    },
  });
}

discordClient.on("message", ({ author, content, channel, guild, member }) => {
  if (author.bot || !content.startsWith("|")) return;

  const gmRole = guild.roles.cache.find((role) => role.name === "GM");
  if (!gmRole) return sendError(channel)('A "GM" role is required');
  const isGM = member._roles.some((roleId) => roleId === gmRole.id);

  const [cmd, ...tokens] = content.split(" ");
  const action = actions.find(
    ({ command, shortcut }) => command === cmd || shortcut === cmd
  );

  if (!action) return sendUsage(channel);

  if (action.gmOnly && !isGM) {
    return sendError(channel)('You need the "GM" role to do that!');
  }

  if ("args" in action) {
    if (action.args.some((a) => a.startsWith("..."))) {
      if (tokens.length < action.args.length) {
        return sendError(channel)("Not enough arguments");
      }
    } else if (tokens.length !== action.args.length) {
      return sendError(channel)("Not enough arguments");
    }
  }

  new Promise((resolve, reject) => action.run(tokens, resolve, reject))
    .then((send = sendEntities) => {
      send(channel);
    })
    .catch(sendError(channel));
});

/*
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
        const resText = ratingText(res);
        channel.send({
          embed: {
            description: `${fateDieEmoji(a)} ${fateDieEmoji(b)} ${fateDieEmoji(
              c
            )} ${fateDieEmoji(d)}${ensp}${tokens[1]}${ensp}➤${ensp}**${res}**${
              resText ? ensp : ""
            }${resText}`,
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
*/

discordClient.login(process.env["BOT_TOKEN"]);
