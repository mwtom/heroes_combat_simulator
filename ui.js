/* Inputs: None
 * Outputs: None. Loads options into the various player and enemy menus.
 */
function loadUI() {
  var character_list = "";

  // Load the initial Character & Enemy drop-downs.
  for (var i = 0; i < Characters.length; i++) {
    character_list += "<option value='" + i + "'>" + Characters[i].name + "</option>";
  }
  document.getElementById("Character").innerHTML = character_list;
  document.getElementById("Enemy").innerHTML = character_list;

  // Fills the skill menus
  fill_skill_menus("player");
  fill_skill_menus("enemy");

  // Fills the options menus (Dragonflowers, etc.)
  fill_options_menus("player");
  fill_options_menus("enemy");

  // Fills menus specific to enemies (currently only the Blessing menu)
  fill_enemy_menus();
}

/* Inputs: None
 * Outputs: None. Updates the enemy skill and options menus (required when the
 *          Enemy is changed to a new character).
 */
function reload_enemy_options() {
  fill_skill_menus("enemy");
  fill_options_menus("enemy");
}

/* Inputs: None
 * Outputs: None. Updates player skill and options menus (required when the
 *          Player is changed to a new character).
 */
function reload_options() {
  fill_skill_menus("player");
  fill_options_menus("player");

  // Also set merge level to 0, zero out field buffs, combat buffs, and
  // field penalties, and deactivate the Legendary Hero selection menus.
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

/* Inputs: None
 * Outputs: None. Resets the specifications in the "Enemy Stats" menu.
 */
function reset_enemy_overrides() {
  document.getElementById("EnemyMergeLv").value = 0;

  document.getElementById("EnemyBoon").value='None';
  document.getElementById("EnemyBane").value='None';

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
  document.getElementById("EnemyTwoSpaceAllies").value = 0;
  document.getElementById("EnemyThreeSpaceAllies").value = 0;

  document.getElementById("EnemyResplendent").checked = false;
  document.getElementById("EnemyBlessing").value = "(None)";

  $(".EnemyLegAlly").toggle(false);
}

/* Inputs:
 *   -mode [String]: The mode for the function. Either "player" or "enemy".
 * Outputs: None. Fills the skill menus for the Player or Enemy, depending on
 *          the mode.
 */
function fill_skill_menus(mode) {
  // Obtain the id of the currently selected unit.
  var unit_id;
  if (mode == "player") {
    unit_id = document.getElementById("Character").value;
  }
  else {
    unit_id = document.getElementById("Enemy").value;
  }

  // Initialize an empty message to be updated with the relevant html code.
  var msg = "";

  // Populate the Weapon list. Start with the character's base weapon.
  msg = msg + "<option value='" + Characters[unit_id].base_weap + "'>" + Weapons[Characters[unit_id].base_weap].name + "</option>";
  // Add any weapons that the character's base weapon can evolve into.
  if (Weapons[Characters[unit_id].base_weap].evolves_into != 0) {
    msg = msg + "<option value='" + Weapons[Characters[unit_id].base_weap].evolves_into + "'>" + Weapons[Weapons[Characters[unit_id].base_weap].evolves_into].name + "</option>";
  }

  set_skill_icon(mode + "_weapon", Weapons[Characters[unit_id].base_weap]);

  // Find weapons that the current selection (the base weapon) can be refined into,
  // and add them to the "WeaponUpgradeCell" DOM element.
  find_upgrades(Characters[unit_id].base_weap, mode);

  // Note that iteration starts at 1, to exclude the (None) weapon.
  for (var i = 1; i < Weapons.length; i++) {
    // Conditions for including a weapon in the drop-down:
    // 1) Must not be the base weapon (handled separately).
    // 2) Must not be a weapon upgrade (handled separately).
    // 3) Must not be a weapon evolution (handled separately).
    // 4) Must satisfy one of the following:
    //      -The weapon type must be inheritable by the unit.
    //      -The "Remove Inheritance Restrictions" checkbox must be selected.
    if (i != Characters[unit_id].base_weap
        && Weapons[i].upgraded_from == 0
        && Characters[unit_id].base_weap != Weapons[i].evolved_from
        && (verify_legality(Characters[unit_id], Weapons[i]) || document.getElementById("RuleBreaker").checked)
        && (!Weapons[i].tcc || document.getElementById("tcc").checked))
    {
      msg = msg + "<option value='" + i + "'>" + Weapons[i].name + "</option>";
    }
  }

  if (mode == "player") {
    document.getElementById("Weapon").innerHTML = msg;
  }
  else {
    document.getElementById("EnemyWeapon").innerHTML = msg;
  }
  msg = "";

  // Populate the Special list.
  msg = msg + "<option value='" + Characters[unit_id].base_proc + "'>" + Procs[Characters[unit_id].base_proc].name + "</option>";
  document.getElementById(mode + "_special_img").innerHTML = "<img src=\"images/special_icon.png\" class=\"icon\" />";
  //document.getElementById("player_special_desc").innerHTML = Procs[Characters[unit_id].base_proc].desc;
  for (var i = 0; i < Procs.length; i++) {
    if (i != Characters[unit_id].base_proc) {
      if (verify_legality(Characters[unit_id], Procs[i]) || document.getElementById("RuleBreaker").checked) {
        msg = msg + "<option value='" + i + "'>" + Procs[i].name + "</option>";
      }
    }
  }

  if (mode == "player") {
    document.getElementById("Special").innerHTML = msg;
  }
  else {
    document.getElementById("EnemySpecial").innerHTML = msg;
  }
  msg = "";

  // Populate the A Passive list.
  msg = msg + "<option value='" + Characters[unit_id].base_a + "'>" + A_Passives[Characters[unit_id].base_a].name + "</option>";
  document.getElementById(mode + "_a_img").innerHTML = "<img src=\"" + process_skill_path(A_Passives[Characters[unit_id].base_a].name) + "\" class=\"icon\" />";
  //document.getElementById("player_a_desc").innerHTML = A_Passives[Characters[unit_id].base_a].desc;
  for (var i = 0; i < A_Passives.length; i++) {
    if (i != Characters[unit_id].base_a) {
      if(verify_legality(Characters[unit_id], A_Passives[i]) || document.getElementById("RuleBreaker").checked) {
        msg = msg + "<option value='" + i + "'>" + A_Passives[i].name + "</option>";
      }
    }
  }

  if (mode == "player") {
    document.getElementById("A").innerHTML = msg;
  }
  else {
    document.getElementById("EnemyA").innerHTML = msg;
  }
  msg = "";

  // Populate the B Passive list.
  msg = msg + "<option value='" + Characters[unit_id].base_b + "'>" + B_Passives[Characters[unit_id].base_b].name + "</option>";
  document.getElementById(mode + "_b_img").innerHTML = "<img src=\"" + process_skill_path(B_Passives[Characters[unit_id].base_b].name) + "\" class=\"icon\" />";
  //document.getElementById("player_b_desc").innerHTML = B_Passives[Characters[unit_id].base_b].desc;
  for (var i = 0; i < B_Passives.length; i++) {
    if (i != Characters[unit_id].base_b) {
      if(verify_legality(Characters[unit_id], B_Passives[i]) || document.getElementById("RuleBreaker").checked) {
        msg = msg + "<option value='" + i + "'>" + B_Passives[i].name + "</option>";
      }
    }
  }

  if (mode == "player") {
    document.getElementById("B").innerHTML = msg;
  }
  else {
    document.getElementById("EnemyB").innerHTML = msg;
  }
  msg = "";

  // Populate the C Passive list.
  msg = msg + "<option value='" + Characters[unit_id].base_c + "'>" + C_Passives[Characters[unit_id].base_c].name + "</option>";
  document.getElementById(mode + "_c_img").innerHTML = "<img src=\"" + process_skill_path(C_Passives[Characters[unit_id].base_c].name) + "\" class=\"icon\" />";
  //document.getElementById("player_c_desc").innerHTML = C_Passives[Characters[unit_id].base_c].desc;
  for (var i = 0; i < C_Passives.length; i++) {
    if (i != Characters[unit_id].base_c) {
      if(verify_legality(Characters[unit_id], C_Passives[i]) || document.getElementById("RuleBreaker").checked) {
        msg = msg + "<option value='" + i + "'>" + C_Passives[i].name + "</option>";
      }
    }
  }

  if (mode == "player") {
    document.getElementById("C").innerHTML = msg;
  }
  else {
    document.getElementById("EnemyC").innerHTML = msg;
  }
  msg = "";

  // Populate the Sacred Seal list.
  document.getElementById(mode + "_seal_img").innerHTML = "<img src=\"" + process_seal_path(Seals[0].name) + "\" class=\"icon\" />";
  //document.getElementById("player_seal_desc").innerHTML = Seals[0].desc;
  for (var i = 0; i < Seals.length; i++) {
    if (verify_legality(Characters[unit_id], Seals[i]) || document.getElementById("RuleBreaker").checked) {
      msg = msg + "<option value='" + i + "'>" + Seals[i].name + "</option>";
    }
  }

  if (mode == "player") {
    document.getElementById("Seal").innerHTML = msg;
  }
  else {
    document.getElementById("EnemySeal").innerHTML = msg;
  }
  msg = "";

  // The enemy blessings are populated by a separate UI function, so filling the Blessings
  // menus should only be done if the mode is "player".
  if (mode == "player") {
    // Populate the Blessings menu based on whether the hero is Legendary, Mythic, or neither.
    msg = "<option value=\"(None)\">(None)</option>";
    if (!Characters[unit_id].legendary && !Characters[unit_id].mythic) {
      msg += "<option value=\"Earth\">Earth</option>";
      msg += "<option value=\"Fire\">Fire</option>";
      msg += "<option value=\"Water\">Water</option>";
      msg += "<option value=\"Wind\">Wind</option>";
      msg += "<option value=\"Light\">Light</option>";
      msg += "<option value=\"Dark\">Dark</option>";
      msg += "<option value=\"Astra\">Astra</option>";
      msg += "<option value=\"Anima\">Anima</option>";
    }
    else if (Characters[unit_id].legendary) {
      msg += "<option value=\"Light\">Light</option>";
      msg += "<option value=\"Dark\">Dark</option>";
      msg += "<option value=\"Astra\">Astra</option>";
      msg += "<option value=\"Anima\">Anima</option>";
    }
    else {
      msg += "<option value=\"Earth/Fire\">Earth/Fire</option>";
      msg += "<option value=\"Earth/Water\">Earth/Water</option>";
      msg += "<option value=\"Earth/Wind\">Earth/Wind</option>";
      msg += "<option value=\"Fire/Water\">Fire/Water</option>";
      msg += "<option value=\"Fire/Wind\">Fire/Wind</option>";
      msg += "<option value=\"Water/Wind\">Water/Wind</option>";
    }
    document.getElementById("Blessing").innerHTML = msg;
  }

  check_special_effects(mode);
}

/* Inputs:
 *   -mode [String]: The mode for the function. Either "player" or "enemy".
 * Outputs: None. Fills the menus for miscellaneous options for the Player
 *          or Enemy, depending on the mode.
 */
function fill_options_menus(mode) {
  var char_index;

  // Retrieve the Player or Enemy character, depending on the mode.
  if (mode == "player") {
    char_index = parseInt(document.getElementById("Character").value);
  }
  else {
    char_index = parseInt(document.getElementById("Enemy").value);
  }

  var Character;
  Character = Characters[char_index];

  // The Enemy Dragonflower menu is populated by another UI function, so the
  // Dragonflower menu should only be populated if the mode is "player".
  if (mode == "player") {
    var dragonflower_options = "";
    for (var i = 0; i <= Character.df_maximum; i++)
      dragonflower_options += "<option value=" + i + ">" + i + "</option>";

    $("#Dragonflowers").html(dragonflower_options);
  }
}

/* Inputs:
 *   -weap_id [Integer]: An index to the Weapons array.
 *   -mode [String]: The mode for the function. Either "player" or "enemy".
 * Outputs: None. Populates the refinement options for the Player or Enemy,
 *          depending on the mode.
 */
function find_upgrades(weap_id, mode) {
  var msg = "";
  msg = "<option value=\"None\">(None)</option>";

  if (Weapons[weap_id].has_eff_refine)
    msg += "<option value=\"Eff\">Effect</option>";

  if (Weapons[weap_id].has_refinements) {
    if (Weapons[weap_id].type == "ST") {
      msg += "<option value=\"D\">Dazzling Staff</option>";
      msg += "<option value=\"W\">Wrathful Staff</option>";
    }
    else {
      msg += "<option value=\"Atk\">Atk</option>";
      msg += "<option value=\"Spd\">Spd</option>";
      msg += "<option value=\"Def\">Def</option>";
      msg += "<option value=\"Res\">Res</option>";
    }
  }

  if (mode == "player") {
    document.getElementById("WeaponUpgrade").innerHTML = msg;
  }
  else {
    document.getElementById("EnemyWeaponUpgrade").innerHTML = msg;
  }
}

/* Inputs: None
 * Outputs: None. Fills enemy-specific menus not covered by other UI functions.
 */
function fill_enemy_menus() {
  // Initialize an empty message to be updated with the relevant html code.
  var msg = "";

  // Fill the Blessing options, and populate the EnemyBLessing menu.
  msg = "<option value=\"(None)\">(None)</option>";
  msg += "<option value=\"Earth\">Earth</option>";
  msg += "<option value=\"Fire\">Fire</option>";
  msg += "<option value=\"Water\">Water</option>";
  msg += "<option value=\"Wind\">Wind</option>";
  msg += "<option value=\"Light\">Light</option>";
  msg += "<option value=\"Dark\">Dark</option>";
  msg += "<option value=\"Astra\">Astra</option>";
  msg += "<option value=\"Anima\">Anima</option>";
  document.getElementById("EnemyBlessing").innerHTML = msg;
}

/* Inputs:
 *   -unit [Character]: The character being tested for compatibility with the skill.
 *   -skill [Skill]: The skill being tested for compatibility with the unit.
 * Outputs:
 *   -[Boolean]: true if the unit can inherit the skill. false otherwise.
 */
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
    case "NT":
      if (!skill.nt_can_inherit) {
        return false;
      }
      break;
    case "RB":
      if (!skill.rbow_can_inherit) {
        return false;
      }
      break;
    case "BB":
      if (!skill.bbow_can_inherit) {
        return false;
      }
      break;
    case "GB":
      if (!skill.gbow_can_inherit) {
        return false;
      }
      break;
    case "NB":
      if (!skill.nbow_can_inherit) {
        return false;
      }
      break;
    case "RK":
      if (!skill.r_dgr_can_inherit) {
        return false;
      }
      break;
    case "BK":
      if (!skill.b_dgr_can_inherit) {
        return false;
      }
      break;
    case "GK":
      if (!skill.g_dgr_can_inherit) {
        return false;
      }
      break;
    case "NK":
      if (!skill.n_dgr_can_inherit) {
        return false;
      }
      break;
    case "ST":
      if (!skill.stf_can_inherit) {
        return false;
      }
      break;
    case "RD":
      if (!skill.rbrth_can_inherit) {
        return false;
      }
      break;
    case "BD":
      if (!skill.bbrth_can_inherit) {
        return false;
      }
      break;
    case "GD":
      if (!skill.gbrth_can_inherit) {
        return false;
      }
      break;
    case "ND":
      if (unit.color == "N" && !skill.nbrth_can_inherit)
        return false;
      break;
    case "RBe":
      if (!skill.rbe_can_inherit)
        return false;
      break;
    case "BBe":
      if (!skill.bbe_can_inherit)
        return false;
      break;
    case "GBe":
      if (!skill.gbe_can_inherit)
        return false;
      break;
    case "NBe":
      if (!skill.nbe_can_inherit)
        return false;
      break;
    default:
      console.log("Invalid weapon type encountered when evaluating inheritance compatibility for " + skill.name + ": " + unit_weap_type);
      return false;
  }

  return true;
}

