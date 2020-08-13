function simulate() {
  // Set the turn number.
  turn_number = parseInt(document.getElementById("Turn").value);

  // Builds the attacker from the values selected on the UI.
  var blessings = new Array(4);
  if (document.getElementById("Blessing").value != "(None)") {
    blessings[0] = Blessings[parseInt(document.getElementById("LegAlly1").value)];
    blessings[1] = Blessings[parseInt(document.getElementById("LegAlly2").value)];
    blessings[2] = Blessings[parseInt(document.getElementById("LegAlly3").value)];
    blessings[3] = Blessings[parseInt(document.getElementById("LegAlly4").value)];
  }
  else {
    blessings[0] = Blessings[0];
    blessings[1] = Blessings[0];
    blessings[2] = Blessings[0];
    blessings[3] = Blessings[0];
  }

  var Attacker = new Fighter(Characters[document.getElementById("Character").value],
                            document.getElementById("Boon").value,
                            document.getElementById("Bane").value,
                            Weapons[document.getElementById("Weapon").value],
                            document.getElementById("WeaponUpgrade").value,
                            A_Passives[document.getElementById("A").value],
                            B_Passives[document.getElementById("B").value],
                            C_Passives[document.getElementById("C").value],
                            Seals[document.getElementById("Seal").value],
                            Procs[document.getElementById("Special").value],
                            document.getElementById("summoner_support").checked,
                            document.getElementById("resplendent_input").checked,
                            parseInt(document.getElementById("MergeLv").value),
                            Math.min(parseInt(document.getElementById("Dragonflowers").value), Characters[document.getElementById("Character").value].df_maximum),
                            blessings);

  // Set user-defined buffs, boosts (bonuses, in the UI), and debuffs.
  Attacker.set_assumed_atk_buff(document.getElementById("AtkBuff").value);
  Attacker.set_assumed_spd_buff(document.getElementById("SpdBuff").value);
  Attacker.set_assumed_def_buff(document.getElementById("DefBuff").value);
  Attacker.set_assumed_res_buff(document.getElementById("ResBuff").value);
  //Attacker.set_adj_allies(document.getElementById("AdjAllies").value);
  //Attacker.set_two_space_allies(document.getElementById("TwoSpaceAllies").value);

  Attacker.set_assumed_atk_boost(document.getElementById("AtkBonus").value);
  Attacker.set_assumed_spd_boost(document.getElementById("SpdBonus").value);
  Attacker.set_assumed_def_boost(document.getElementById("DefBonus").value);
  Attacker.set_assumed_res_boost(document.getElementById("ResBonus").value);

  Attacker.set_assumed_atk_penalty(document.getElementById("AtkDebuff").value);
  Attacker.set_assumed_spd_penalty(document.getElementById("SpdDebuff").value);
  Attacker.set_assumed_def_penalty(document.getElementById("DefDebuff").value);
  Attacker.set_assumed_res_penalty(document.getElementById("ResDebuff").value);

  Attacker.set_skill_inputs("weapon", document.getElementById("weap_boolean_input").checked, document.getElementById("weap_number_input").value);
  Attacker.set_skill_inputs("special", document.getElementById("special_boolean_input").checked, document.getElementById("special_number_input").value);
  Attacker.set_skill_inputs("A", document.getElementById("a_boolean_input").checked, document.getElementById("a_number_input").value);
  Attacker.set_skill_inputs("B", document.getElementById("b_boolean_input").checked, document.getElementById("b_number_input").value);
  Attacker.set_skill_inputs("C", document.getElementById("c_boolean_input").checked, document.getElementById("c_number_input").value);
  Attacker.set_skill_inputs("S", document.getElementById("seal_boolean_input").checked, document.getElementById("seal_number_input").value);
  Attacker.set_transformed_flag(document.getElementById("transformed_input").checked);
  Attacker.set_nearby_allies(document.getElementById("AdjAllies").value, document.getElementById("TwoSpaceAllies").value, document.getElementById("ThreeSpaceAllies").value);

  // The attacker is controlled by the player.
  Attacker.set_control_flag("player");
  // Calculate the attacker's printed stats.
  Attacker.calculate_permanent_stats();

  // Add the Attacker's stat line to the proper UI elements.
  document.getElementById("CharHP").innerHTML = Attacker.get_max_hp();
  document.getElementById("CharAtk").innerHTML = Attacker.get_permanent_atk();
  document.getElementById("CharSpd").innerHTML = Attacker.get_permanent_spd();
  document.getElementById("CharDef").innerHTML = Attacker.get_permanent_def();
  document.getElementById("CharRes").innerHTML = Attacker.get_permanent_res();

  // Prep & logging variables
  var boon, bane, weap, weap_selected, refine, respl, merge_lv, flower_lv, a, b, c, proc, seal;
  var Defender;
  var orko = new Array();
  var orko_dealt = new Array();
  var orko_taken = new Array();
  var orko_def_hp_max = new Array();
  var orko_log = new Array();
  var orko_skill_log = new Array();
  var losses = new Array();
  var losses_dealt = new Array();
  var losses_taken = new Array();
  var losses_def_hp_max = new Array();
  var losses_log = new Array();
  var losses_skill_log = new Array();
  var no_ko = new Array();
  var no_ko_dealt = new Array();
  var no_ko_taken = new Array();
  var no_ko_def_hp_max = new Array();
  var no_ko_log = new Array();
  var no_ko_skill_log = new Array();
  var msg = "";

  var enemy_pool = Enemy_List;

  // Iterate on all characters from the desired pool.
  for (var i = 0; i < enemy_pool.length; i++) {
    // Only run the matchup if the character is within the subset defined by the filters.
    if (passes_filter_reqs(enemy_pool[i])) {
      boon = enemy_pool[i].boon;
      bane = enemy_pool[i].bane;
      weap = Weapons[enemy_pool[i].weapon];
      refine = enemy_pool[i].refine;
      a = A_Passives[enemy_pool[i].a];
      b = B_Passives[enemy_pool[i].b];
      c = C_Passives[enemy_pool[i].c];
      proc = Procs[enemy_pool[i].proc];
      seal = Seals[enemy_pool[i].seal];

      // Retrieves the "mass override" setting, which applies the values specified in the
      // Enemy Stats menu to all foes.
      var mass_override = document.getElementById("apply_to_all").checked;

      // If the mass override setting is enabled, use the blessing, resplendent, merge, and
      // dragonflower settings directly from the UI. Otherwise, use the settings specified
      // on each individual foe.
      if (mass_override) {
        respl = document.getElementById("EnemyResplendent").checked && Characters[enemy_pool[i].base_index].has_resplendent;
        merge_lv = document.getElementById("EnemyMergeLv").value;
        flower_lv = Math.min(document.getElementById("EnemyDragonflowers").value, enemy_pool[i].df_maximum);
        // Apply enemy blessings as long as the unit is eligible to receive them.
        if (document.getElementById("EnemyBlessing").value != "(None)" &&
            !(enemy_pool[i].legendary && legendary_blessings.includes(document.getElementById("EnemyBlessing").value)) &&
            !(enemy_pool[i].mythic && mythic_blessings.includes(document.getElementById("EnemyBlessing").value))) {
          blessings[0] = Blessings[parseInt(document.getElementById("EnemyLegAlly1").value)];
          blessings[1] = Blessings[parseInt(document.getElementById("EnemyLegAlly2").value)];
          blessings[2] = Blessings[parseInt(document.getElementById("EnemyLegAlly3").value)];
          blessings[3] = Blessings[parseInt(document.getElementById("EnemyLegAlly4").value)];
        }
        else {
          blessings[0] = Blessings[0];
          blessings[1] = Blessings[0];
          blessings[2] = Blessings[0];
          blessings[3] = Blessings[0];
        }
      }
      else {
        respl = enemy_pool[i].resplendent && Characters[enemy_pool[i].base_index].has_resplendent;
        merge_lv = enemy_pool[i].merge_lv;
        flower_lv = Math.min(enemy_pool[i].dragonflowers, enemy_pool[i].df_maximum);
        // Apply enemy blessings as long as the unit is eligible to receive them.
        if (enemy_pool[i].blessing != "(None)" &&
            !(enemy_pool[i].legendary && legendary_blessings.includes(enemy_pool[i].blessing)) &&
            !(enemy_pool[i].mythic && mythic_blessings.includes(enemy_pool[i].blessing))) {
          blessings[0] = Blessings[enemy_pool[i].leg1];
          blessings[1] = Blessings[enemy_pool[i].leg2];
          blessings[2] = Blessings[enemy_pool[i].leg3];
          blessings[3] = Blessings[enemy_pool[i].leg4];
        }
        else {
          blessings[0] = Blessings[0];
          blessings[1] = Blessings[0];
          blessings[2] = Blessings[0];
          blessings[3] = Blessings[0];
        }
      }

      // Build the defender with the base set & valid overrides.
      Defender = new Fighter(enemy_pool[i],
                             boon,
                             bane,
                             weap,
                             refine,
                             a,
                             b,
                             c,
                             seal,
                             proc,
                             false,
                             respl,
                             parseInt(merge_lv),
                             Math.min(parseInt(flower_lv), enemy_pool[i].df_maximum),
                             blessings);

      // The Defender is controlled by the enemy.
      Defender.set_control_flag("enemy");

      // If mass override is enabled, use the settings from the UI for nearby allies and
      // stat mods. Otherwise, use the settings specified on each individual foe.
      if (mass_override) {
        Defender.set_assumed_atk_buff(document.getElementById("EnemyAtkBuff").value);
        Defender.set_assumed_spd_buff(document.getElementById("EnemySpdBuff").value);
        Defender.set_assumed_def_buff(document.getElementById("EnemyDefBuff").value);
        Defender.set_assumed_res_buff(document.getElementById("EnemyResBuff").value);

        Defender.set_assumed_atk_boost(document.getElementById("EnemyAtkBonus").value);
        Defender.set_assumed_spd_boost(document.getElementById("EnemySpdBonus").value);
        Defender.set_assumed_def_boost(document.getElementById("EnemyDefBonus").value);
        Defender.set_assumed_res_boost(document.getElementById("EnemyResBonus").value);

        Defender.set_assumed_atk_penalty(document.getElementById("EnemyAtkDebuff").value);
        Defender.set_assumed_spd_penalty(document.getElementById("EnemySpdDebuff").value);
        Defender.set_assumed_def_penalty(document.getElementById("EnemyDefDebuff").value);
        Defender.set_assumed_res_penalty(document.getElementById("EnemyResDebuff").value);

        Defender.set_nearby_allies(document.getElementById("EnemyAdjAllies").value, document.getElementById("EnemyTwoSpaceAllies").value, document.getElementById("EnemyThreeSpaceAllies").value);
      }
      else {
        Defender.set_assumed_atk_buff(enemy_pool[i].assumed_atk_buff);
        Defender.set_assumed_spd_buff(enemy_pool[i].assumed_spd_buff);
        Defender.set_assumed_def_buff(enemy_pool[i].assumed_def_buff);
        Defender.set_assumed_res_buff(enemy_pool[i].assumed_res_buff);

        Defender.set_assumed_atk_boost(enemy_pool[i].assumed_atk_boost);
        Defender.set_assumed_spd_boost(enemy_pool[i].assumed_spd_boost);
        Defender.set_assumed_def_boost(enemy_pool[i].assumed_def_boost);
        Defender.set_assumed_res_boost(enemy_pool[i].assumed_res_boost);

        Defender.set_assumed_atk_penalty(enemy_pool[i].assumed_atk_penalty);
        Defender.set_assumed_spd_penalty(enemy_pool[i].assumed_spd_penalty);
        Defender.set_assumed_def_penalty(enemy_pool[i].assumed_def_penalty);
        Defender.set_assumed_res_penalty(enemy_pool[i].assumed_res_penalty);

        Defender.set_nearby_allies(enemy_pool[i].adj, enemy_pool[i].two_space, enemy_pool[i].three_space);
      }

      // Set boolean inputs to true if the appropriate box is checked.
      if (document.getElementById("enemy_conditional_effects").checked) {
        Defender.set_skill_inputs("weapon", true, enemy_pool[i].weap_num);
        Defender.set_skill_inputs("special", true, enemy_pool[i].spec_num);
        Defender.set_skill_inputs("A", true, enemy_pool[i].a_num);
        Defender.set_skill_inputs("B", true, enemy_pool[i].b_num);
        Defender.set_skill_inputs("C", true, enemy_pool[i].c_num);
        Defender.set_skill_inputs("S", true, enemy_pool[i].seal_num);
        if (weap.type == "Be")
          Defender.set_transformed_flag(true);
      }
      else {
        Defender.set_skill_inputs("weapon", enemy_pool[i].weap_bool, enemy_pool[i].weap_num);
        Defender.set_skill_inputs("special", enemy_pool[i].spec_bool, enemy_pool[i].spec_num);
        Defender.set_skill_inputs("A", enemy_pool[i].a_bool, enemy_pool[i].a_num);
        Defender.set_skill_inputs("B", enemy_pool[i].b_bool, enemy_pool[i].b_num);
        Defender.set_skill_inputs("C", enemy_pool[i].c_bool, enemy_pool[i].c_num);
        Defender.set_skill_inputs("S", enemy_pool[i].seal_bool, enemy_pool[i].seal_num);
        if (weap.type == "Be")
          Defender.set_transformed_flag(enemy_pool[i].transformed);
      }

      Defender.calculate_permanent_stats();

      // Apply any modifications specified on the UI (HP/cooldown reduction).
      if (document.getElementById("HPCut").value != "") {
        if (Number.isInteger(parseInt(document.getElementById("HPCut").value))) {
          Attacker.reduce_hp(parseInt(document.getElementById("HPCut").value));
        }
      }
      if (document.getElementById("SpecCharge").value != "") {
        if (Number.isInteger(parseInt(document.getElementById("SpecCharge").value))) {
          Attacker.cooldown = parseInt(document.getElementById("SpecCharge").value);
          Attacker.cooldown_start = parseInt(document.getElementById("SpecCharge").value);
        }
      }

      if (mass_override) {
        if (document.getElementById("EnemyHPCut").value != "") {
          if (Number.isInteger(parseInt(document.getElementById("EnemyHPCut").value))) {
            Defender.reduce_hp(parseInt(document.getElementById("EnemyHPCut").value));
          }
        }
        if (document.getElementById("EnemySpecCharge").value != "") {
          if (Number.isInteger(parseInt(document.getElementById("EnemySpecCharge").value))) {
            Defender.cooldown = parseInt(document.getElementById("EnemySpecCharge").value);
            Defender.cooldown_start = parseInt(document.getElementById("EnemySpecCharge").value);
          }
        }
      }
      else {
        if (enemy_pool[i].hp_cut != "") {
          if (Number.isInteger(parseInt(enemy_pool[i].hp_cut))) {
            Defender.reduce_hp(parseInt(enemy_pool[i].hp_cut));
          }
        }
        if (enemy_pool[i].spec_charge != "") {
          if (Number.isInteger(parseInt(enemy_pool[i].spec_charge))) {
            Defender.cooldown = parseInt(enemy_pool[i].spec_charge);
            Defender.cooldown_start = parseInt(enemy_pool[i].spec_charge);
          }
        }
      }

      // Apply any status effects specified on the UI.
      switch (document.getElementById("PanicActive").value) {
        case "Neither":
          break;
        case "Player":
          Attacker.set_panic_flag(true);
          break;
        case "Enemy":
          Defender.set_panic_flag(true);
          break;
        case "Both":
          Attacker.set_panic_flag(true);
          Defender.set_panic_flag(true);
          break;
      }
      switch (document.getElementById("GuardActive").value) {
        case "Neither":
          break;
        case "Player":
          Attacker.set_guard_flag(true);
          break;
        case "Enemy":
          Defender.set_guard_flag(true);
          break;
        case "Both":
          Attacker.set_guard_flag(true);
          Defender.set_guard_flag(true);
          break;
      }
      switch (document.getElementById("IsolationActive").value) {
        case "Neither":
          break;
        case "Player":
          Attacker.set_isolation_flag(true);
          break;
        case "Enemy":
          Defender.set_isolation_flag(true);
          break;
        case "Both":
          Attacker.set_isolation_flag(true);
          Defender.set_isolation_flag(true);
          break;
      }
      switch (document.getElementById("Gravityctive").value) {
        case "Neither":
          break;
        case "Player":
          Attacker.set_gravity_flag(true);
          break;
        case "Enemy":
          Defender.set_gravity_flag(true);
          break;
        case "Both":
          Attacker.set_gravity_flag(true);
          Defender.set_gravity_flag(true);
          break;
      }
      switch (document.getElementById("FlashActive").value) {
        case "Neither":
          break;
        case "Player":
          Attacker.set_flash_flag(true);
          break;
        case "Enemy":
          Defender.set_flash_flag(true);
          break;
        case "Both":
          Attacker.set_flash_flag(true);
          Defender.set_flash_flag(true);
          break;
      }
      switch (document.getElementById("TrilemmaActive").value) {
        case "Neither":
          break;
        case "Player":
          Attacker.set_trilemma_flag(true);
          break;
        case "Enemy":
          Defender.set_trilemma_flag(true);
          break;
        case "Both":
          Attacker.set_trilemma_flag(true);
          Defender.set_trilemma_flag(true);
          break;
      }
      switch (document.getElementById("BDoublerActive").value) {
        case "Neither":
          break;
        case "Player":
          Attacker.set_bonus_doubler_flag(true);
          break;
        case "Enemy":
          Defender.set_bonus_doubler_flag(true);
          break;
        case "Both:":
          Attacker.set_bonus_doubler_flag(true);
          Defender.set_bonus_doubler_flag(true);
          break;
      }
      switch (document.getElementById("ExtraMovActive").value) {
        case "Neither":
          break;
        case "Player":
          Attacker.set_extra_movement_flag(true);
          break;
        case "Enemy":
          Defender.set_extra_movement_flag(true);
          break;
        case "Both":
          Attacker.set_extra_movement_flag(true);
          Defender.set_extra_movement_flag(true);
          break;
      }
      switch (document.getElementById("DivineFangActive").value) {
        case "Neither":
          break;
        case "Player":
          Attacker.set_divine_fang_flag(true);
          break;
        case "Enemy":
          Defender.set_divine_fang_flag(true);
          break;
        case "Both":
          Attacker.set_divine_fang_flag(true);
          Defender.set_divine_fang_flag(true);
          break;
      }
      switch (document.getElementById("NtrDraArmEffActive").value) {
        case "Neither":
          break;
        case "Player":
          Attacker.set_neutralize_dragon_armor_eff_flag(true);
          break;
        case "Enemy":
          Defender.set_neutralize_dragon_armor_eff_flag(true);
          break;
        case "Both":
          Attacker.set_neutralize_dragon_armor_eff_flag(true);
          Defender.set_neutralize_dragon_armor_eff_flag(true);
          break;
      }
      switch (document.getElementById("DominanceActive").value) {
        case "Neither":
          break;
        case "Player":
          Attacker.set_dominance_flag(true);
          break;
        case "Enemy":
          Defender.set_dominance_flag(true);
          break;
        case "Both":
          Attacker.set_dominance_flag(true);
          Defender.set_dominance_flag(true);
          break;
      }
      switch (document.getElementById("DesperationActive").value) {
        case "Neither":
          break;
        case "Player":
          Attacker.set_desperation_status_flag(true);
          break;
        case "Enemy":
          Defender.set_desperation_status_flag(true);
          break;
        case "Both":
          Attacker.set_desperation_status_flag(true);
          Defender.set_desperation_status_flag(true);
          break;
      }

      // If external effects are not neutralized by either fighter, apply any that were specified on the UI.
      for (var j = 0; j < Attacker.neutralize_external_skills_effects.length; j++) {
        if (Attacker.eval_conditions(Attacker.neutralize_external_skills_effects[j].conditions, Defender)) {
          combat_log += Attacker.get_name() + "'s " + Attacker.neutralize_external_skills_effects[j].source + " neutralizes the skills of " + Defender.get_name() + "'s allies during combat!<br />";
          Attacker.set_neutralize_external_skills_flag(true);
          break;
        }
      }
      for (var j = 0; j < Defender.neutralize_external_skills_effects.length; j++) {
        if (Defender.eval_conditions(Defender.neutralize_external_skills_effects[j].conditions, Attacker)) {
          combat_log += Defender.get_name() + "'s " + Defender.neutralize_external_skills_effects[j].source + " neutralizes the skills of " + Attacker.get_name() + "'s allies during combat!<br />";
          Defender.set_neutralize_external_skills_flag(true);
          break;
        }
      }

      if (!Attacker.get_neutralize_external_skills_flag()) {
        switch (document.getElementById("GeirskogulActive").value) {
          case "Enemy":
            Defender.set_geirskogul_support_flag(true);
            break;
          case "Both":
            Defender.set_geirskogul_support_flag(true);
            break;
        }
        switch (document.getElementById("InfBreathActive").value) {
          case "Enemy":
            Defender.set_inf_breath_support_flag(true);
            break;
          case "Both":
            Defender.set_inf_breath_support_flag(true);
            break;
        }
        switch (document.getElementById("InfRushActive").value) {
          case "Enemy":
            Defender.set_inf_rush_support_flag(true);
            break;
          case "Both":
            Defender.set_inf_rush_support_flag(true);
            break;
        }
        switch (document.getElementById("InfFlashActive").value) {
          case "Enemy":
            Defender.set_inf_flash_support_flag(true);
            break;
          case "Both":
            Defender.set_inf_flash_support_flag(true);
            break;
        }
        switch (document.getElementById("InfHexbladeActive").value) {
          case "Enemy":
            Defender.set_inf_hexblade_support_flag(true);
            break;
          case "Both":
            Defender.set_inf_hexblade_support_flag(true);
            break;
        }
        Defender.set_cg_stacks(document.getElementById("EnemyCGStacks").value);
        Defender.set_dg_stacks(document.getElementById("EnemyDGStacks").value);
      }
      if (!Defender.get_neutralize_external_skills_flag()) {
        switch (document.getElementById("GeirskogulActive").value) {
          case "Player":
            Attacker.set_geirskogul_support_flag(true);
            break;
          case "Both":
            Attacker.set_geirskogul_support_flag(true);
            break;
        }
        switch (document.getElementById("InfBreathActive").value) {
          case "Player":
            Attacker.set_inf_breath_support_flag(true);
            break;
          case "Both":
            Attacker.set_inf_breath_support_flag(true);
            break;
        }
        switch (document.getElementById("InfRushActive").value) {
          case "Player":
            Attacker.set_inf_rush_support_flag(true);
            break;
          case "Both":
            Attacker.set_inf_rush_support_flag(true);
            break;
        }
        switch (document.getElementById("InfFlashActive").value) {
          case "Player":
            Attacker.set_inf_flash_support_flag(true);
            break;
          case "Both":
            Attacker.set_inf_flash_support_flag(true);
            break;
        }
        switch (document.getElementById("InfHexbladeActive").value) {
          case "Player":
            Attacker.set_inf_hexblade_support_flag(true);
            break;
          case "Both":
            Attacker.set_inf_hexblade_support_flag(true);
            break;
        }
        Attacker.set_cg_stacks(document.getElementById("CGStacks").value);
        Attacker.set_dg_stacks(document.getElementById("DGStacks").value);
      }

      // Populate the effective damage arrays.
      Attacker.apply_eff_damage_effects();
      Defender.apply_eff_damage_effects();

      // Run the simulation. The third variable determines what type of simulation should be run.
      combat_log = execute_phase(Attacker, Defender, (document.getElementById("SimType").value == "Offense"));

      // After combat, save the logging information to the proper arrays.
      if (Defender.get_hp() == 0) {
        orko[orko.length] = i;
        orko_dealt[orko_dealt.length] = Attacker.get_dmg_dealt();
        orko_taken[orko_taken.length] = Defender.get_dmg_dealt();
        orko_def_hp_max[orko_def_hp_max.length] = Defender.get_max_hp();
        orko_skill_log[orko_skill_log.length] = skill_string;
        orko_log[orko_log.length] = combat_log;
      }
      else if (Attacker.get_hp() == 0) {
        losses[losses.length] = i;
        losses_dealt[losses_dealt.length] = Attacker.get_dmg_dealt();
        losses_taken[losses_taken.length] = Defender.get_dmg_dealt();
        losses_def_hp_max[losses_def_hp_max.length] = Defender.get_max_hp();
        losses_skill_log[losses_skill_log.length] = skill_string;
        losses_log[losses_log.length] = combat_log;
      }
      else {
        no_ko[no_ko.length] = i;
        no_ko_dealt[no_ko_dealt.length] = Attacker.get_dmg_dealt();
        no_ko_taken[no_ko_taken.length] = Defender.get_dmg_dealt();
        no_ko_def_hp_max[no_ko_def_hp_max.length] = Defender.get_max_hp();
        no_ko_skill_log[no_ko_skill_log.length] = skill_string;
        no_ko_log[no_ko_log.length] = combat_log;
      }

      // Reset the attacker to the values specified by the user, and clear the combat log.
      Attacker.revive();
      combat_log = "";
    }
  }

  // Report the results.
  msg += "<b>Summary: " + orko.length + " ORKOs, " + no_ko.length + " No KO, " + losses.length + " Losses</b><br><br>";
  msg += "<b>Details (Click any line to show/hide combat details)</b><br><br>";
  msg += "<b>ORKOs (" + orko.length + ")</b><br><table class='results_table'>";
  for (var i = 0; i < orko.length; i++) {
    msg += "<tr><td><span id='orko" + i + "' onclick=showorhide('orko" + i + "')>";
    msg += enemy_pool[orko[i]].name + ": " + orko_dealt[i] + " total dmg dealt (";
    msg += Math.floor(orko_dealt[i]/orko_def_hp_max[i]*100) + "%), " + orko_taken[i];
    msg += " total dmg taken (" + Math.floor(orko_taken[i]/Attacker.get_max_hp()*100) + "%).<br>" + orko_skill_log[i] + "<br></span>";
    msg += "<div id='orko" + i + "details' class='tempHidden log'>" + orko_log[i] + "</div></td></tr>";
  }
  msg += "</table><br><b>No KO (" + no_ko.length + ")</b><br><table class='results_table'>";
  for (var i =0; i < no_ko.length; i++) {
    msg += "<tr><td><span id='noko" + i + "' onclick=showorhide('noko" + i + "')>";
    msg += enemy_pool[no_ko[i]].name + ": " + no_ko_dealt[i] + " total dmg dealt (";
    msg += Math.floor(no_ko_dealt[i]/no_ko_def_hp_max[i]*100) + "%), " + no_ko_taken[i];
    msg += " total dmg taken (" + Math.floor(no_ko_taken[i]/Attacker.get_max_hp()*100) + "%).<br>" + no_ko_skill_log[i] + "<br></span>";
    msg += "<div id='noko" + i + "details' class='tempHidden log'>" + no_ko_log[i] + "</div></td></tr>";
  }
  msg += "</table><br><b>Losses (" + losses.length + ")</b><br><table class='results_table'>";
  for (var i = 0; i < losses.length; i++) {
    msg += "<tr><td><span id='loss" + i + "' onclick=showorhide('loss" + i + "')>";
    msg += enemy_pool[losses[i]].name + ": " + losses_dealt[i] + " total dmg dealt (";
    msg += Math.floor(losses_dealt[i]/losses_def_hp_max[i]*100) + "%), " + losses_taken[i];
    msg += " total dmg taken (" + Math.floor(losses_taken[i]/Attacker.get_max_hp()*100) + "%).<br>" + losses_skill_log[i] + "<br></span>";
    msg += "<div id='loss" + i + "details' class='tempHidden log'>" + losses_log[i] + "</div></td></tr>";
  }
  msg += "</table>";

  document.getElementById("ResultSet").innerHTML = msg;
}

