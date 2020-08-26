require("dotenv").config();

const { Client } = require("discord.js");

const ensp = " ";

const AspectType = {
  Aspect: "ASPECT",
  Boost: "BOOST",
};

const entities = [];

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

function fate(num) {
  if (num < 0) return ":arrow_down_small:";
  if (num > 0) return ":arrow_up_small:";
  return ":record_button:";
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

function sendEntities(channel) {
  if (entities.length < 1) {
    return channel.send("***No entities***");
  }

  channel.send("", {
    embed: {
      color: 0x5e81ac,
      fields: entities.map(({ aspects, name }) => ({
        name,
        value:
          aspects.length > 0 ? aspects.map(aspectText) : `***No aspects***`,
      })),
    },
  });
}

function sendUsage(channel) {
  channel.send("", {
    embed: {
      title: "Commands",
      color: 0xebcb8b,
      fields: [
        {
          name: "|add *entity* *aspect*",
          value: "Add *aspect* to *entity*",
        },
        {
          name: "|add1 *entity* *aspect*",
          value: "Add *aspect* to *entity* with 1 free invoke",
        },
        {
          name: "|add2 *entity* *aspect*",
          value: "Add *aspect* to *entity* with 2 free invokes",
        },
        {
          name: "|boost *entity* *aspect*",
          value: "Add a boost *aspect* to *entity* (with 1 free invoke)",
        },
        {
          name: "|del *entity*",
          value: "Deletes *entity*",
        },
        {
          name: "|fe+ *entity* *aspect*",
          value: "Add a free invoke to *aspect* on *entity*",
        },
        {
          name: "|fe- *entity* *aspect*",
          value: "Remove a free invoke to *aspect* on *entity*",
        },
        {
          name: "|new *entity*",
          value: "Create a new *entity*",
        },
        {
          name: "|rm *entity* *aspect*",
          value: "Remove *aspect* from *entity*",
        },
        {
          name: "|roll *rating*",
          value: "Roll 4dF with *rating* of positive or negative number",
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
      case "|add":
        if (tokens.length < 3) return sendUsage(channel);
        addAspect(tokens[1], AspectType.Aspect, tokens.slice(2).join(" "))
          .then(() => sendEntities(channel))
          .catch(sendError(channel));
        break;

      case "|add1":
        if (tokens.length < 3) return sendUsage(channel);
        addAspect(tokens[1], AspectType.Aspect, tokens.slice(2).join(" "), 1)
          .then(() => sendEntities(channel))
          .catch(sendError(channel));
        break;

      case "|add2":
        if (tokens.length < 3) return sendUsage(channel);
        addAspect(tokens[1], AspectType.Aspect, tokens.slice(2).join(" "), 2)
          .then(() => sendEntities(channel))
          .catch(sendError(channel));
        break;

      case "|boost":
        if (tokens.length < 3) return sendUsage(channel);
        addAspect(tokens[1], AspectType.Boost, tokens.slice(2).join(" "), 1)
          .then(() => sendEntities(channel))
          .catch(sendError(channel));
        break;

      case "|del":
        if (tokens.length !== 2) return sendUsage(channel);
        entityIndexNamed(tokens[1].toLowerCase())
          .then((e) => {
            entities.splice(e, 1);
            sendEntities(channel);
          })
          .catch(sendError(channel));
        break;

      case "|fe+":
        if (tokens.length !== 3) return sendUsage(channel);
        entityAspectIndexNamed(tokens[1], tokens[2])
          .then(([e, a]) => {
            entities[e].aspects[a].freeInvokes += 1;
            sendEntities(channel);
          })
          .catch(sendError(channel));
        break;

      case "|fe-":
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

      case "|help":
        sendUsage(channel);
        break;

      case "|new":
        if (tokens.length < 2) return sendUsage(channel);
        entities.push({ aspects: [], name: tokens.slice(1).join(" ") });
        sendEntities(channel);
        break;

      case "|rm": {
        if (tokens.length !== 3) return sendUsage(channel);
        entityAspectIndexNamed(tokens[1], tokens[2])
          .then(([e, a]) => {
            entities[e].aspects.slice(a, 1);
            sendEntities(channel);
          })
          .catch(sendError(channel));
        break;
      }

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
            description: `${fate(a)} ${fate(b)} ${fate(c)} ${fate(d)}${ensp}${
              tokens[1]
            }${ensp}➤${ensp}**${res}**${rating(res)}`,
          },
        });
        break;
      }

      default:
        channel.send(`I didn't understand the command "${tokens[0]}"`);
    }
  }
});

discordClient.login(process.env["BOT_TOKEN"]);