/* Inputs: None
 * Outputs: None. Checks all color-based filter checkboxes.
 */
function select_all_colors() {
  document.getElementById("Red").checked = true;
  document.getElementById("Blue").checked = true;
  document.getElementById("Green").checked = true;
  document.getElementById("Colorless").checked = true;
}

/* Inputs: None
 * Outputs: None. Unchecks all color-based filter checkboxes.
 */
function deselect_all_colors() {
  document.getElementById("Red").checked = false;
  document.getElementById("Blue").checked = false;
  document.getElementById("Green").checked = false;
  document.getElementById("Colorless").checked = false;
}

/* Inputs: None
 * Outputs: None. Checks all weapon-based filter checkboxes.
 */
function select_all_weapons() {
  document.getElementById("Sword").checked = true;
  document.getElementById("Lance").checked = true;
  document.getElementById("Axe").checked = true;
  document.getElementById("R Tome").checked = true;
  document.getElementById("B Tome").checked = true;
  document.getElementById("G Tome").checked = true;
  document.getElementById("N Tome").checked = true;
  document.getElementById("R Breath").checked = true;
  document.getElementById("B Breath").checked = true;
  document.getElementById("G Breath").checked = true;
  document.getElementById("N Breath").checked = true;
  document.getElementById("R Bow").checked = true;
  document.getElementById("B Bow").checked = true;
  document.getElementById("G Bow").checked = true;
  document.getElementById("N Bow").checked = true;
  document.getElementById("R Dagger").checked = true;
  document.getElementById("B Dagger").checked = true;
  document.getElementById("G Dagger").checked = true;
  document.getElementById("N Dagger").checked = true;
  document.getElementById("Staff").checked = true;
  document.getElementById("R Beast").checked = true;
  document.getElementById("B Beast").checked = true;
  document.getElementById("G Beast").checked = true;
  document.getElementById("N Beast").checked = true;
}