// Determines whether or not a character meets the user-defined filter requirements.
function passes_filter_reqs(character) {
  var color = character.color;
  var weapon_type = character.weap;
  var mov_type = character.type;

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
    case "NT":
      if (!document.getElementById("N Tome").checked) {
        return false;
      }
      break;
    case "RD":
      if (!document.getElementById("R Breath").checked) {
        return false;
      }
      break;
    case "BD":
      if (!document.getElementById("B Breath").checked) {
        return false;
      }
      break;
    case "GD":
      if (!document.getElementById("G Breath").checked) {
        return false;
      }
      break;
    case "ND":
      if (!document.getElementById("N Breath").checked) {
        return false;
      }
      break;
    case "RB":
      if (!document.getElementById("R Bow").checked) {
        return false;
      }
      break;
    case "BB":
      if (!document.getElementById("B Bow").checked) {
        return false;
      }
      break;
    case "GB":
      if (!document.getElementById("G Bow").checked) {
        return false;
      }
      break;
    case "NB":
      if (!document.getElementById("N Bow").checked) {
        return false;
      }
      break;
    case "RK":
      if (!document.getElementById("R Dagger").checked) {
        return false;
      }
      break;
    case "BK":
      if (!document.getElementById("B Dagger").checked) {
        return false;
      }
      break;
    case "GK":
      if (!document.getElementById("G Dagger").checked) {
        return false;
      }
      break;
    case "NK":
      if (!document.getElementById("N Dagger").checked) {
        return false;
      }
      break;
    case "RBe":
      if (!document.getElementById("R Beast").checked) {
        return false;
      }
      break;
    case "BBe":
      if (!document.getElementById("B Beast").checked) {
        return false;
      }
      break;
    case "GBe":
      if (!document.getElementById("G Beast").checked) {
        return false;
      }
      break;
    case "NBe":
      if (!document.getElementById("N Beast").checked) {
        return false;
      }
      break;
    // Staff is the only other option.
    default:
      if (!document.getElementById("Staff").checked) {
        return false;
      }
  }
  switch(mov_type) {
    case "A":
      if (!document.getElementById("Armor").checked) {
        return false;
      }
      break;
    case "C":
      if (!document.getElementById("Cavalry").checked) {
        return false;
      }
      break;
    case "F":
      if (!document.getElementById("Flier").checked) {
        return false;
      }
      break;
    default:
      if (!document.getElementById("Infantry").checked) {
        return false;
      }
  }

  return true;
}

