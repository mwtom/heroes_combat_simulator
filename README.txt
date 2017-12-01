====================================
Fire Emblem: Heroes Combat Simulator
====================================

Contents

1. About
2. How to Use
3. How to Update

====================================
--------------1. About--------------
====================================

The Fire Emblem: Heroes Combat Simulator runs mass matchups for a selected character against a selected subset of the Fire Emblem: Heroes cast.

The simulator uses a web interface and runs on HTML and JavaScript.

====================================
-----------2. How to Use------------
====================================

-Open the index.html file.
-Set player character and skills in the Character Customization menu.
  -Boon and Bane will only be applied to units that are not neutral-locked.
-Set player character buffs, bonuses, debuffs, etc. in the Other Settings menu.
  -The Other Settings menu can be expanded and collapsed by clicking the header.
  -A buff is any stat boost which is shown on the stat display for the unit in-game.
   When a buffed stat is tapped, it will list "Buff +[x]" in the details box that opens.
   The source of a buff is generally a Hone, Fortify, or Rally skill.
  -A bonus is any stat boost which affects a unit's stats, but does not show on the stat
   display. The source of a bonus is usually an "aura".
    -"Aura"s include, but are not limited to, Spur, Goad, and Ward skills, as well as
     Ally Support.
-Set any overrides for the enemy unit in the Enemy Overrides menu.
  -The Enemy Overrides menu can be expanded and collapsed by clicking the header.
  -Overrides for skills will only be applied to enemies that can legally inherit that
   skill.
-Set filters for enemies in the Enemy Filters menu.
-Set any special options in the Special Options menu.
  -The "Break Inheritance Restrictions" option allows units to inherit any skill.
   Please note that the following combat mechanics will not change:
    -Weapon Triangle: Weapon triangle advantage or disadvantage is tied to the unit's
     color, not the weapon's. This is how the game works. Verify by using an unequipped
     lance user to fight Narcian in Story Map 9-2 (Normal difficulty or higher).
    -Breaker applicability: Breakers are based on the unit's weapon type, not the
     weapon's weapon type. This is how the game works. Verify by using an unequipped
     lance user with 12+ Spd to fight Narcian in Story Map 9-2 (Normal difficulty).
    -Weapon damage type: Damage type is determined by the unit's weapon type, not the
     weapon's weapon type. This cannot be tested, and is instead inferred.

Simulation will automatically occur after any field is changed. Some fields may not
be considered as "changed" until the field has been left (i.e. clicked out of).

====================================
----------3. How to Update----------
====================================

-Update the Google Spreadsheet where character and skill data is stored.
  -The spreadsheet is located at the following link: https://docs.google.com/spreadsheets/d/1YKZJmiNAOxcpPaRSvYk6756tPLoKxWxKdmJYF26Vy28/
    -Access may be restricted.
  -Most of the fields for the Characters sheet are straightforward, data can simply be entered straight into the cells. However, the final 5 (base_weap, base_a, base_b, base_c, base_proc) use lookup formulas to get the indexes of the character's base skills from the other sheets.
  -When entering names, use the HexCode equivalents for special characters (accents, etc.)
    -Note the following HexCode equivalents:
     Latin eth ('dh'): \xF0
     Accented a: \xE1
     Accented o: \xF3
     Accented u: \xFA
     o with umlaut: \xF6
    -These equivalents should be used both when entering the name to the relevant sheet. If the name is for a skill, the HexCode equivalent should be used in the lookup formula for all characters possessing the skill.
-Export the Google Spreadsheet to JSON using an appropriate add-on.
-Change the output JSON file to be compatible with the simulator using the following steps:
  -Add "var data = " to the very beginning of the file.
  -Use Replace All to change all instances of "\\" to "\", if the export add-on automatically escaped the backslash in front of the HexCode characters.
  -Change the file extension from ".json" to ".js".
-Replace the existing "FE Heroes - Raw Data.js" with the new "FE Heroes - Raw Data.js".
-Add code to handle new skills as appropriate. Note the following file structure:
  -index.html: HTML code for the UI. Also contains some jquery event handlers (load, click, change).
  -mechanics_single_round.js: JavaScript code that handles game mechanics and simulation.
   Functions listed below.
    -simulate: pulls user input data for player unit and enemy overrides/filters and runs the simulation.
    -passes_filter_reqs: determines whether or not a character meets the user-defined filter requirements.
    -execute_phase: performs a one-round combat simulation between a given attacker and defender.
    -apply_start_buffs: applies start-of-turn buffs, except Renewal, to the active unit.
    -check_counter: given an attacker and a defender, determines whether or not the defender is capable of counterattacking.
    -check_follow_up: given two units (unit1 and unit2), whether or not unit1 is active, and whether or not unit2 can counter, determines whether or not unit1 can perform a follow-up attack.
    -calculate_damage: Given an attacking unit and a defending unit, calculates the damage dealt by the attacking unit and applies it to the defending unit.
  -fighter_single_round.js: JavaScript class for a fighter unit. Holds stats and skills as properties. Methods involve stat calculation, determining whether or not certain skills (ex. Quick Riposte, etc.) apply, and getters/setters.
  -ui.js: JavaScript to populate the UI menus.
  -data.js: JavaScript to transfer the data from the "FE Heroes - Raw Data.js" file into arrays.
  -FE Heroes - Raw Data.js: JavaScript that holds character and skill data, created with the method described above.
  -sim_style.css: CSS for the UI.
  -jquery-3.2.1.min.js: The jquery library.