/* Inputs: None
 * Outputs: None. Unchecks all weapon-based filter checkboxes.
 */
function deselect_all_weapons() {
  document.getElementById("Sword").checked = false;
  document.getElementById("Lance").checked = false;
  document.getElementById("Axe").checked = false;
  document.getElementById("R Tome").checked = false;
  document.getElementById("B Tome").checked = false;
  document.getElementById("G Tome").checked = false;
  document.getElementById("N Tome").checked = false;
  document.getElementById("R Breath").checked = false;
  document.getElementById("B Breath").checked = false;
  document.getElementById("G Breath").checked = false;
  document.getElementById("N Breath").checked = false;
  document.getElementById("R Bow").checked = false;
  document.getElementById("B Bow").checked = false;
  document.getElementById("G Bow").checked = false;
  document.getElementById("N Bow").checked = false;
  document.getElementById("R Dagger").checked = false;
  document.getElementById("B Dagger").checked = false;
  document.getElementById("G Dagger").checked = false;
  document.getElementById("N Dagger").checked = false;
  document.getElementById("Staff").checked = false;
  document.getElementById("R Beast").checked = false;
  document.getElementById("B Beast").checked = false;
  document.getElementById("G Beast").checked = false;
  document.getElementById("N Beast").checked = false;
}

