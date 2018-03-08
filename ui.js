function loadUI() {
  var UImsg = "";

  // Load the initial Character drop-down.
  for (var i = 0; i < Characters.length; i++) {
    UImsg = UImsg + "<option value='" + i + "'>" + Characters[i].name + "</option>";
  }
  document.getElementById("Character").innerHTML = UImsg;

  fill_skill_menus();
  fill_enemy_menus();
}

function reload_options() {
  fill_skill_menus();

  document.getElementById("MergeLv").value = 0;

  document.getElementById("AtkBuff").value = 0;
  document.getElementById("SpdBuff").value = 0;
  document.getElementById("DefBuff").value = 0;
  document.getElementById("ResBuff").value = 0;

  document.getElementById("AtkBonus").value = 0;
  document.getElementById("SpdBonus").value = 0;
  document.getElementById("DefBonus").value = 0;
  document.getElementById("ResBonus").value = 0;

  document.getElementById("AtkDebuff").value = 0;
  document.getElementById("SpdDebuff").value = 0;
  document.getElementById("DefDebuff").value = 0;
  document.getElementById("ResDebuff").value = 0;

  $(".LegAlly").toggle(false);
}

function reset_enemy_overrides() {
  fill_enemy_menus();

  document.getElementById("EnemyMergeLv").value = 0;

  document.getElementById("EnemyAtkBuff").value = 0;
  document.getElementById("EnemySpdBuff").value = 0;
  document.getElementById("EnemyDefBuff").value = 0;
  document.getElementById("EnemyResBuff").value = 0;

  document.getElementById("EnemyAtkBonus").value = 0;
  document.getElementById("EnemySpdBonus").value = 0;
  document.getElementById("EnemyDefBonus").value = 0;
  document.getElementById("EnemyResBonus").value = 0;

  document.getElementById("EnemyAtkDebuff").value = 0;
  document.getElementById("EnemySpdDebuff").value = 0;
  document.getElementById("EnemyDefDebuff").value = 0;
  document.getElementById("EnemyResDebuff").value = 0;

  document.getElementById("EnemyHPCut").value = "";
  document.getElementById("EnemySpecCharge").value = "";
  document.getElementById("EnemyAdjAllies").value = 0;
  document.getElementById("enemy_conditional_effects").checked = false;

  $(".EnemyLegAlly").toggle(false);
}

