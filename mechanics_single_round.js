function simulate() {
  // Builds the attacker from the values selected on the UI.
  var selectedWeapon = Weapons[document.getElementById("Weapon").value];
  if (document.getElementById("WeaponUpgrade").value != 0) {
    selectedWeapon = Weapons[document.getElementById("WeaponUpgrade").value];
  }

  var Attacker = new Fighter(Characters[document.getElementById("Character").value],
                            document.getElementById("Boon").value,
                            document.getElementById("Bane").value,
                            selectedWeapon,
                            A_Passives[document.getElementById("A").value],
                            B_Passives[document.getElementById("B").value],
                            C_Passives[document.getElementById("C").value],
                            Seals[document.getElementById("Seal").value],
                            Procs[document.getElementById("Special").value],
                            document.getElementById("summoner_support").checked,
                            parseInt(document.getElementById("MergeLv").value));

  // Add the Attacker's stat line to the proper UI elements.
  document.getElementById("CharHP").innerHTML = Attacker.get_HP_max();
  document.getElementById("CharAtk").innerHTML = Attacker.get_perm_atk();
  document.getElementById("CharSpd").innerHTML = Attacker.get_perm_spd();
  document.getElementById("CharDef").innerHTML = Attacker.get_perm_def();
  document.getElementById("CharRes").innerHTML = Attacker.get_perm_res();

  // Set user-defined buffs, boosts (bonuses, in the UI), and debuffs.
  Attacker.set_assumed_atk_buff(document.getElementById("AtkBuff").value);
  Attacker.set_assumed_spd_buff(document.getElementById("SpdBuff").value);
  Attacker.set_assumed_def_buff(document.getElementById("DefBuff").value);
  Attacker.set_assumed_res_buff(document.getElementById("ResBuff").value);
  Attacker.set_adj_allies(document.getElementById("AdjAllies").value);

  Attacker.set_assumed_atk_boost(document.getElementById("AtkBonus").value);
  Attacker.set_assumed_spd_boost(document.getElementById("SpdBonus").value);
  Attacker.set_assumed_def_boost(document.getElementById("DefBonus").value);
  Attacker.set_assumed_res_boost(document.getElementById("ResBonus").value);

  Attacker.set_assumed_atk_debuff(document.getElementById("AtkDebuff").value);
  Attacker.set_assumed_spd_debuff(document.getElementById("SpdDebuff").value);
  Attacker.set_assumed_def_debuff(document.getElementById("DefDebuff").value);
  Attacker.set_assumed_res_debuff(document.getElementById("ResDebuff").value);

  // Prep & logging variables
  var weap, weap_selected, a, b, c, proc, seal;
  var Defender;
  var orko = new Array();
  var orko_dealt = new Array();
  var orko_taken = new Array();
  var orko_def_hp_max = new Array();
  var orko_log = new Array();
  var orko_atk_spd = new Array();
  var orko_def_spd = new Array();
  var losses = new Array();
  var losses_dealt = new Array();
  var losses_taken = new Array();
  var losses_def_hp_max = new Array();
  var losses_log = new Array();
  var losses_atk_spd = new Array();
  var losses_def_spd = new Array();
  var no_ko = new Array();
  var no_ko_dealt = new Array();
  var no_ko_taken = new Array();
  var no_ko_def_hp_max = new Array();
  var no_ko_log = new Array();
  var no_ko_atk_spd = new Array();
  var no_ko_def_spd = new Array();
  var msg = "";

  // Iterate on all characters.
  for (var i = 0; i < Characters.length; i++) {
    // Only run the matchup if the character is within the subset defined by the filters.
    if (passes_filter_reqs(Characters[i])) {
      // Skill validation on enemy overrides. Use default skills if override skill is invalid.
      weap_selected = document.getElementById("EnemyWeapon").value;
      // A weapon override is valid if one of the following applies:
      //    -The weapon's type matches the unit's weapon type, and the weapon is non-exclusive.
      //    -The weapon is the character's base weapon, or is evolved from their base weapon, or
      //     inheritance restrictions have been removed by the user.
      if (weap_selected != 0 &&
          ((Characters[i].weap == Weapons[weap_selected].type && !Weapons[weap_selected].char_lock
            ||
            (weap_selected == Characters[i].base_weap || Weapons[weap_selected].evolved_from == Characters[i].base_weap)) || document.getElementById("RuleBreaker").checked)) {
        weap = Weapons[weap_selected];
      }
      else {
        weap = Weapons[Characters[i].base_weap];
      }
      if (document.getElementById("EnemyA").value != 0 && (verify_legality(Characters[i], A_Passives[document.getElementById("EnemyA").value]) || document.getElementById("RuleBreaker").checked)) {
        a = A_Passives[document.getElementById("EnemyA").value];
      }
      else {
        a = A_Passives[Characters[i].base_a];
      }
      if (document.getElementById("EnemyB").value != 0 && (verify_legality(Characters[i], B_Passives[document.getElementById("EnemyB").value]) || document.getElementById("RuleBreaker").checked)) {
        b = B_Passives[document.getElementById("EnemyB").value];
      }
      else {
        b = B_Passives[Characters[i].base_b];
      }
      if (document.getElementById("EnemyC").value != 0 && (verify_legality(Characters[i], C_Passives[document.getElementById("EnemyC").value]) || document.getElementById("RuleBreaker").checked)) {
        c = C_Passives[document.getElementById("EnemyC").value];
      }
      else {
        c = C_Passives[Characters[i].base_c];
      }
      if (document.getElementById("EnemySpecial").value != 0 && (verify_legality(Characters[i], Procs[document.getElementById("EnemySpecial").value]) || document.getElementById("RuleBreaker").checked)) {
        proc = Procs[document.getElementById("EnemySpecial").value];
      }
      else {
        proc = Procs[Characters[i].base_proc];
      }
      if (verify_legality(Characters[i], Seals[document.getElementById("EnemySeal").value]) || document.getElementById("RuleBreaker").checked) {
        seal = Seals[document.getElementById("EnemySeal").value];
      }
      else {
        seal = Seals[0];
      }

      // Build the defender with the base set & valid overrides.
      Defender = new Fighter(Characters[i], document.getElementById("EnemyBoon").value, document.getElementById("EnemyBane").value, weap, a, b, c, seal, proc, false, parseInt(document.getElementById("EnemyMergeLv").value));

      Defender.set_assumed_atk_buff(document.getElementById("EnemyAtkBuff").value);
      Defender.set_assumed_spd_buff(document.getElementById("EnemySpdBuff").value);
      Defender.set_assumed_def_buff(document.getElementById("EnemyDefBuff").value);
      Defender.set_assumed_res_buff(document.getElementById("EnemyResBuff").value);
      Defender.set_adj_allies(document.getElementById("EnemyAdjAllies").value);

      Defender.set_assumed_atk_boost(document.getElementById("EnemyAtkBonus").value);
      Defender.set_assumed_spd_boost(document.getElementById("EnemySpdBonus").value);
      Defender.set_assumed_def_boost(document.getElementById("EnemyDefBonus").value);
      Defender.set_assumed_res_boost(document.getElementById("EnemyResBonus").value);

      Defender.set_assumed_atk_debuff(document.getElementById("EnemyAtkDebuff").value);
      Defender.set_assumed_spd_debuff(document.getElementById("EnemySpdDebuff").value);
      Defender.set_assumed_def_debuff(document.getElementById("EnemyDefDebuff").value);
      Defender.set_assumed_res_debuff(document.getElementById("EnemyResDebuff").value);

      // Apply any modifications specified on the UI (HP/cooldown reduction).
      if (document.getElementById("HPCut").value != "") {
        if (Number.isInteger(parseInt(document.getElementById("HPCut").value))) {
          Attacker.reduce_HP(parseInt(document.getElementById("HPCut").value));
        }
      }
      if (document.getElementById("SpecCharge").value != "") {
        if (Number.isInteger(parseInt(document.getElementById("SpecCharge").value))) {
          Attacker.cooldown = parseInt(document.getElementById("SpecCharge").value);
        }
      }
      if (document.getElementById("EnemyHPCut").value != "") {
        if (Number.isInteger(parseInt(document.getElementById("EnemyHPCut").value))) {
          Defender.reduce_HP(parseInt(document.getElementById("EnemyHPCut").value));
        }
      }
      if (document.getElementById("EnemySpecCharge").value != "") {
        if (Number.isInteger(parseInt(document.getElementById("EnemySpecCharge").value))) {
          Defender.cooldown = parseInt(document.getElementById("EnemySpecCharge").value);
        }
      }

      // Determine which type of simulation should be run.
      if (document.getElementById("SimType").value == "Offense") {
        combat_log = execute_phase(Attacker, Defender);
      }
      else {
        combat_log = execute_phase(Defender, Attacker);
      }

      // After combat, save the logging information to the proper arrays.
      if (Defender.get_HP() == 0) {
        orko[orko.length] = i;
        orko_dealt[orko_dealt.length] = Attacker.get_dmg_dealt();
        orko_taken[orko_taken.length] = Defender.get_dmg_dealt();
        orko_def_hp_max[orko_def_hp_max.length] = Defender.get_HP_max();
        orko_log[orko_log.length] = combat_log;
        orko_atk_spd[orko_atk_spd.length] = spd_log[0];
        orko_def_spd[orko_def_spd.length] = spd_log[1];
      }
      else if (Attacker.get_HP() == 0) {
        losses[losses.length] = i;
        losses_dealt[losses_dealt.length] = Attacker.get_dmg_dealt();
        losses_taken[losses_taken.length] = Defender.get_dmg_dealt();
        losses_def_hp_max[losses_def_hp_max.length] = Defender.get_HP_max();
        losses_log[losses_log.length] = combat_log;
        losses_atk_spd[losses_atk_spd.length] = spd_log[0];
        losses_def_spd[losses_def_spd.length] = spd_log[1];
      }
      else {
        no_ko[no_ko.length] = i;
        no_ko_dealt[no_ko_dealt.length] = Attacker.get_dmg_dealt();
        no_ko_taken[no_ko_taken.length] = Defender.get_dmg_dealt();
        no_ko_def_hp_max[no_ko_def_hp_max.length] = Defender.get_HP_max();
        no_ko_log[no_ko_log.length] = combat_log;
        no_ko_atk_spd[no_ko_atk_spd.length] = spd_log[0];
        no_ko_def_spd[no_ko_def_spd.length] = spd_log[1];
      }

      // Reset the attacker to the values specified by the user, and clear the combat log.
      Attacker.revive();
      combat_log = "";
    }
  }

  // Report the results.
  msg += "<b>Summary: " + orko.length + " ORKOs, " + no_ko.length + " No KO, " + losses.length + " Losses</b><br><br>";
  msg += "<b>ORKOs (" + orko.length + ")</b><br><table class='results_table'>";
  for (var i = 0; i < orko.length; i++) {
    msg += "<tr><td><details><summary>";
    msg += Characters[orko[i]].name + ": " + orko_dealt[i] + " total dmg dealt (";
    msg += Math.floor(orko_dealt[i]/orko_def_hp_max[i]*100) + "%), " + orko_taken[i];
    msg += " total dmg taken (" + Math.floor(orko_taken[i]/Attacker.get_HP_max()*100) + "%)." + " (" + orko_atk_spd[i] + " Spd vs " + orko_def_spd[i] + " Spd)" + "<br></summary>";
    msg += "<div class='log'>" + orko_log[i] + "</div></details></td></tr>";
  }
  msg += "</table><br><b>No KO (" + no_ko.length + ")</b><br><table class='results_table'>";
  for (var i =0; i < no_ko.length; i++) {
    msg += "<tr><td><details><summary>";
    msg += Characters[no_ko[i]].name + ": " + no_ko_dealt[i] + " total dmg dealt (";
    msg += Math.floor(no_ko_dealt[i]/no_ko_def_hp_max[i]*100) + "%), " + no_ko_taken[i];
    msg += " total dmg taken (" + Math.floor(no_ko_taken[i]/Attacker.get_HP_max()*100) + "%)." + " (" + no_ko_atk_spd[i] + " Spd vs " + no_ko_def_spd[i] + " Spd)" + "<br></summary>";
    msg += "<div class='log'>" + no_ko_log[i] + "</div></details></td></tr>";
  }
  msg += "</table><br><b>Losses (" + losses.length + ")</b><br><table class='results_table'>";
  for (var i = 0; i < losses.length; i++) {
    msg += "<tr><td><details><summary>";
    msg += Characters[losses[i]].name + ": " + losses_dealt[i] + " total dmg dealt (";
    msg += Math.floor(losses_dealt[i]/losses_def_hp_max[i]*100) + "%), " + losses_taken[i];
    msg += " total dmg taken (" + Math.floor(losses_taken[i]/Attacker.get_HP_max()*100) + "%)." + " (" + losses_atk_spd[i] + " Spd vs " + losses_def_spd[i] + " Spd)" + "<br></summary>";
    msg += "<div class='log'>" + losses_log[i] + "</div></details></td></tr>";
  }
  msg += "</table>";

  document.getElementById("results").innerHTML = msg;
}