/* Inputs: None
 * Outputs: None. Checks all filter checkboxes that correspond to
 *          magical weapons.
 */
function select_magical_weapons() {
  document.getElementById("R Tome").checked = true;
  document.getElementById("B Tome").checked = true;
  document.getElementById("G Tome").checked = true;
  document.getElementById("N Tome").checked = true;
  document.getElementById("R Breath").checked = true;
  document.getElementById("B Breath").checked = true;
  document.getElementById("G Breath").checked = true;
  document.getElementById("N Breath").checked = true;
  document.getElementById("Staff").checked = true;
  document.getElementById("Sword").checked = false;
  document.getElementById("Lance").checked = false;
  document.getElementById("Axe").checked = false;
  document.getElementById("R Bow").checked = false;
  document.getElementById("B Bow").checked = false;
  document.getElementById("G Bow").checked = false;
  document.getElementById("N Bow").checked = false;
  document.getElementById("R Dagger").checked = false;
  document.getElementById("B Dagger").checked = false;
  document.getElementById("G Dagger").checked = false;
  document.getElementById("N Dagger").checked = false;
  document.getElementById("R Beast").checked = false;
  document.getElementById("B Beast").checked = false;
  document.getElementById("G Beast").checked = false;
  document.getElementById("N Beast").checked = false;
}

/* Inputs: None
 * Outputs: None. Checks all filter checkboxes that correspond to
 *          physical weapons.
 */
function select_physical_weapons() {
  document.getElementById("Sword").checked = true;
  document.getElementById("Lance").checked = true;
  document.getElementById("Axe").checked = true;
  document.getElementById("R Bow").checked = true;
  document.getElementById("B Bow").checked = true;
  document.getElementById("G Bow").checked = true;
  document.getElementById("N Bow").checked = true;
  document.getElementById("R Dagger").checked = true;
  document.getElementById("B Dagger").checked = true;
  document.getElementById("G Dagger").checked = true;
  document.getElementById("N Dagger").checked = true;
  document.getElementById("R Beast").checked = true;
  document.getElementById("B Beast").checked = true;
  document.getElementById("G Beast").checked = true;
  document.getElementById("N Beast").checked = true;
  document.getElementById("R Tome").checked = false;
  document.getElementById("B Tome").checked = false;
  document.getElementById("G Tome").checked = false;
  document.getElementById("N Tome").checked = false;
  document.getElementById("R Breath").checked = false;
  document.getElementById("B Breath").checked = false;
  document.getElementById("G Breath").checked = false;
  document.getElementById("N Breath").checked = false;
  document.getElementById("Staff").checked = false;
}

/* Inputs: None
 * Outputs: None. Checks all filter checkboxes that correspond to
 *          one-range weapons.
 */
function select_one_range_weapons() {
  document.getElementById("Sword").checked = true;
  document.getElementById("Lance").checked = true;
  document.getElementById("Axe").checked = true;
  document.getElementById("R Breath").checked = true;
  document.getElementById("B Breath").checked = true;
  document.getElementById("G Breath").checked = true;
  document.getElementById("N Breath").checked = true;
  document.getElementById("R Beast").checked = true;
  document.getElementById("B Beast").checked = true;
  document.getElementById("G Beast").checked = true;
  document.getElementById("N Beast").checked = true;
  document.getElementById("R Tome").checked = false;
  document.getElementById("B Tome").checked = false;
  document.getElementById("G Tome").checked = false;
  document.getElementById("N Tome").checked = false;
  document.getElementById("R Bow").checked = false;
  document.getElementById("B Bow").checked = false;
  document.getElementById("G Bow").checked = false;
  document.getElementById("N Bow").checked = false;
  document.getElementById("R Dagger").checked = false;
  document.getElementById("B Dagger").checked = false;
  document.getElementById("G Dagger").checked = false;
  document.getElementById("N Dagger").checked = false;
  document.getElementById("Staff").checked = false;
}

/* Inputs: None
 * Outputs: None. Checks all filter checkboxes that correspond to
 *          two-range weapons.
 */
function select_two_range_weapons() {
  document.getElementById("R Tome").checked = true;
  document.getElementById("B Tome").checked = true;
  document.getElementById("G Tome").checked = true;
  document.getElementById("N Tome").checked = true;
  document.getElementById("R Bow").checked = true;
  document.getElementById("B Bow").checked = true;
  document.getElementById("G Bow").checked = true;
  document.getElementById("N Bow").checked = true;
  document.getElementById("R Dagger").checked = true;
  document.getElementById("B Dagger").checked = true;
  document.getElementById("G Dagger").checked = true;
  document.getElementById("N Dagger").checked = true;
  document.getElementById("Staff").checked = true;
  document.getElementById("Sword").checked = false;
  document.getElementById("Lance").checked = false;
  document.getElementById("Axe").checked = false;
  document.getElementById("R Breath").checked = false;
  document.getElementById("B Breath").checked = false;
  document.getElementById("G Breath").checked = false;
  document.getElementById("N Breath").checked = false;
  document.getElementById("R Beast").checked = false;
  document.getElementById("B Beast").checked = false;
  document.getElementById("G Beast").checked = false;
  document.getElementById("N Beast").checked = false;
}

/* Inputs: None
 * Outputs: None. Checks all movement-based filter checkboxes.
 */
function select_all_mov_types() {
  document.getElementById("Armor").checked = true;
  document.getElementById("Cavalry").checked = true;
  document.getElementById("Flier").checked = true;
  document.getElementById("Infantry").checked = true;
}

/* Inputs: None
 * Outputs: None. Unchecks all movement-based filter checkboxes.
 */
function deselect_all_mov_types() {
  document.getElementById("Armor").checked = false;
  document.getElementById("Cavalry").checked = false;
  document.getElementById("Flier").checked = false;
  document.getElementById("Infantry").checked = false;
}

/* Inputs:
 *   -mode [String]: The mode for the function. Either "player" or "enemy".
 * Outputs: None. Reveals or hides the boolean and number inputs for the
 *          Players or Enemy's skills, depending on the mode.
 */