// Runs through a single phase with an attacker and a defender. After combat concludes
// (end of phase or one unit dies), the combat log is returned.
function execute_phase(player, enemy, player_initiating) {
  //console.log(enemy.get_name());

  var attacker, defender;
  var pre_combat_log = "";
  in_combat = false;

  if (player_initiating) {
    player.set_initiating_flag(true);
    attacker = player;
    enemy.set_initiating_flag(false);
    defender = enemy;
    phase = "player"
  }
  else {
    player.set_initiating_flag(false);
    attacker = enemy;
    enemy.set_initiating_flag(true);
    defender = player;
    phase = "enemy"
  }

  // Apply the assumed field buffs and penalties.
  player.apply_assumed_values();
  enemy.apply_assumed_values();

  // Apply pulse effects, if they're enabled.
  if (document.getElementById("Pulse").checked) {
    for (var i = 0; i < player.pulse_effects.length; i++) {
      if (player.eval_conditions(player.pulse_effects[i].conditions, enemy)) {
        pre_combat_log += player.get_name() + "'s " + player.pulse_effects[i].source + " reduces cooldown by " + player.apply_pulse(player.pulse_effects[i].effect, enemy) + "!<br />";
      }
    }
  }
  if (document.getElementById("E_Pulse").checked) {
    for (var i = 0; i < enemy.pulse_effects.length; i++) {
      if (enemy.eval_conditions(enemy.pulse_effects[i].conditions, player)) {
        pre_combat_log += enemy.get_name() + "'s " + enemy.pulse_effects[i].source + " reduces cooldown by " + enemy.apply_pulse(enemy.pulse_effects[i].effect, player) + "!<br />";
      }
    }
  }

  // Set start HP for start-of-turn effects.
  player.set_start_hp(player.get_hp());
  enemy.set_start_hp(enemy.get_hp())

  // Calculate printed stats
  player.calculate_printed_stats();
  enemy.calculate_printed_stats();
  // Also apply any bonus movement effects.
  for (var i = 0; i < attacker.extra_movement_effects.length; i++) {
    if (attacker.eval_conditions(attacker.extra_movement_effects[i].conditions, defender)) {
      attacker.set_extra_movement_flag(true);
      break;
    }
  }
  for (var i = 0; i < defender.extra_movement_effects.length; i++) {
    if (defender.eval_conditions(defender.extra_movement_effects[i].conditions, attacker)) {
      defender.set_extra_movement_flag(true);
      break;
    }
  }

  // Set Phantom Stat values.
  for (var i = 0; i < player.phantom_effects.length; i++)
    if (player.eval_conditions(player.phantom_effects[i].conditions, enemy))
      player.add_phantom_stat(player.phantom_effects[i].effect, enemy);
  for (var i = 0; i < enemy.phantom_effects.length; i++)
    if (enemy.eval_conditions(enemy.phantom_effects[i].conditions, player))
      enemy.add_phantom_stat(enemy.phantom_effects[i].effect, player);

  // ploy_flag is true if ploys are applied.
  var ploy_flag = false;

  // If ploys & statuses are enabled, apply Stat Ploys
  if (this.document.getElementById("Ploys").checked) {
    for (var i = 0; i < player.stat_ploy_effects.length; i++) {
      if (player.eval_conditions(player.stat_ploy_effects[i].conditions, enemy)) {
        pre_combat_log += enemy.get_name() + " receives a " + enemy.apply_stat_ploy(player.stat_ploy_effects[i].effect) + " penalty from " + player.get_name() + "'s " + player.stat_ploy_effects[i].source + "!<br />";
        ploy_flag = true;
      }
    }
  }
  if (this.document.getElementById("E_Ploys").checked) {
    for (var i = 0; i < enemy.stat_ploy_effects.length; i++) {
      if (enemy.eval_conditions(enemy.stat_ploy_effects[i].conditions, player)) {
        pre_combat_log += player.get_name() + " receives a " + player.apply_stat_ploy(enemy.stat_ploy_effects[i].effect) + " penalty from " + enemy.get_name() + "'s " + enemy.stat_ploy_effects[i].source + "!<br />";
        ploy_flag = true;
      }
    }
  }

  // If ploys & statuses are enabled, apply Panic Ploy
  if (this.document.getElementById("Ploys").checked) {
    for (var i = 0; i < player.panic_ploy_effects.length; i++) {
      if (player.eval_conditions(player.panic_ploy_effects[i].conditions, enemy)) {
        enemy.set_panic_flag(true);
        pre_combat_log += player.get_name() + "'s " + player.panic_ploy_effects[i].source + " inflicts Panic on " + enemy.get_name() + "!<br />";
        ploy_flag = true;
        break;
      }
    }
  }
  if (this.document.getElementById("E_Ploys").checked) {
    for (var i = 0; i < enemy.panic_ploy_effects.length; i++) {
      if (enemy.eval_conditions(enemy.panic_ploy_effects[i].conditions, player)) {
        player.set_panic_flag(true);
        pre_combat_log += enemy.get_name() + "'s " + enemy.panic_ploy_effects[i].source + " inflicts Panic on " + player.get_name() + "!<br />";
        ploy_flag = true;
        break;
      }
    }
  }

  // If ploys & statuses are enabled, apply Guard infliction.
  if (this.document.getElementById("Ploys").checked) {
    for (var i = 0; i < player.inflict_guard_effects.length; i++) {
      if (player.eval_conditions(player.inflict_guard_effects[i].conditions, enemy)) {
        enemy.set_guard_flag(true);
        pre_combat_log += player.get_name() + "'s " + player.inflict_guard_effects[i].source + " inflicts Guard on " + enemy.get_name() + "!<br />";
        break;
      }
    }
  }
  if (this.document.getElementById("E_Ploys").checked) {
    for (var i = 0; i < enemy.inflict_guard_effects.length; i++) {
      if (enemy.eval_conditions(enemy.inflict_guard_effects[i].conditions, player)) {
        player.set_guard_flag(true);
        pre_combat_log += enemy.get_name() + "'s " + enemy.inflict_guard_effects[i].source + " inflicts Guard on " + player.get_name() + "!<br />";
      }
    }
  }

  // If a ploy was applied, recalculate printed stats.
  if (ploy_flag && player_initiating) {
    player.calculate_printed_stats();
    enemy.calculate_printed_stats();
  }

  combat_log += "Enemy Stats: +" + enemy.boon + "/-" + enemy.bane;
  combat_log += ", " + enemy.get_max_hp() + " HP, " + enemy.get_permanent_atk() + " Atk";
  if (enemy.get_actual_atk_buff() > 0) {
    combat_log += "<span class=\"buff\"> (+" + enemy.get_actual_atk_buff() + ")</span>";
  }
  if (enemy.get_actual_atk_buff() < 0) {
    combat_log += "<span class=\"penalty\"> (" + enemy.get_actual_atk_buff() + ")</span>";
  }
  if (enemy.get_actual_atk_penalty() > 0) {
    combat_log += "<span class=\"penalty\"> (-" + enemy.get_actual_atk_penalty() + ")</span>";
  }
  combat_log += ", " + enemy.get_permanent_spd() + " Spd";
  if (enemy.get_actual_spd_buff() > 0) {
    combat_log += "<span class=\"buff\"> (+" + enemy.get_actual_spd_buff() + ")</span>";
  }
  if (enemy.get_actual_spd_buff() < 0) {
    combat_log += "<span class=\"penalty\"> (" + enemy.get_actual_spd_buff() + ")</span>";
  }
  if (enemy.get_actual_spd_penalty() > 0) {
    combat_log += "<span class=\"penalty\"> (-" + enemy.get_actual_spd_penalty() + ")</span>";
  }
  combat_log += ", " + enemy.get_permanent_def() + " Def";
  if (enemy.get_actual_def_buff() > 0) {
    combat_log += "<span class=\"buff\"> (+" + enemy.get_actual_def_buff() + ")</span>";
  }
  if (enemy.get_actual_def_buff() < 0) {
    combat_log += "<span class=\"penalty\"> (" + enemy.get_actual_def_buff() + ")</span>";
  }
  if (enemy.get_actual_def_penalty() > 0) {
    combat_log += "<span class=\"penalty\"> (-" + enemy.get_actual_def_penalty() + ")</span>";
  }
  combat_log += ", " + enemy.get_permanent_res() + " Res";
  if (enemy.get_actual_res_buff() > 0) {
    combat_log += "<span class=\"buff\"> (+" + enemy.get_actual_res_buff() + ")</span>";
  }
  if (enemy.get_actual_res_buff() < 0) {
    combat_log += "<span class=\"penalty\"> (" + enemy.get_actual_res_buff() + ")</span>";
  }
  if (enemy.get_actual_res_penalty() > 0) {
    combat_log += "<span class=\"penalty\"> (-" + enemy.get_actual_res_penalty() + ")</span>";
  }
  combat_log += ".<br />" + pre_combat_log;

  skill_string = "<div class=\"result_cell\">";
  skill_string += "<img src=\"images/weapon_icon.png\" class=\"icon\" />" + enemy.get_weapon_name() + "</div>";
  //skill_string += "<span class=\"weapon_desc\">" + enemy.weapon.desc + "</span></div>";
  skill_string += "<div class=\"result_cell\"><img src=\"images/special_icon.png\" class=\"icon\" />" + enemy.get_special_name() + "</div>";
  //skill_string += "<span class=\"special_desc\">" + enemy.special.desc + "</span></div>";
  skill_string += "<div class=\"skill_icon\"><img src=" + process_skill_path(enemy.a_skill.name) + " class=\"icon\" /></div>";
  //skill_string += "<span class=\"skill_desc\">" + clean(enemy.a_skill.name) + ": " + enemy.a_skill.desc + "</span></div>";
  skill_string += "<div class=\"skill_icon\"><img src=" + process_skill_path(enemy.b_skill.name) + " class=\"icon\" /></div>";
  //skill_string += "<span class=\"skill_desc\">" + clean(enemy.b_skill.name) + ": " + enemy.b_skill.desc + "</span></div>";
  skill_string += "<div class=\"skill_icon\"><img src=" + process_skill_path(enemy.c_skill.name) + " class=\"icon\" /></div>";
  //skill_string += "<span class=\"skill_desc\">" + clean(enemy.c_skill.name) + ": " + enemy.c_skill.desc + "</span></div>";
  skill_string += "<div class=\"skill_icon\"><img src=" + process_seal_path(enemy.seal.name) + " class=\"icon\" /></div>";
  //skill_string += "<span class=\"skill_desc\">" + clean(enemy.seal.name) + ": " + enemy.seal.desc + "</span></div>";

  // Determine whether the units neutralize adaptive damage.
  for (var i = 0; i < attacker.neutralize_adaptive_damage_effects.length; i++) {
    if (attacker.eval_conditions(attacker.neutralize_adaptive_damage_effects[i].conditions, defender)) {
      attacker.set_neutralize_adaptive_damage_flag(true);
      break;
    }
  }
  for (var i = 0; i < defender.neutralize_adaptive_damage_effects.length; i++) {
    if (defender.eval_conditions(defender.neutralize_adaptive_damage_effects[i].conditions, attacker)) {
      defender.set_neutralize_adaptive_damage_flag(true);
      break;
    }
  }

  // Determine whether the units deal adaptive damage.
  if (!defender.get_neutralize_adaptive_damage_flag()) {
    for (var i = 0; i < attacker.adaptive_damage_effects.length; i++) {
      if (attacker.eval_conditions(attacker.adaptive_damage_effects[i].conditions, defender)) {
        attacker.set_adaptive_damage_flag(true);
        break;
      }
    }
  }
  if (!attacker.get_neutralize_adaptive_damage_flag()) {
    for (var i = 0; i < defender.adaptive_damage_effects.length; i++) {
      if (defender.eval_conditions(defender.adaptive_damage_effects[i].conditions, attacker)) {
        defender.set_adaptive_damage_flag(true);
        break;
      }
    }
  }

  // Evaluate any "targets" effects that affect which defensive stat the units target.
  for (var i = 0; i < attacker.targets_effects.length; i++) {
    if (attacker.eval_conditions(attacker.targets_effects[i].conditions, defender)) {
      attacker.set_targets_flag(attacker.targets_effects[i].effect);
      break;
    }
  }
  for (var i = 0; i < defender.targets_effects.length; i++) {
    if (defender.eval_conditions(defender.targets_effects[i].conditions, attacker)) {
      defender.set_targets_flag(defender.targets_effects[i].effect);
      break;
    }
  }

  // Handling for pre-combat AoEs. Just deal damage to the defender & ignore
  // the rest of the AoE.
  if (attacker.get_special_type() == "precombat") {
    if (attacker.eval_conditions(attacker.activate_special_effect.conditions, defender)) {
      attacker.set_special_activating_flag(true);
      combat_log += (attacker.get_name() + "'s " + attacker.get_special_name() + " activates!<br>");
    }

    // Set the attacker's "targeting" flag.
    attacker.set_targeting_flag(defender.get_printed_def(), defender.get_printed_res());

    // Apply any active precombat damage effects.
    for (var i = 0; i < attacker.precombat_damage_effects.length; i++) {
      if (attacker.eval_conditions(attacker.precombat_damage_effects[i].conditions, defender)) {
        // Calculate the initial precombat_dmg value.
        var precombat_dmg = attacker.calculate_precombat_damage(attacker.precombat_damage_effects[i].effect, defender);
        var bonus_dmg, pct_mit;

        // Add any valid sources of bonus damage.
        for (var j = 0; j < attacker.bonus_damage_effects.length; j++) {
          if (attacker.eval_conditions(attacker.bonus_damage_effects[j].conditions, defender)) {
            bonus_dmg = attacker.calculate_extra_damage(attacker.bonus_damage_effects[j].effect, defender);
            combat_log += attacker.get_name() + "'s " + attacker.bonus_damage_effects[j].source + " adds +" + bonus_dmg + " damage!<br />";
            precombat_dmg += bonus_dmg;
          }
        }

        // Apply any mitigations.
        for (var j = 0; j < defender.flat_percent_precombat_mitigation_effects.length; j++) {
          if (defender.eval_conditions(defender.flat_percent_precombat_mitigation_effects[j].conditions, attacker)) {
            pct_mit = defender.calculate_flat_percent_mitigation(defender.flat_percent_precombat_mitigation_effects[j].effect, attacker);
            combat_log += defender.get_name() + "'s " + defender.flat_percent_precombat_mitigation_effects[j].source + " reduces damage by " + pct_mit + "%!<br />";
            precombat_dmg -= Math.floor(precombat_dmg * pct_mit / 100);
          }
        }
        for (var j = 0; j < defender.scaled_percent_precombat_mitigation_effects.length; j++) {
          if (defender.eval_conditions(defender.scaled_percent_precombat_mitigation_effects[i].conditions, attacker)) {
            pct_mit = defender.calculate_scaled_percent_mitigation(defender.scaled_percent_precombat_mitigation_effects[j].effect, attacker);
            combat_log += defender.get_name() + "'s " + defender.scaled_percent_precombat_mitigation_effects[j].source + " reduces damage by " + pct_mit + "%!<br />";
            precombat_dmg -= Math.floor(precombat_dmg * pct_mit / 100);
          }
        }

        defender.reduce_hp(precombat_dmg);
        combat_log += defender.get_name() + " takes non-lethal damage up to " + precombat_dmg + ", and has " + defender.get_hp() + " HP remaining.<br />";
      }
    }

    if (attacker.get_special_activating_flag()) {
      attacker.set_special_activating_flag(false);
      attacker.reset_cooldown();
    }
  }

  // Set start-of-combat members for attacker and defender. Notably HP for skills that check HP thresholds
  // (Wrathful Staff, "Boost" skills, -breakers, and the like).
  attacker.set_start_hp(attacker.get_hp());
  defender.set_start_hp(defender.get_hp());

  // Set the strike twice flag.
  for (var i = 0; i < attacker.strike_twice_effects.length; i++) {
    if (attacker.eval_conditions(attacker.strike_twice_effects[i].conditions, defender)) {
      attacker.set_strike_twice_flag(true);
      break;
    }
  }
  for (var i = 0; i < defender.strike_twice_effects.length; i++) {
    if (defender.eval_conditions(defender.strike_twice_effects[i].conditions, attacker)) {
      defender.set_strike_twice_flag(true);
      break;
    }
  }

  // Set neutralize bonuses flags.
  for (var i = 0; i < attacker.neutralize_bonus_effects.length; i++)
    if (attacker.eval_conditions(attacker.neutralize_bonus_effects[i].conditions, defender))
      defender.set_neutralize_bonus_flags(attacker.neutralize_bonus_effects[i].effect);
  for (var i = 0; i < defender.neutralize_bonus_effects.length; i++)
    if (defender.eval_conditions(defender.neutralize_bonus_effects[i].conditions, attacker))
      attacker.set_neutralize_bonus_flags(defender.neutralize_bonus_effects[i].effect);

  // Set neutralize penalty flags.
  for (var i = 0; i < attacker.neutralize_penalty_effects.length; i++)
    if (attacker.eval_conditions(attacker.neutralize_penalty_effects[i].conditions, defender))
      combat_log += attacker.get_name() + "'s " + attacker.neutralize_penalty_effects[i].source + " neutralizes penalties" + attacker.set_neutralize_penalty_flags(attacker.neutralize_penalty_effects[i].effect);
  for (var i = 0; i < defender.neutralize_penalty_effects.length; i++)
    if (defender.eval_conditions(defender.neutralize_penalty_effects[i].conditions, attacker))
      combat_log += defender.get_name() + "'s " + defender.neutralize_penalty_effects[i].source + " neutralizes penalties" + defender.set_neutralize_penalty_flags(defender.neutralize_penalty_effects[i].effect);

  // Set neutralize wrathful staff flags.
  for (var i = 0; i < attacker.neutralize_wrathful_staff_effects.length; i++) {
    if (attacker.eval_conditions(attacker.neutralize_wrathful_staff_effects[i].conditions, defender)) {
      attacker.set_neutralize_wrathful_staff_flag(true);
      break;
    }
  }
  for (var i = 0; i < defender.neutralize_wrathful_staff_effects.length; i++) {
    if (defender.eval_conditions(defender.neutralize_wrathful_staff_effects[i].conditions, attacker)) {
      defender.set_neutralize_wrathful_staff_flag(true);
      break;
    }
  }

  // Set wrathful staff flags, if it's not neutralized.
  if (!defender.get_neutralize_wrathful_staff_flag()) {
    for (var i = 0; i < attacker.wrathful_staff_effects.length; i++) {
      if (attacker.eval_conditions(attacker.wrathful_staff_effects[i].conditions, defender)) {
        attacker.set_wrathful_staff_active_flag(true);
        break;
      }
    }
  }
  if (!attacker.get_neutralize_wrathful_staff_flag()) {
    for (var i = 0; i < defender.wrathful_staff_effects.length; i++) {
      if (defender.eval_conditions(defender.wrathful_staff_effects[i].conditions, attacker)) {
        defender.set_wrathful_staff_active_flag(true);
        break;
      }
    }
  }

  // Set colorless wta flags.
  for (var i = 0; i < attacker.colorless_wta_effects.length; i++) {
    if (attacker.eval_conditions(attacker.colorless_wta_effects[i].conditions, defender)) {
      attacker.set_colorless_wta_flag(true);
      break;
    }
  }
  for (var i = 0; i < defender.colorless_wta_effects.length; i++) {
    if (defender.eval_conditions(defender.colorless_wta_effects[i].conditions, attacker)) {
      defender.set_colorless_wta_flag(true);
      break;
    }
  }

  // Set triangle statuses.
  if ((attacker.get_color() == "R" && defender.get_color() == "G") || (attacker.get_color() == "B" && defender.get_color() == "R") ||
      (attacker.get_color() == "G" && defender.get_color() == "B") || (defender.get_color() == "N" && attacker.get_colorless_wta_flag())) {
    attacker.set_triangle_status("a");
    defender.set_triangle_status("d");
  }
  else if ((attacker.get_color() == "R" && defender.get_color() == "B") || (attacker.get_color() == "B" && defender.get_color() == "G") ||
           (attacker.get_color() == "G" && defender.get_color() == "R") || (defender.get_colorless_wta_flag() && attacker.get_color() == "N")) {
    attacker.set_triangle_status("d");
    defender.set_triangle_status("a");
  }
  else {
    attacker.set_triangle_status("n");
    defender.set_triangle_status("n");
  }

  // Calculate combat stats. Start with a base calculation of printed stats.
  attacker.calculate_base_combat_stats();
  defender.calculate_base_combat_stats();

  // Combat is now starting.
  in_combat = true;

  // Re-evaluate whether the units deal adaptive damage.

  // Determine whether the units neutralize adaptive damage.
  for (var i = 0; i < attacker.neutralize_adaptive_damage_effects.length; i++) {
    if (attacker.eval_conditions(attacker.neutralize_adaptive_damage_effects[i].conditions, defender)) {
      attacker.set_neutralize_adaptive_damage_flag(true);
      defender.set_adaptive_damage_flag(false);
      break;
    }
  }
  for (var i = 0; i < defender.neutralize_adaptive_damage_effects.length; i++) {
    if (defender.eval_conditions(defender.neutralize_adaptive_damage_effects[i].conditions, attacker)) {
      defender.set_neutralize_adaptive_damage_flag(true);
      attacker.set_adaptive_damage_flag(false);
      break;
    }
  }
  // Determine whether the units deal adaptive damage.
  if (!defender.get_neutralize_adaptive_damage_flag()) {
    for (var i = 0; i < attacker.adaptive_damage_effects.length; i++) {
      if (attacker.eval_conditions(attacker.adaptive_damage_effects[i].conditions, defender)) {
        attacker.set_adaptive_damage_flag(true);
        break;
      }
    }
  }

  if (!attacker.get_neutralize_adaptive_damage_flag()) {
    for (var i = 0; i < defender.adaptive_damage_effects.length; i++) {
      if (defender.eval_conditions(defender.adaptive_damage_effects[i].conditions, attacker)) {
        defender.set_adaptive_damage_flag(true);
        break;
      }
    }
  }

  // Evaluate any "targets" effects that affect which defensive stat the units target.
  for (var i = 0; i < attacker.targets_effects.length; i++) {
    if (attacker.eval_conditions(attacker.targets_effects[i].conditions, defender)) {
      combat_log += attacker.get_name() + " targets " + attacker.set_targets_flag(attacker.targets_effects[i].effect) + " due to " + attacker.targets_effects[i].source + "!<br>";
      break;
    }
  }
  for (var i = 0; i < defender.targets_effects.length; i++) {
    if (defender.eval_conditions(defender.targets_effects[i].conditions, attacker)) {
      combat_log += defender.get_name() + " targets " + defender.set_targets_flag(defender.targets_effects[i].effect) + " due to " + defender.targets_effects[i].source + "!<br>";
      break;
    }
  }

  // Next, apply combat bonuses from the user's skills.
  for (var i = 0; i < attacker.flat_stat_boost_effects.length; i++)
    if (attacker.eval_conditions(attacker.flat_stat_boost_effects[i].conditions, defender))
      //attacker.apply_flat_stat_boost(attacker.flat_stat_boost_effects[i].effect, defender);
      combat_log += attacker.get_name() + "'s " + attacker.flat_stat_boost_effects[i].source + " grants " + attacker.apply_flat_stat_boost(attacker.flat_stat_boost_effects[i].effect, defender) + ".<br />";
  for (var i = 0; i < attacker.scaled_stat_boost_effects.length; i++)
    if (attacker.eval_conditions(attacker.scaled_stat_boost_effects[i].conditions, defender))
      combat_log += attacker.get_name() + "'s " + attacker.scaled_stat_boost_effects[i].source + " grants " + attacker.apply_scaled_stat_boost(attacker.scaled_stat_boost_effects[i].effect, defender) + ".<br />";
  for (var i = 0; i < defender.flat_stat_boost_effects.length; i++)
    if (defender.eval_conditions(defender.flat_stat_boost_effects[i].conditions, attacker))
      combat_log += defender.get_name() + "'s " + defender.flat_stat_boost_effects[i].source + " grants " + defender.apply_flat_stat_boost(defender.flat_stat_boost_effects[i].effect, attacker) + ".<br />";
  for (var i = 0; i < defender.scaled_stat_boost_effects.length; i++)
    if (defender.eval_conditions(defender.scaled_stat_boost_effects[i].conditions, attacker))
      combat_log += defender.get_name() + "'s " + defender.scaled_stat_boost_effects[i].source + " grants " + defender.apply_scaled_stat_boost(defender.scaled_stat_boost_effects[i].effect, attacker) + ".<br />";

  // Next, apply any combat penalties applied by the other fighter.
  for (var i = 0; i < attacker.stat_penalty_effects.length; i++)
    if (attacker.eval_conditions(attacker.stat_penalty_effects[i].conditions, defender))
      combat_log += attacker.get_name() + "'s " + attacker.stat_penalty_effects[i].source + " inflicts " + defender.apply_stat_penalty(attacker.stat_penalty_effects[i].effect, attacker) + " on " + defender.get_name() + ".<br />";
  for (var i = 0; i < attacker.scaled_stat_penalty_effects.length; i++)
    if (attacker.eval_conditions(attacker.scaled_stat_penalty_effects[i].conditions, defender))
      combat_log += attacker.get_name() + "'s " + attacker.scaled_stat_penalty_effects[i].source + " inflicts " + defender.apply_scaled_stat_penalty(attacker.scaled_stat_penalty_effects[i].effect, attacker) + " on " + defender.get_name() + ".<br />";
  for (var i = 0; i < defender.stat_penalty_effects.length; i++)
    if (defender.eval_conditions(defender.stat_penalty_effects[i].conditions, attacker))
      combat_log += defender.get_name() + "'s " + defender.stat_penalty_effects[i].source + " inflicts " + attacker.apply_stat_penalty(defender.stat_penalty_effects[i].effect, defender) + " on " + attacker.get_name() + ".<br />";
  for (var i = 0; i < defender.scaled_stat_penalty_effects.length; i++)
    if (defender.eval_conditions(defender.scaled_stat_penalty_effects[i].conditions, attacker))
      combat_log += defender.get_name() + "'s " + defender.scaled_stat_penalty_effects[i].source + " inflicts " + attacker.apply_scaled_stat_penalty(defender.scaled_stat_penalty_effects[i].effect, defender) + " on " + attacker.get_name() + ".<br />";

  // Calculate effective attack stats.
  for (var i = 0; i < attacker.neutralize_triangle_amplifier_effects.length; i++) {
    if (attacker.eval_conditions(attacker.neutralize_triangle_amplifier_effects[i].conditions, defender)) {
      attacker.set_neutralize_triangle_amplifier_flag(true);
      break;
    }
  }
  for (var i = 0; i < defender.neutralize_triangle_amplifier_effects.length; i++) {
    if (defender.eval_conditions(defender.neutralize_triangle_amplifier_effects[i].conditions, attacker)) {
      defender.set_neutralize_triangle_amplifier_flag(true);
    }
  }

  for (var i = 0; i < attacker.e_triangle_reverser_effects.length; i++) {
    if (attacker.eval_conditions(attacker.e_triangle_reverser_effects[i].conditions, defender)) {
      attacker.set_reverse_triangle_amplifier_flag(true);
      break;
    }
  }
  for (var i = 0; i < defender.e_triangle_reverser_effects.length; i++) {
    if (defender.eval_conditions(defender.e_triangle_reverser_effects[i].conditions, attacker)) {
      defender.set_reverse_triangle_amplifier_flag(true);
      break;
    }
  }

  if (attacker.triangle_amplifier_effects.length > 0 && !attacker.get_neutralize_triangle_amplifier_flag())
    attacker.set_triangle_amplifier_flag(true);
  if (defender.triangle_amplifier_effects.length > 0 && !defender.get_neutralize_triangle_amplifier_flag()) {
    defender.set_triangle_amplifier_flag(true);
  }

  for (var i = 0; i < attacker.neutralize_weap_eff_effects.length; i++) {
    if (attacker.eval_conditions(attacker.neutralize_weap_eff_effects[i].conditions, defender)) {
      attacker.set_neutralize_weapon_effective_flag(true);
      break;
    }
  }
  for (var i = 0; i < defender.neutralize_weap_eff_effects.length; i++) {
    if (defender.eval_conditions(defender.neutralize_weap_eff_effects[i].conditions, attacker)) {
      defender.set_neutralize_weapon_effective_flag(true);
      break;
    }
  }

  for (var i = 0; i < attacker.neutralize_mov_eff_effects.length; i++) {
    if (attacker.eval_conditions(attacker.neutralize_mov_eff_effects[i].conditions, defender)) {
      attacker.set_neutralize_movement_effective_flag(true);
      break;
    }
  }
  for (var i = 0; i < defender.neutralize_mov_eff_effects.length; i++) {
    if (defender.eval_conditions(defender.neutralize_mov_eff_effects[i].conditions, attacker)) {
      defender.set_neutralize_movement_effective_flag(true);
      break;
    }
  }

  if ((!defender.get_neutralize_weapon_effective_flag() && attacker.check_weapon_effective(defender)) ||
      (!defender.get_neutralize_movement_effective_flag() && attacker.movement_effective.includes(defender.get_movement_type()))) {
    combat_log += attacker.get_name() + " receives a +50% Atk boost from effective damage.<br />";
    attacker.set_eff_damage_flag(true);
  }
  if ((!attacker.get_neutralize_weapon_effective_flag() && defender.check_weapon_effective(attacker)) ||
      (!attacker.get_neutralize_movement_effective_flag() && defender.movement_effective.includes(attacker.get_movement_type()))) {
    combat_log += defender.get_name() + " receives a +50% Atk boost from effective damage.<br />";
    defender.set_eff_damage_flag(true);
  }

  attacker.calculate_effective_atk(defender);
  defender.calculate_effective_atk(attacker);

  // Set the targeting flags.
  attacker.set_targeting_flag(defender.get_combat_def(), defender.get_combat_res());
  defender.set_targeting_flag(attacker.get_combat_def(), attacker.get_combat_res());

  // Determine whether or not the defender can counter.
  defender.set_counterattack_flag(check_counter(attacker, defender));

  // Determine whether one or both units perform a follow up attack.
  attacker.set_follow_up_flag(check_follow_up(attacker, defender));

  if (defender.get_counterattack_flag()) {
    defender.set_follow_up_flag(check_follow_up(defender, attacker));
  }

  if (attacker.get_follow_up_flag())
    combat_log += attacker.get_name() + " will perform a follow-up attack!<br />";
  if (defender.get_counterattack_flag() && defender.get_follow_up_flag())
    combat_log += defender.get_name() + " will perform a follow-up attack!<br />";


  // Determine whether either unit neutralizes combat order alteration effects.
  var combat_order_alteration_neutralized = false;
  for (var i = 0; i < attacker.neutralize_combat_order_alteration_effects.length; i++) {
    if (attacker.eval_conditions(attacker.neutralize_combat_order_alteration_effects[i].conditions, defender)) {
      combat_order_alteration_neutralized = true;
      break;
    }
  }
  for (var i = 0; i < defender.neutralize_combat_order_alteration_effects.length; i++) {
    if (defender.eval_conditions(defender.neutralize_combat_order_alteration_effects[i].conditions, attacker)) {
      combat_order_alteration_neutralized = true;
      break;
    }
  }

  // Set combat order alteration flags on the fighters, if combat order alteration has not been neutralized.
  if (!combat_order_alteration_neutralized) {
    // Determines whether the attacker's Desperation is active.
    for (var i = 0; i < attacker.desperation_effects.length; i++) {
      if (attacker.eval_conditions(attacker.desperation_effects[i].conditions, defender)) {
        attacker.set_desperation_flag(true);
        break;
      }
    }
    for (var i = 0; i < defender.inverse_desperation_effects.length; i++) {
      if (defender.eval_conditions(defender.inverse_desperation_effects[i].conditions, attacker)) {
        attacker.set_desperation_flag(true);
        break;
      }
    }

    // Determines whether the defender's Desperation is active.
    for (var i = 0; i < defender.desperation_effects.length; i++) {
      if (defender.eval_conditions(defender.desperation_effects[i].conditions, attacker)) {
        defender.set_desperation_flag(true);
        break;
      }
    }

    // Determines whether the defender's Vantage is active.
    for (var i = 0; i < defender.vantage_effects.length; i++) {
      if (defender.eval_conditions(defender.vantage_effects[i].conditions, attacker)) {
        defender.set_vantage_flag(true);
        break;
      }
    }
  }

  // The defender gets the first strike if vantage applies.
  if (defender.get_counterattack_flag() && defender.get_vantage_flag()) {
    combat_log += (defender.get_name() + " strikes first!<br />");

    defender.set_first_hit_flag(true);
    calculate_damage(defender, attacker);
    defender.set_first_hit_flag(false);

    if (attacker.get_hp() == 0) {
      return combat_log;
    }

    if (defender.get_strike_twice_flag()) {
      combat_log += defender.get_name() + " performs an immediate second strike!<br />";

      defender.set_hitting_consecutively_flag(true);
      calculate_damage(defender, attacker);
      defender.set_hitting_consecutively_flag(false);
    }
    if (attacker.get_hp() == 0) {
      return combat_log;
    }
  }

  // The defender gets another strike if vantage and desperation both apply.
  if (defender.get_counterattack_flag() && defender.get_vantage_flag() && (defender.get_desperation_flag() && defender.get_follow_up_flag())) {
    combat_log += (defender.get_name() + "'s follow up occurs immediately!<br />");

    defender.set_hitting_consecutively_flag(true);
    calculate_damage(defender, attacker);
    defender.set_hitting_consecutively_flag(false);

    if (attacker.get_hp() == 0) {
      return combat_log;
    }

    if (defender.get_strike_twice_flag()) {
      combat_log += defender.get_name() + " performs an immediate second strike!<br />";

      defender.set_hitting_consecutively_flag(true);
      calculate_damage(defender, attacker);
      defender.set_hitting_consecutively_flag(false);

      if (attacker.get_hp() == 0) {
        return combat_log;
      }
    }
  }

  // The attacker launches his/her first strike.
  combat_log += attacker.get_name() + " attacks!<br />";

  attacker.set_first_hit_flag(true);
  calculate_damage(attacker, defender);
  attacker.set_first_hit_flag(false);

  if (defender.get_hp() == 0) {
    return combat_log;
  }

  if (attacker.get_strike_twice_flag()) {
    combat_log += attacker.get_name() + " performs an immediate second strike!<br />";

    attacker.set_hitting_consecutively_flag(true);
    calculate_damage(attacker, defender);
    attacker.set_hitting_consecutively_flag(false);
  }
  if (defender.get_hp() == 0) {
    return combat_log;
  }

  // If attacker can double, and has desperation active, perform the 2nd attack.
  if (attacker.get_follow_up_flag() && attacker.get_desperation_flag()) {
    combat_log += (attacker.get_name() + "'s follow up occurs immediately!<br />");

    attacker.set_hitting_consecutively_flag(true);
    calculate_damage(attacker, defender);
    attacker.set_hitting_consecutively_flag(false);

    if (defender.get_hp() == 0) {
      return combat_log;
    }
    // Weapons with brave effects strike twice when initiating.
    if (attacker.get_strike_twice_flag()) {
      combat_log += attacker.get_name() + " performs an immediate second strike!<br />";

      attacker.set_hitting_consecutively_flag(true);
      calculate_damage(attacker, defender);
      attacker.set_hitting_consecutively_flag(false);

      if (defender.get_hp() == 0) {
        return combat_log;
      }
    }
  }

  if (defender.get_counterattack_flag()) {
    // If vantage activated, only perform a counterattack if the defender
    // can follow up.
    if (defender.get_vantage_flag()) {
      if (defender.get_follow_up_flag()) {
        combat_log += defender.get_name() + " performs a follow up attack!<br />";

        calculate_damage(defender, attacker);
        if (attacker.get_hp() == 0) {
          return combat_log;
        }
        if (defender.get_strike_twice_flag()) {
          combat_log += defender.get_name() + " performs an immediate second strike!<br />";

          defender.set_hitting_consecutively_flag(true);
          calculate_damage(defender, attacker);
          defender.set_hitting_consecutively_flag(false);
        }
        if (attacker.get_hp() == 0) {
          return combat_log;
        }
      }
    }
    // Otherwise, perform an attack like normal.
    else {
      combat_log += defender.get_name() + " attacks!<br />";

      defender.set_first_hit_flag(true);
      calculate_damage(defender, attacker);
      defender.set_first_hit_flag(false);
      if (attacker.get_hp() == 0) {
        return combat_log;
      }
      if (defender.get_strike_twice_flag()) {
        combat_log += defender.get_name() + " performs an immediate second strike!<br />";

        defender.set_hitting_consecutively_flag(true);
        calculate_damage(defender, attacker);
        defender.set_hitting_consecutively_flag(false);
      }
      if (attacker.get_hp() == 0) {
        return combat_log;
      }

      // Perform a follow up attack if the defender's desperation is active.
      if (defender.get_desperation_flag() && defender.get_follow_up_flag()) {
        combat_log += defender.get_name() + "'s follow up occurs immediately!<br />";

        defender.set_hitting_consecutively_flag(true);
        calculate_damage(defender, attacker);
        defender.set_hitting_consecutively_flag(false);

        if (attacker.get_hp() == 0) {
          return combat_log;
        }

        if (defender.get_strike_twice_flag()) {
          combat_log += defender.get_name() + " performs an immediate second strike!<br />";

          defender.set_hitting_consecutively_flag(true);
          calculate_damage(defender, attacker);
          defender.set_hitting_consecutively_flag(false);

          if (attacker.get_hp() == 0) {
            return combat_log;
          }
        }
      }
    }
  }

  // If attacker can double and did not have desperation active at the start of
  // combat, perform the 2nd attack.
  if (attacker.get_follow_up_flag() && !attacker.get_desperation_flag()) {
    combat_log += attacker.get_name() + " performs a follow up attack!<br />";

    if (!defender.get_counterattack_flag()) {
      attacker.set_hitting_consecutively_flag(true);
    }
    calculate_damage(attacker, defender);
    if (defender.get_hp() == 0) {
      return combat_log;
    }
    attacker.set_hitting_consecutively_flag(false);

    // Weapons with brave effects strike twice when initiating.
    if (attacker.get_strike_twice_flag()) {
      combat_log += attacker.get_name() + " performs an immediate second strike!<br />";

      attacker.set_hitting_consecutively_flag(true);
      calculate_damage(attacker, defender);
      attacker.set_hitting_consecutively_flag(false);
      if (defender.get_hp() == 0) {
        return combat_log;
      }
    }
  }

  // If defender can counter, can double, and did not already do so by virtue of
  // vantage or desperation being active, perform the 2nd attack.
  if (defender.get_counterattack_flag() && defender.get_follow_up_flag() && !defender.get_vantage_flag() && !defender.get_desperation_flag()) {
    combat_log += defender.get_name() + " performs a follow up attack!<br />";

    defender.set_hitting_consecutively_flag(!attacker.get_follow_up_flag());
    calculate_damage(defender, attacker);
    defender.set_hitting_consecutively_flag(false);
    if (attacker.get_hp() == 0) {
      return combat_log;
    }
    if (defender.get_strike_twice_flag()) {
      combat_log += defender.get_name() + " performs an immediate second strike!<br />";

      defender.set_hitting_consecutively_flag(true);
      calculate_damage(defender, attacker);
      defender.set_hitting_consecutively_flag(false);
    }
    if (attacker.get_hp() == 0) {
      return combat_log;
    }
  }

  // The action is complete, remove any debuffs from the previous turn, and zero out
  // next_atk_bonus_dmg values.
  // attacker.reset_debuffs();
  attacker.set_next_atk_bonus_dmg(0);
  defender.set_next_atk_bonus_dmg(0);

  in_combat = false;

  return combat_log;
}