// Determines whether or not a character meets the user-defined filter requirements.
function passes_filter_reqs(character) {
  var color = character.color;
  var weapon_type = character.weap;

  switch (color) {
    case "R":
      if (!document.getElementById("Red").checked) {
        return false;
      }
      break;
    case "B":
      if (!document.getElementById("Blue").checked) {
        return false;
      }
      break;
    case "G":
      if (!document.getElementById("Green").checked) {
        return false;
      }
      break;
    // Colorless is the only other option.
    default:
      if (!document.getElementById("Colorless").checked) {
        return false;
      }
  }
  switch (weapon_type) {
    case "S":
      if (!document.getElementById("Sword").checked) {
        return false;
      }
      break;
    case "L":
      if (!document.getElementById("Lance").checked) {
        return false;
      }
      break;
    case "A":
      if (!document.getElementById("Axe").checked) {
        return false;
      }
      break;
    case "RT":
      if (!document.getElementById("R Tome").checked) {
        return false;
      }
      break;
    case "BT":
      if (!document.getElementById("B Tome").checked) {
        return false;
      }
      break;
    case "GT":
      if (!document.getElementById("G Tome").checked) {
        return false;
      }
      break;
    case "D":
      if ((color == "R" && !document.getElementById("R Breath").checked) || (color == "B" && !document.getElementById("B Breath").checked) || (color == "G" && !document.getElementById("G Breath").checked)) {
        return false;
      }
      break;
    case "B":
      if (!document.getElementById("Bow").checked) {
        return false;
      }
      break;
    case "K":
      if (!document.getElementById("Dagger").checked) {
        return false;
      }
      break;
    // Staff is the only other option.
    default:
      if (!document.getElementById("Staff").checked) {
        return false;
      }
  }

  return true;
}