function check_special_effects(mode) {
  var special_effect_text = "";
  var cond_effect_found = false;
  var char_index, weap_index, weap_refine, spec_index, a_index, b_index, c_index, seal_index;
  // Load in the indexes for the character, weapon, special, and passive skills for the player
  // or enemy, based on the mode.
  if (mode == "player") {
    char_index = parseInt(document.getElementById("Character").value);
    weap_index = parseInt(document.getElementById("Weapon").value);
    weap_refine = document.getElementById("WeaponUpgrade").value;
    spec_index = parseInt(document.getElementById("Special").value);
    a_index = parseInt(document.getElementById("A").value);
    b_index = parseInt(document.getElementById("B").value);
    c_index = parseInt(document.getElementById("C").value);
    seal_index = parseInt(document.getElementById("Seal").value);
  }
  else {
    char_index = parseInt(document.getElementById("Enemy").value);
    weap_index = parseInt(document.getElementById("EnemyWeapon").value);
    weap_refine = document.getElementById("EnemyWeaponUpgrade").value;
    spec_index = parseInt(document.getElementById("EnemySpecial").value);
    a_index = parseInt(document.getElementById("EnemyA").value);
    b_index = parseInt(document.getElementById("EnemyB").value);
    c_index = parseInt(document.getElementById("EnemyC").value);
    seal_index = parseInt(document.getElementById("EnemySeal").value);
  }

  // Retrieve the character and skills from the appropriate arrays.
  var Character, Weapon, Special, A_Skill, B_Skill, C_Skill, Seal;
  Character = Characters[char_index];
  Weapon = Weapons[weap_index];
  Special = Procs[spec_index];
  A_Skill = A_Passives[a_index];
  B_Skill = B_Passives[b_index];
  C_Skill = C_Passives[c_index];
  Seal = Seals[seal_index];

  // Initialize prefix strings, which are used for DOM element manipulation.
  var row_prefix = "", option_prefix = "";
  if (mode == "enemy") {
    row_prefix = "Enemy";
    option_prefix = "enemy_";
  }

  // The Resplendent checkbox should only be toggled if the mode is "player".
  // The Enemy Resplendent checkbox is always active.
  if (mode == "player") {
    if (Character.has_resplendent) {
      $("#resplendent").toggle(true);
    }
    else {
      $("#resplendent").toggle(false);
      document.getElementById("resplendent_input").checked = false;
    }
  }

  // Reveal or hide the Transformation checkbox (for Beast units).
  if (Weapon.user_can_transform) {
    $("." + row_prefix + "Transformed").toggle(true);
  }
  else {
    $("." + row_prefix + "Transformed").toggle(false);
    document.getElementById(option_prefix + "transformed_input").checked = false;
  }

  // Reveal or hide the boolean and number inputs for the weapon, if the base weapon is
  // used.
  if (weap_refine == "None") {
    if (Weapon.base_has_number_input)
      $("." + row_prefix + "WeapNum").toggle(true);
    else {
      $("." + row_prefix + "WeapNum").toggle(false);
      document.getElementById(option_prefix + "weap_number_input").value = 0;
    }

    if (Weapon.base_has_boolean_input)
      $("." + row_prefix + "WeapBool").toggle(true);
    else {
      $("." + row_prefix + "WeapBool").toggle(false);
      document.getElementById(option_prefix + "weap_boolean_input").checked = false;
    }
  }
  // Reveal or hide the boolean and number inputs for the effect-refined weapon, if
  // the effect refinement is used.
  else if (weap_refine == "Eff") {
    if (Weapon.eff_has_number_input)
      $("." + row_prefix + "WeapNum").toggle(true);
    else {
      $("." + row_prefix + "WeapNum").toggle(false);
      document.getElementById(option_prefix + "weap_number_input").value = 0;
    }

    if (Weapon.eff_has_boolean_input)
      $("." + row_prefix + "WeapBool").toggle(true);
    else {
      $("." + row_prefix + "WeapBool").toggle(false);
      document.getElementById(option_prefix + "weap_boolean_input").checked = false;
    }
  }
  // Reveal or hide the boolean and number inputs for the non-effect-refined weapon,
  // if one of those refinements are used.
  else if (weap_refine == "Atk" || weap_refine == "Spd" || weap_refine == "Def" || weap_refine == "Res") {
    if (Weapon.ref_has_number_input)
      $("." + row_prefix + "WeapNum").toggle(true);
    else {
      $("." + row_prefix + "WeapNum").toggle(false);
      document.getElementById(option_prefix + "weap_number_input").value = 0;
    }

    if (Weapon.ref_has_boolean_input)
      $("." + row_prefix + "WeapBool").toggle(true);
    else {
      $("." + row_prefix + "WeapBool").toggle(false);
      document.getElementById(option_prefix + "weap_boolean_input").checked = false;
    }
  }
  else {
    $("." + row_prefix + "WeapNum").toggle(false);
    document.getElementById(option_prefix + "weap_number_input").value = 0;

    $("." + row_prefix + "WeapBool").toggle(false);
    document.getElementById(option_prefix + "weap_boolean_input").checked = false;
  }

  // Reveal or hide the boolean and number inputs for the special.
  if (Special.has_number_input)
    $("." + row_prefix + "SpecNum").toggle(true);
  else {
    $("." + row_prefix + "SpecNum").toggle(false);
    document.getElementById(option_prefix + "special_number_input").value = 0;
  }
  if (Special.has_boolean_input)
    $("." + row_prefix + "SpecBool").toggle(true);
  else {
    $("." + row_prefix + "SpecBool").toggle(false);
    document.getElementById(option_prefix + "special_boolean_input").checked = false;
  }
  // Reveal or hide the boolean and number inputs for the A Passive.
  if (A_Skill.has_number_input)
    $("." + row_prefix + "ANum").toggle(true);
  else {
    $("." + row_prefix + "ANum").toggle(false);
    document.getElementById(option_prefix + "a_number_input").value = 0;
  }
  if (A_Skill.has_boolean_input)
    $("." + row_prefix + "ABool").toggle(true);
  else {
    $("." + row_prefix + "ABool").toggle(false);
    document.getElementById(option_prefix + "a_boolean_input").checked = false;
  }
  // Reveal or hide the boolean and number inputs for the B Passive.
  if (B_Skill.has_number_input)
    $("." + row_prefix + "BNum").toggle(true);
  else {
    $("." + row_prefix + "BNum").toggle(false);
    document.getElementById(option_prefix + "b_number_input").value = 0;
  }
  if (B_Skill.has_boolean_input)
    $("." + row_prefix + "BBool").toggle(true);
  else {
    $("." + row_prefix + "BBool").toggle(false);
    document.getElementById(option_prefix + "b_boolean_input").checked = false;
  }
  // Reveal or hide the boolean and number inputs for the C Passive.
  if (C_Skill.has_number_input)
    $("." + row_prefix + "CNum").toggle(true);
  else {
    $("." + row_prefix + "CNum").toggle(false);
    document.getElementById(option_prefix + "c_number_input").value = 0;
  }
  if (C_Skill.has_boolean_input)
    $("." + row_prefix + "CBool").toggle(true);
  else {
    $("." + row_prefix + "CBool").toggle(false);
    document.getElementById(option_prefix + "c_boolean_input").checked = false;
  }
  // Reveal or hide the boolean and number inputs for the Sacred Seal.
  if (Seal.has_number_input)
    $("." + row_prefix + "SNum").toggle(true);
  else {
    $("." + row_prefix + "SNum").toggle(false);
    document.getElementById(option_prefix + "seal_number_input").value = 0;
  }
  if (Seal.has_boolean_input)
    $("." + row_prefix + "SBool").toggle(true);
  else {
    $("." + row_prefix + "SBool").toggle(false);
    document.getElementById(option_prefix + "seal_boolean_input").checked = false;
  }
}

