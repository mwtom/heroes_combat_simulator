/* **************************** GLOBAL VARIABLES ***************************** */
// Object arrays.
var Characters = new Array();
var Optimized_Chars = new Array();
var Weapons = new Array();
var A_Passives = new Array();
var B_Passives = new Array();
var C_Passives = new Array();
var Seals = new Array();
var Procs = new Array();
var Blessings = new Array();

// Counters/indexes for object arrays.
var char_count = 0;
var weap_count = 0;
var a_count = 0;
var b_count = 0;
var c_count = 0;
var seal_count = 0;
var proc_count = 0;

// Logging variables
var combat_log = "";
var skill_string = "";

// Pushes character and skill data into arrays.
function load_data() {
  var base_unit, optimized_unit;
  for (item in data.Characters) {
    Characters.push(data.Characters[item]);
  }
  for (item in data.Optimized_Chars) {
    base_unit = Characters[data.Optimized_Chars[item].base_index];
    optimized_unit = data.Optimized_Chars[item];
    optimized_unit.color = base_unit.color;
    optimized_unit.hp_base = base_unit.hp_base;
    optimized_unit.atk_base = base_unit.atk_base;
    optimized_unit.spd_base = base_unit.spd_base;
    optimized_unit.def_base = base_unit.def_base;
    optimized_unit.res_base = base_unit.res_base;
    optimized_unit.hp40 = base_unit.hp40;
    optimized_unit.atk40 = base_unit.atk40;
    optimized_unit.spd40 = base_unit.spd40;
    optimized_unit.def40 = base_unit.def40;
    optimized_unit.res40 = base_unit.res40;
    optimized_unit.n_lock = base_unit.n_lock;
    optimized_unit.type = base_unit.type;
    optimized_unit.weap = base_unit.weap;
    optimized_unit.legendary = base_unit.legendary;
    Optimized_Chars.push(optimized_unit);
  }
  for (item in data.Weapons) {
    Weapons.push(data.Weapons[item]);
  }
  for (item in data.A_Passives) {
    A_Passives.push(data.A_Passives[item]);
  }
  for (item in data.B_Passives) {
    B_Passives.push(data.B_Passives[item]);
  }
  for (item in data.C_Passives) {
    C_Passives.push(data.C_Passives[item]);
  }
  for (item in data.Seals) {
    Seals.push(data.Seals[item]);
  }
  for (item in data.Specials) {
    Procs.push(data.Specials[item]);
  }
  for (item in data.Blessings) {
    Blessings.push(data.Blessings[item]);
  }
}

/* ************************* END OF GLOBAL VARIABLES ************************* */