/*
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
  if (((active_unit.get_HP() / active_unit.get_HP_max()) <= active_unit.get_wrath_threshold()) && active_unit.get_special_name() != "(None)") {
    combat_log += active_unit.get_name() + "'s Wrath decreases the cooldown on " + active_unit.get_special_name() + " by 1!<br>";
    active_unit.decrement_cooldown();
  }
}*/

// Determines whether the defender is capable of counterattacking.
function check_counter(attacker, defender) {
  var can_counterattack = false;

  // If the two fighters' ranges are equal, then the defender can counterattack.
  if (attacker.get_range() == defender.get_range())
    can_counterattack = true;

  // Evaluate counterattack effects.
  for (var i = 0; i < defender.counterattack_effects.length; i++) {
    if (defender.eval_conditions(defender.counterattack_effects[i].conditions, attacker)) {
      combat_log += defender.get_name() + " can counterattack regardless of foe's range due to " + defender.counterattack_effects[i].source + "!<br />";
      can_counterattack = true;
      break;
    }
  }

  // Determine whether the defender neutralizes counterattack prevention.
  for (var i = 0; i < defender.neutralize_counterattack_preventer_effects.length; i++) {
    if (defender.eval_conditions(defender.neutralize_counterattack_preventer_effects[i].conditions, attacker)) {
      combat_log += defender.get_name() + "'s " + defender.neutralize_counterattack_preventer_effects[i].source + " neutralizes counterattack prevention effects!<br />";
      defender.set_neutralize_counterattack_preventers_flag(true);
      break;
    }
  }

  // If the defender does not neutralize counterattack preventers, evaluate effects that prevent counterattacking.
  if (!defender.get_neutralize_counterattack_preventers_flag()) {
    for (var i = 0; i < defender.counterattack_preventer_effects.length; i++) {
      if (defender.eval_conditions(defender.counterattack_preventer_effects[i].conditions, attacker)) {
        combat_log += defender.get_name() + "'s " + defender.counterattack_preventer_effects[i].source + " prevents their own counterattack!<br />";
        can_counterattack = false;
      }
    }
    for (var i = 0; i < attacker.e_counterattack_preventer_effects.length; i++) {
      if (attacker.eval_conditions(attacker.e_counterattack_preventer_effects[i].conditions, defender)) {
        combat_log += attacker.get_name() + " prevents " + defender.get_name() + " from counterattacking with " + attacker.e_counterattack_preventer_effects[i].source + "!<br />";
        can_counterattack = false;
      }
    }
  }

  return can_counterattack;
}