/* Inputs:
 *   -id [Integer]: The ID portion of the matchup details in the "Results" section.
 * Outputs: None. Toggles the visibility of the matchup details based on the id.
 */
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

/* Inputs: None.
 * Outputs: None. Adds the Legendary Hero options to the player's Legendary/Mythic drop-downs,
 *          based on the blessing that was selected in the "Blessing" drop-down.
 */
function add_legendary_heroes() {
  var blessing1, blessing2;
  var mythic_flag = Characters[document.getElementById("Character").value].mythic;

  if (mythic_flag) {
    switch (document.getElementById("Blessing").value) {
      case "Earth/Fire":
        blessing1 = "Earth";
        blessing2 = "Fire";
        break;
      case "Earth/Water":
        blessing1 = "Earth";
        blessing2 = "Water";
        break;
      case "Earth/Wind":
        blessing1 = "Earth";
        blessing2 = "Wind";
        break;
      case "Fire/Water":
        blessing1 = "Fire";
        blessing2 = "Water";
        break;
      case "Fire/Wind":
        blessing1 = "Fire";
        blessing2 = "Wind";
        break;
      case "Water/Wind":
        blessing1 = "Water";
        blessing2 = "Wind";
        break;
    }
  }
  else
    blessing1 = document.getElementById("Blessing").value;

  for (var i = 1; i < 5; i++) {
    var msg = "<option value=\"0\">(None)</option>";
    for (var j = 0; j < Blessings.length; j++) {
      if (mythic_flag) {
        if (blessing1 == Blessings[j].element || blessing2 == Blessings[j].element)
          msg += "<option value=\"" + j + "\">" + Blessings[j].name + ": " + process_blessing_bonuses(Blessings[j]) + "</option>";
      }
      else {
        if (blessing1 == Blessings[j].element)
          msg += "<option value=\"" + j + "\">" + Blessings[j].name + ": " + process_blessing_bonuses(Blessings[j]) + "</option>";
      }
    }
    document.getElementById("LegAlly" + i).innerHTML = msg;
  }
}
/* Inputs: None.
 * Outputs: None. Adds the Legendary Hero options to the enemy's Legendary/Mythic drop-downs,
 *          based on the blessing that was selected in the "EnemyBlessing" drop-down.
 */