// Runs through a single phase with an attacker and a defender. After combat concludes
// (end of phase or one unit dies), the combat log is returned.
function execute_phase(attacker, defender) {

  // Apply any start-of-turn buffs to the attacker.
  // apply_start_buffs(attacker);

  // Handling for pre-combat AoEs. Just deal damage to the defender & ignore
  // the rest of the AoE.
  if (attacker.get_precombat_atk_mult_proc() > 0) {
    if (attacker.get_cooldown() == 0) {
      combat_log += (attacker.get_name() + "'s " + attacker.get_proc_name() + " activates!<br>");
      var precombat_dmg = defender.apply_precombat_dmg(attacker, defender, attacker.get_precombat_atk_mult_proc());
      combat_log += (defender.get_name() + " takes non-lethal damage up to " + precombat_dmg + ", and has " + defender.get_HP() + " HP remaining.<br>" );
      attacker.reset_cooldown();
    }
  }

  // Set start-of-combat members for attacker and defender. Notably HP for skills that check HP thresholds
  // (Wrathful Staff, "Boost" skills, -breakers, and the like).
  attacker.set_start_HP(attacker.get_HP());
  defender.set_start_HP(defender.get_HP());

  // Determine whether or not the defender can counter.
  var can_counter = check_counter(attacker, defender);

  // Determine whether one or both units perform a follow up attack.
  // check_follow_up takes four arguments: the two units in combat, whether or not the first unit is active, and
  // whether or not the second unit can counterattack.
  var attacker_follow_up = check_follow_up(attacker, defender, true, can_counter);
  var defender_follow_up = false;
  if (can_counter) {
    defender_follow_up = check_follow_up(defender, attacker, false, 1);
  }

  // Spd logging for the output.
  spd_log[0] = attacker.calculate_spd(true, defender, true);
  spd_log[1] = defender.calculate_spd(false, attacker, true);

  // Determines whether the attacker's Desperation is active (see the Fighter.desperation_applies
  // method for details).
  var desperation_flag = attacker.desperation_applies(defender);
  // Determines whether the defender's Vantage is active (see the Fighter.vantage_applies
  // method for details).
  var vantage_flag = defender.vantage_applies(attacker);

  // The defender gets the first strike if vantage applies.
  if (can_counter && vantage_flag) {
    combat_log += (defender.get_name() + "'s " + defender.get_vantage_source() + " allows the first strike!<br>");
    // See calculate_damage in this file for more details about the arguments and algorithm for
    // this function.
    calculate_damage(defender, attacker, false, false, true);
    if (attacker.get_HP() == 0) {
      return combat_log;
    }
  }

  // The attacker launches his/her first strike.
  combat_log += attacker.get_name() + " attacks!<br>";
  calculate_damage(attacker, defender, true, false, true);
  if (defender.get_HP() == 0) {
    return combat_log;
  }
  // Weapons with brave effects strike twice when initiating.
  if (attacker.get_brave() == 1) {
    combat_log += attacker.get_name() + "'s " + attacker.get_weap_name() + " allows an immediate second strike!<br>";
    calculate_damage(attacker, defender, true, true, false);
  }
  if (defender.get_HP() == 0) {
    return combat_log;
  }

  // If attacker can double, and has desperation active, perform the 2nd attack.
  if (attacker_follow_up == 1 && desperation_flag) {
    combat_log += (attacker.get_name() + "'s follow up occurs immediately due to " + attacker.get_desperation_source() + "!<br>");
    calculate_damage(attacker, defender, true, true, false);
    if (defender.get_HP() == 0) {
      return combat_log;
    }
    // Weapons with brave effects strike twice when initiating.
    if (attacker.get_brave() == 1) {
      combat_log += attacker.get_name() + "'s " + attacker.get_weap_name() + " allows an immediate second strike!<br>";
      calculate_damage(attacker, defender, true, true, false);
      if (defender.get_HP() == 0) {
        return combat_log;
      }
    }
  }

  if (can_counter) {
    // If vantage activated, only perform a counterattack if the defender
    // can follow up.
    if (vantage_flag) {
      if (defender_follow_up == 1) {
        combat_log += defender.get_name() + " performs a follow up attack!<br>";
        calculate_damage(defender, attacker, false, false, false);
        if (attacker.get_HP() == 0) {
          return combat_log;
        }
      }
    }
    // Otherwise, perform an attack like normal.
    else {
      combat_log += defender.get_name() + " attacks!<br>";
      calculate_damage(defender, attacker, false, false, true);
      if (attacker.get_HP() == 0) {
        return combat_log;
      }
    }
  }

  // If attacker can double and did not have desperation active at the start of
  // combat, perform the 2nd attack.
  if (attacker_follow_up == 1 && !desperation_flag) {
    combat_log += attacker.get_name() + " performs a follow up attack!<br>";
    calculate_damage(attacker, defender, true, !can_counter, false);
    if (defender.get_HP() == 0) {
      return combat_log;
    }
    // Weapons with brave effects strike twice when initiating.
    if (attacker.get_brave() == 1) {
      combat_log += attacker.get_name() + "'s " + attacker.get_weap_name() + " allows an immediate second strike!<br>";
      calculate_damage(attacker, defender, true, true, false);
      if (defender.get_HP() == 0) {
        return combat_log;
      }
    }
  }

  // If defender can counter, can double, and did not already do so by virtue of
  // vantage activating, perform the 2nd attack.
  if (can_counter && defender_follow_up == 1 && !vantage_flag) {
    combat_log += defender.get_name() + " performs a follow up attack!<br>";
    calculate_damage(defender, attacker, false, !attacker_follow_up, false);
    if (attacker.get_HP() == 0) {
      return combat_log;
    }
  }

  // The action is complete, remove any debuffs from the previous turn, and zero out
  // next_atk_bonus_dmg values.
  attacker.reset_debuffs();
  attacker.set_next_atk_bonus_dmg(0);
  defender.set_next_atk_bonus_dmg(0);

  return combat_log;
}

