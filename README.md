# WarriorJS Solution
My solution to the first tower from [warriorjs](https://warrior.js.org/).

I've focused on developing an AI for the warrior that can handle any dungeon layout. It's also well on its way to be able to handle room sized dungeons and not just the corridors from the first tower.

The backbone to my AI is with the impementation of a memory. As the warrior explores the dungeon it adds everything it sees into it's memory which it then utilises for all its decision making purposes.

I've left a lot of inline comments explaining what each part of the program does to make it easy to understand.

## Installation
If you're curious about seeing this AI in action then simply download and install [warriorjs](https://warrior.js.org/) and override the player.js file with the one from this repo.

## Current goal
- Implement handling of multiple enemies with the setting of a priority target. This is needed for the final level in tower 1.
