# Fate Discord Bot

A bot for playing [Fate RPG](https://fate-srd.com) completely within Discord.

![Example image of bot output](https://github.com/joshforisha/fate-bot/blob/main/images/output-example.png)

![Example image of roll prompt and output](https://github.com/joshforisha/fate-bot/blob/main/images/roll-example.png)

At this point, the bot is meant to be run locally. The current state of the entities (including all aspects, fate points, skills, and stress tracks) are saved in an `entities.json` at the root of the project. After most successful commands, the bot will update the stored state and print out the affected state. Otherwise, an error message will be displayed.

A "GM" role is required on any server that the bot is invited to, which prevents any commands besides `|`, `|help`, `|skills`, and `|roll` from being run by players.

## Setup

(TODO)

## Commands

All commands are prefixed with `|` (the "pipe" character).

| Command | Shortcut | Description |
| ------- | -------- | ----------- |
| `\|` | | Output the current entities list |
| `\|aspect+ *entity* *aspect*` | `\|a` | Add *aspect* to *entity*", "Shortcut: `|a`"],
| `\|aspect+1 *entity* *aspect*` | `\|a1` | Add *aspect* to *entity* with 1 free invoke |
| `\|aspect+2 *entity* *aspect*` | `\|a2` | Add *aspect* to *entity* with 2 free invokes |
| `\|aspect- *entity* *aspect*` | `\|A` | Remove *aspect* (or boost) from *entity* |
| `\|boost *entity* *aspect*` | `\|b` | Add a boost *aspect* to *entity* (with 1 free invoke) |
| `\|clear *entity* *type*` | `\|C` | Clear stress of *type* on the *entity* |
| `\|clearall *type*` | `\|CC` | Clear all stress of *type* across all entities |
| `\|entity+ *entity*` | `\|e` | Create a new *entity* |
| `\|entity- *entity*` | `\|E` | Deletes *entity* |
| `\|fate+ *entity*` | `\|f` | Give a fate point to *entity* |
| `\|fate- *entity*` | `\|F` | Take a fate point from *entity* |
| `\|fate= *points* *entity*` | `\|f=` | Set fate points for the *entity* |
| `\|help` | `\|h` | Print this command list to Discord |
| `\|invoke+ *entity* *aspect*` | `\|i` | Add a free invoke to *aspect* on *entity* |
| `\|invoke- *entity* *aspect*` | `\|I` | Remove a free invoke to *aspect* on *entity* |
| `\|invoke= *count* *entity* *aspect*` | `\|i=` | Set free invokes to *count* on the *aspect* for *entity* |
| `\|roll *rating*` | `\|r` | Roll 4dF with *rating* of positive or negative number |
| `\|skill+ *entity* *skill* *rating*` | | Add a *skill* with *rating* to *entity* |
| `\|skill- *entity* *skill*` | | Remove *skill* from *entity* |
| `\|skills *entity*` | `\|k` | Print out skills list for *entity* |
| `\|stress+ *entity* *type* *number*` | `\|s` | Add *type* stress (consuming a *number* box) on *entity* |
| `\|stress- *entity* *type* *number*` | `\|S` | Remove *type* stress (clearing a *number* box) on *entity* |
| `\|track+ *entity* *type* *values*` | `\|t` | Create a stress track for *entity* of *type* with *values* as a string of ratings (e.g., `123` for :one: :two: :three:) |
| `\|track- *entity* *type*` | `\|T` | Remove the stress track of *type* for *entity* |