// Determines whether unit1 is capable of performing a follow-up attack.
function check_follow_up(unit1, unit2) {
  var follow_up_counter = 0;

  // Evaluate the standard Spd check.
  if ((unit1.get_combat_spd() - unit2.get_combat_spd()) >= 5) {
    combat_log += unit1.get_name() + " has at least five more Spd than " + unit2.get_name() + ", allowing a follow-up attack!<br />";
    follow_up_counter += 1;
  }

  // Determine whether unit1 neutralizes follow up inhibitors.
  for (var i = 0; i < unit1.neutralize_follow_up_inhibitor_effects.length; i++) {
    if (unit1.eval_conditions(unit1.neutralize_follow_up_inhibitor_effects[i].conditions, unit2)) {
      combat_log += unit1.get_name() + "'s " + unit1.neutralize_follow_up_inhibitor_effects[i].source + " neutralizes effects that inhibit their follow-up!<br />";
      unit1.set_neutralize_follow_up_inhibitors_flag(true);
      break;
    }
  }

  // If unit1 does not neutralize follow up inhibitors, apply any active enemy follow up inhibitors from unit2.
  // Also apply any active self follow up inhibitors from unit1.
  if (!unit1.get_neutralize_follow_up_inhibitors_flag()) {
    for (var i = 0; i < unit2.e_follow_up_inhibit_effects.length; i++) {
      if (unit2.eval_conditions(unit2.e_follow_up_inhibit_effects[i].conditions, unit1)) {
        combat_log += unit2.get_name() + "'s " + unit2.e_follow_up_inhibit_effects[i].source + " inhibits " + unit1.get_name() + "'s ability to perform a follow-up!<br />";
        follow_up_counter -= 1;
      }
    }

    for (var i = 0; i < unit1.follow_up_inhibit_effects.length; i++) {
      if (unit1.eval_conditions(unit1.follow_up_inhibit_effects[i].conditions, unit2)) {
        combat_log += unit1.get_name() + "'s " + unit1.follow_up_inhibit_effects[i].source + " inhibits their own ability to perform a follow-up!<br />";
        follow_up_counter -= 1;
      }
    }
  }

  // Determine whether unit2 neutralizes enemy follow up guarantors.
  for (var i = 0; i < unit2.neutralize_follow_up_guarantor_effects.length; i++) {
    if (unit2.eval_conditions(unit2.neutralize_follow_up_guarantor_effects[i].conditions, unit1)) {
      combat_log += unit2.get_name() + "'s " + unit2.neutralize_follow_up_guarantor_effects[i].source + " neutralizes effects that guarantee " + unit1.get_name() + "'s follow-up!<br />";
      unit2.set_neutralize_follow_up_guarantors_flag(true);
      break;
    }
  }

  // If unit2 does not neutralize enemy follow up guarantors, apply any active follow up guarantors from unit1.
  if (!unit2.get_neutralize_follow_up_guarantors_flag()) {
    for (var i = 0; i < unit1.follow_up_guarantor_effects.length; i++) {
      if (unit1.eval_conditions(unit1.follow_up_guarantor_effects[i].conditions, unit2)) {
        combat_log += unit1.get_name() + "'s " + unit1.follow_up_guarantor_effects[i].source + " guarantees a follow-up attack!<br />";
        follow_up_counter += 1;
      }
    }
  }

  return follow_up_counter > 0;
}