// Applies any applicable start-of-turn buffs to the active unit.
function apply_start_buffs(active_unit) {
  // Apply active_unit defiant skills, if applicable.
  if (active_unit.get_HP() <= Math.floor(active_unit.get_HP_max() / 2)) {
    if (active_unit.get_defiant_atk() > 0) {
      combat_log += (active_unit.get_name() + " gains +" + active_unit.get_defiant_atk() + " Atk from Defiant Atk.<br>");
      active_unit.apply_atk_buff(active_unit.get_defiant_atk());
    }
  }
  if (active_unit.get_HP() <= Math.floor(active_unit.get_HP_max() / 2)) {
    if (active_unit.get_defiant_spd() > 0) {
      combat_log += (active_unit.get_name() + " gains +" + active_unit.get_defiant_spd() + " Spd from Defiant Spd.<br>");
      active_unit.apply_spd_buff(active_unit.get_defiant_spd());
    }
  }
  if (active_unit.get_HP() <= Math.floor(active_unit.get_HP_max() / 2)) {
    if (active_unit.get_defiant_def() > 0) {
      combat_log += (active_unit.get_name() + " gains +" + active_unit.get_defiant_def() + " Def from Defiant Def.<br>");
      active_unit.apply_def_buff(active_unit.get_defiant_def());
    }
  }
  if (active_unit.get_HP() <= Math.floor(active_unit.get_HP_max() / 2)) {
    if (active_unit.get_defiant_res() > 0) {
      combat_log += (active_unit.get_name() + " gains +" + active_unit.get_defiant_res() + " Res from Defiant Res.<br>");
      active_unit.apply_res_buff(active_unit.get_defiant_res());
    }
  }
  // Apply Wrath, if applicable.
  if (((active_unit.get_HP() / active_unit.get_HP_max()) <= active_unit.get_wrath_threshold()) && active_unit.get_proc_name() != "(None)") {
    combat_log += active_unit.get_name() + "'s Wrath decreases the cooldown on " + active_unit.get_proc_name() + " by 1!<br>";
    active_unit.decrement_cooldown();
  }
}

