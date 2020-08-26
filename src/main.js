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

function fateDieEmoji(num) {
  if (num < 0) return ":arrow_down_small:";
  if (num > 0) return ":arrow_up_small:";
  return ":record_button:";
}

function fatePointsEmoji(points) {
  if (typeof points === "undefined") return "";
  switch (points) {
    case 0:
      return `${ensp}:zero:`;
    case 1:
      return `${ensp}:one:`;
    case 2:
      return `${ensp}:two:`;
    case 3:
      return `${ensp}:three:`;
    case 4:
      return `${ensp}:four:`;
    case 5:
      return `${ensp}:five:`;
    case 6:
      return `${ensp}:six:`;
    case 7:
      return `${ensp}:seven:`;
    case 8:
      return `${ensp}:eight:`;
    case 9:
      return `${ensp}:nine:`;
    default:
      return `${ensp}${points}`;
  }
}

function entityAspectIndexNamed(entityStart, aspectStart) {
  const asp = aspectStart.toLowerCase();
  return entityIndexNamed(entityStart).then(
    (e) =>
      new Promise((resolve, reject) => {
        const a = entities[e].aspects.findIndex(({ name }) =>
          name.toLowerCase().startsWith(asp)
        );
        if (a > -1) return resolve([e, a]);
        reject(`I couldn't find an aspect starting with "${asp}"`);
      })
  );
}

function entityIndexNamed(entityStart) {
  const ent = entityStart.toLowerCase();
  return new Promise((resolve, reject) => {
    const e = entities.findIndex(({ name }) =>
      name.toLowerCase().startsWith(ent)
    );
    if (e > -1) return resolve(e);
    reject(`I couldn't find an entity starting with "${ent}"`);
  });
}

function rating(score) {
  switch (score) {
    case -4:
      return " Horrifying";
    case -3:
      return " Catastrophic";
    case -2:
      return " Terrible";
    case -1:
      return " Poor";
    case 0:
      return " Mediocre";
    case 1:
      return " Average";
    case 2:
      return " Fair";
    case 3:
      return " Good";
    case 4:
      return " Great";
    case 5:
      return " Superb";
    case 6:
      return " Fantastic";
    case 7:
      return " Epic";
    case 8:
      return " Legendary";
    default:
      return "";
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
      fields: entities.map(({ aspects, fatePoints, name }) => ({
        name: `${name}${fatePointsEmoji(fatePoints)}`,
        value:
          aspects.length > 0 ? aspects.map(aspectText) : `***No aspects***`,
      })),
    },
  });
  saveEntities();
}

function sendUsage(channel) {
  channel.send("", {
    embed: {
      title: "Commands",
      color: 0xebcb8b,
      fields: [
        /*
        {
          name: "",
          value: ["", "Shortcut: `|`"],
        },
        // */
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

discordClient.on("message", ({ content, channel }) => {
  if (content.startsWith("|")) {
    const tokens = content.split(" ");
    switch (tokens[0]) {
      case "|":
        sendEntities(channel);
        break;

      case "|a":
      case "|aspect":
        if (tokens.length < 3) return sendUsage(channel);
        addAspect(tokens[1], AspectType.Aspect, tokens.slice(2).join(" "))
          .then(() => sendEntities(channel))
          .catch(sendError(channel));
        break;

      case "|A":
      case "|aspect-":
        if (tokens.length !== 2) return sendUsage(channel);
        entityIndexNamed(tokens[1].toLowerCase())
          .then((e) => {
            entities.splice(e, 1);
            sendEntities(channel);
          })
          .catch(sendError(channel));
        break;

      case "|a1":
      case "|aspect+1":
        if (tokens.length < 3) return sendUsage(channel);
        addAspect(tokens[1], AspectType.Aspect, tokens.slice(2).join(" "), 1)
          .then(() => sendEntities(channel))
          .catch(sendError(channel));
        break;

      case "|a2":
      case "|aspect+2":
        if (tokens.length < 3) return sendUsage(channel);
        addAspect(tokens[1], AspectType.Aspect, tokens.slice(2).join(" "), 2)
          .then(() => sendEntities(channel))
          .catch(sendError(channel));
        break;

      case "|b":
      case "|boost":
        if (tokens.length < 3) return sendUsage(channel);
        addAspect(tokens[1], AspectType.Boost, tokens.slice(2).join(" "), 1)
          .then(() => sendEntities(channel))
          .catch(sendError(channel));
        break;

      case "|e":
      case "|entity+":
        if (tokens.length < 2) return sendUsage(channel);
        entities.push({ aspects: [], name: tokens.slice(1).join(" ") });
        sendEntities(channel);
        break;

      case "|E":
      case "|entity-":
        if (tokens.length !== 3) return sendUsage(channel);
        entityAspectIndexNamed(tokens[1], tokens[2])
          .then(([e, a]) => {
            entities[e].aspects.slice(a, 1);
            sendEntities(channel);
          })
          .catch(sendError(channel));
        break;

      case "|f":
      case "|fate+":
        if (tokens.length !== 2) return sendUsage(channel);
        entityIndexNamed(tokens[1])
          .then((e) => {
            entities[e].fatePoints = (entities[e].fatePoints || 0) + 1;
            sendEntities(channel);
          })
          .catch(sendError(channel));
        break;

      case "|F":
      case "|fate-":
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
        if (tokens.length !== 3) return sendUsage(channel);
        entityAspectIndexNamed(tokens[1], tokens[2])
          .then(([e, a]) => {
            entities[e].aspects[a].freeInvokes += 1;
            sendEntities(channel);
          })
          .catch(sendError(channel));
        break;

      case "|I":
      case "|invoke-":
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
            }${ensp}➤${ensp}**${res}**${rating(res)}`,
          },
        });
        break;
      }

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