/*
function apply_postcombat_effects(attacker, defender) {
  if (attacker.get_heal_after_attack() > 0 && attacker.get_burn() == 0) {
    attacker.add_HP(4);
    combat_log += (attacker.get_name() + " heals " + attacker.get_heal_after_attack() + " HP from " + attacker.get_weapon_name() + ", and has " + attacker.get_HP() + " HP.<br>");
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
} */

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
function calculate_damage(attacker, defender) {
  attacker.set_attacking_flag(true);
  defender.set_attacking_flag(false);

  var damage = 0;
  var mitigation = 0;
  var damage_boost = 0;

  if (attacker.get_targeting_flag() == "def")
    damage = attacker.get_effective_atk() - defender.get_combat_def();
  else
    damage = attacker.get_effective_atk() - defender.get_combat_res();

  attacker.set_damage(damage);

  // Determine whether the attacker's special should activate.
  if (attacker.get_special_type() == "attack") {
    if (attacker.eval_conditions(attacker.activate_special_effect.conditions, defender)) {
      attacker.set_special_activating_flag(true);
      combat_log += attacker.get_name() + "'s " + attacker.get_special_name() + " activates!<br />";
    }
  }

  // Apply damage boost from specials, if applicable.
  for (var i = 0; i < attacker.damage_boost_effects.length; i++) {
    if (attacker.eval_conditions(attacker.damage_boost_effects[i].conditions, defender)) {
      damage_boost = attacker.calculate_extra_damage(attacker.damage_boost_effects[i].effect, defender);
      combat_log += attacker.get_name() + "'s " + attacker.damage_boost_effects[i].source + " deals +" + damage_boost + " damage!<br />";
      damage += damage_boost;
    }
  }

  // Apply next-hit damage bonuses, if applicable.
  damage += attacker.get_next_atk_bonus_dmg();
  attacker.set_next_atk_bonus_dmg(0);

  // If damage is negative, set it to 0.
  if (damage < 0)
    damage = 0;

  // Apply the staff damage penalty, if applicable.
  if (attacker.get_weapon_type() == "ST") {
    if ((defender.get_neutralize_wrathful_staff_flag() && attacker.get_wrathful_staff_active_flag()) || !attacker.get_wrathful_staff_active_flag()) {
      combat_log += attacker.get_name() + "'s damage is halved by the staff damage penalty!<br />";
      damage = Math.floor(damage / 2);
    }
  }

  // Apply bonus damage, if applicable.
  for (var i = 0; i < attacker.bonus_damage_effects.length; i++) {
    if (attacker.eval_conditions(attacker.bonus_damage_effects[i].conditions, defender)){
      damage_boost = attacker.calculate_extra_damage(attacker.bonus_damage_effects[i].effect, defender);
      combat_log += attacker.get_name() + "'s " + attacker.bonus_damage_effects[i].source + " adds +" + damage_boost + " damage!<br />";
      damage += damage_boost;
    }
  }

  attacker.set_damage(damage);

  // Determine whether the defender's special should activate.
  if (defender.get_special_type() == "defend") {
    if (defender.eval_conditions(defender.activate_special_effect.conditions, attacker)) {
      defender.set_special_activating_flag(true);
      combat_log += defender.get_name() + "'s " + defender.get_special_name() + " activates!<br />";
    }
  }

  // Determine whether the attacker neutralizes %-based mitigation.
  for (var i = 0; i < attacker.neutralize_scaled_mitigation_effects.length; i++) {
    if (attacker.eval_conditions(attacker.neutralize_scaled_mitigation_effects[i].conditions, defender)) {
      attacker.set_neutralize_scaled_mitigation_flag(true);
      combat_log += attacker.get_name() + "'s " + attacker.neutralize_scaled_mitigation_effects[i].source + " will neutralize percent-based mitigation this attack!<br />";
      break;
    }
  }

  // Determine whether the defender has a mitigation mirror effect.
  for (var i = 0; i < defender.mitigation_mirror_effects.length; i++) {
    if (defender.eval_conditions(defender.mitigation_mirror_effects[i].conditions, attacker)) {
      defender.set_mitigation_mirror_flag(true);
      break;
    }
  }

  // Apply %-based mitigation, if applicable and not neutralized.
  if (!attacker.get_neutralize_scaled_mitigation_flag()) {
    for (var i = 0; i < defender.flat_percent_mitigation_effects.length; i++) {
      if (defender.eval_conditions(defender.flat_percent_mitigation_effects[i].conditions, attacker)) {
        mitigation = Math.floor(damage * defender.calculate_flat_percent_mitigation(defender.flat_percent_mitigation_effects[i].effect, attacker) / 100);
        combat_log += defender.get_name() + "'s " + defender.flat_percent_mitigation_effects[i].source + " reduces damage by " + mitigation + ".<br />";
        if (defender.get_mitigation_mirror_flag()) {
          defender.add_next_hit_damage(mitigation);
        }
        damage -= mitigation;
      }
    }
    for (var i = 0; i < defender.scaled_percent_mitigation_effects.length; i++) {
      if (defender.eval_conditions(defender.scaled_percent_mitigation_effects[i].conditions, attacker)) {
        mitigation -= Math.floor(damage * defender.calculate_scaled_percent_mitigation(defender.scaled_percent_mitigation_effects[i].effect, attacker) / 100);
        combat_log += defender.get_name() + "'s " + defender.scaled_percent_mitigation_effects[i].source + " reduces damage by " + mitigation + ".<br />";
        if (defender.get_mitigation_mirror_flag()) {
          defender.add_next_hit_damage(mitigation);
        }
        damage -= mitigation;
      }
    }
  }

  // Apply flat mitigation.
  for (var i = 0; i < defender.static_mitigation_effects.length; i++) {
    if (defender.eval_conditions(defender.static_mitigation_effects[i].conditions, attacker)) {
      mitigation = defender.calculate_static_mitigation(defender.static_mitigation_effects[i].effect, attacker);
      combat_log += defender.get_name() + "'s " + defender.static_mitigation_effects[i].source + " reduces damage by " + mitigation + ".<br />";
      if (defender.get_mitigation_mirror_flag()) {
        // Next hit damage should be capped at the amount of damage the hit deals.
        defender.add_next_hit_damage(Math.min(damage, mitigation));
      }
      damage -= mitigation;
    }
  }

  if (damage < 0)
    damage = 0;

  for (var i = 0; i < defender.endure_effects.length; i++) {
    if (defender.eval_conditions(defender.endure_effects[i].conditions, attacker)) {
      combat_log += defender.endure_effects[i].source + " allows " + defender.get_name() + " to endure the hit with 1 HP!<br />";
      damage = defender.get_hp() - 1;

      if (defender.endure_effects[i].effect == "endure_with_flag") {
        defender.set_skill_miracle_activated_flag(true);
      }

      break;
    }
  }

  // For the purposes of heal-on-hit effects, attacker's damage is capped at defender's HP.
  attacker.set_damage(Math.min(damage, defender.get_hp()));

  // Apply heal-on-hit effects for the attacker.
  for (var i = 0; i < attacker.heal_on_hit_effects.length; i++) {
    var prev_hp;
    if (attacker.eval_conditions(attacker.heal_on_hit_effects[i].conditions, defender)) {
      prev_hp = attacker.apply_heal(attacker.heal_on_hit_effects[i].effect, defender);
      combat_log += attacker.get_name() + " heals " + (attacker.get_hp() - prev_hp) + " damage, and has " + attacker.get_hp() + " HP.<br />";
    }
  }

  attacker.set_damage(damage);

  // Charge or reset specials as necessary.
  if (attacker.get_special_activating_flag()) {
    attacker.set_special_activating_flag(false);
    attacker.reset_cooldown();
  }
  else {
    // Determine whether the attacker neutralizes special charge inhibitors.
    for (var i = 0; i < attacker.neutralize_special_charge_inhibitor_effects.length; i++) {
      if (attacker.eval_conditions(attacker.neutralize_special_charge_inhibitor_effects[i].conditions, defender)) {
        attacker.set_neutralize_special_charge_inhibitors_flag(true);
        break;
      }
    }

    // Determine whether the defender applies a special charge inhibitor.
    if (!attacker.get_neutralize_special_charge_inhibitors_flag()) {
      for (var i = 0; i < defender.special_charge_inhibitor_effects.length; i++) {
        if (defender.eval_conditions(defender.special_charge_inhibitor_effects[i].conditions, attacker)) {
          combat_log += defender.get_name() + "'s " + defender.special_charge_inhibitor_effects[i].source + " inhibits " + attacker.get_name() + "'s special charge by -1!<br />";
          defender.set_inhibit_special_charge_flag(true);
          break;
        }
      }
      // If the special charge inhibition flag is not already set, apply the attacker's guard status, if active.
      if (!defender.get_inhibit_special_charge_flag() && attacker.get_guard_flag()) {
        combat_log += attacker.get_name() + "'s Guard status condition inhibits special charge by -1!<br />";
      }
    }

    // Decrement the cooldown if the defender does not inhibit the attacker's special charge.
    if (!defender.get_inhibit_special_charge_flag()) {
      attacker.decrement_cooldown();
    }

    // Determine whether the defender neutralizes special charge accelerators.
    for (var i = 0; i < defender.neutralize_special_charge_accelerator_effects.length; i++) {
      if (defender.eval_conditions(defender.neutralize_special_charge_accelerator_effects[i].conditions, attacker)) {
        defender.set_neutralize_special_charge_accelerators_flag(true);
        break;
      }
    }

    // Decrement the cooldown if the attacker has a special charge accelerator, if applicable and not neutralized.
    if (!defender.get_neutralize_special_charge_accelerators_flag()) {
      for (var i = 0; i < attacker.special_charge_accelerator_effects.length; i++) {
        if (attacker.eval_conditions(attacker.special_charge_accelerator_effects[i].conditions, defender)) {
          combat_log += attacker.get_name() + "'s " + attacker.special_charge_accelerator_effects[i].source + " accelerates special charge by +1!<br />";
          attacker.decrement_cooldown();
          break;
        }
      }
    }
  }

  if (defender.get_special_activating_flag()) {
    defender.set_special_activating_flag(false);
    defender.reset_cooldown();
  }
  else {
    // Determine whether the defender neutralizes special charge inhibitors.
    for (var i = 0; i < defender.neutralize_special_charge_inhibitor_effects.length; i++) {
      if (defender.eval_conditions(defender.neutralize_special_charge_inhibitor_effects[i].conditions, attacker)) {
        defender.set_neutralize_special_charge_inhibitors_flag(true);
        break;
      }
    }

    // Determine whether the attacker applies a special charge inhibitor.
    if (!defender.get_neutralize_special_charge_inhibitors_flag()) {
      for (var i = 0; i < attacker.special_charge_inhibitor_effects.length; i++) {
        if (attacker.eval_conditions(attacker.special_charge_inhibitor_effects[i].conditions, defender)) {
          combat_log += attacker.get_name() + "'s " + attacker.special_charge_inhibitor_effects[i].source + " inhibits " + defender.get_name() + "'s special charge by -1!<br />";
          attacker.set_inhibit_special_charge_flag(true);
          break;
        }
      }
      // If the special charge inhibition flag is not already set, apply the guard status, if active.
      if (!attacker.get_inhibit_special_charge_flag() && defender.get_guard_flag()) {
        combat_log += defender.get_name() + "'s Guard status condition inhibits special charge by -1!<br />";
      }
    }

    // Decrement the cooldown if the attacker does not inhibit the defender's special charge.
    if (!attacker.get_inhibit_special_charge_flag()) {
      defender.decrement_cooldown();
    }

    // Determine whether the attacker neutralizes special charge accelerators.
    for (var i = 0; i < attacker.neutralize_special_charge_accelerator_effects.length; i++) {
      if (attacker.eval_conditions(attacker.neutralize_special_charge_accelerator_effects[i].conditions, defender)) {
        attacker.set_neutralize_special_charge_accelerators_flag(true);
        break;
      }
    }

    // Decrement the cooldown if the defender has a special charge accelerator, if applicable and not neutralized.
    if (!attacker.get_neutralize_special_charge_accelerators_flag()) {
      for (var i = 0; i < defender.special_charge_accelerator_effects.length; i++) {
        if (defender.eval_conditions(defender.special_charge_accelerator_effects[i].conditions, attacker)) {
          combat_log += defender.get_name() + "'s " + defender.special_charge_accelerator_effects[i].source + " accelerates special charge by +1!<br />";
          defender.decrement_cooldown();
          break;
        }
      }
    }
  }

  // Apply damage to the defender.
  defender.apply_damage(damage);

  var span_class;
  // attacker_dmg and defender_dmg lines are colored blue and red, respectively.
  if (attacker.get_initiating_flag())
    span_class = "attacker_dmg";
  else
    span_class = "defender_dmg";

  combat_log += "<span class='" + span_class + "'>" + defender.get_name() + " takes " + damage + " damage, and has " + defender.get_hp() + " HP remaining.<br></span>";
  attacker.add_dmg_value(damage);

  attacker.reset_single_hit_flags();
  defender.reset_single_hit_flags();

  /*
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

  // Handling for enemy def/res reduction procs (Luna, etc).
  if (attacker.get_def_reduce_proc() > 0 && attacker.get_cooldown() == 0) {
    combat_log += (attacker.get_name() + "'s " + attacker.get_special_name() + " activates! " + defender.get_name() + " suffers a -" + Math.floor(def * attacker.get_def_reduce_proc()) + " " + defense_stat + " penalty.<br>");
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
    combat_log += (attacker.get_name() + "'s " + attacker.get_special_name() + " activates, dealing +" + Math.floor(raw_atk * attacker.get_atk_mult_proc()) + " damage!<br>");
    dmg += Math.floor(raw_atk * attacker.get_atk_mult_proc());
    attacker_skill_procced = true;
  }

  // Handling for damage dealt to damage dealt conversion procs (Glimmer, etc.)
  if (attacker.get_dmg_mult_proc() > 0 && attacker.get_cooldown() == 0) {
    combat_log += (attacker.get_name() + "'s " + attacker.get_special_name() + " activates, dealing +" + Math.floor(dmg * attacker.get_dmg_mult_proc()) + " damage!<br>");
    dmg += Math.floor(dmg * attacker.get_dmg_mult_proc());
    attacker_skill_procced = true;
  }

  // Handling for damage taken to damage dealt conversion procs.
  if (attacker.get_dmg_taken_mult_proc() > 0 && attacker.get_cooldown() == 0) {
    combat_log += (attacker.get_name() + "'s " + attacker.get_special_name() + " activates, dealing +" + Math.floor((attacker.get_HP_max() - attacker.get_HP()) * attacker.get_dmg_taken_mult_proc()) + " damage!<br>");
    dmg += Math.floor((attacker.get_HP_max() - attacker.get_HP()) * attacker.get_dmg_taken_mult_proc());
    attacker_skill_procced = true;
  }

  // Handling for spd to damage conversion procs.
  if (attacker.get_spd_as_dmg_proc() > 0 && attacker.get_cooldown() == 0) {
    combat_log += (attacker.get_name() + "'s " + attacker.get_special_name() + " activates, dealing +" + Math.floor(attacker.calculate_spd(attacker_active, defender, true) * attacker.get_spd_as_dmg_proc()) + " damage!<br>");
    dmg += Math.floor(attacker.calculate_spd(attacker_active, defender, true) * attacker.get_spd_as_dmg_proc());
    attacker_skill_procced = true;
  }

  // Handling for res to damage conversion procs.
  if (attacker.get_res_as_dmg_proc() > 0 && attacker.get_cooldown() == 0) {
    combat_log += (attacker.get_name() + "'s " + attacker.get_special_name() + " activates, dealing +" + Math.floor(attacker.calculate_res(attacker_active, defender, true) * attacker.get_res_as_dmg_proc()) + " damage!<br>");
    dmg += Math.floor(attacker.calculate_res(attacker_active, defender, true) * attacker.get_res_as_dmg_proc());
    attacker_skill_procced = true;
  }

  // Handling for def to damage conversion procs.
  if (attacker.get_def_as_dmg_proc() > 0 && attacker.get_cooldown() == 0) {
    combat_log += (attacker.get_name() + "'s " + attacker.get_special_name() + " activates, dealing +" + Math.floor(attacker.calculate_def(attacker_active, defender, true) * attacker.get_def_as_dmg_proc()) + " damage!<br>");
    dmg += Math.floor(attacker.calculate_def(attacker_active, defender, true) * attacker.get_def_as_dmg_proc());
    attacker_skill_procced = true;
  }

  // If a heal-on-hit special is ready, set a flag for handling later (need to factor in any defensive specials first).
  if (attacker.get_heal_on_hit_proc() > 0 && attacker.get_cooldown() == 0) {
    // If a skill hasn't activated already (Aether, due to the order in which specials are activated by this function),
    // log the activation message.
    if (!attacker_skill_procced) {
      combat_log += (attacker.get_name() + "'s " + attacker.get_special_name() + " activates!<br>");
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
  // Apply bonus damage from effects like Giga Excalibur, which are assumed to be
  // unaffected by enemy defenses.
  dmg += attacker.get_excess_spd_to_dmg(defender, attacker_active);
  // Apply bonus damage from Light Brand, which is not affected by enemy defenses.
  dmg += attacker.get_light_brand_dmg_bonus(defender, attacker_active);

  // If the unit has a damage reduction skill compatible with the current
  // combat range off cooldown, activate and apply it.
  if (combat_range == 1 && defender.get_one_rng_reduce_proc() > 0 && defender.get_cooldown() == 0) {
    combat_log += (defender.get_name() + "'s " + defender.get_special_name() + " activates, reducing damage by " + (defender.get_one_rng_reduce_proc() * 100) + "%!<br>");
    mitigated_temp = Math.floor(dmg * defender.get_one_rng_reduce_proc());
    mitigated_dmg += mitigated_temp;
    dmg -= mitigated_temp;
    defender_skill_procced = true;
  }
  else if (combat_range == 2 && defender.get_two_rng_reduce_proc() > 0 && defender.get_cooldown() == 0) {
      combat_log += (defender.get_name() + "'s " + defender.get_special_name() + " activates, reducing damage by " + (defender.get_two_rng_reduce_proc() * 100) + "%!<br>");
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
    if (defender.get_missile_consec_hit_mitig() > 0 && (attacker.get_weap() == "RB" || attacker.get_weap() == "BB" || attacker.get_weap() == "GB" || attacker.get_weap() == "NB"
        || attacker.get_weap() == "RK" || attacker.get_weap() == "BK" || attacker.get_weap() == "GK" || attacker.get_weap() == "NK")) {
      combat_log += defender.get_name() + " receives " + (defender.get_missile_consec_hit_mitig() * 100) + "% less damage from consecutive hits from bows and daggers!<br>";
      mitigated_temp = Math.floor(dmg * defender.get_missile_consec_hit_mitig());
      mitigated_dmg += mitigated_temp;
      dmg -= mitigated_temp;
    }
    // 2-Range enemy consecutive hit mitigation (Crusader's Ward)
    if (defender.get_distant_consec_hit_mitig() > 0 && attacker.get_range() == 2) {
      combat_log += defender.get_name() + " receives " + (defender.get_distant_consec_hit_mitig() * 100) + "% less damage from consecutive hits from foes with a 2-range weapon!<br>";
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
    // Ranged Cav/Armor first hit mitigation (Thani)
    if (defender.get_thani_mitigation()
        && (attacker.get_type() == "C" || attacker.get_type() == "A")
        && (attacker.get_weap() == "RT" || attacker.get_weap() == "BT" || attacker.get_weap() == "GT"
        || attacker.get_weap() == "RK" || attacker.get_weap() == "BK" || attacker.get_weap() == "GK" || attacker.get_weap() == "NK"
        || attacker.get_weap() == "RB" || attacker.get_weap() == "BB" || attacker.get_weap() == "GB" || attacker.get_weap() == "NB" || attacker.get_weap() == "ST")) {
      combat_log += defender.get_name() + " receives " + (defender.get_thani_mitigation() * 100) + "% less damage from the first hit from ranged Cavalry or Armored enemies!<br>";
      mitigated_temp = Math.floor(dmg * defender.get_thani_mitigation());
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
    combat_log += (defender.get_name() + "'s " + defender.get_special_name() + " activates!<br>");
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
    combat_log += (attacker.get_name() + " heals up to " + Math.floor(Math.min(dmg, defender.get_HP()) * attacker.get_heal_on_hit_proc()) + " HP from " + attacker.get_special_name() + ", and has " + attacker.get_HP() + " HP remaining.<br>");
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
    if (defender.guard_applies() && attacker.get_special_name() != "(None)") {
      combat_log += defender.get_name() + "'s " + defender.get_guard_source() + " reduces the charge rate on " + attacker.get_name() + "'s " + attacker.get_special_name() + " by 1!<br>";
    }
    // The normal cooldown decrementation.
    else {
      attacker.decrement_cooldown();
    }
    // Extra cooldown decrementation for skill effects.
    // Heavy Blade & similar.
    if ((attacker.bonus_cd_applies(defender, attacker_active, true) > 0) && attacker.get_special_name() != "(None)") {
      combat_log += attacker.get_name() + " receives a +" + attacker.bonus_cd_applies(defender, attacker_active, true) + " charge rate on " + attacker.get_special_name() + "!<br>";
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
    if (attacker.guard_applies() && defender.get_special_name() != "(None)") {
      combat_log += attacker.get_name() + "'s " + attacker.get_guard_source() + " reduces the charge rate on " + defender.get_name() + "'s " + defender.get_special_name() + " by 1!<br>";
    }
    // The normal cooldown decrementation.
    else {
      defender.decrement_cooldown();
    }
    if ((defender.bonus_cd_applies(attacker, !attacker_active, false) > 0) && defender.get_special_name() != "(None)") {
      combat_log += defender.get_name() + " receives a +" + defender.bonus_cd_applies(attacker, !attacker_active, false) + " charge rate on " + defender.get_special_name() + "!<br>";
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
  */
}

