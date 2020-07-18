/* **************************** GLOBAL VARIABLES ***************************** */
// Object arrays.
var Enemy_List = new Array();
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
var current_enemy = 0;
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
    optimized_unit.hpGrowth = base_unit.hpGrowth;
    optimized_unit.atkGrowth = base_unit.atkGrowth;
    optimized_unit.spdGrowth = base_unit.spdGrowth;
    optimized_unit.defGrowth = base_unit.defGrowth;
    optimized_unit.resGrowth = base_unit.resGrowth;
    optimized_unit.n_lock = base_unit.n_lock;
    optimized_unit.type = base_unit.type;
    optimized_unit.weap = base_unit.weap;
    optimized_unit.legendary = base_unit.legendary;
    optimized_unit.mythic = base_unit.mythic;
    optimized_unit.has_resplendent = base_unit.has_resplendent;
    optimized_unit.df_maximum = base_unit.df_maximum;
    optimized_unit.assumed_atk_buff = 0;
    optimized_unit.assumed_spd_buff = 0;
    optimized_unit.assumed_def_buff = 0;
    optimized_unit.assumed_res_buff = 0;
    optimized_unit.assumed_atk_boost = 0;
    optimized_unit.assumed_spd_boost = 0;
    optimized_unit.assumed_def_boost = 0;
    optimized_unit.assumed_res_boost = 0;
    optimized_unit.assumed_atk_penalty = 0;
    optimized_unit.assumed_spd_penalty = 0;
    optimized_unit.assumed_def_penalty = 0;
    optimized_unit.assumed_res_penalty = 0;
    optimized_unit.merge_lv = 0;
    optimized_unit.dragonflowers = 0;
    optimized_unit.hp_cut = "";
    optimized_unit.spec_charge = "";
    optimized_unit.adj = 0;
    optimized_unit.two_space = 0;
    optimized_unit.three_space = 0;
    optimized_unit.blessing = "(None)";
    optimized_unit.leg1 = 0;
    optimized_unit.leg2 = 0;
    optimized_unit.leg3 = 0;
    optimized_unit.leg4 = 0;
    optimized_unit.transformed = false;
    optimized_unit.weap_bool = false;
    optimized_unit.spec_bool = false;
    optimized_unit.a_bool = false;
    optimized_unit.b_bool = false;
    optimized_unit.c_bool = false;
    optimized_unit.spec_bool = false;
    optimized_unit.weap_num = 0;
    optimized_unit.spec_num = 0;
    optimized_unit.a_num = 0;
    optimized_unit.b_num = 0;
    optimized_unit.c_num = 0;
    optimized_unit.seal_num = 0;
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

var physical_weapons = ["S", "L", "A", "RB", "BB", "GB", "NB", "RK", "BK", "GK", "NK", "RBe", "BBe", "GBe", "NBe"];
var magical_weapons = ["RT", "BT", "GT", "NT", "ST", "RD", "BD", "GD", "ND"];
var one_range_weapons = ["S", "L", "A", "RD", "BD", "GD", "ND", "RBe", "BBe", "GBe", "NBe", "D"];
var two_range_weapons = ["RT", "BT", "GT", "NT", "ST", "RB", "BB", "GB", "NB", "RK", "BK", "GK", "NK", "K", "B"];
var legendary_blessings = ["Earth", "Fire", "Water", "Wind"];
var mythic_blessings = ["Light", "Dark", "Astra", "Anima"];
var phase = "";
var in_combat = false;
var turn_number = 1;

/* ************************* END OF GLOBAL VARIABLES ************************* */