function add_enemy_legendary_heroes() {
  for (var i = 1; i < 5; i++) {
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
  if (blessing.hp_mod > 0) {
    output += "HP +" + blessing.hp_mod + " ";
  }
  if (blessing.atk_mod > 0) {
    output += "Atk +" + blessing.atk_mod + " ";
  }
  if (blessing.spd_mod > 0) {
    output += "Spd +" + blessing.spd_mod + " ";
  }
  if (blessing.def_mod > 0) {
    output += "Def +" + blessing.def_mod + " ";
  }
  if (blessing.res_mod > 0) {
    output += "Res +" + blessing.res_mod + " ";
  }
  return output;
}

/* Inputs:
 *   -skill_type [String]: Determines which DOM IDs to insert into.
 *   -skill [Skill]: The skill for which the icon should be set.
 * Outputs: None. Inserts a skill image to the appropriate DOM elements.
*/
function set_skill_icon(skill_type, skill) {
  var img_id = skill_type + "_img";
  var img_path;

  switch (skill_type) {
    case "player_weapon":
      img_path = "images/weapon_icon.png";
      document.getElementById("player_weapon_refined_img").innerHTML = "";
      //document.getElementById("player_weapon_refined_desc").innerHTML = "No Refinement selected/available.";
      break;
    case "player_weapon_refined":
      img_path = "images/weapon_icon.png";
      document.getElementById("player_weapon_img").innerHTML = "";
      //document.getElementById("player_weapon_desc").innerHTML = "See the selected Weapon Refinement for the weapon effect.";
      break;
    case "enemy_weapon":
      img_path = "images/weapon_icon.png";
      document.getElementById("enemy_weapon_refined_img").innerHTML = "";
      break;
    case "enemy_weapon_refined":
      img_path = "images/weapon_icon.png";
      document.getElementById("enemy_weapon_img").innerHTML = "";
      break;
    case "player_special":
      img_path = "images/special_icon.png";
      break;
    case "enemy_special":
      img_path = "images/special_icon.png";
      break;
    case "player_seal":
      img_path = process_seal_path(skill.name);
      break;
    case "enemy_seal":
      img_path = process_seal_path(skill.name);
      break;
    default:
      img_path = process_skill_path(skill.name);
  }

  document.getElementById(img_id).innerHTML = "<img src=\"" + img_path + "\" class=\"icon\" />";
}

/* Inputs: None.
 * Outputs: None. Fills the "Enemies" div with a single row for each entry in Enemy_List, including
 *          a field for a remove enemy button, a field for the enemy name button, and event handlers
 *          for each that will allow the user to either remove the enemy from the list, or load the
 *          enemy's skills and stat options into the appropriate menus.
 */
function update_enemy_list() {
  var e_list;

  document.getElementById("Enemies").innerHTML = "";

  for (var i = 0; i < Enemy_List.length; i++) {
    var row = document.createElement("div");
    row.classList.add("enemy_row");

    var remove = document.createElement("div");
    remove.appendChild(document.createTextNode("x"));
    remove.id = "remove_enemy_" + i;
    remove.classList.add("remove_enemy");
    remove.addEventListener("click", function(e) { remove_enemy(e.currentTarget.id); });
    row.appendChild(remove);

    var name = document.createElement("div");
    name.appendChild(document.createTextNode(Enemy_List[i].name));
    name.id = "enemy_" + i;
    name.classList.add("enemy_name");
    name.addEventListener("click", function(e) { load_enemy(e.currentTarget.id); });
    row.appendChild(name);

    document.getElementById("Enemies").appendChild(row);
    //e_list_string += "<div class=\"enemy_row\"><div class=\"remove_enemy\">x</div><div class=\"enemy_name\">" + Enemy_List[i].name + "</div>";
  }
}

/* Inputs: None.
 * Outputs: None. Called when the user clicks on the name of an enemy from the "Enemies" list.
 *          Loads that enemy's skills and stat specifications into the appropriate DOM elements.
 *          Sets the current_index of the enemy list to the selected foe, so that if the "Add/
 *          Update Current Foe" button is pressed, that particular entry will be modified.
 */
function load_enemy(element_id) {
  var index = parseInt(element_id.substring(6));
  current_enemy = index;

  var foe = Enemy_List[index];
  document.getElementById("Enemy").value = foe.base_index;
  fill_skill_menus("enemy");

  document.getElementById("EnemyBoon").value = foe.boon;
  document.getElementById("EnemyBane").value = foe.bane;

  document.getElementById("EnemyWeapon").value = foe.weapon;
  find_upgrades(foe.weapon, "enemy");

  document.getElementById("EnemyWeaponUpgrade").value = foe.refine;
  if (foe.refine == "None") {
    set_skill_icon("enemy_weapon", Weapons[foe.weapon]);
  }
  else {
    set_skill_icon("enemy_weapon_refined", Weapons[foe.weapon]);
  }

  document.getElementById("EnemyA").value = foe.a;
  set_skill_icon("enemy_a", A_Passives[foe.a]);

  document.getElementById("EnemyB").value = foe.b;
  set_skill_icon("enemy_b", B_Passives[foe.b]);

  document.getElementById("EnemyC").value = foe.c;
  set_skill_icon("enemy_c", C_Passives[foe.c]);

  document.getElementById("EnemySpecial").value = foe.proc;
  set_skill_icon("enemy_special", Procs[foe.proc]);

  document.getElementById("EnemySeal").value = foe.seal;
  set_skill_icon("enemy_seal", Seals[foe.seal]);

  check_special_effects("enemy");
  document.getElementById("enemy_transformed_input").checked = foe.transformed;
  document.getElementById("enemy_weap_boolean_input").checked = foe.weap_bool;
  document.getElementById("enemy_weap_number_input").value = foe.weap_num;
  document.getElementById("enemy_special_boolean_input").checked = foe.spec_bool;
  document.getElementById("enemy_special_number_input").value = foe.spec_num;
  document.getElementById("enemy_a_boolean_input").checked = foe.a_bool;
  document.getElementById("enemy_a_number_input").value = foe.a_num;
  document.getElementById("enemy_b_boolean_input").checked = foe.b_bool;
  document.getElementById("enemy_b_number_input").value = foe.b_num;
  document.getElementById("enemy_c_boolean_input").checked = foe.c_bool;
  document.getElementById("enemy_c_number_input").value = foe.c_num;
  document.getElementById("enemy_seal_boolean_input").checked = foe.seal_bool;
  document.getElementById("enemy_seal_number_input").value = foe.seal_num;

  // Load in Enemy Stat options, if the "Apply to all" setting is not checked.
  if (!document.getElementById("apply_to_all").checked) {
    document.getElementById("EnemyAtkBuff").value = foe.assumed_atk_buff;
    document.getElementById("EnemySpdBuff").value = foe.assumed_spd_buff;
    document.getElementById("EnemyDefBuff").value = foe.assumed_def_buff;
    document.getElementById("EnemyResBuff").value = foe.assumed_res_buff;
    document.getElementById("EnemyAtkBonus").value = foe.assumed_atk_boost;
    document.getElementById("EnemySpdBonus").value = foe.assumed_spd_boost;
    document.getElementById("EnemyDefBonus").value = foe.assumed_def_boost;
    document.getElementById("EnemyResBonus").value = foe.assumed_res_boost;
    document.getElementById("EnemyAtkDebuff").value = foe.assumed_atk_penalty;
    document.getElementById("EnemySpdDebuff").value = foe.assumed_spd_penalty;
    document.getElementById("EnemyDefDebuff").value = foe.assumed_def_penalty;
    document.getElementById("EnemyResDebuff").value = foe.assumed_res_penalty;
    document.getElementById("EnemyMergeLv").value = foe.merge_lv;
    document.getElementById("EnemyDragonflowers").value = foe.dragonflowers;
    document.getElementById("EnemyResplendent").checked = foe.resplendent;
    document.getElementById("EnemyHPCut").value = foe.hp_cut;
    document.getElementById("EnemySpecCharge").value = foe.spec_charge;
    document.getElementById("EnemyAdjAllies").value = foe.adj;
    document.getElementById("EnemyTwoSpaceAllies").value = foe.two_space;
    document.getElementById("EnemyThreeSpaceAllies").value = foe.three_space;
    document.getElementById("EnemyBlessing").value = foe.blessing;
    if (foe.blessing != "(None)") {
      $(".EnemyLegAlly").toggle(true);
    }
    document.getElementById("EnemyLegAlly1").value = foe.leg1;
    document.getElementById("EnemyLegAlly2").value = foe.leg2;
    document.getElementById("EnemyLegAlly3").value = foe.leg3;
    document.getElementById("EnemyLegAlly4").value = foe.leg4;
  }
}

/* Inputs: None.
 * Outputs: None. Called when the "x" (remove button) is clicked from the "Enemies" list.
 *          Removes the corresponding enemy from the list, resets the div ids for the "Enemies"
 *          list, and runs a fresh simulation.
 */
function remove_enemy(element_id) {
  var index = parseInt(element_id.substring(13));
  Enemy_List.splice(index, 1);
  current_enemy = Enemy_List.count;
  update_enemy_list();
  simulate();
}

/* Inputs: None.
 * Outputs: None. Adds or updates an entry in Enemy_List, based on the current_enemy index
 *          to Enemy_List, and the selection in the "Enemy" drop-down (which specifies the
 *          Enemy's character).
 */
function add_current_foe() {
  var foe, base_unit;

  // Load the selected options into the "foe" object.
  base_unit = Characters[document.getElementById("Enemy").value];
  foe = {};
  foe.name = base_unit.name;
  foe.color = base_unit.color;
  foe.hp_base = base_unit.hp_base;
  foe.atk_base = base_unit.atk_base;
  foe.spd_base = base_unit.spd_base;
  foe.def_base = base_unit.def_base;
  foe.res_base = base_unit.res_base;
  foe.hpGrowth = base_unit.hpGrowth;
  foe.atkGrowth = base_unit.atkGrowth;
  foe.spdGrowth = base_unit.spdGrowth;
  foe.defGrowth = base_unit.defGrowth;
  foe.resGrowth = base_unit.resGrowth;
  foe.n_lock = base_unit.n_lock;
  foe.type = base_unit.type;
  foe.weap = base_unit.weap;
  foe.legendary = base_unit.legendary;
  foe.mythic = base_unit.mythic;
  foe.has_resplendent = base_unit.has_resplendent;
  foe.df_maximum = base_unit.df_maximum;
  foe.base_index = document.getElementById("Enemy").value;
  foe.boon = document.getElementById("EnemyBoon").value;
  foe.bane = document.getElementById("EnemyBane").value;
  foe.resplendent = document.getElementById("EnemyResplendent").checked;
  foe.weapon = document.getElementById("EnemyWeapon").value;
  foe.refine = document.getElementById("EnemyWeaponUpgrade").value;
  foe.a = document.getElementById("EnemyA").value;
  foe.b = document.getElementById("EnemyB").value;
  foe.c = document.getElementById("EnemyC").value;
  foe.proc = document.getElementById("EnemySpecial").value;
  foe.seal = document.getElementById("EnemySeal").value;
  foe.transformed = document.getElementById("enemy_transformed_input").checked;
  foe.weap_bool = document.getElementById("enemy_weap_boolean_input").checked;
  foe.spec_bool = document.getElementById("enemy_special_boolean_input").checked;
  foe.a_bool = document.getElementById("enemy_a_boolean_input").checked;
  foe.b_bool = document.getElementById("enemy_b_boolean_input").checked;
  foe.c_bool = document.getElementById("enemy_c_boolean_input").checked;
  foe.seal_bool = document.getElementById("enemy_seal_boolean_input").checked;
  foe.weap_num = document.getElementById("enemy_weap_number_input").value;
  foe.spec_num = document.getElementById("enemy_special_number_input").value;
  foe.a_num = document.getElementById("enemy_a_number_input").value;
  foe.b_num = document.getElementById("enemy_b_number_input").value;
  foe.c_num = document.getElementById("enemy_c_number_input").value;
  foe.seal_num = document.getElementById("enemy_seal_number_input").value;

  if (!document.getElementById("apply_to_all").checked) {
    foe.assumed_atk_buff = document.getElementById("EnemyAtkBuff").value;
    foe.assumed_spd_buff = document.getElementById("EnemySpdBuff").value;
    foe.assumed_def_buff = document.getElementById("EnemyDefBuff").value;
    foe.assumed_res_buff = document.getElementById("EnemyResBuff").value;
    foe.assumed_atk_boost = document.getElementById("EnemyAtkBonus").value;
    foe.assumed_spd_boost = document.getElementById("EnemySpdBonus").value;
    foe.assumed_def_boost = document.getElementById("EnemyDefBonus").value;
    foe.assumed_res_boost = document.getElementById("EnemyResBonus").value;
    foe.assumed_atk_penalty = document.getElementById("EnemyAtkDebuff").value;
    foe.assumed_spd_penalty = document.getElementById("EnemySpdDebuff").value;
    foe.assumed_def_penalty = document.getElementById("EnemyDefDebuff").value;
    foe.assumed_res_penalty = document.getElementById("EnemyResDebuff").value;
    foe.merge_lv = document.getElementById("EnemyMergeLv").value;
    foe.dragonflowers = document.getElementById("EnemyDragonflowers").value;
    foe.resplendent = document.getElementById("EnemyResplendent").checked;
    foe.hp_cut = document.getElementById("EnemyHPCut").value;
    foe.spec_charge = document.getElementById("EnemySpecCharge").value;
    foe.adj = document.getElementById("EnemyAdjAllies").value;
    foe.two_space = document.getElementById("EnemyTwoSpaceAllies").value;
    foe.three_space = document.getElementById("EnemyThreeSpaceAllies").value;
    foe.blessing = document.getElementById("EnemyBlessing").value;
    foe.leg1 = document.getElementById("EnemyLegAlly1").value;
    foe.leg2 = document.getElementById("EnemyLegAlly2").value;
    foe.leg3 = document.getElementById("EnemyLegAlly3").value;
    foe.leg4 = document.getElementById("EnemyLegAlly4").value;
  }

  // If current_enemy is pointed at an entry in the list...
  if (current_enemy < Enemy_List.length) {
    // Check to see if the "Enemy" drop-down is pointed at the same character. If so,
    // update the current_enemy.
    if (document.getElementById("Enemy").value == Enemy_List[current_enemy].base_index) {
      Enemy_List[current_enemy] = foe;
      current_enemy = Enemy_List.length;
      update_enemy_list();
      simulate();

      // Return to prevent the function from continuing to execute.
      return null;
    }
  }

  // If the function has reached this point, then current_enemy is equal to the length
  // of Enemy_List, and the foe object should be pushed to the Enemy_List as a new enemy.
  Enemy_List.push(foe);
  current_enemy = Enemy_List.length;
  update_enemy_list();
  simulate();
}