// Fills the skill menus for a selected unit.
function fill_skill_menus() {
  // Obtain the id of the currently selected unit.
  var unit_id = document.getElementById("Character").value;
  // Initialize an empty message to be updated with the relevant html code.
  var msg = "";

  // Populate the Weapon list. Start with the character's base weapon.
  msg = msg + "<option value='" + Characters[unit_id].base_weap + "'>" + Weapons[Characters[unit_id].base_weap].name + "</option>";
  // Add any weapons that the character's base weapon can evolve into.
  if (Weapons[Characters[unit_id].base_weap].evolves_into != 0) {
    msg = msg + "<option value='" + Weapons[Characters[unit_id].base_weap].evolves_into + "'>" + Weapons[Weapons[Characters[unit_id].base_weap].evolves_into].name + "</option>";
  }
  // Find weapons that the current selection (the base weapon) can be refined into,
  // and add them to the "WeaponUpgradeCell" <td> tag.
  find_upgrades(Characters[unit_id].base_weap);
  // Note that iteration starts at 1, to exclude the (None) weapon.
  for (var i = 1; i < Weapons.length; i++) {
    // Conditions for including a weapon in the drop-down:
    // 1) Must not be the base weapon (handled separately).
    // 2) Must not be a weapon upgrade (handled separately).
    // 3) Must not be a weapon evolution (handled separately).
    // 4) Must satisfy one of the following:
    //      -The weapon type must match the unit's weapon type, and the weapon cannot be exclusive.
    //      -The "Remove Inheritance Restrictions" checkbox must be selected.
    if (i != Characters[unit_id].base_weap
        && Weapons[i].upgraded_from == 0
        && Characters[unit_id].base_weap != Weapons[i].evolved_from
        && ((Characters[unit_id].weap == Weapons[i].type && !Weapons[i].char_lock) || document.getElementById("RuleBreaker").checked))
    {
      msg = msg + "<option value='" + i + "'>" + Weapons[i].name + "</option>";
    }
  }
  document.getElementById("Weapon").innerHTML = msg;
  msg = "";

  // Populate the Special list.
  msg = msg + "<option value='" + Characters[unit_id].base_proc + "'>" + Procs[Characters[unit_id].base_proc].name + "</option>";
  for (var i = 0; i < Procs.length; i++) {
    if (i != Characters[unit_id].base_proc) {
      if (verify_legality(Characters[unit_id], Procs[i]) || document.getElementById("RuleBreaker").checked) {
        msg = msg + "<option value='" + i + "'>" + Procs[i].name + "</option>";
      }
    }
  }
  document.getElementById("Special").innerHTML = msg;
  msg = "";

  // Populate the A Passive list.
  msg = msg + "<option value='" + Characters[unit_id].base_a + "'>" + A_Passives[Characters[unit_id].base_a].name + "</option>";
  for (var i = 0; i < A_Passives.length; i++) {
    if (i != Characters[unit_id].base_a) {
      if(verify_legality(Characters[unit_id], A_Passives[i]) || document.getElementById("RuleBreaker").checked) {
        msg = msg + "<option value='" + i + "'>" + A_Passives[i].name + "</option>";
      }
    }
  }
  document.getElementById("A").innerHTML = msg;
  msg = "";

  // Populate the B Passive list.
  msg = msg + "<option value='" + Characters[unit_id].base_b + "'>" + B_Passives[Characters[unit_id].base_b].name + "</option>";
  for (var i = 0; i < B_Passives.length; i++) {
    if (i != Characters[unit_id].base_b) {
      if(verify_legality(Characters[unit_id], B_Passives[i]) || document.getElementById("RuleBreaker").checked) {
        msg = msg + "<option value='" + i + "'>" + B_Passives[i].name + "</option>";
      }
    }
  }
  document.getElementById("B").innerHTML = msg;
  msg = "";

  // Populate the C Passive list.
  msg = msg + "<option value='" + Characters[unit_id].base_c + "'>" + C_Passives[Characters[unit_id].base_c].name + "</option>";
  for (var i = 0; i < C_Passives.length; i++) {
    if (i != Characters[unit_id].base_c) {
      if(verify_legality(Characters[unit_id], C_Passives[i]) || document.getElementById("RuleBreaker").checked) {
        msg = msg + "<option value='" + i + "'>" + C_Passives[i].name + "</option>";
      }
    }
  }
  document.getElementById("C").innerHTML = msg;
  msg = "";

  // Populate the Sacred Seal list.
  for (var i = 0; i < Seals.length; i++) {
    if (verify_legality(Characters[unit_id], Seals[i]) || document.getElementById("RuleBreaker").checked) {
      msg = msg + "<option value='" + i + "'>" + Seals[i].name + "</option>";
    }
  }
  document.getElementById("Seal").innerHTML = msg;
  msg = "";

  // If the selected chracter is not a Legendary Hero, populate the
  // Elements/Blessings Menu.
  msg = "<option value=\"(None)\">(None)</option>";
  if (!Characters[unit_id].legendary) {
    msg += "<option value=\"Earth\">Earth</option>";
    msg += "<option value=\"Fire\">Fire</option>";
    msg += "<option value=\"Water\">Water</option>";
    msg += "<option value=\"Wind\">Wind</option>";
  }
  document.getElementById("Blessing").innerHTML = msg;

  check_special_effects();
}

function find_upgrades(weap_id) {
  var msg = "";
  msg = "<option value='0'>(None)</option>";
  for (var i = 1; i < Weapons.length; i++) {
    if (Weapons[i].upgraded_from == weap_id) {
      msg = msg + "<option value='" + i + "'>" + Weapons[i].name + "</option>";
      upgrade_found = true;
    }
  }
  document.getElementById("WeaponUpgrade").innerHTML = msg;
}