// Determines whether the defender is capable of counterattacking.
function check_counter(attacker, defender) {
  // Evaluate whether the defender's weapon has the same range as the attacker's weapon. If the defender does,
  // or has an any-range-counter effect, the result is true.
  var result = (attacker.get_range() == defender.get_range() || defender.get_any_range_counter() > 0);

  // Handling for counterattack negation, which trumps both of the above factors. Only check for counterattack
  // negation if the enemy would perform a counterattack.
  if (result) {
    // Check weapon, movement, and self counterattack negation.
    if (attacker.negates_counter(defender) != "") {
      combat_log += (attacker.get_name() + "'s " + attacker.negates_counter(defender) + " prevents " + defender.get_name() + " from counterattacking this round.<br>");
      return false;
    }
    if (defender.get_negate_self_counter() != "") {
      combat_log += (defender.get_name() + "'s " + defender.get_negate_self_counter() + " prevents him/her from counterattacking this round.<br>");
      return false;
    }

    // Variables to factor in any phantom spd effects that are relevant for wind & watersweep.
    var phantom_spd_attacker = attacker.get_skl_compare_spd_boost();
    var phantom_spd_msg_atk = attacker.get_name() + "'s " + attacker.get_skl_compare_spd_boost_source() + " adds " + phantom_spd_attacker + " Spd for ";
    var phantom_spd_defender = defender.get_skl_compare_spd_boost();
    var phantom_spd_msg_def = defender.get_name() + "'s " + defender.get_skl_compare_spd_boost_source()  + " adds " + phantom_spd_defender + " Spd for ";

    // Windsweep handling.
    if (attacker.get_windsweep_threshold() > 0 && (defender.get_weap() == "S" || defender.get_weap() == "L" || defender.get_weap() == "A" || defender.get_weap() == "B" || defender.get_weap() == "K")) {
      if (((attacker.calculate_spd(true, defender, true) + phantom_spd_attacker) - (defender.calculate_spd(false, attacker, true) + phantom_spd_defender)) >= attacker.get_windsweep_threshold()) {
        if (result) {
          if (phantom_spd_attacker > 0) {
            combat_log += phantom_spd_msg_atk + attacker.get_name() + "'s " + attacker.get_windsweep_source() + " Spd comparison.<br>";
          }
          if (phantom_spd_defender > 0) {
            combat_log += phantom_spd_msg_def + attacker.get_name() + "'s " + attacker.get_windsweep_source() + " Spd comparison.<br>";
          }
          combat_log += (attacker.get_name() + "'s " + attacker.get_windsweep_source() + " prevents " + defender.get_name() + " from counterattacking this round.<br>");
        }
        return false;
      }
    }

    // Watersweep handling.
    if (attacker.get_watersweep_threshold() > 0 && (defender.get_weap() == "GT" || defender.get_weap() == "RT" || defender.get_weap() == "BT" || defender.get_weap() == "ST" || defender.get_weap() == "D")) {
      if (((attacker.calculate_spd(true, defender, true) + phantom_spd_attacker) - (defender.calculate_spd(false, attacker, true) + phantom_spd_defender)) >= attacker.get_watersweep_threshold()) {
        if (result) {
          if (phantom_spd_attacker > 0) {
            combat_log += phantom_spd_msg_atk + attacker.get_name() + "'s " + attacker.get_watersweep_source() + " Spd comparison.<br>";
          }
          if (phantom_spd_defender > 0) {
            combat_log += phantom_spd_msg_def + attacker.get_name() + "'s " + attacker.get_watersweep_source() + " Spd comparison.<br>";
          }
          combat_log += attacker.get_name() + "'s " + attacker.get_watersweep_source() + " prevents " + defender.get_name() + " from counterattacking this round.<br>";
        }
        return false;
      }
    }

    // Dazzling Staff handling.
    if (attacker.dazzling_staff_applies()) {
      combat_log += attacker.get_name() + "'s " + attacker.get_dazzling_staff_source() + " prevents " + defender.get_name() + " from counterattacking this round.<br>";
      return false;
    }
  }

  return result;
}

// Determines whether unit1 is capable of performing a follow-up attack.
function check_follow_up(unit1, unit2, unit1_active, can_counter) {
  // Normal combat handling.
  var normal_follow_up = ((unit1.calculate_spd(unit1_active, unit2, true) - unit2.calculate_spd(!unit1_active, unit1, true)) >= 5);

  // The inhibitor variable keeps track of follow up "inhibitors" (that prevent follow ups in certain cases)
  // and "guarantors"  (that guarantee follow ups in certain cases). The variable is incremented with each
  // inhibitor, and decremented with each guarantor. At the end of the function, if the inhibitor is positive,
  // then follow up does not occur (i.e. is successfully inhibited). If the inhibitor is negative,
  // then follow up does occur (i.e. is successfully guaranteed). If the inhibitor is 0, then any inhibitors and
  // guarantors have canceled out, and follow up will occur based on the normal Spd calculations.

  // Relevant factors: Wary Fighter, Breakers, Wind/Watersweep, Quick Riposte, Brash Assault (& similar), Follow-Up Ring.
  var inhibitor = 0;
  if (unit1.wary_fighter_applies()) {
    inhibitor += 1;
  }
  if (unit2.wary_fighter_applies()) {
    inhibitor += 1;
  }
  if (unit2.breaker_applies(unit1.get_weap())) {
    inhibitor += 1;
  }
  if (unit1.get_windsweep_threshold() > 0 && unit1_active) {
    inhibitor += 1;
  }
  if (unit1.get_watersweep_threshold() > 0 && unit1_active) {
    inhibitor += 1;
  }
  if (unit1.breaker_applies(unit2.get_weap())) {
    inhibitor -= 1;
  }
  if (unit1.follow_up_thresh_applies()) {
    inhibitor -= 1;
  }
  if (unit1.brash_assault_applies(can_counter) && unit1_active) {
    inhibitor -= 1;
  }
  if (unit1.calculated_assault_applies(can_counter) && unit1_active) {
    inhibitor -= 1;
  }
  if (unit1.quick_riposte_applies() && !unit1_active) {
    inhibitor -= 1;
  }

  // If the inhibitor is positive, no follow up occurs (return false).
  // If inhibitor is 0, follow up occurs ONLY if unit1 is fast enough.
  // If inhibitor is negative, follow up occurs (return true).
  if (inhibitor > 0) {
    return false;
  }
  else if (inhibitor == 0) {
    return normal_follow_up;
  }
  else {
    return true;
  }
}

function apply_postcombat_effects(attacker, defender) {
  if (attacker.get_heal_after_attack() > 0 && attacker.get_burn() == 0) {
    attacker.add_HP(4);
    combat_log += (attacker.get_name() + " heals " + attacker.get_heal_after_attack() + " HP from " + attacker.get_weap_name() + ", and has " + attacker.get_HP() + " HP.<br>");
  }
  if (attacker.get_burn() > 0) {
    if (attacker.get_burn() - attacker.get_heal_after_attack() > 0) {
      attacker.apply_burn();
      combat_log += (attacker.get_name() + " takes " + (attacker.get_burn() - attacker.get_heal_after_attack()) + " self-damage.<br>");
    }
    else {
      attacker.add_HP(attacker.get_heal_after_attack() - attacker.get_burn());
      combat_log += (attacker.get_name() + " heals " + (attacker.get_heal_after_attack() - attacker.get_burn()) + " damage after combat.<br>");
    }
  }
  if (defender.get_burn() > 0) {
    defender.apply_burn();
    combat_log += (defender.get_name() + " takes " + defender.get_burn() + " self-damage.<br>");
  }
}