// Input: A, B, or C Passive name.
// Output: File path for that skill's image.
function process_skill_path(input) {
  var output = "images/";
  for (var i = 0; i < input.length; i++) {
    if (input[i] == "'") {
      output += "\'";
    }
    else if (input[i] == "/" || input[i] == " ") {
      output += "_";
    }
    else if (input[i] == "+") {
      output += "Plus_";
    }
    else if (input[i] != "!") {
      output += input[i];
    }
  }
  output += ".png";

  return output;
}
// Input: Seal name.
// Output: File path for that seal's image.
function process_seal_path(input) {
  var output = "images/";
  var number_flag = false;
  var i = 0;
  for (; i < input.length; i++) {
    if (input[i] == "1" || input[i] == "2" || input[i] == "3") {
      number_flag = true;
      break;
    }
    if (input[i] == "'") {
      output += "\'";
    }
    else if (input[i] == "/" || input[i] == " ") {
      output += "_";
    }
    else if (input[i] == "+") {
      output += "Plus_";
    }
    else {
      output += input[i];
    }
  }

  // If a number was encountered, then it is either the final
  // number in the string, or the start of a 1/2/3-esque sequence.
  // Jump to the end of the string for the final number.
  if (number_flag) {
    output += input[input.length - 1];
  }

  output += ".png";

  return output;
}

function clean(input) {
  var output = "";

  for (var i = 0; i < input.length; i++) {
    if (input[i] == "'") {
      output += "&apos;";
    }
    else if (input[i] == '"') {
      output += "&quot;";
    }
    else if (input[i] == "&") {
      output += "&amp;";
    }
    else if (input[i] == "<") {
      output += "&lt;";
    }
    else if (input[i] == ">") {
      output += "&gt;";
    }
    else {
      output += input[i];
    }
  }

  return output;
}