// Fills the skill menus for the enemy overrides section.
function fill_enemy_menus() {
  // Initialize an empty message to be updated with the relevant html code.
  var msg = "";

  // Populate the Weapon list.
  for (var i = 0; i < Weapons.length; i++) {
    msg = msg + "<option value='" + i + "'>" + Weapons[i].name + "</option>";
  }
  document.getElementById("EnemyWeapon").innerHTML = msg;
  msg = "";

  // Populate the Special list.
  for (var i = 0; i < Procs.length; i++) {
    msg = msg + "<option value='" + i + "'>" + Procs[i].name + "</option>";
  }
  document.getElementById("EnemySpecial").innerHTML = msg;
  msg = "";

  // Populate the A Passive list.
  for (var i = 0; i < A_Passives.length; i++) {
    msg = msg + "<option value='" + i + "'>" + A_Passives[i].name + "</option>";
  }
  document.getElementById("EnemyA").innerHTML = msg;
  msg = "";

  // Populate the B Passive list.
  for (var i = 0; i < B_Passives.length; i++) {
    msg = msg + "<option value='" + i + "'>" + B_Passives[i].name + "</option>";
  }
  document.getElementById("EnemyB").innerHTML = msg;
  msg = "";

  // Populate the C Passive list.
  for (var i = 0; i < C_Passives.length; i++) {
    msg = msg + "<option value='" + i + "'>" + C_Passives[i].name + "</option>";
  }
  document.getElementById("EnemyC").innerHTML = msg;
  msg = "";

  // Populate the Sacred Seal list.
  for (var i = 0; i < Seals.length; i++) {
      msg = msg + "<option value='" + i + "'>" + Seals[i].name + "</option>";
  }
  document.getElementById("EnemySeal").innerHTML = msg;
  msg = "";

  msg = "<option value=\"(None)\">(None)</option>";
  msg += "<option value=\"Earth\">Earth</option>";
  msg += "<option value=\"Fire\">Fire</option>";
  msg += "<option value=\"Water\">Water</option>";
  msg += "<option value=\"Wind\">Wind</option>";
  document.getElementById("EnemyBlessing").innerHTML = msg;
}

// Verifies that a given unit can legally inherit a given skill
function verify_legality(unit, skill) {
  // Obtain the unit's movement and weapon types.
  var unit_mov_type = unit.type;
  var unit_weap_type = unit.weap;

  // Verify that the unit's movement type is compatible with the skill.
  switch (unit_mov_type) {
    case "I":
      if (!skill.inf_can_inherit) {
        return false;
      }
      break;
    case "C":
      if (!skill.cav_can_inherit) {
        return false;
      }
      break;
    case "F":
      if (!skill.fly_can_inherit) {
        return false;
      }
      break;
    default:
      if (!skill.arm_can_inherit) {
        return false;
      }
  }

  // Verify that the unit's weapon type is compatible with the skill.
  switch (unit_weap_type) {
    case "S":
      if (!skill.srd_can_inherit) {
        return false;
      }
      break;
    case "L":
      if (!skill.lnc_can_inherit) {
        return false;
      }
      break;
    case "A":
      if (!skill.axe_can_inherit) {
        return false;
      }
      break;
    case "RT":
      if (!skill.rt_can_inherit) {
        return false;
      }
      break;
    case "BT":
      if (!skill.bt_can_inherit) {
        return false;
      }
      break;
    case "GT":
      if (!skill.gt_can_inherit) {
        return false;
      }
      break;
    case "B":
      if (!skill.bow_can_inherit) {
        return false;
      }
      break;
    case "K":
      if (!skill.dgr_can_inherit) {
        return false;
      }
      break;
    case "ST":
      if (!skill.stf_can_inherit) {
        return false;
      }
      break;
    default:
      if ((unit.color == "R" && !skill.rbrth_can_inherit) || (unit.color == "B" && !skill.bbrth_can_inherit) || (unit.color == "G" && !skill.gbrth_can_inherit) || (unit.color == "N" && !skill.nbrth_can_inherit)) {
        return false;
      }
  }

  return true;
}

// Checks all color-based filter checkboxes.
function select_all_colors() {
  document.getElementById("Red").checked = true;
  document.getElementById("Blue").checked = true;
  document.getElementById("Green").checked = true;
  document.getElementById("Colorless").checked = true;
}

// Unchecks all color-based filter checkboxes.
function deselect_all_colors() {
  document.getElementById("Red").checked = false;
  document.getElementById("Blue").checked = false;
  document.getElementById("Green").checked = false;
  document.getElementById("Colorless").checked = false;
}

// Checks all weapon-based filter checkboxes.
function select_all_weapons() {
  document.getElementById("Sword").checked = true;
  document.getElementById("Lance").checked = true;
  document.getElementById("Axe").checked = true;
  document.getElementById("R Tome").checked = true;
  document.getElementById("B Tome").checked = true;
  document.getElementById("G Tome").checked = true;
  document.getElementById("R Breath").checked = true;
  document.getElementById("B Breath").checked = true;
  document.getElementById("G Breath").checked = true;
  document.getElementById("N Breath").checked = true;
  document.getElementById("Bow").checked = true;
  document.getElementById("Dagger").checked = true;
  document.getElementById("Staff").checked = true;
}