/*
  Description:
    Given an attacking unit and a defending unit, calculates the damage dealt by the attacking
    unit and applies it to the defending unit.
  Input:
    -attacker: Fighter object, the unit dealing damage.
    -defender: Fighter object, unit receiving damage.
    -attacker_active: boolean, true when the attacker is the active unit (i.e. is the combat initiator).
    -consec_hit: boolean, true when the attacker is performing a strike without the defender having counterattacked.
  Output:
    -none
  Notes:
    -attacker and defender are defined here as units dealing and receiving damage (respectively). These terms
     have no bearing on which unit is initiating; this is left to the attacker_active veriable. For example,
     the Fighter passed in to the attacker variable will gain the Steady Breath cooldown bonus IF attacker_active
     is false.
*/
function calculate_damage(attacker, defender, attacker_active, consec_hit, first_hit) {
  // Variable initializations.
  var dmg = 0;
  var attacker_skill_procced = false; // For cooldown handling.
  var defender_skill_procced = false; // For cooldown handling.
  var heal_special_procced = false; // For heal special handling (required for proper handling of Wo Dao + heal special
                                    // vs defender's damage reduction special).
  var mitigated_dmg = 0, mitigated_temp = 0; // For mitigated damage calculation and Ice Mirror handling.

  var raw_atk = attacker.calculate_atk(attacker_active, defender, true);
  var atk = attacker.calculate_effective_atk(raw_atk, defender);
  var def = 0;
  var defense_stat = "";

  if (attacker.get_hit_2rng_weaker_def_stat() && defender.get_range() == 2) {
    if (defender.calculate_def(!attacker_active, attacker, true) < defender.calculate_res(!attacker_active, attacker, true)) {
      def = defender.calculate_def(!attacker_active, attacker, true);
      defense_stat = "Def";
    }
    else {
      def = defender.calculate_res(!attacker_active, attacker, true);
      defense_stat = "Res";
    }
    combat_log += attacker.get_name() + " hits " + defender.get_name() + "'s weaker defensive stat (" + defense_stat + ")!<br>";
  }
  else {
    // Load in the defensive stat that corresponds to the enemy's weapon damage type.
    if (attacker.get_weap() == "ST" || attacker.get_weap() == "RT" || attacker.get_weap() == "BT" || attacker.get_weap() == "GT" || attacker.get_weap() == "D") {
      def = defender.calculate_res(!attacker_active, attacker, true);
      defense_stat = "Res";
    }
    else {
      def = defender.calculate_def(!attacker_active, attacker, true);
      defense_stat = "Def";
    }
  }

  // Determine the range at which combat is occurring. Useful for defensive specials.
  var combat_range;
  if (!attacker_active) {
    combat_range = defender.get_range();
  }
  else {
    combat_range = attacker.get_range();
  }

  // Handling for enemy def/res reduction procs (Luna, etc).
  if (attacker.get_def_reduce_proc() > 0 && attacker.get_cooldown() == 0) {
    combat_log += (attacker.get_name() + "'s " + attacker.get_proc_name() + " activates! " + defender.get_name() + " suffers a -" + Math.floor(def * attacker.get_def_reduce_proc()) + " " + defense_stat + " penalty.<br>");
    def -= Math.floor(def * attacker.get_def_reduce_proc());
    attacker_skill_procced = true;
  }

  // Calculate an initial value for the damage. Halve staff damage.
  dmg = atk - def;
  if (attacker.get_weap() == "ST") {
    if (!attacker.wrathful_staff_applies()) {
      dmg = Math.floor(dmg / 2);
    }
    else {
      combat_log += attacker.get_name() + "'s " + attacker.get_wrathful_staff_source() + " negates the staff damage penalty!<br>";
    }
  }

  // If next_atk_bonus_dmg exists, add it.
  if (attacker.get_next_atk_bonus_dmg() > 0) {
    combat_log += attacker.get_name() + " receives +" + attacker.get_next_atk_bonus_dmg() + " bonus damage!<br>";
    dmg += attacker.get_next_atk_bonus_dmg();
    attacker.set_next_atk_bonus_dmg(0);
  }

  // Handling for atk to damage conversion procs (Draconic Aura, etc).
  if (attacker.get_atk_mult_proc() > 0 && attacker.get_cooldown() == 0) {
    if (attacker.get_blade() == 1) {
      raw_atk += attacker.get_atk_buff() + attacker.get_spd_buff() + attacker.get_def_buff() + attacker.get_res_buff();
    }
    combat_log += (attacker.get_name() + "'s " + attacker.get_proc_name() + " activates, dealing +" + Math.floor(raw_atk * attacker.get_atk_mult_proc()) + " damage!<br>");
    dmg += Math.floor(raw_atk * attacker.get_atk_mult_proc());
    attacker_skill_procced = true;
  }

  // Handling for damage dealt to damage dealt conversion procs (Glimmer, etc.)
  if (attacker.get_dmg_mult_proc() > 0 && attacker.get_cooldown() == 0) {
    combat_log += (attacker.get_name() + "'s " + attacker.get_proc_name() + " activates, dealing +" + Math.floor(dmg * attacker.get_dmg_mult_proc()) + " damage!<br>");
    dmg += Math.floor(dmg * attacker.get_dmg_mult_proc());
    attacker_skill_procced = true;
  }

  // Handling for damage taken to damage dealt conversion procs.
  if (attacker.get_dmg_taken_mult_proc() > 0 && attacker.get_cooldown() == 0) {
    combat_log += (attacker.get_name() + "'s " + attacker.get_proc_name() + " activates, dealing +" + Math.floor((attacker.get_HP_max() - attacker.get_HP()) * attacker.get_dmg_taken_mult_proc()) + " damage!<br>");
    dmg += Math.floor((attacker.get_HP_max() - attacker.get_HP()) * attacker.get_dmg_taken_mult_proc());
    attacker_skill_procced = true;
  }

  // Handling for spd to damage conversion procs.
  if (attacker.get_spd_as_dmg_proc() > 0 && attacker.get_cooldown() == 0) {
    combat_log += (attacker.get_name() + "'s " + attacker.get_proc_name() + " activates, dealing +" + Math.floor(attacker.calculate_spd(attacker_active, defender, true) * attacker.get_spd_as_dmg_proc()) + " damage!<br>");
    dmg += Math.floor(attacker.calculate_spd(attacker_active, defender, true) * attacker.get_spd_as_dmg_proc());
    attacker_skill_procced = true;
  }

  // Handling for res to damage conversion procs.
  if (attacker.get_res_as_dmg_proc() > 0 && attacker.get_cooldown() == 0) {
    combat_log += (attacker.get_name() + "'s " + attacker.get_proc_name() + " activates, dealing +" + Math.floor(attacker.calculate_res(attacker_active, defender, true) * attacker.get_res_as_dmg_proc()) + " damage!<br>");
    dmg += Math.floor(attacker.calculate_res(attacker_active, defender, true) * attacker.get_res_as_dmg_proc());
    attacker_skill_procced = true;
  }

  // Handling for def to damage conversion procs.
  if (attacker.get_def_as_dmg_proc() > 0 && attacker.get_cooldown() == 0) {
    combat_log += (attacker.get_name() + "'s " + attacker.get_proc_name() + " activates, dealing +" + Math.floor(attacker.calculate_def(true, defender, true) * attacker.get_def_as_dmg_proc()) + " damage!<br>");
    dmg += Math.floor(attacker.calculate_def(true, defender, true) * attacker.get_def_as_dmg_proc());
    attacker_skill_procced = true;
  }

  // If a heal-on-hit special is ready, set a flag for handling later (need to factor in any defensive specials first).
  if (attacker.get_heal_on_hit_proc() > 0 && attacker.get_cooldown() == 0) {
    // If a skill hasn't activated already (Aether, due to the order in which specials are activated by this function),
    // log the activation message.
    if (!attacker_skill_procced) {
      combat_log += (attacker.get_name() + "'s " + attacker.get_proc_name() + " activates!<br>");
    }

    heal_special_procced = true;
    attacker_skill_procced = true;
  }

  // If damage is less than 0, make it 0.
  if (dmg < 0) {
    dmg = 0;
  }
  // If the attacker activated a special, apply any special bonus damage.
  if (attacker_skill_procced) {
    dmg += attacker.get_skill_dmg_bonus();
  }

  // If the unit has a damage reduction skill compatible with the current
  // combat range off cooldown, activate and apply it.
  if (combat_range == 1 && defender.get_one_rng_reduce_proc() > 0 && defender.get_cooldown() == 0) {
    combat_log += (defender.get_name() + "'s " + defender.get_proc_name() + " activates, reducing damage by " + (defender.get_one_rng_reduce_proc() * 100) + "%!<br>");
    mitigated_temp = Math.floor(dmg * defender.get_one_rng_reduce_proc());
    mitigated_dmg += mitigated_temp;
    dmg -= mitigated_temp;
    defender_skill_procced = true;
  }
  else if (combat_range == 2 && defender.get_two_rng_reduce_proc() > 0 && defender.get_cooldown() == 0) {
      combat_log += (defender.get_name() + "'s " + defender.get_proc_name() + " activates, reducing damage by " + (defender.get_two_rng_reduce_proc() * 100) + "%!<br>");
      mitigated_temp = Math.floor(dmg * defender.get_two_rng_reduce_proc());
      mitigated_dmg += mitigated_temp;
      dmg -= mitigated_temp;
      defender_skill_procced = true;
  }

  // Apply damage mitigation if necessary.
  if (consec_hit) {
    // Blanket consecutive hit mitigation (Urvan)
    if (defender.get_consec_hit_mitig() > 0) {
      combat_log += defender.get_name() + " receives " + (defender.get_consec_hit_mitig() * 100) + "% less damage from a consecutive hit!<br>";
      mitigated_temp = Math.floor(dmg * defender.get_consec_hit_mitig());
      mitigated_dmg += mitigated_temp;
      dmg -= mitigated_temp;
    }
    // Axe/Lance/Sword consecutive hit mitigation (Deflect Melee)
    if (defender.get_ALS_consec_hit_mitig() > 0  && (attacker.get_weap() == "A" || attacker.get_weap() == "L" || attacker.get_weap() == "S")) {
      combat_log += defender.get_name() + " receives " + (defender.get_ALS_consec_hit_mitig() * 100) + "% less damage from consecutive hits from an axe, lance or sword!<br>";
      mitigated_temp = Math.floor(dmg * defender.get_ALS_consec_hit_mitig());
      mitigated_dmg += mitigated_temp;
      dmg -= mitigated_temp;
    }
    // Tome consecutive hit mitigation (Deflect Magic)
    if (defender.get_tome_consec_hit_mitig() > 0 && (attacker.get_weap() == "RT" || attacker.get_weap() == "BT" || attacker.get_weap() == "GT")) {
      combat_log += defender.get_name() + " receives " + (defender.get_tome_consec_hit_mitig() * 100) + "% less damage from consecutive hits from tomes!<br>";
      mitigated_temp = Math.floor(dmg * defender.get_tome_consec_hit_mitig());
      mitigated_dmg += mitigated_temp;
      dmg -= mitigated_temp;
    }
    // Bow/Dagger consecutive hit mitigation (Deflect Missile)
    if (defender.get_missile_consec_hit_mitig() > 0 && (attacker.get_weap() == "B" || attacker.get_weap() == "K")) {
      combat_log += defender.get_name() + " receives " + (defender.get_missile_consec_hit_mitig() * 100) + "% less damage from consecutive hits from bows and daggers!<br>";
      mitigated_temp = Math.floor(dmg * defender.get_missile_consec_hit_mitig());
      mitigated_dmg += mitigated_temp;
      dmg -= mitigated_temp;
    }
    // Distant consecutive hit mitigation (Crusader's Ward)
    if (defender.get_distant_consec_hit_mitig() > 0 && combat_range == 2) {
      combat_log += defender.get_name() + " receives " + (defender.get_distant_consec_hit_mitig() * 100) + "% less damage from consecutive hits from 2 spaces away!<br>";
      mitigated_temp = Math.floor(dmg * defender.get_distant_consec_hit_mitig());
      mitigated_dmg += mitigated_temp;
      dmg -= mitigated_temp;
    }
  }
  if (first_hit) {
    // Tome first hit mitigation (Divine Tyrfing)
    if (defender.get_first_tome_hit_mitig() > 0 && (attacker.get_weap() == "RT" || attacker.get_weap() == "BT" || attacker.get_weap() == "GT")) {
      combat_log += defender.get_name() + " receives " + (defender.get_first_tome_hit_mitig() * 100) + "% less damage from the first hit from a tome!<br>";
      mitigated_temp = Math.floor(dmg * defender.get_first_tome_hit_mitig());
      mitigated_dmg += mitigated_temp;
      dmg -= mitigated_temp;
    }
  }

  // Apply flat damage mitigation, if applicable.
  if (defender_skill_procced && !defender.get_miracle_proc()) {
    mitigated_temp = defender.get_def_spec_dmg_reduce();
    if (mitigated_temp > 0) {
      combat_log += defender.get_name() + "'s " + defender.get_def_spec_dmg_reduce_source() + " reduces damage by up to " + mitigated_temp + "!<br>";
    }
    if (mitigated_temp > dmg) {
      mitigated_dmg += dmg;
      dmg = 0;
    }
    else {
      mitigated_dmg += mitigated_temp;
      dmg -= mitigated_temp;
    }
  }

  // If, after all factors are calculated, the defender would still die,
  // but has Miracle charged and has more than 1 HP, activate it.
  if (dmg >= defender.get_HP() && defender.get_miracle_proc() == 1 && defender.get_HP() > 1 && defender.get_cooldown() == 0) {
    combat_log += (defender.get_name() + "'s " + defender.get_proc_name() + " activates!<br>");
    dmg = defender.get_HP() - 1;
    defender_skill_procced = true;
  }

  attacker.add_dmg_value(dmg);

  // Handling for heal special.
  if (heal_special_procced) {
    if (dmg > 0) {
      if (dmg >= defender.get_HP()) {
        attacker.add_HP(Math.floor(defender.get_HP() * attacker.get_heal_on_hit_proc()));
      }
      else {
        attacker.add_HP(Math.floor(dmg * attacker.get_heal_on_hit_proc()));
      }
    }
    combat_log += (attacker.get_name() + " heals up to " + Math.floor(Math.min(dmg, defender.get_HP()) * attacker.get_heal_on_hit_proc()) + " HP from " + attacker.get_proc_name() + ", and has " + attacker.get_HP() + " HP remaining.<br>");
  }

  // Handling for non-special-oriented heal-on-hit (Absorb).
  if (attacker.get_heal_on_hit() > 0) {
    if (dmg > defender.get_HP()) {
      attacker.add_HP(Math.floor(defender.get_HP() * attacker.get_heal_on_hit()));
    }
    else {
      attacker.add_HP(Math.floor(dmg * attacker.get_heal_on_hit()));
    }
    combat_log += (attacker.get_name() + " heals up to " + Math.floor(dmg * attacker.get_heal_on_hit()) + " HP, and has " + attacker.get_HP() + " HP remaining.<br>");
  }

  // Skill cooldown handling. Two if/else blocks: one for the attacker, one for the defender.

  // Reset the attacker's cooldown if their special activated.
  if (attacker_skill_procced) {
    attacker.reset_cooldown();
  }
  // Otherwise, decrement the attacker's cooldown as appropriate.
  else {
    // Guard cuts the cooldown charge rate by 1, if applicable.
    if (defender.guard_applies() && attacker.get_proc_name() != "(None)") {
      combat_log += defender.get_name() + "'s " + defender.get_guard_source() + " reduces the charge rate on " + attacker.get_name() + "'s " + attacker.get_proc_name() + " by 1!<br>";
    }
    // The normal cooldown decrementation.
    else {
      attacker.decrement_cooldown();
    }
    // Extra cooldown decrementation for skill effects.
    // Heavy Blade & similar.
    if ((attacker.bonus_cd_applies(defender, attacker_active, true) > 0) && attacker.get_proc_name() != "(None)") {
      combat_log += attacker.get_name() + " receives a +" + attacker.bonus_cd_applies(defender, attacker_active, true) + " charge rate on " + attacker.get_proc_name() + "!<br>";
      for (var i = 0; i < attacker.bonus_cd_applies(defender, attacker_active, true); i++) {
        attacker.decrement_cooldown();
      }
    }
  }

  // If the defender's skill procced, apply the appropriate effects.
  // -Cooldown reset.
  // -If the defender has a mitig_to_dmg_proc value, add mitigated_dmg to next_atk_bonus_dmg.
  if (defender_skill_procced) {
    defender.reset_cooldown();

    if (defender.get_mitig_to_dmg_proc() > 0) {
      combat_log += defender.get_name() + "'s " + defender.proc.name + " will add " + mitigated_dmg + " damage to his/her next attack this combat.<br>";
      defender.next_atk_bonus_dmg += mitigated_dmg;
    }
  }
  // Otherwise, decrement the defender's cooldown as appropriate.
  else {
    // Guard cuts the cooldown charge rate by 1, if applicable.
    if (attacker.guard_applies() && defender.get_proc_name() != "(None)") {
      combat_log += attacker.get_name() + "'s " + attacker.get_guard_source() + " reduces the charge rate on " + defender.get_name() + "'s " + defender.get_proc_name() + " by 1!<br>";
    }
    // The normal cooldown decrementation.
    else {
      defender.decrement_cooldown();
    }
    if ((defender.bonus_cd_applies(attacker, !attacker_active, false) > 0) && defender.get_proc_name() != "(None)") {
      combat_log += defender.get_name() + " receives a +" + defender.bonus_cd_applies(attacker, !attacker_active, false) + " charge rate on " + defender.get_proc_name() + "!<br>";
      for (var i = 0; i < defender.bonus_cd_applies(attacker, !attacker_active, false); i++) {
        defender.decrement_cooldown();
      }
    }
  }

  defender.apply_damage(dmg);
  var span_class;
  // attacker_dmg and defender_dmg lines are colored blue and red, respectively.
  if (attacker_active) {
    span_class = "attacker_dmg";
  }
  else {
    span_class = "defender_dmg";
  }
  combat_log += "<span class='" + span_class + "'>" + defender.get_name() + " takes " + dmg + " damage, and has " + defender.get_HP() + " HP remaining.<br></span>";
}
