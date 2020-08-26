require("dotenv").config();

const { Client, MessageEmbed } = require("discord.js");

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

function addAspect(ent, type, name, freeInvokes) {
  const e = entities.findIndex(({ name }) =>
    name.toLowerCase().startsWith(ent)
  );
  if (e > -1) {
    entities[e].aspects.push({ name, freeInvokes, type });
    return true;
  }

  return false;
}

function aspectText({ freeInvokes, name, type }) {
  const sym = type === AspectType.Boost ? "*" : "";
  const fis = typeof freeInvokes !== "undefined" ? ` \`${freeInvokes}\`` : "";
  return `> ${sym}${name}${sym}${fis}`;
}

function entitiesEmbed() {
  return new MessageEmbed().setColor(0x5e81ac).addFields(
    entities.map(({ aspects, name }) => ({
      name,
      value: aspects.length > 0 ? aspects.map(aspectText) : `*No aspects yet*`,
    }))
  );
}

discordClient.on("message", (message) => {
  if (message.content.startsWith("|")) {
    const tokens = message.content.split(" ");
    switch (tokens[0]) {
      case "|add": {
        if (
          addAspect(
            tokens[1].toLowerCase(),
            AspectType.Aspect,
            tokens.slice(2).join(" ")
          )
        ) {
          message.channel.send(entitiesEmbed());
        } else {
          message.channel.send(
            `I couldn't find an entity starting with "${tokens[1]}"`
          );
        }
        break;
      }

      case "|add1": {
        if (
          addAspect(
            tokens[1].toLowerCase(),
            AspectType.Aspect,
            tokens.slice(2).join(" "),
            1
          )
        ) {
          message.channel.send(entitiesEmbed());
        } else {
          message.channel.send(
            `I couldn't find an entity starting with "${tokens[1]}"`
          );
        }
        break;
      }

      case "|add2": {
        if (
          addAspect(
            tokens[1].toLowerCase(),
            AspectType.Aspect,
            tokens.slice(2).join(" "),
            2
          )
        ) {
          message.channel.send(entitiesEmbed());
        } else {
          message.channel.send(
            `I couldn't find an entity starting with "${tokens[1]}"`
          );
        }
        break;
      }

      case "|help":
        message.channel.send(
          new MessageEmbed().setColor(0xebcb8b).addFields({
            name: "Commands",
            value: ["`|add *<entity>* *<aspect>*`", "`|new *<entity>*`"],
          })
        );
        break;

      case "|new":
        entities.push({ aspects: [], name: tokens.slice(1).join(" ") });
        message.channel.send(entitiesEmbed());
        break;

      default:
        message.channel.send(`I didn't understand the command "${tokens[0]}"`);
    }
  }
});

discordClient.login(process.env["BOT_TOKEN"]);