// Unchecks all weapon-based filter checkboxes.
function deselect_all_weapons() {
  document.getElementById("Sword").checked = false;
  document.getElementById("Lance").checked = false;
  document.getElementById("Axe").checked = false;
  document.getElementById("R Tome").checked = false;
  document.getElementById("B Tome").checked = false;
  document.getElementById("G Tome").checked = false;
  document.getElementById("R Breath").checked = false;
  document.getElementById("B Breath").checked = false;
  document.getElementById("G Breath").checked = false;
  document.getElementById("N Breath").checked = false;
  document.getElementById("Bow").checked = false;
  document.getElementById("Dagger").checked = false;
  document.getElementById("Staff").checked = false;
}

// Checks all movement-based filter checkboxes.
function select_all_mov_types() {
  document.getElementById("Armor").checked = true;
  document.getElementById("Cavalry").checked = true;
  document.getElementById("Flier").checked = true;
  document.getElementById("Infantry").checked = true;
}
// Unchecks all movement-based filter checkboxes.
function deselect_all_mov_types() {
  document.getElementById("Armor").checked = false;
  document.getElementById("Cavalry").checked = false;
  document.getElementById("Flier").checked = false;
  document.getElementById("Infantry").checked = false;
}

function check_special_effects() {
  var special_effect_text = "None.";
  var Weapon;
  if (Weapons[parseInt(document.getElementById("Weapon").value)].cond_effect && parseInt(document.getElementById("WeaponUpgrade").value) == 0) {
    Weapon = Weapons[parseInt(document.getElementById("Weapon").value)];
  }
  else if (Weapons[parseInt(document.getElementById("WeaponUpgrade").value)].cond_effect) {
    Weapon = Weapons[parseInt(document.getElementById("WeaponUpgrade").value)];
  }
  if (typeof(Weapon) != "undefined") {
    special_effect_text = Weapon.name + ": " + Weapon.cond_eff_text;
  }
  document.getElementById("conditional_effect_details").innerHTML = special_effect_text;
}

// Show or hide matchup details.
function showorhide(id) {
  // DOM elements with matchup details always have the id structure of
  // "match" + [input] + "details".
  var tagId = id + "details";
  // DOM elements with matchup details always have the "tempHidden" class
  // when they are created, which sets their CSS display property to none.
  if (document.getElementById(tagId).classList.contains("tempHidden")) {
    document.getElementById(tagId).classList.remove("tempHidden");
  }
  else {
    $("#" + tagId).toggle();
  }
}

// Adds the Legendary Hero options to the proper drop-downs.

function add_legendary_heroes() {
  for (var i = 1; i < 4; i++) {
    var msg = "<option value=\"0\">(None)</option>";
    for (var j = 0; j < Blessings.length; j++) {
      if (document.getElementById("Blessing").value == Blessings[j].element) {
        msg += "<option value=\"" + j + "\">" + Blessings[j].name + ": " + process_blessing_bonuses(Blessings[j]) + "</option>";
      }
    }
    document.getElementById("LegAlly" + i).innerHTML = msg;
  }
}
function add_enemy_legendary_heroes() {
  for (var i = 1; i < 4; i++) {
    var msg = "<option value=\"0\">(None)</option>";
    for (var j = 0; j < Blessings.length; j++) {
      if (document.getElementById("EnemyBlessing").value == Blessings[j].element) {
        msg += "<option value=\"" + j + "\">" + Blessings[j].name + ": " + process_blessing_bonuses(Blessings[j]) + "</option>";
      }
    }
    document.getElementById("EnemyLegAlly" + i).innerHTML = msg;
  }
}
function process_blessing_bonuses(blessing) {
  var output = "";
  if (blessing.hp_boost_perm > 0) {
    output += "HP +" + blessing.hp_boost_perm + " ";
  }
  if (blessing.atk_boost_perm > 0) {
    output += "Atk +" + blessing.atk_boost_perm + " ";
  }
  if (blessing.spd_boost_perm > 0) {
    output += "Spd +" + blessing.spd_boost_perm + " ";
  }
  if (blessing.def_boost_perm > 0) {
    output += "Def +" + blessing.def_boost_perm + " ";
  }
  if (blessing.res_boost_perm > 0) {
    output += "Res +" + blessing.res_boost_perm + " ";
  }
  return output;
}
