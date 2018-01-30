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
  for (item in data.Characters) {
    Characters.push(data.Characters[item]);
  }
  for (item in data.Optimized_Chars) {
    Optimized_Chars.push(data.Optimized_Chars[item]);
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
}

/* ************************* END OF GLOBAL VARIABLES ************************* */
