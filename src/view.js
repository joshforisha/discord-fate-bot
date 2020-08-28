import { AspectType } from "./fate.js";

export function aspectText({ freeInvokes, name, type }) {
  const sym = type === AspectType.Boost ? "*" : "";
  const fis = freeInvokes > 0 ? ` \`${freeInvokes}\`` : "";
  return `> ${sym}${name}${sym}${fis}`;
}

export const ensp = " ";

export function numberEmoji(num) {
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

export function trackSpan({ name, ratings }) {
  const emojis = ratings
    .map(({ clear, value }) => (clear ? numberEmoji(value) : ":x:"))
    .join(" ");
  return `${name} ${emojis}`;
}
