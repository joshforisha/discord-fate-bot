import { die, fateDieEmoji, ratingText } from "../fate.js";
import { ensp } from "../view.js";

export const actions = [
  {
    command: "|roll",
    shortcut: "|r",
    args: ["rating"],
    description: "Roll 4dF with *rating* of positive or negative number",
    run: ([rating], resolve, reject) => {
      const mod = parseInt(rating, 10);
      if (Number.isNaN(mod)) return reject("Invalid rating");
      const a = die();
      const b = die();
      const c = die();
      const d = die();
      const res = a + b + c + d + mod;
      const resText = ratingText(res);
      resolve((channel) =>
        channel.send({
          embed: {
            description: `${fateDieEmoji(a)} ${fateDieEmoji(b)} ${fateDieEmoji(
              c
            )} ${fateDieEmoji(d)}${ensp}${rating}${ensp}➤${ensp}**${res}**${
              resText ? ensp : ""
            }${resText}`,
          },
        })
      );
    },
  },
];
