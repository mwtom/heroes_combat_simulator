// The Fighter class, a fusion of the base stats of a character
// and the stats & properties of their skills.
class Fighter {
  constructor(char, boon, bane, weap, refine, a, b, c, seal, special, summoner_support, bonus_unit, resplendent, merge_lv, dragonflowers, blessings) {
    // Load properties from the character.
    this.name = char.name;
    this.color = char.color;
    this.hp = this.calculate_stat(char.hp_base, char.hpGrowth, "neutral");
    this.atk = this.calculate_stat(char.atk_base, char.atkGrowth, "neutral");
    this.spd = this.calculate_stat(char.spd_base, char.spdGrowth, "neutral");
    this.def = this.calculate_stat(char.def_base, char.defGrowth, "neutral");
    this.res = this.calculate_stat(char.res_base, char.resGrowth, "neutral");
    this.hp_base = char.hp_base;
    this.atk_base = char.atk_base;
    this.spd_base = char.spd_base;
    this.def_base = char.def_base;
    this.res_base = char.res_base;
    if (char.n_lock == 1) {
      this.boon = "None";
      this.bane = "None";
    }
    else {
      this.boon = boon;
      this.bane = bane;
    }
    // Only calculate boon/bane if character is not neutral-locked, and the
    // selected boon is not the same as the selected bane.
    // Update lv. 40 stats (obvious reasons) AND base stats (merge calcs).
    if (char.n_lock != 1 && (boon != bane)) {
      switch (boon) {
        case "HP":
          this.hp = this.calculate_stat(char.hp_base, char.hpGrowth, "boon");
          this.hp_base += 1;
          break;
        case "Atk":
          this.atk = this.calculate_stat(char.atk_base, char.atkGrowth, "boon");
          this.atk_base += 1;
          break;
        case "Spd":
          this.spd = this.calculate_stat(char.spd_base, char.spdGrowth, "boon");
          this.spd_base += 1;
          break;
        case "Def":
          this.def = this.calculate_stat(char.def_base, char.defGrowth, "boon");
          this.def_base += 1;
          break;
        case "Res":
          this.res = this.calculate_stat(char.res_base, char.resGrowth, "boon");
          this.res_base += 1;
          break;
        // No default case, since "None" is a valid boon selection.
      }
      if (merge_lv <= 0) {
        switch (bane) {
          case "HP":
            this.hp = this.calculate_stat(char.hp_base, char.hpGrowth, "bane");
            this.hp_base -= 1;
            break;
          case "Atk":
            this.atk = this.calculate_stat(char.atk_base, char.atkGrowth, "bane");
            this.atk_base -= 1;
            break;
          case "Spd":
            this.spd = this.calculate_stat(char.spd_base, char.spdGrowth, "bane");
            this.spd_base -= 1;
            break;
          case "Def":
            this.def = this.calculate_stat(char.def_base, char.defGrowth, "bane");
            this.def_base -= 1;
            break;
          case "Res":
            this.res = this.calculate_stat(char.res_base, char.resGrowth, "bane");
            this.res_base -= 1;
            break;
          // No default case, since "None" is a valid bane selection.
        }
      }
    }

    // Apply Rank S Summoner Support stat bonuses.
    if (summoner_support) {
      this.hp += 5;
      this.atk += 2;
      this.spd += 2;
      this.def += 2;
      this.res += 2;
    }
    // Apply Resplendent stat bonuses.
    if (resplendent) {
      this.hp += 2;
      this.atk += 2;
      this.spd += 2;
      this.def += 2;
      this.res += 2;
    }
    // Apply Bonus Unit stat bonuses.
    if (bonus_unit) {
      this.hp += 10;
      this.atk += 4;
      this.spd += 4;
      this.def += 4;
      this.res += 4;
    }

    // Apply blessing bonuses.
    this.hp += blessings[0].hp_mod + blessings[1].hp_mod + blessings[2].hp_mod + blessings[3].hp_mod;
    this.atk += blessings[0].atk_mod + blessings[1].atk_mod + blessings[2].atk_mod + blessings[3].atk_mod;
    this.spd += blessings[0].spd_mod + blessings[1].spd_mod + blessings[2].spd_mod + blessings[3].spd_mod;
    this.def += blessings[0].def_mod + blessings[1].def_mod + blessings[2].def_mod + blessings[3].def_mod;
    this.res += blessings[0].res_mod + blessings[1].res_mod + blessings[2].res_mod + blessings[3].res_mod;

    var labels = ["hp", "atk", "spd", "def", "res"];
    var stats = [this.hp_base, this.atk_base, this.spd_base, this.def_base, this.res_base];
    var sorted_labels = this.two_array_sort(labels, stats);
    var j = 0;

    // If a merge level greater than 0 is specified, add stats accordingly.
    if (merge_lv > 0) {

      // If the unit does not have an asset, add 1 point to the first three stats in the sorted_labels array.
      if (boon == "None") {
        this.increment_stat(labels[0]);
        this.increment_stat(labels[1]);
        this.increment_stat(labels[2]);
      }

      for (var i = merge_lv; i > 0; i--) {
        if (j >= labels.length) {
          j = 0;
        }
        this.increment_stat(labels[j]);

        j += 1;
        if (j >= labels.length) {
          j = 0;
        }
        this.increment_stat(labels[j]);

        j += 1;
      }
    }

    j = 0;
    // Apply stat bonuses from dragonflowers.
    for (var i = dragonflowers; i > 0; i--) {
      if (j >= labels.length)
        j = 0;
      this.increment_stat(labels[j]);
      j++;
    }

    // set various fighter properties.
    this.weapon_type = char.weap;
    this.refinement = refine;
    this.movement_type = char.type;

    this.weapon = weap;
    this.a_skill = a;
    this.b_skill = b;
    this.c_skill = c;
    this.special = special;
    this.seal = seal;

    /* ********** ARRAYS FOR SKILL EFFECTS. *********** */

    // Stat bonuses and penalties.
    this.permanent_stat_boost_effects = new Array();
    this.permanent_stat_penalty_effects = new Array();
    this.flat_stat_boost_effects = new Array();
    this.scaled_stat_boost_effects = new Array
    this.stat_penalty_effects = new Array(); // Note: for combat debuffs, not field debuffs.
    this.scaled_stat_penalty_effects = new Array();
    this.phantom_effects = new Array();
    this.bonus_multiplier_effects = new Array();

    // Follow up guarantors and inhibitors.
    this.follow_up_guarantor_effects = new Array();
    this.follow_up_inhibit_effects = new Array();
    this.e_follow_up_inhibit_effects = new Array();

    // Special charge accelerators and inhibitors.
    this.special_charge_accelerator_effects = new Array();
    this.special_charge_inhibitor_effects = new Array();

    // Counterattack effects.
    this.counterattack_effects = new Array();
    this.counterattack_preventer_effects = new Array();
    this.e_counterattack_preventer_effects = new Array();

    // Additional damage effects
    this.bonus_damage_effects = new Array();
    this.damage_boost_effects = new Array();
    this.precombat_damage_effects = new Array();

    // Mitigation effects
    this.static_mitigation_effects = new Array();
    this.flat_percent_mitigation_effects = new Array();
    this.scaled_percent_mitigation_effects = new Array();
    this.flat_percent_precombat_mitigation_effects = new Array();
    this.scaled_percent_precombat_mitigation_effects = new Array();
    this.mitigation_mirror_effects = new Array();

    // Healing effects
    this.heal_on_hit_effects = new Array();

    // Atk multiplier effects
    this.weapon_eff_effects = new Array();
    this.mov_eff_effects = new Array();
    this.weapon_eff_susceptible_effects = new Array();
    this.triangle_amplifier_effects = new Array();
    this.e_triangle_reverser_effects = new Array();

    // Combat order effects
    this.vantage_effects = new Array();
    this.desperation_effects = new Array();
    this.inverse_desperation_effects = new Array();

    // Neutralization effects
    this.neutralize_bonus_effects = new Array();
    this.neutralize_penalty_effects = new Array();
    this.neutralize_triangle_amplifier_effects = new Array();
    //this.neutralize_e_triangle_amplifier_effects = new Array();
    this.neutralize_weap_eff_effects = new Array();
    this.neutralize_mov_eff_effects = new Array();
    this.neutralize_adaptive_damage_effects = new Array();
    this.neutralize_follow_up_guarantor_effects = new Array();
    this.neutralize_follow_up_inhibitor_effects = new Array();
    this.neutralize_counterattack_preventer_effects = new Array();
    this.neutralize_scaled_mitigation_effects = new Array();
    this.neutralize_special_charge_inhibitor_effects = new Array();
    this.neutralize_special_charge_accelerator_effects = new Array();
    this.neutralize_combat_order_alteration_effects = new Array();
    this.neutralize_wrathful_staff_effects = new Array();
    this.neutralize_external_skills_effects = new Array();

    // Misc. effects
    this.activate_special_effect = null;
    this.adaptive_damage_effects = new Array();
    this.targets_effects = new Array();
    this.pulse_effects = new Array();
    this.stat_ploy_effects = new Array();
    this.panic_ploy_effects = new Array();
    this.inflict_guard_effects = new Array();
    this.endure_effects = new Array();
    this.wrathful_staff_effects = new Array();
    this.colorless_wta_effects = new Array();
    this.extra_movement_effects = new Array();
    this.strike_twice_effects = new Array();

    /* ******* END OF ARRAYS FOR SKILL EFFECTS. ******* */

    this.refine_hp_mod = 0;
    this.refine_atk_mod = 0;
    this.refine_spd_mod = 0;
    this.refine_def_mod = 0;
    this.refine_res_mod = 0;

    // Set up the unit's special type and cooldown.
    this.special_type = special.activation_type;
    this.cooldown_max = special.cooldown_max + weap.cooldown_mod + a.cooldown_mod + b.cooldown_mod + c.cooldown_mod;
    this.cooldown = this.cooldown_max;
    // The start-of-turn cooldown. NOT the start-of-combat cooldown.
    this.cooldown_start = this.cooldown;

    if (this.refinement != "None")
      this.process_weapon_refinement();
    this.process_skill_effects();

    // set default values for field buffs.
    this.atk_buff = 0;
    this.spd_buff = 0;
    this.def_buff = 0;
    this.res_buff = 0;

    // set default values for penalties.
    this.atk_penalty = 0;
    this.spd_penalty = 0;
    this.def_penalty = 0;
    this.res_penalty = 0;

    // default values for assumed variables, to be set by the user.
    // field buffs
    this.assumed_atk_buff = 0;
    this.assumed_spd_buff = 0;
    this.assumed_def_buff = 0;
    this.assumed_res_buff = 0;

    // combat buffs
    this.assumed_atk_boost = 0;
    this.assumed_spd_boost = 0;
    this.assumed_def_boost = 0;
    this.assumed_res_boost = 0;

    // penalties
    this.assumed_atk_penalty = 0;
    this.assumed_spd_penalty = 0;
    this.assumed_def_penalty = 0;
    this.assumed_res_penalty = 0;

    // damage_dealt is a logging variable, used to report amount of damage dealt
    // by the unit during combat (for % HP calculations).
    this.damage_dealt = 0;

    // start_HP helps determine if skills such as breakers or wrathful staff apply.
    this.start_hp = 0;

    // counter for allies 1, 2, and 3 spaces away.
    this.adjacent_allies = 0;
    this.two_space_allies = 0;
    this.three_space_allies = 0;

    // Flags related to during-combat events.
    this.range = this.weapon.range;
    this.targeting = ""; // "def" or "res", depending on what the weapon targets.
    this.initiating = false;
    this.attacking = false;
    this.first_hit = false;
    this.hitting_consecutively = false;
    this.following_up = false;
    this.special_activating = false;
    this.control = "";

    this.can_counterattack = false;
    this.can_follow_up = false;
    this.desperation_active = false;
    this.vantage_active = false;
    this.has_triangle_amplifier = false;
    this.deals_adaptive_damage = false;
    this.deals_effective_damage = false;
    this.targets_def = false;
    this.targets_res = false;
    this.strikes_twice = false;
    this.prevents_counterattack = false;
    this.prevents_e_counterattack = false;
    this.transformed = false;
    this.triangle_status = "n"; // "a" = unit has triangle advantage, "d" = disadvantage, "n" = neutral
    this.has_colorless_wta = false;
    this.mitigation_mirror_active = false;
    this.inhibits_special_charge = false;
    this.accelerates_special_charge = false;
    this.wrathful_staff_active = false;
    this.skill_miracle_activated = false;
    this.atk_buff_neutralized = false;
    this.spd_buff_neutralized = false;
    this.def_buff_neutralized = false;
    this.res_buff_neutralized = false;
    this.atk_penalty_neutralized = false;
    this.spd_penalty_neutralized = false;
    this.def_penalty_neutralized = false;
    this.res_penalty_neutralized = false;

    this.neutralizes_wrathful_staff = false;
    this.neutralizes_adaptive_damage = false;
    this.neutralizes_counterattack_preventers = false;
    this.neutralizes_follow_up_guarantors = false;
    this.neutralizes_follow_up_inhibitors = false;
    this.neutralizes_special_charge_accelerators = false;
    this.neutralizes_special_charge_inhibitors = false;
    this.neutralizes_weapon_effective = false;
    this.neutralizes_movement_effective = false;
    this.neutralizes_triangle_amplifier = false;
    this.neutralizes_scaled_mitigation = false;
    this.neutralizes_external_skills = false;
    this.reverses_triangle_amplifier = false;

    // The unit's permanent stats (includes base stats and stats from skills, but not field or combat buffs and penalties).
    this.max_hp = 0;
    this.permanent_atk = 0;
    this.permanent_spd = 0;
    this.permanent_def = 0;
    this.permanent_res = 0;

    // The unit's printed stats (includes base stats, stats from skills, and field buffs and penalties).
    this.printed_atk = 0;
    this.printed_spd = 0;
    this.printed_def = 0;
    this.printed_res = 0;

    // The unit's combat stats.
    this.combat_atk = 0;
    this.combat_spd = 0;
    this.combat_def = 0;
    this.combat_res = 0;
    this.phantom_spd = 0;
    this.phantom_res = 0;

    // The unit's effective attack.
    this.effective_atk = 0;

    // Positive Status effects
    this.bonus_mov_active = false;
    this.bonus_doubler_active = false;
    this.divine_fang_active = false;
    this.neutralize_dragon_armor_effective_active = false;
    this.dominance_active = false;
    this.desperation_status_active = false;

    // Negative Status effects
    this.panic_active = false;
    this.guard_active = false;
    this.isolation_active = false;
    this.gravity_active = false;
    this.flash_active = false;
    this.trilemma_active = false;

    // External Support flags
    this.geirskogul_support_active = false;
    this.inf_breath_support_active = false;
    this.inf_rush_support_active = false;
    this.inf_flash_support_active = false;
    this.inf_hexblade_support_active = false;
    this.cg_stacks = 0;
    this.dg_stacks = 0;

    // Weapon and movement types that the Fighter deals effective datamge to
    this.weapon_effective = new Array();
    this.movement_effective = new Array();
    this.weapon_effective_susceptible = new Array();

    // User Input variables
    this.weap_user_number_input = 0;
    this.weap_user_boolean_input = false;
    this.transformed_input = false;
    this.a_user_number_input = 0;
    this.a_user_boolean_input = false;
    this.b_user_number_input = 0;
    this.b_user_boolean_input = false;
    this.c_user_number_input = 0;
    this.c_user_boolean_input = false;
    this.seal_user_number_input = 0;
    this.seal_user_boolean_input = false;
    this.spec_user_number_input = 0;
    this.spec_user_boolean_input = false;

    // Damage the unit is dealing to the enemy.
    this.damage = 0;

    // next_atk_bonus_dmg is a variable used to handle damage that is carried over
    // from a previous action (ex. Ice Mirror is a defensive special that grants damage
    // equal to the damage mitigated from a foe's prior attack).
    this.next_atk_bonus_dmg = 0;

    this.buffs_negated = false;
  }
}
// Sorts arr2 in descending order, swapping the elements of arr1 in the same pattern.
// Returns arr1. Uses simple insertion sort, as it is used as an assistant for
// merge handling. i.e. base stats are sorted, then added to in order.
Fighter.prototype.two_array_sort = function (arr1, arr2) {
  var temp_arr1, temp_arr2, j;
  for (var i = 0; i < arr2.length; i++) {
    temp_arr1 = arr1[i];
    temp_arr2 = arr2[i];
    j = i - 1;
    while (j >= 0 && arr2[j] < temp_arr2) {
      arr2[j + 1] = arr2[j];
      arr1[j + 1] = arr1[j];
      j -= 1;
    }
    arr1[j + 1] = temp_arr1;
    arr2[j + 1] = temp_arr2;
  }

  return arr1;
};
// Function for boon/bane stat calculations
Fighter.prototype.calculate_stat = function(stat_base, stat_Growth, case_type) {
  // Formula is:
  // [base stat] + Math.floor(39 * Math.floor([growth rate] * (1 + .7 * (rarity - 3))))
  // This simulator assumes a rarity of 5. Note that boon stats mean +1 base point/GP, and
  // bane stats mean -1 base point/GP. Finally, growth rate is ((GP + 4) * 5)%
  var base, growth, growth_rate;
  switch (case_type) {
    case "boon":
      base = stat_base + 1;
      growth = stat_Growth + 5;
      break;
    case "bane":
      base = stat_base - 1;
      growth = stat_Growth - 5;
      break;
    default:
      base = stat_base;
      growth = stat_Growth;
  }
  growth_rate = Math.floor(growth * (1 + (.07 * (5 - 3)))) / 100;
  return (base + Math.floor(39 * growth_rate));
};
Fighter.prototype.increment_stat = function (stat) {
  switch (stat) {
    case "hp":
      this.hp += 1;
      break;
    case "atk":
      this.atk += 1;
      break;
    case "spd":
      this.spd += 1;
      break;
    case "def":
      this.def += 1;
      break;
    default:
      this.res += 1;
  }
};
// Applies refinement stats and skills (skills only applied for staff weapons).
Fighter.prototype.process_weapon_refinement = function () {
  if (this.weapon.type == "ST") {
    if (this.refinement == "D")
      this.e_counterattack_preventer_effects.push(new Effect("e_counterattack_preventer", "[0]", this.get_weapon_name(), "e_counterattack_preventer"));
    if (this.refinement == "W")
      this.wrathful_staff_effects.push(new Effect("wrathful_staff", "[0]", this.get_weapon_name(), "wrathful_staff"));
  }
  else if (this.weapon.range == 1) {
    switch (this.refinement) {
      case "Eff":
        this.refine_hp_mod = 3;
        break;
      case "Atk":
        this.refine_hp_mod += 5;
        this.refine_atk_mod += 2;
        break;
      case "Spd":
        this.refine_hp_mod += 5;
        this.refine_spd_mod += 3;
        break;
      case "Def":
        this.refine_hp_mod += 5;
        this.refine_def_mod += 4;
        break;
      case "Res":
        this.refine_hp_mod += 5;
        this.refine_res_mod += 4;
        break;
    }
  }
  else {
    switch (this.refinement) {
      case "Eff":
        break;
      case "Atk":
        this.refine_hp_mod += 2;
        this.refine_atk_mod += 1;
        break;
      case "Spd":
        this.refine_hp_mod += 2;
        this.refine_spd_mod += 2;
        break;
      case "Def":
        this.refine_hp_mod += 2;
        this.refine_def_mod += 3;
        break;
      case "Res":
        this.refine_hp_mod += 2;
        this.refine_res_mod += 3;
        break;
    }
  }
};
// Adds each skill effect to the appropriate array.
Fighter.prototype.process_skill_effects = function () {
  var skills = new Array(this.special, this.a_skill, this.b_skill, this.c_skill, this.seal);
  //console.log(skills);

  if (this.refinement == "Eff")
    this.add_to_array(this.weapon.skill_desc_refine_eff, this.get_weapon_name());
  else if (this.refinement != "None")
    this.add_to_array(this.weapon.skill_desc_refine_base, this.get_weapon_name());
  else
    this.add_to_array(this.weapon.skill_definition, this.get_weapon_name());

  for (var i = 0; i < skills.length; i++) {
    if (skills[i].skill_definition != "empty")
      this.add_to_array(skills[i].skill_definition, skills[i].name);
  }
};
// Processes the skill description strings and sorts effects into the proper arrays.
Fighter.prototype.add_to_array = function (sd, n) {
  var reader = "";
  var identifier = "";
  var effects = new Array();
  var condition_string = "";
  var i = 1;

  // Run until the end of the string is reached.
  for (; i < sd.length; i++) {
    // If a ";" is encountered, then the condition string has been reached. Run until the end of
    // the condition string, set the "conditions" property of all effects in the effect array,
    // and sort all effects into the appropriate places. Then clear out the effects array and
    // condition string in preparation for the next set of effects (if any).
    if (sd[i] == ";") {
      if (reader != "") {
        effects.push(new Effect(reader, "", n, reader));
        reader = "";
      }

      for (i += 1; sd[i] != "}"; i++)
        condition_string += sd[i];

      effects.forEach((item) => {
        item.conditions = condition_string;
        this.sort_effect(item);
      });

      effects = new Array();
      condition_string = "";
    }
    // If a "(" is encountered, then an identifier has been fully loaded into the reader.
    // Set the identifier, then load the rest of the effect into the reader and push it to
    // the effects array. Clear out the reader and identifier in preparation for the next
    // effect.
    else if (sd[i] == "(") {
      identifier = reader;
      var unclosed_parentheses = 1;
      reader += sd[i];
      for (i += 1; unclosed_parentheses != 0; i++) {
        reader += sd[i];
        if (sd[i] == "(")
          unclosed_parentheses += 1;
        else if (sd[i] == ")")
          unclosed_parentheses -= 1;
      }

      effects.push(new Effect(reader, "", n, identifier));

      reader = "";
      identifier = "";

      // sd[i] is now either "," or ";". i is incremented at the end of the conditional statements,
      // so if a ";" is encountered, rewind i by 1 so it is caught on the loop's next iteration. There
      // is no need to rewind i for a ",", as the function's state is already set up for the next effect.
      if (sd[i] == ";")
        i -= 1;
    }
    // If a "," is encountered, then an identifier has been fully loaded into the reader, and is
    // in fact identical to the effect string. Push the effect to the effects array, and clear out the
    // reader in preparation for the next effect.
    else if (sd[i] == ",") {
      effects.push(new Effect(reader, "", n, reader));
      reader = "";
    }
    else if (sd[i] != "{")
      reader += sd[i];
  }
};

// Inserts an effect in to the appropriate array based on the "identifier" property.
Fighter.prototype.sort_effect = function (effect) {
  switch (effect.identifier) {
    case "permanent_stat_boost":
      this.permanent_stat_boost_effects.push(effect);
      break;
    case "permanent_stat_penalty":
      this.permanent_stat_penalty_effects.push(effect);
      break;
    case "accelerate_special_trigger":
      this.cooldown_max -= 1;
      this.cooldown -= 1;
      this.cooldown_start -= 1;
      break;
    case "flat_stat_boost":
      this.flat_stat_boost_effects.push(effect);
      break;
    case "scaled_stat_boost":
      this.scaled_stat_boost_effects.push(effect);
      break;
    case "bonus_damage":
      this.bonus_damage_effects.push(effect);
      break;
    case "damage_boost":
      this.damage_boost_effects.push(effect);
      break;
    case "precombat_damage":
      this.precombat_damage_effects.push(effect);
      break;
    case "stat_penalty":
      this.stat_penalty_effects.push(effect);
      break;
    case "scaled_stat_penalty":
      this.scaled_stat_penalty_effects.push(effect);
      break;
    case "static_mitigation":
      this.static_mitigation_effects.push(effect);
      break;
    case "flat_percent_mitigation":
      this.flat_percent_mitigation_effects.push(effect);
      break;
    case "scaled_percent_mitigation":
      this.scaled_percent_mitigation_effects.push(effect);
      break;
    case "flat_percent_precombat_mitigation":
      this.flat_percent_precombat_mitigation_effects.push(effect);
      break;
    case "scaled_percent_precombat_mitigation":
      this.scaled_percent_precombat_mitigation_effects.push(effect);
      break;
    case "heal_on_hit":
      this.heal_on_hit_effects.push(effect);
      break;
    case "weap_eff":
      this.weapon_eff_effects.push(effect);
      break;
    case "mov_eff":
      this.mov_eff_effects.push(effect);
      break;
    case "weap_eff_susceptible":
      this.weapon_eff_susceptible_effects.push(effect);
      break;
    case "pulse":
      this.pulse_effects.push(effect);
      break;
    case "panic_ploy":
      this.panic_ploy_effects.push(effect);
      break;
    case "stat_ploy":
      this.stat_ploy_effects.push(effect);
      break;
    case "inflict_guard":
      this.inflict_guard_effects.push(effect);
      break;
    case "phantom":
      this.phantom_effects.push(effect);
      break;
    case "neutralize_bonuses":
      this.neutralize_bonus_effects.push(effect);
      break;
    case "neutralize_penalties":
      this.neutralize_penalty_effects.push(effect);
      break;
    case "neutralize_weapon_effective":
      this.neutralize_weap_eff_effects.push(effect);
      break;
    case "neutralize_movement_effective":
      this.neutralize_mov_eff_effects.push(effect);
      break;
    case "multiply_bonus":
      this.bonus_multiplier_effects.push(effect);
      break;
    case "activate_special":
      this.activate_special_effect = effect;
      break;
    case "triangle_amplifier":
      this.triangle_amplifier_effects.push(effect);
      break;
    case "adaptive_damage":
      this.adaptive_damage_effects.push(effect);
      break;
    case "targets":
      this.targets_effects.push(effect);
      break;
    case "counterattack":
      this.counterattack_effects.push(effect);
      break;
    case "strike_twice":
      this.strike_twice_effects.push(effect);
      break;
    case "follow_up_guarantor":
      this.follow_up_guarantor_effects.push(effect);
      break;
    case "follow_up_inhibitor":
      this.follow_up_inhibit_effects.push(effect);
      break;
    case "e_follow_up_inhibitor":
      this.e_follow_up_inhibit_effects.push(effect);
      break;
    case "special_charge_accelerator":
      this.special_charge_accelerator_effects.push(effect);
      break;
    case "special_charge_inhibitor":
      this.special_charge_inhibitor_effects.push(effect);
      break;
    case "counterattack_preventer":
      this.counterattack_preventer_effects.push(effect);
      break;
    case "e_counterattack_preventer":
      this.e_counterattack_preventer_effects.push(effect);
      break;
    case "desperation":
      this.desperation_effects.push(effect);
      break;
    case "inverse_desperation":
      this.inverse_desperation_effects.push(effect);
      break;
    case "vantage":
      this.vantage_effects.push(effect);
      break;
    case "endure":
      this.endure_effects.push(effect);
      break;
    case "endure_with_flag":
      this.endure_effects.push(effect);
      break;
    case "colorless_wta":
      this.colorless_wta_effects.push(effect);
      break;
    case "e_triangle_reverser":
      this.e_triangle_reverser_effects.push(effect);
      break;
    case "wrathful_staff":
      this.wrathful_staff_effects.push(effect);
      break;
    case "mitigation_mirror":
      this.mitigation_mirror_effects.push(effect);
      break;
    case "extra_movement":
      this.extra_movement_effects.push(effect);
      break;
    case "neutralize_adaptive_damage":
      this.neutralize_adaptive_damage_effects.push(effect);
      break;
    case "neutralize_follow_up_guarantors":
      this.neutralize_follow_up_guarantor_effects.push(effect);
      break;
    case "neutralize_follow_up_inhibitors":
      this.neutralize_follow_up_inhibitor_effects.push(effect);
      break;
    case "neutralize_counterattack_preventers":
      this.neutralize_counterattack_preventer_effects.push(effect);
      break;
    case "neutralize_triangle_amplifier":
      this.neutralize_triangle_amplifier_effects.push(effect);
      break;
    case "neutralize_scaled_mitigation":
      this.neutralize_scaled_mitigation_effects.push(effect);
      break;
    case "neutralize_special_charge_inhibitors":
      this.neutralize_special_charge_inhibitor_effects.push(effect);
      break;
    case "neutralize_special_charge_accelerators":
      this.neutralize_special_charge_accelerator_effects.push(effect);
      break;
    case "neutralize_combat_order_alteration":
      this.neutralize_combat_order_alteration_effects.push(effect);
      break;
    case "neutralize_wrathful_staff":
      this.neutralize_wrathful_staff_effects.push(effect);
      break;
    case "neutralize_external_skills":
      this.neutralize_external_skills_effects.push(effect);
      break;
    default:
      console.log("Unexpected skill identifier encountered: " + effect.identifier);
  }
};

/* ******* CONDITION EVALUATION ******* */

Fighter.prototype.eval_conditions = function(conditions, e) {
  //console.log("eval_conditions called on " + conditions);

  var reader = "";
  var i = 1;

  var condition_groups = new Array();
  var operators = new Array();

  for (; i < conditions.length - 1; i++) {
    if (conditions[i] == "&" || conditions[i] == "|") {
      operators.push(conditions[i]);
      i += 2;
    }

    for (; conditions[i] != "]" && i < conditions.length - 1; i++)
      reader += conditions[i];

    condition_groups.push(reader);
    reader = "";
  }

  if (condition_groups.length == 1)
    return this.eval_condition_group(condition_groups[0], e);

  var result = this.eval_condition_group(condition_groups[0], e);
  var j = 1;
  for (var i = 0; i < operators.length; i++) {
    if (operators[i] == "&")
      result = result && this.eval_condition_group(condition_groups[j], e);
    else
      result = result || this.eval_condition_group(condition_groups[j], e);
    j++;
  }

  return result;
};

Fighter.prototype.eval_condition_group = function(condition_group, e) {
  //console.log("eval_condition_group called on " + condition_group);

  var reader = "";
  var i = 0;

  for (; condition_group[i] != "&" && condition_group[i] != "|" && i < condition_group.length; i++)
    reader += condition_group[i];

  if (i == condition_group.length)
    return this.eval_condition(reader, e);
  else if (condition_group[i] == "&")
    return this.eval_condition(reader, e) && this.eval_condition_group(condition_group.substring(i + 1, condition_group.length), e);
  else
    return this.eval_condition(reader, e) || this.eval_condition_group(condition_group.substring(i + 1, condition_group.length), e);
};

Fighter.prototype.eval_condition = function(condition, e) {
  //console.log("eval_condition called on " + condition);

  var reader = "";
  var i = 0;

  for (; condition[i] != "(" && i < condition.length; i++)
    reader += condition[i];

  switch(reader) {
    case "not":
      return !this.eval_condition(condition.substring(4, condition.length - 1), e);
    case "comp":
      return this.comparison_evaluator(condition.substring(i + 1, condition.length - 1), e);
    case "hp_thresh":
      return this.hp_threshold_evaluator(condition.substring(i + 1, condition.length - 1), e, "self");
    case "e_hp_thresh":
      return this.hp_threshold_evaluator(condition.substring(i + 1, condition.length - 1), e, "enemy");
    case "boolean_check":
      return this.boolean_evaluator(condition.substring(i + 1, condition.length - 1), e);
    case "state_check":
      return this.state_evaluator(condition.substring(i + 1, condition.length - 1), e);
    case "weap_check":
      return this.weap_check(condition.substring(i + 1, condition.length - 1));
    case "mov_check":
      return this.mov_check(condition.substring(i + 1, condition.length - 1));
    case "e_weap_check":
      return e.weap_check(condition.substring(i + 1, condition.length - 1));
    case "e_mov_check":
      return e.mov_check(condition.substring(i + 1, condition.length - 1));
    case "e_weap_eff_check":
      return this.e_weap_eff_check(condition.substring(i + 1, condition.length - 1), e);
    case "e_mov_eff_check":
      return this.e_mov_eff_check(condition.substring(i + 1, condition.length - 1), e);
    case "eff_susc_check":
      return this.eff_susc_check(condition.substring(i + 1, condition.length - 1), e);
//    case "user_boolean_input":
//      return this.user_boolean_input_check(condition.substring(i + 1, condition.length - 1));
    case "0":
      return true;
    default:
      return false;
  }
};

Fighter.prototype.comparison_evaluator = function(comparison_string, e) {
  //console.log("comparison_evaluator called on " + comparison_string);

  var term1 = "";
  var operator = "";
  var term2 = "";

  var comparison_operators = ["=", ">", "<"];

  var i = 0;

  for (; !comparison_operators.includes(comparison_string[i]) && i < comparison_string.length; i++)
    term1 += comparison_string[i];
  for (; comparison_operators.includes(comparison_string[i]) && i < comparison_string.length; i++)
    operator += comparison_string[i];
  for (; i < comparison_string.length; i++)
    term2 += comparison_string[i];

  switch(operator) {
    case "=":
      return this.parse_num_expr(term1, e, true) == this.parse_num_expr(term2, e, true);
    case ">":
      return this.parse_num_expr(term1, e, true) > this.parse_num_expr(term2, e, true);
    case "<":
      return this.parse_num_expr(term1, e, true) < this.parse_num_expr(term2, e, true);
    case ">=":
      return this.parse_num_expr(term1, e, true) >= this.parse_num_expr(term2, e, true);
    case "<=":
      return this.parse_num_expr(term1, e, true) <= this.parse_num_expr(term2, e, true);
    default:
      return false;
  }
};

/* Function hp_threshold_evaluator
 * Inputs:
 *  -threshold_string: [String] A string in the format [Threshold],[Comparison Operator].
 *  -e:                [Fighter] The opposing fighter.
 * Outputs:
 *  -[Boolean]: Whether the unit meets the threshold requirement.
 */
Fighter.prototype.hp_threshold_evaluator = function(threshold_string, e, mode) {
  //console.log("hp_threshold_evaluator called on " + threshold_string);

  var threshold = "";
  var operator = "";
  var type = "";
  var i = 0;

  // Load the threshold and operator into variables.
  for (; threshold_string[i] != ","; i++)
    threshold += threshold_string[i];
  for (i += 1; threshold_string[i] != ","; i++)
    operator += threshold_string[i];
  for (i += 1; i < threshold_string.length; i++)
    type += threshold_string[i];

  // Evaluate the hp percentage.
  if (type == "start" && mode == "self")
    hp_percentage = this.start_hp / this.max_hp * 100;
  else if (type == "now" && mode == "self")
    hp_percentage = this.hp / this.max_hp * 100;
  else if (type == "start" && mode == "enemy")
    hp_percentage = e.start_hp / e.max_hp * 100;
  else if (type == "now" && mode == "enemy")
    hp_percentage = e.hp / e.max_hp * 100;

  switch(operator) {
    case ">":
      return hp_percentage > parseInt(threshold);
    case "<":
      return hp_percentage < parseInt(threshold);
    case ">=":
      return hp_percentage >= parseInt(threshold);
    case "<=":
      return hp_percentage <= parseInt(threshold);
    case "=":
      return hp_percentage == parseInt(threshold);
    default:
      return false;
  }
};

/* Function boolean_evaluator
 * Inputs:
 *   -boolean_string: [String] A string in the format [Boolean value],[True or False]
 *   -e:              [Fighter] The opposing fighter.
 * Outputs:
 *   -[Boolean]: Whether the [Boolean value] matches [True or False].
 */
Fighter.prototype.boolean_evaluator = function(boolean_string, e) {
  //console.log("boolean_evaluator called on " + boolean_string);

  var boolean_value = "";
  var comparison_value = "";
  var i = 0;

  var evaluated_boolean = false;

  for (; boolean_string[i] != ","; i++)
    boolean_value += boolean_string[i];
  for (i += 1; i < boolean_string.length; i++)
    comparison_value += boolean_string[i];

  switch(boolean_value) {
    case "initiating":
      evaluated_boolean = this.initiating;
      break;
    case "attacking":
      evaluated_boolean = this.attacking;
      break;
    case "special_activating":
      evaluated_boolean = this.special_activating;
      break;
    case "has_penalty":
      evaluated_boolean = this.has_penalty();
      break;
    case "has_active_penalty":
      evaluated_boolean = this.has_active_penalty();
      break;
    case "has_neutralized_penalty":
      evaluated_boolean = this.has_neutralized_penalty();
      break;
    case "has_positive_status":
      evaluated_boolean = this.has_positive_status();
      break;
    case "has_negative_status":
      evaluated_boolean = this.has_negative_status();
      break;
    case "has_extra_movement":
      evaluated_boolean = this.bonus_mov_active;
      break;
    case "e_has_penalty":
      evaluated_boolean = e.has_penalty();
      break;
    case "e_has_active_penalty":
      evaluated_boolean = e.has_active_penalty();
      break;
    case "e_has_negative_status":
      evaluated_boolean = e.has_negative_status();
      break;
    case "e_has_extra_movement":
      evaluated_boolean = e.bonus_mov_active;
      break;
    case "e_can_counterattack":
      evaluated_boolean = e.can_counterattack;
      break;
    case "weap_boolean_input":
      evaluated_boolean = this.weap_user_boolean_input;
      break;
    case "a_boolean_input":
      evaluated_boolean = this.a_user_boolean_input;
      break;
    case "b_boolean_input":
      evaluated_boolean = this.b_user_boolean_input;
      break;
    case "c_boolean_input":
      evaluated_boolean = this.c_user_boolean_input;
      break;
    case "seal_boolean_input":
      evaluated_boolean = this.seal_user_boolean_input;
      break;
    case "spec_boolean_input":
      evaluated_boolean = this.spec_user_boolean_input;
      break;
    case "is_transformed":
      evaluated_boolean = this.transformed_input;
      break;
    case "in_combat":
      evaluated_boolean = in_combat;
      break;
    case "skill_miracle_flag":
      evaluated_boolean = this.skill_miracle_activated;
      break;
    default:
      console.log("A check has been requested for an invalid boolean_value: " + boolean_value);
      return false;
  }

  if (comparison_value == "true")
    return evaluated_boolean;
  else
    return !evaluated_boolean;
};

Fighter.prototype.state_evaluator = function(state_string, e) {
  //console.log("state_evaluator called on " + state_string);

  var state_variable = "";
  var state_requirement = "";
  var i = 0;

  for (; state_string[i] != ","; i++)
    state_variable += state_string[i];
  for (i += 1; i < state_string.length; i++)
    state_requirement += state_string[i];

  switch (state_variable) {
    case "special_type":
      return this.special_type == state_requirement;
    case "hit_type":
      if (state_requirement == "first")
        return this.first_hit;
      else if (state_requirement == "consecutive")
        return this.hitting_consecutively;
      else if (state_requirement == "follow-up")
        return this.following_up;
      else
        return false;
    case "e_hit_type":
      if (state_requirement == "first")
        return e.first_hit;
      else if (state_requirement == "consecutive")
        return e.hitting_consecutively;
      else if (state_requirement == "follow-up")
        return e.following_up;
      else
        return false;
    case "control":
      if (state_requirement == "player")
        return this.control == "player";
      else if (state_requirement == "enemy")
        return this.control == "enemy";
      else
        return this.control == phase;
    case "targeting":
      return this.targeting == state_requirement;
    case "triangle_status":
      return this.triangle_status == state_requirement;
    default:
      return false;
  }
};

Fighter.prototype.weap_check = function (weap_string) {
  var reader = "";
  var weapon_list = [];
  var i = 0;
  var weapon_found = false;

  for (; i < weap_string.length; i++) {
    if (weap_string[i] == ",") {
      weapon_list.push(reader);
      reader = "";
    }
    else if (i == (weap_string.length - 1)) {
      weapon_list.push(reader + weap_string[i]);
      reader = "";
    }
    else
      reader += weap_string[i];
  }

  weapon_list.forEach((item) => {
    if ((item == "P" && physical_weapons.includes(this.weapon_type)) || (item == "M" && magical_weapons.includes(this.weapon_type)) ||
        (item == "1rng" && one_range_weapons.includes(this.weapon_type)) || (item == "2rng" && two_range_weapons.includes(this.weapon_type)))
      weapon_found = true;
    else if (this.weapon_type == item)
      weapon_found = true;
  });

  return weapon_found;
};

Fighter.prototype.mov_check = function (mov_string) {
  var reader = "";
  var mov_list = [];
  var i = 0;

  for (; i < mov_string.length; i++) {
    if (mov_string[i] == ",") {
      mov_list.push(reader);
      reader = "";
    }
    else if (i == (mov_string.length - 1)) {
      mov_list.push(reader + mov_string[i]);
      reader = "";
    }
    else
      reader += mov_string[i];
  }

  return mov_list.includes(this.movement_type);
};

Fighter.prototype.e_weap_eff_check = function(effective_string, e) {
  //console.log("e_weap_eff_check called on " + effective_string);

  var reader = "";
  var eff_list = [];
  var i = 0;

  for (; i < effective_string.length; i++) {
    if (effective_string[i] == ",") {
      eff_list.push(reader);
      reader = "";
    }
    else if (i == (effective_string.length -1)) {
      eff_list.push(reader + effective_string[i]);
      reader = "";
    }
    else
      reader += effective_string[i];
  }

  for (i = 0; i < eff_list.length; i++) {
    if (e.weapon_effective.includes(eff_list[i]))
      return true;
  }

  return false;
};

Fighter.prototype.e_mov_eff_check = function(effective_string, e) {
  //console.log("e_mov_eff_check called on " + effective_string);

  var reader = "";
  var eff_list = [];
  var i = 0;

  for (; i < effective_string.length; i++) {
    if (effective_string[i] == ",") {
      eff_list.push(reader);
      reader = "";
    }
    else if (i == (effective_string.length -1)) {
      eff_list.push(reader + effective_string[i]);
      reader = "";
    }
    else
      reader += effective_string[i];
  }

  for (i = 0; i < eff_list.length; i++) {
    if (this.movement_effective.includes(eff_list[i]))
      return true;
  }

  return false;
};

Fighter.prototype.eff_susc_check = function (susc_string) {
  var reader = "";
  var susc_list = [];
  var i = 0;

  for (; i < susc_string.length; i++) {
    if (susc_string[i] == ",") {
      susc_list.push(reader);
      reader = "";
    }
    else if (i == (susc_string.length - 1)) {
      susc_list.push(reader + susc_string[i]);
      reader = "";
    }
    else
      reader += susc_string[i];
  }

  for (i = 0; i < susc_list.length; i++) {
    if (this.weapon_effective_susceptible.includes(susc_list[i]))
      return true;
  }

  return false;
};

/* Function parse_num_expr
 * Inputs:
 *  -num_expr: [String] The numeric expression to process.
 *  -e:        [Fighter] The opposing fighter.
 *  -skl_comp: [Boolean] Whether the function is being called on a skill comparison.
 * Outputs:
 *  -[Integer] The value of the numeric expression.
 */
Fighter.prototype.parse_num_expr = function(num_expr, e, skl_comp) {
  //console.log("parse_num_expr called on " + num_expr);

  // reader holds characters from the string, which help identify what to do next.
  var reader = "";

  // # of found open & close parentheses as the string is processed.
  // Used for parenthesis matching.
  var open_parentheses_found = 0;
  var close_parentheses_found = 0;

  // Characters that are considered (mathematic) operators
  var operators = ["+", "-", "*", "/", "%"];

  // String indexes.
  var i = 0, j = 0, k = 0;

  // Log characters into the reader until the first "(", an operator,
  // or the end of the string, are encountered.
  for (; num_expr[i] != "(" && !operators.includes(num_expr[i]) && i < num_expr.length; i++)
    reader += num_expr[i];

  // Base case: if no parentheses or operators were encountered, the
  // function is dealing with a basic number or number substitution.
  if (i == num_expr.length)
    return this.process_numeric_value(reader, e, skl_comp);

  // If the reader's value is "max", the function is dealing with a "max" operation.
  // If the max operation is the last portion of the string, it should be processed and returned.
  // Otherwise, it should be processed, and its value should be pre-pended to the rest of the string.
  // The new string should be evaluated with parse_num_expr.
  if (reader == "max") {
    reader = "";
    open_parentheses_found = 1;

    for (j = i + 1; open_parentheses_found != close_parentheses_found; j++) {
      if (num_expr[j] == "(")
        open_parentheses_found += 1;
      else if (num_expr[j] == ")")
        close_parentheses_found += 1;
    }

    // NOTE: j is now either the length of the string, or num_expr[j] is an operator.

    // Retrieve the comparison value for the max function, which ends at j - 2, and starts after the "," character.
    // (Note that the comparison value is read in backwards)
    for (k = j - 2; num_expr[k] != ","; k--)
      reader = num_expr[k] + reader;

    if (j == num_expr.length)
      return Math.max(this.parse_num_expr(num_expr.substring(i + 1, k), e), parseFloat(reader), skl_comp);
    else
      return this.parse_num_expr(Math.max(this.parse_num_expr(num_expr.substring(i + 1, k), e, skl_comp), parseFloat(reader)).toString() + num_expr.substring(j, num_expr.length), e, skl_comp);
  }

  // If the reader's value is "min", the function is dealing with a "min" operation.
  // This should be handled similarly to the "max" operation, but the absolute value should
  // be taken, as negative numbers will break the function.
  if (reader == "min") {
    reader = "";
    open_parentheses_found = 1;

    for (j = i + 1; open_parentheses_found != close_parentheses_found; j++) {
      if (num_expr[j] == "(")
        open_parentheses_found += 1;
      else if (num_expr[j] == ")")
        close_parentheses_found += 1;
    }

    // NOTE: j is now either the length of the string, or num_expr[j] is an operator.

    // Retrieve the comparison value for the min function, which ends at j - 2, and starts after the "," character.
    // (Note that the comparison value is read in backwards)
    for (k = j - 2; num_expr[k] != ","; k--)
      reader = num_expr[k] + reader;

    if (j == num_expr.length) {
      return Math.abs(Math.min(this.parse_num_expr(num_expr.substring(i + 1, k), e, skl_comp), parseFloat(reader)));
    }
    else {
      return this.parse_num_expr(Math.abs(Math.min(this.parse_num_expr(num_expr.substring(i + 1, k), e, skl_comp), parseFloat(reader))).toString() + num_expr.substring(j, num_expr.length), e, skl_comp);
    }
  }

  // If an operator was encountered, then the reader must contain a number or basic number substitution.
  // Process the reader as a numeric value, and then perform the appropriate math operation using the result
  // of the reader's processing as the first term, and the rest of the string as the second term.
  if (operators.includes(num_expr[i])) {
    switch (num_expr[i]) {
      case "+":
        return this.process_numeric_value(reader, e, skl_comp) + this.parse_num_expr(num_expr.substring(i + 1, num_expr.length), e, skl_comp);
      case "-":
        return this.process_numeric_value(reader, e, skl_comp) - this.parse_num_expr(num_expr.substring(i + 1, num_expr.length), e, skl_comp);
      case "*":
        return Math.floor(this.process_numeric_value(reader, e, skl_comp) * this.parse_num_expr(num_expr.substring(i + 1, num_expr.length), e), skl_comp);
      case "/":
        return Math.floor(this.process_numeric_value(reader, e, skl_comp) / this.parse_num_expr(num_expr.substring(i + 1, num_expr.length), e), skl_comp);
      case "%":
        //console.log(Math.floor(this.process_numeric_value(reader, e) % this.parse_num_expr(num_expr.substring(i + 1, num_expr.length), e)));
        return Math.floor(this.process_numeric_value(reader, e, skl_comp) % this.parse_num_expr(num_expr.substring(i + 1, num_expr.length), e), skl_comp);
      default:
        return 0;
    }
  }

  // If the first character was "(", then the function is dealing with an enclosed term.
  // The enclosed term should be extracted, and evaluated with parse_num_expr.
  // If the term is the last part of the numeric expression string, no further action is needed.
  // Otherwise, the result should be pre-pended to the rest of the string and evaluated with parse_num_expr.
  if (reader == "") {
    i += 1;
    for (open_parentheses_found = 1; open_parentheses_found != close_parentheses_found; i++) {
      if (num_expr[i] == "(")
        open_parentheses_found += 1;
      if (num_expr[i] == ")")
        close_parentheses_found += 1;
    }

    if (i == num_expr.length)
      return this.parse_num_expr(num_expr.substring(1, num_expr.length - 1), e, skl_comp);
    else
      return this.parse_num_expr(this.parse_num_expr(num_expr.substring(1, i - 1), e, skl_comp).toString() + num_expr.substring(i, num_expr.length), e, skl_comp);
  }
};

Fighter.prototype.process_numeric_value = function(reader, e, skl_comp) {
  //console.log("process_numeric_value called on " + reader);
  switch (reader) {
    case "max_hp":
      return this.max_hp;
    case "hp":
      return this.hp;
    case "start_hp":
      return this.start_hp;
    case "e_start_hp":
      return e.start_hp;
    case "e_max_hp":
      return e.max_hp;
    case "e_hp":
      return e.hp;
    case "cd":
      return this.cooldown;
    case "cd_max":
      return this.cooldown_max;
    case "cd_start":
      return this.cooldown_start;
    case "e_cd":
      return e.get_cooldown();
    case "e_cd_max":
      return e.cooldown_max;
    case "e_cd_start":
      return e.cooldown_start;
    case "printed_atk":
      return this.printed_atk;
    case "printed_spd":
      return skl_comp ? (this.printed_spd + this.phantom_spd) : this.printed_spd;
    case "printed_def":
      return this.printed_res;
    case "printed_res":
      return skl_comp ? (this.printed_res + this.phantom_res) : this.printed_res;
    case "permanent_atk":
      return this.permanent_atk;
    case "permanent_spd":
      return this.permanent_spd;
    case "permanent_def":
      return this.permanent_def;
    case "permanent_res":
      return skl_comp ? (this.permanent_res + this.phantom_res) : this.permanent_res;
    case "e_permanent_atk":
      return e.get_permanent_atk();
    case "e_permanent_spd":
      return e.get_permanent_spd();
    case "e_permanent_def":
      return e.get_permanent_def();
    case "e_permanent_res":
      return skl_comp ? (e.get_permanent_res() + e.get_phantom_res()) : e.get_permanent_res();
    case "e_printed_atk":
      return e.get_printed_atk();
    case "e_printed_spd":
      return skl_comp ? (e.get_printed_spd() + e.get_phantom_spd()) : e.get_printed_spd();
    case "e_printed_def":
      return e.get_printed_def();
    case "e_printed_res":
      return skl_comp ? (e.get_printed_res() + e.get_phantom_res()) : e.get_printed_res();
    case "combat_atk":
      return in_combat ? this.combat_atk : this.printed_atk;
    case "combat_spd":
      if (in_combat)
        return skl_comp ? (this.combat_spd + this.phantom_spd) : this.combat_spd;
      else
        return skl_comp ? (this.printed_spd + this.phantom_spd) : this.printed_spd;
    case "combat_def":
      return in_combat ? this.combat_def : this.printed_def;
    case "combat_res":
      if (in_combat)
        return skl_comp ? (this.combat_res + this.phantom_res) : this.combat_res;
      else
        return skl_comp ? (this.printed_res + this.phantom_res) : this.printed_res;
    case "combat_comparison_spd":
      return this.combat_spd + this.phantom_spd;
    case "printed_comparison_spd":
        return this.printed_spd + this.phantom_spd;
    case "e_combat_atk":
      return in_combat ? e.get_combat_atk() : e.get_printed_atk();
    case "e_combat_spd":
      if (in_combat)
        return skl_comp ? (e.get_combat_spd() + e.get_phantom_spd()) : e.get_combat_spd();
      else
        return skl_comp ? (e.get_printed_spd() + e.get_phantom_spd()) : e.get_printed_spd();
    case "e_combat_def":
      return in_combat ? e.get_combat_def() : e.get_printed_def();
    case "e_combat_res":
      if (in_combat)
        return skl_comp ? (e.get_combat_res() + e.get_phantom_res()) : e.get_combat_res();
      else
        return skl_comp ? (e.get_printed_res() + e.get_phantom_res()) : e.get_printed_res();
    case "e_combat_comparison_spd":
      return e.get_combat_spd() + e.get_phantom_spd();
    case "e_printed_comparison_spd":
      return e.get_printed_spd() + e.get_phantom_spd();
    case "atk_buff":
      return this.get_buff_value("atk");
    case "spd_buff":
      return this.get_buff_value("spd");
    case "def_buff":
      return this.get_buff_value("def");
    case "res_buff":
      return this.get_buff_value("res");
    case "e_atk_buff":
      return e.get_buff_value("atk");
    case "e_spd_buff":
      return e.get_buff_value("spd");
    case "e_def_buff":
      return e.get_buff_value("def");
    case "e_res_buff":
      return e.get_buff_value("res");
    case "atk_penalty":
      return this.get_penalty_value("atk");
    case "spd_penalty":
      return this.get_penalty_value("spd");
    case "def_penalty":
      return this.get_penalty_value("def");
    case "res_penalty":
      return this.get_penalty_value("res");
    case "total_atk_penalty":
      return this.get_penalty_value("atk") + Math.abs(Math.min(this.get_buff_value("atk"), 0));
    case "total_spd_penalty":
      return this.get_penalty_value("spd") + Math.abs(Math.min(this.get_buff_value("spd"), 0));
    case "total_def_penalty":
      return this.get_penalty_value("def") + Math.abs(Math.min(this.get_buff_value("def"), 0));
    case "total_res_penalty":
      return this.get_penalty_value("res") + Math.abs(Math.min(this.get_buff_value("res"), 0));
    case "e_atk_penalty":
      return e.get_penalty_value("atk");
    case "e_spd_penalty":
      return e.get_penalty_value("spd");
    case "e_def_penalty":
      return e.get_penalty_value("def");
    case "e_res_penalty":
      return e.get_penalty_value("res");
    case "e_total_atk_penalty":
      return e.get_penalty_value("atk") + Math.abs(Math.min(e.get_buff_value("atk"), 0));
    case "e_total_spd_penalty":
      return e.get_penalty_value("spd") + Math.abs(Math.min(e.get_buff_value("spd"), 0));
    case "e_total_def_penalty":
      return e.get_penalty_value("def") + Math.abs(Math.min(e.get_buff_value("def"), 0));
    case "e_total_res_penalty":
      return e.get_penalty_value("res") + Math.abs(Math.min(e.get_buff_value("res"), 0));
    case "weap_number_input":
      return this.weap_user_number_input;
    case "a_number_input":
      return this.a_user_number_input;
    case "b_number_input":
      return this.b_user_number_input;
    case "c_number_input":
      return this.c_user_number_input;
    case "seal_number_input":
      return this.seal_user_number_input;
    case "spec_number_input":
      return this.spec_user_number_input;
    case "damage":
      return this.damage;
    case "e_damage":
      return e.damage;
    case "turn":
      return turn_number; // Global Variable
    case "combat_range":
      if (this.initiating)
        return this.range;
      else
        return e.get_range();
    case "cooldown_count":
      return this.cooldown;
    case "buff_sum":
      return Math.max(this.get_buff_value("atk"), 0) + Math.max(this.get_buff_value("spd"), 0) + Math.max(this.get_buff_value("def"), 0) + Math.max(this.get_buff_value("res"), 0);
    case "e_buff_sum":
      return Math.max(e.get_buff_value("atk"), 0) + Math.max(e.get_buff_value("spd"), 0) + Math.max(e.get_buff_value("def"), 0) + Math.max(e.get_buff_value("res"), 0);
    case "penalty_sum":
      return this.get_penalty_value("atk") + this.get_penalty_value("spd") + this.get_penalty_value("def") + this.get_penalty_value("res") +
             Math.abs(Math.min(this.get_buff_value("atk"), 0)) + Math.abs(Math.min(this.get_buff_value("spd"), 0)) + Math.abs(Math.min(this.get_buff_value("def"), 0)) + Math.abs(Math.min(this.get_buff_value("res"), 0));
    case "e_penalty_sum":
      return e.get_penalty_value("atk") + e.get_penalty_value("spd") + e.get_penalty_value("def") + e.get_penalty_value("res") +
             Math.abs(Math.min(e.get_buff_value("atk"), 0)) + Math.abs(Math.min(e.get_buff_value("spd"), 0)) + Math.abs(Math.min(e.get_buff_value("def"), 0)) + Math.abs(Math.min(e.get_buff_value("res"), 0));
    case "adj":
      return this.adjacent_allies;
    case "e_adj":
      return e.adjacent_allies;
    case "two_space":
      return this.two_space_allies + this.adjacent_allies;
    case "e_two_space":
      return e.two_space_allies + e.adjacent_allies;
    case "three_space":
      return this.three_space_allies + this.two_space_allies + this.adjacent_allies;
    case "e_three_space":
      return e.three_space_allies + e.two_space_allies + e.adjacent_allies;
    default:
      return parseFloat(reader);
  }
};

// Checks the existence of a stat penalty on the unit.
Fighter.prototype.has_penalty = function() {
  return ((this.atk_penalty > 0 || this.atk_buff < 0 || (this.atk_buff > 0 && this.panic_active)) && !this.atk_penalty_neutralized) ||
         ((this.spd_penalty > 0 || this.spd_buff < 0 || (this.spd_buff > 0 && this.panic_active)) && !this.spd_penalty_neutralized) ||
         ((this.def_penalty > 0 || this.def_buff < 0 || (this.def_buff > 0 && this.panic_active)) && !this.def_penalty_neutralized) ||
         ((this.res_penalty > 0 || this.res_buff < 0 || (this.res_buff > 0 && this.panic_active)) && !this.res_penalty_neutralized);
};
Fighter.prototype.has_neutralized_penalty = function () {
  return this.atk_penalty_neutralized || this.spd_penalty_neutralized || this.def_penalty_neutralized || this.res_penalty_neutralized;
};
Fighter.prototype.has_positive_status = function () {
  return this.bonus_doubler_active || this.bonus_mov_active || this.divine_fang_active || this.neutralize_dragon_armor_effective_active || this.dominance_active || this.desperation_status_active;
};
Fighter.prototype.has_negative_status = function() {
  return this.panic_active || this.guard_active || this.isolation_active || this.gravity_active || this.flash_active || this.trilemma_active;
};

Fighter.prototype.get_buff_value = function (stat) {
  var value;
  var is_neutralized;
  var penalty_neutralized;

  switch (stat) {
    case "atk":
      value = this.atk_buff;
      is_neutralized = this.atk_buff_neutralized;
      penalty_neutralized = this.atk_penalty_neutralized;
      break;
    case "spd":
      value = this.spd_buff;
      is_neutralized = this.spd_buff_neutralized;
      penalty_neutralized = this.spd_penalty_neutralized;
      break;
    case "def":
      value = this.def_buff;
      is_neutralized = this.def_buff_neutralized;
      penalty_neutralized = this.def_penalty_neutralized;
      break;
    case "res":
      value = this.res_buff;
      is_neutralized = this.res_buff_neutralized;
      penalty_neutralized = this.res_penalty_neutralized;
      break;
  }

  if (this.panic_active && value > 0) {
    if (penalty_neutralized)
      return 0;

    return value * -1;
  }
  else if (is_neutralized && value > 0) {
      return 0;
  }
  else if (value < 0) {
    if (penalty_neutralized)
        return 0;

    return value;
  }
  else
    return value;
};
// Retrieves value of an active stat penalty.
Fighter.prototype.get_penalty_value = function (stat) {
  var value;
  var is_neutralized = false;

  switch (stat) {
    case "atk":
      value = this.atk_penalty;
      is_neutralized = this.atk_penalty_neutralized;
      break;
    case "spd":
      value = this.spd_penalty;
      is_neutralized = this.spd_penalty_neutralized;
      break;
    case "def":
      value = this.def_penalty;
      is_neutralized = this.def_penalty_neutralized;
      break;
    case "res":
      value = this.res_penalty;
      is_neutralized = this.res_penalty_neutralized;
      break;
  }

  if (is_neutralized)
      return 0;

  return value;
};

/* ******* END OF CONDITION EVALUATION ******* */

// Calculates the unit's permanent stats.
Fighter.prototype.calculate_permanent_stats = function () {
  this.max_hp = this.hp + this.weapon.hp_mod + this.a_skill.hp_mod + this.seal.hp_mod + this.refine_hp_mod;
  this.hp = this.max_hp;
  this.permanent_atk = this.atk + this.weapon.atk_mod + this.a_skill.atk_mod + this.seal.atk_mod + this.refine_atk_mod;
  this.permanent_spd = this.spd + this.weapon.spd_mod + this.a_skill.spd_mod + this.seal.spd_mod + this.refine_spd_mod;
  this.permanent_def = this.def + this.weapon.def_mod + this.a_skill.def_mod + this.seal.def_mod + this.refine_def_mod;
  this.permanent_res = this.res + this.weapon.res_mod + this.a_skill.res_mod + this.seal.res_mod + this.refine_res_mod;

  for (var i = 0; i < this.permanent_stat_boost_effects.length; i++)
    if (this.eval_conditions(this.permanent_stat_boost_effects[i].conditions, null))
      this.process_permanent_boost(this.permanent_stat_boost_effects[i].effect);
  for (var i = 0; i < this.permanent_stat_penalty_effects.length; i++)
    if (this.eval_conditions(this.permanent_stat_penalty_effects[i].conditions, null))
      this.process_permanent_penalty(this.permanent_stat_penalty_effects[i].effect);
};
Fighter.prototype.process_permanent_boost = function (effect_string) {
  var stat = "";
  var value = "";
  var i = 21;

  for (; effect_string[i] != ","; i++)
    stat += effect_string[i];
  for (i += 1; i < effect_string.length - 1; i++)
    value += effect_string[i];

  switch (stat) {
    case "permanent_atk":
      this.permanent_atk += parseInt(value);
      break;
    case "permanent_spd":
      this.permanent_spd += parseInt(value);
      break;
    case "permanent_def":
      this.permanent_def += parseInt(value);
      break;
    case "permanent_res":
      this.permanent_res += parseInt(value);
      break;
  }
};
Fighter.prototype.process_permanent_penalty = function (effect_string) {
  var stat = "";
  var value = "";
  var i = 23;

  for (; effect_string[i] != ","; i++)
    stat += effect_string[i];
  for (i += 1; i < effect_string.length - 1; i++)
    value += effect_string[i];

  switch (stat) {
    case "permanent_atk":
      this.permanent_atk -= parseInt(value);
      break;
    case "permanent_spd":
      this.permanent_spd -= parseInt(value);
      break;
    case "permanent_def":
      this.permanent_def -= parseInt(value);
      break;
    case "permanent_res":
      this.permanent_res -= parseInt(value);
      break;
  }
};
// Calculates the unit's printed stats.
Fighter.prototype.calculate_printed_stats = function () {
  this.printed_atk = this.permanent_atk + this.get_buff_value("atk") - this.get_penalty_value("atk");
  this.printed_spd = this.permanent_spd + this.get_buff_value("spd") - this.get_penalty_value("spd");
  this.printed_def = this.permanent_def + this.get_buff_value("def") - this.get_penalty_value("def");
  this.printed_res = this.permanent_res + this.get_buff_value("res") - this.get_penalty_value("res");
};
// Base combat stats are the sum of the printed stats and user-specified combat buffs.
Fighter.prototype.calculate_base_combat_stats = function () {
  this.combat_atk = this.permanent_atk + this.get_buff_value("atk") + this.assumed_atk_boost - this.get_penalty_value("atk");
  this.combat_spd = this.permanent_spd + this.get_buff_value("spd") + this.assumed_spd_boost - this.get_penalty_value("spd");
  this.combat_def = this.permanent_def + this.get_buff_value("def") + this.assumed_def_boost - this.get_penalty_value("def");
  this.combat_res = this.permanent_res + this.get_buff_value("res") + this.assumed_res_boost - this.get_penalty_value("res");
};
// Apply user-specified values for field buffs and penalties.
Fighter.prototype.apply_assumed_values = function () {
  this.atk_buff = this.assumed_atk_buff;
  this.spd_buff = this.assumed_spd_buff;
  this.def_buff = this.assumed_def_buff;
  this.res_buff = this.assumed_res_buff;

  this.atk_penalty = this.assumed_atk_penalty;
  this.spd_penalty = this.assumed_spd_penalty;
  this.def_penalty = this.assumed_def_penalty;
  this.res_penalty = this.assumed_res_penalty;
};
// Reduces HP without KOing (Poison Strike, Deathly Dagger, etc.)
Fighter.prototype.reduce_hp = function(value) {
  this.hp -= value;
  if (this.hp <= 0) {
    this.hp = 1;
  }
};
Fighter.prototype.apply_damage = function (damage) {
  this.hp -= damage;
  if (this.hp < 0)
    this.hp = 0;
};
// Revives a unit, resetting everything to default values (overridden by user input when applicable).
Fighter.prototype.revive = function() {
  this.hp = this.max_hp;
  this.reset_cooldown();
  this.apply_assumed_values();
  this.reset_flags();
  this.remove_external_effects();
  this.damage_dealt = 0;

};
// Decrements the skill cooldown timer.
Fighter.prototype.decrement_cooldown = function() {
  if (this.cooldown > 0)
    this.cooldown -= 1;
};
// Resets the skill cooldown timer.
Fighter.prototype.reset_cooldown = function() {
  this.cooldown = this.cooldown_max;
};
Fighter.prototype.reset_flags = function () {
  this.targeting = ""; // "def" or "res", depending on what the weapon targets.
  this.initiating = false;
  this.attacking = false;
  this.first_hit = false;
  this.hitting_consecutively = false;
  this.following_up = false;
  this.special_activating = false;

  this.can_counterattack = false;
  this.can_follow_up = false;
  this.desperation_active = false;
  this.vantage_active = false;
  this.has_triangle_amplifier = false;
  this.deals_adaptive_damage = false;
  this.deals_effective_damage = false;
  this.targets_def = false;
  this.targets_res = false;
  this.strikes_twice = false;
  this.prevents_counterattack = false;
  this.prevents_e_counterattack = false;
  this.transformed = false;
  this.triangle_status = "n"; // "a" = unit has triangle advantage, "d" = disadvantage, "n" = neutral
  this.has_colorless_wta = false;
  this.mitigation_mirror_active = false;
  this.inhibits_special_charge = false;
  this.accelerates_special_charge = false;
  this.wrathful_staff_active = false;
  this.skill_miracle_activated = false;
  this.atk_buff_neutralized = false;
  this.spd_buff_neutralized = false;
  this.def_buff_neutralized = false;
  this.res_buff_neutralized = false;
  this.atk_penalty_neutralized = false;
  this.spd_penalty_neutralized = false;
  this.def_penalty_neutralized = false;
  this.res_penalty_neutralized = false;

  this.neutralizes_wrathful_staff = false;
  this.neutralizes_adaptive_damage = false;
  this.neutralizes_counterattack_preventers = false;
  this.neutralizes_follow_up_guarantors = false;
  this.neutralizes_follow_up_inhibitors = false;
  this.neutralizes_special_charge_accelerators = false;
  this.neutralizes_special_charge_inhibitors = false;
  this.neutralizes_weapon_effective = false;
  this.neutralizes_movement_effective = false;
  this.neutralizes_triangle_amplifier = false;
  this.neutralizes_scaled_mitigation = false;
  this.neutralizes_external_skills = false;
  this.reverses_triangle_amplifier = false;

  // Positive Status effects
  this.bonus_doubler_active = false;
  this.bonus_mov_active = false;
  this.divine_fang_active = false;
  this.neutralize_dragon_armor_effective_active = false;
  this.dominance_active = false;
  this.desperation_status_active = false;

  // Negative Status effects
  this.panic_active = false;
  this.guard_active = false;
  this.isolation_active = false;
  this.gravity_active = false;
  this.flash_active = false;
  this.trilemma_active = false;

  // External Support flags
  this.geirskogul_support_active = false;
  this.inf_breath_support_active = false;
  this.inf_rush_support_active = false;
  this.inf_flash_support_active = false;
  this.inf_hexblade_support_active = false;
  this.cg_stacks = 0;
  this.dg_stacks = 0;

  // The unit's printed stats (includes base stats, stats from skills, and field buffs and penalties).
  this.printed_atk = 0;
  this.printed_spd = 0;
  this.printed_def = 0;
  this.printed_res = 0;

  // The unit's combat stats.
  this.combat_atk = 0;
  this.combat_spd = 0;
  this.combat_def = 0;
  this.combat_res = 0;
  this.phantom_spd = 0;
  this.phantom_res = 0;

  // The unit's effective attack.
  this.effective_atk = 0;
};
Fighter.prototype.remove_external_effects = function () {
  this.splice_external_effects_from_array(this.special_charge_accelerator_effects);
  this.splice_external_effects_from_array(this.flat_stat_boost_effects);
  this.splice_external_effects_from_array(this.adaptive_damage_effects);
  this.splice_external_effects_from_array(this.weapon_eff_effects);
  this.splice_external_effects_from_array(this.neutralize_weap_eff_effects);
  this.splice_external_effects_from_array(this.neutralize_mov_eff_effects);
  this.splice_external_effects_from_array(this.bonus_damage_effects);
  this.splice_external_effects_from_array(this.desperation_effects);
};
Fighter.prototype.splice_external_effects_from_array = function (arr) {
  for (var i = 0; i < arr.length; i++) {
    if (arr[i].identifier == "external") {
      arr.splice(i, 1);
      i--;
    }
  }
};
// Adds the value of a numeric expression to the unit's Phantom Spd.
Fighter.prototype.add_phantom_stat = function (effect_string, e) {
  //"phantom(", user_combat_stat, ",", numeric_expression, ")"
  var stat = "";
  var value_string = "";
  var i;

  // The first 8 characters of the effect_string are "phantom("
  for (i = 8; effect_string[i] != ","; i++)
    stat += effect_string[i];
  for (i += 1; i < effect_string.length - 1; i++)
    value_string += effect_string[i];

  if (stat == "spd")
    this.phantom_spd += this.parse_num_expr(value_string, e, false);
  if (stat == "res")
    this.phantom_res += this.parse_num_expr(value_string, e, false);
};
// Populates the effective damage arrays.
Fighter.prototype.apply_eff_damage_effects = function () {
  for (var i = 0; i < this.weapon_eff_effects.length; i++)
    this.add_to_eff_array(this.weapon_eff_effects[i].effect, "weapon");
  for (var i = 0; i < this.mov_eff_effects.length; i++)
    this.add_to_eff_array(this.mov_eff_effects[i].effect, "movment");
  for (var i = 0; i < this.weapon_eff_susceptible_effects.length; i++)
    this.add_to_susc_array(this.weapon_eff_susceptible_effects[i].effect);
};
Fighter.prototype.add_to_eff_array = function (effect_string, type) {
//weapon_effective		= "weap_eff(", weapon_type, { ",", weapon_type }, ")"
//movement_effective		= "mov_eff(", move_type, { ",", move_type }, ")"
  var reader = "";
  var i;
  if (type == "weapon")
    i = 9;
  else
    i = 8;

  for (; i < effect_string.length; i++) {
    if (effect_string[i] == "," || i == effect_string.length - 1) {
      if (type == "weapon")
        this.weapon_effective.push(reader);
      else
        this.movement_effective.push(reader);
      reader = "";
    }
    else
      reader += effect_string[i];
  }
};
Fighter.prototype.add_to_susc_array = function (effect_string) {
  var reader = "";
  // The first 21 characters of effect_string are "weap_eff_susceptible(".
  var i = 21;

  for (; i < effect_string.length; i++) {
    if (effect_string[i] == "," || i == effect_string.length - 1) {
      this.weapon_effective_susceptible.push(reader);
      reader = "";
    }
    else
      reader += effect_string[i];
  }
};
// Applies a stat ploy effect to the unit, if it is greater than or equal to the current penalty for that stat.
// Returns a string detailing the action taken.
Fighter.prototype.apply_stat_ploy = function (ploy_string) {
  var reader = "";
  var i = 10;
  var stat = "";
  var value = "";
  var value_int = 0;
  var return_string = "";

  var stat_penalties = new Array();
  var result_string = "";

  for (; i < ploy_string.length; i++) {
    for (; ploy_string[i] != ","; i++)
      stat += ploy_string[i];
    for (i += 1; ploy_string[i] != "&" && i != ploy_string.length - 1; i++)
      value += ploy_string[i];

    value_int = parseInt(value);

    switch (stat) {
      case "highest":
        if ((this.printed_atk - 15) >= this.printed_spd && (this.printed_atk - 15) >= this.printed_def && (this.printed_atk - 15) >= this.printed_res) {
          if (this.atk_penalty < value_int) {
            this.atk_penalty = value_int;
            stat_penalties.push(new Stat_Boost(value_int, "Atk"));
          }
        }
        if (this.printed_spd >= (this.printed_atk - 15) && this.printed_spd >= this.printed_def && this.printed_spd >= this.printed_res) {
          if (this.spd_penalty < value_int) {
            this.spd_penalty = value_int;
            stat_penalties.push(new Stat_Boost(value_int, "Spd"));
          }
        }
        if (this.printed_def >= (this.printed_atk - 15) && this.printed_def >= this.printed_spd && this.printed_def >= this.printed_res) {
          if (this.def_penalty < value_int) {
            this.def_penalty = value_int;
            stat_penalties.push(new Stat_Boost(value_int, "Def"));
          }
        }
        if (this.printed_res >= (this.printed_atk - 15) && this.printed_res >= this.printed_spd && this.printed_res >= this.printed_def) {
          if (this.res_penalty < value_int) {
            this.res_penalty = value_int;
            stat_penalties.push(new Stat_Boost(value_int, "Res"));
          }
        }
        break;
      case "e_atk_penalty":
        if (this.atk_penalty < value_int) {
          this.atk_penalty = value_int;
          stat_penalties.push(new Stat_Boost(value_int, "Atk"));
        }
        break;
      case "e_spd_penalty":
        if (this.spd_penalty < value_int) {
          this.spd_penalty = value_int;
          stat_penalties.push(new Stat_Boost(value_int, "Spd"));
        }
        break;
      case "e_def_penalty":
        if (this.def_penalty < value_int) {
          this.def_penalty = value_int;
          stat_penalties.push(new Stat_Boost(value_int, "Def"));
        }
        break;
      case "e_res_penalty":
        if (this.res_penalty < value_int) {
          this.res_penalty = value_int;
          stat_penalties.push(new Stat_Boost(value_int, "Res"));
        }
        break;
    }

    stat = "";
    value = "";
  }

  if (stat_penalties.length > 0)
    result_string += "-" + stat_penalties[0].value + " " + stat_penalties[0].stat;
  for (var j = 1; j < stat_penalties.length; j++) {
    result_string += "/-" + stat_penalties[j].value + " " + stat_penalties[j].stat;
  }

  return result_string;
};
Fighter.prototype.apply_flat_stat_boost = function (effect_string, e) {
  var stat = "";
  var value_string = "";
  var stat_boosts = new Array();
  var result_string = "";
  // The first 16 characters of the effect_string are "flat_stat_boost()"
  var i = 16;

  for (; i < effect_string.length; i++) {
    for (; effect_string[i] != ","; i++)
      stat += effect_string[i];
    for (i += 1; effect_string[i] != "&" && i != effect_string.length - 1; i++)
      value_string += effect_string[i];

    var value = this.parse_num_expr(value_string, e, false);

    switch (stat) {
      case "combat_atk":
        this.combat_atk += value;
        stat_boosts.push(new Stat_Boost(value, "Atk"));
        break;
      case "combat_spd":
        this.combat_spd += value;
        stat_boosts.push(new Stat_Boost(value, "Spd"));
        break;
      case "combat_def":
        this.combat_def += value;
        stat_boosts.push(new Stat_Boost(value, "Def"));
        break;
      case "combat_res":
        this.combat_res += value;
        stat_boosts.push(new Stat_Boost(value, "Res"));
        break;
    }

    stat = "";
    value_string = "";
  }

  if (stat_boosts.length > 0)
    result_string += "+" + stat_boosts[0].value + " " + stat_boosts[0].stat;
  for (var j = 1; j < stat_boosts.length; j++) {
    result_string += "/+" + stat_boosts[j].value + " " + stat_boosts[j].stat;
  }

  return result_string;
};
Fighter.prototype.apply_scaled_stat_boost = function (effect_string, e) {
  var stat = "";
  var base_value_string = "";
  var scale_factor_string = "";
  var max_string = "";
  var stat_boosts = new Array();
  var result_string = "";

  var base_value = 0;
  var scale_factor = 0;
  var max = 0;

  var value = 0;

  // The first 18 characters are "scaled_stat_boost("
  var i = 18;
  for (; i < effect_string.length; i++) {
    for (; effect_string[i] != ","; i++)
      stat += effect_string[i];
    for (i += 1; effect_string[i] != ";"; i++)
      base_value_string += effect_string[i];
    for (i += 1; effect_string[i] != ","; i++)
      scale_factor_string += effect_string[i];
    for (i += 5; effect_string[i] != "&" && i != effect_string.length - 1; i++)
      max_string += effect_string[i];

    base_value = this.parse_num_expr(base_value_string, e, false);
    scale_factor = this.parse_num_expr(scale_factor_string, e, false);
    if (max_string != "none") {
      max = parseInt(max_string);
      value = Math.floor(Math.min((base_value * scale_factor), max));
    }
    else
      value = Math.floor(base_value * scale_factor);

    switch (stat) {
      case "combat_atk":
        this.combat_atk += value;
        stat_boosts.push(new Stat_Boost(value, "Atk"));
        break;
      case "combat_spd":
        this.combat_spd += value;
        stat_boosts.push(new Stat_Boost(value, "Spd"));
        break;
      case "combat_def":
        this.combat_def += value;
        stat_boosts.push(new Stat_Boost(value, "Def"));
        break;
      case "combat_res":
        this.combat_res += value;
        stat_boosts.push(new Stat_Boost(value, "Res"));
        break;
      default:
        console.log("Encountered invalid stat string when evaluating combat buffs: " + stat);
    }

    stat = "";
    base_value_string = "";
    scale_factor_string = "";
    max_string = "";
    value = 0;
  }

  if (stat_boosts.length > 0)
    result_string += "+" + stat_boosts[0].value + " " + stat_boosts[0].stat;
  for (var j = 1; j < stat_boosts.length; j++) {
    result_string += "/+" + stat_boosts[j].value + " " + stat_boosts[j].stat;
  }

  return result_string;
};
Fighter.prototype.apply_stat_penalty = function (effect_string, e) {
  var stat = "";
  var value_string = "";
  var stat_penalties = new Array();
  var result_string = "";

  // The first 13 characters of effect_string are "stat_penalty("
  var i = 13;

  for (; i < effect_string.length; i++) {
    for (; effect_string[i] != ","; i++)
      stat += effect_string[i];
    for (i += 1; effect_string[i] != "&" && i != effect_string.length - 1; i++)
      value_string += effect_string[i];

    var value = e.parse_num_expr(value_string, this, false);

    switch(stat) {
      case "e_combat_atk":
        this.combat_atk -= value;
        if (this.combat_atk < 0)
          this.combat_atk = 0;
        stat_penalties.push(new Stat_Boost(value, "Atk"));
        break;
      case "e_combat_spd":
        this.combat_spd -= value;
        if (this.combat_spd < 0)
          this.combat_spd = 0;
        stat_penalties.push(new Stat_Boost(value, "Spd"));
        break;
      case "e_combat_def":
        this.combat_def -= value;
        if (this.combat_def < 0)
          this.combat_def = 0;
        stat_penalties.push(new Stat_Boost(value, "Def"));
        break;
      case "e_combat_res":
        this.combat_res -= value;
        if (this.combat_res < 0)
          this.combat_res = 0;
        stat_penalties.push(new Stat_Boost(value, "Res"));
        break;
      default:
        console.log("Encountered invalid stat string when evaluating combat penalties: " + stat);
    }

    stat = "";
    value_string = "";
  }

  if (stat_penalties.length > 0)
    result_string += "-" + stat_penalties[0].value + " " + stat_penalties[0].stat;
  for (var j = 1; j < stat_penalties.length; j++) {
    result_string += "/-" + stat_penalties[j].value + " " + stat_penalties[j].stat;
  }

  return result_string;
};
Fighter.prototype.apply_scaled_stat_penalty = function (effect_string, e) {
  var stat = "";
  var base_value_string = "";
  var scale_factor_string = "";
  var max_string = "";
  var stat_penalties = new Array();
  var result_string = "";

  // The first 20 characters of effect_string are "scaled_stat_penalty("
  var i = 20;

  for (; i < effect_string.length; i++) {
    for (; effect_string[i] != ","; i++)
      stat += effect_string[i];
    for (i += 1; effect_string[i] != ";"; i++)
      base_value_string += effect_string[i];
    for (i += 1; effect_string[i] != ","; i++)
      scale_factor_string += effect_string[i];
    for (i += 5; effect_string[i] != "&" && i != effect_string.length - 1; i++)
      max_string += effect_string[i];

    base_value = e.parse_num_expr(base_value_string, this, false);
    scale_factor = e.parse_num_expr(scale_factor_string, this, false);
    if (max_string != "none") {
      max = parseInt(max_string);
      value = Math.floor(Math.min((base_value * scale_factor), max));
    }
    else
      value = Math.floor(base_value * scale_factor);

    switch (stat) {
      case "e_combat_atk":
        this.combat_atk -= value;
        stat_penalties.push(new Stat_Boost(value, "Atk"));
        break;
      case "e_combat_spd":
        this.combat_spd -= value;
        stat_penalties.push(new Stat_Boost(value, "Spd"));
        break;
      case "e_combat_def":
        this.combat_def -= value;
        stat_penalties.push(new Stat_Boost(value, "Def"));
        break;
      case "e_combat_res":
        this.combat_res -= value;
        stat_penalties.push(new Stat_Boost(value, "Res"));
        break;
      default:
        console.log("Encountered invalid stat string when evaluating combat penalties: " + stat);
    }

    stat = "";
    base_value_string = "";
    scale_factor_string = "";
    max_string = "";
    value = 0;
  }

  if (stat_penalties.length > 0)
    result_string += "-" + stat_penalties[0].value + " " + stat_penalties[0].stat;
  for (var j = 1; j < stat_penalties.length; j++) {
    result_string += "/-" + stat_penalties[j].value + " " + stat_penalties[j].stat;
  }

  return result_string;
};
Fighter.prototype.apply_pulse = function (effect_string, e) {
  var pulse_string = "";
  var pulse_value = 0;
  // The first 6 characters of effect_string are "pulse(".
  var i = 6;

  for (; i < effect_string.length - 1; i++)
    pulse_string += effect_string[i];

  pulse_value = this.process_numeric_value(pulse_string, false);
  this.cooldown -= pulse_value;

  return pulse_value;
};
Fighter.prototype.calculate_precombat_damage = function (effect_string, e) {
  var reader = "";

  for (var i = 17; i < effect_string.length - 1; i++)
    reader += effect_string[i];

  return this.parse_num_expr(reader, e, false);
};
// Calculates and returns extra damage from an effect.
Fighter.prototype.calculate_extra_damage = function (effect_string, e) {
  var damage_string = "";
  var max_string = "";
  // The first 13 characters of effect_string are "bonus_damage(" or "damage_boost(".
  var i = 13;

  for (; effect_string[i] != ";"; i++)
    damage_string += effect_string[i];
  for (i += 5; i < effect_string.length - 1; i++)
    max_string += effect_string[i];

  if (max_string != "none")
    return Math.min(this.parse_num_expr(damage_string, e, false), parseInt(max_string));
  else
    return this.parse_num_expr(damage_string, e, false);
};
// Calculates the effective attack of a unit, including effective damage,
// weapon triangle, etc.
Fighter.prototype.calculate_effective_atk = function (e) {
  var atk = this.combat_atk;

  if (this.deals_effective_damage)
    atk += Math.floor(atk * .5);

  if (this.triangle_status == "a") {
    if (!this.has_triangle_amplifier && !e.get_triangle_amplifier_flag())
      atk += Math.floor(atk * .2);
    else if ((this.has_triangle_amplifier && !e.get_reverse_triangle_amplifier_flag()) || e.get_triangle_amplifier_flag())
      atk += Math.floor(atk * .4);
  }
  else if (this.triangle_status == "d") {
    if (!this.has_triangle_amplifier && !e.get_triangle_amplifier_flag())
      atk -= Math.floor(atk * .2);
    else if ((e.get_triangle_amplifier_flag() && !this.reverses_triangle_amplifier) || this.has_triangle_amplifier)
      atk -= Math.floor(atk * .4);
  }

  this.effective_atk = atk;
};
// Calculate and return the flat percent damage mitigation value.
Fighter.prototype.calculate_flat_percent_mitigation = function (effect_string, e) {
  var value = "";
  var i = 0;

  for (; effect_string[i] != "("; i++);
  for (i += 1; i < effect_string.length - 1; i++)
    value += effect_string[i];

  return this.parse_num_expr(value, e, false);
};
// Calculate and return the scaled percent damage mitigation value.
Fighter.prototype.calculate_scaled_percent_mitigation = function (effect_string, e) {
  var mitigation_string = "";
  var max_string = "";
  var i = 0;

  for (; effect_string[i] != "("; i++);
  for (i += 1; effect_string[i] != ";"; i++)
    mitigation_string += effect_string[i];
  for (i += 5; i < effect_string.length - 1; i++)
    max_string += effect_string[i];

  if (max_string != "none")
    return Math.min(this.parse_num_expr(mitigation_string, e, false), parseInt(max_string));
  else
    return this.parse_num_expr(mitigation_string, e, false);
};
Fighter.prototype.calculate_static_mitigation = function (effect_string, e) {
  var mitigation_string = "";
  // The first 18 characters of effect_string are "static_mitigation("
  var i = 18;

  for (; i < effect_string.length - 1; i++)
    mitigation_string += effect_string[i];

  return this.parse_num_expr(mitigation_string, e, false);
};
Fighter.prototype.add_next_hit_damage = function (value) {
  this.next_atk_bonus_dmg += value;
};
Fighter.prototype.apply_heal = function (effect_string, e) {
  var prev_hp = this.hp;
  var heal_string = "";
  // The first 12 characters of effect_string are "heal_on_hit(".
  var i = 12;

  for (; i < effect_string.length - 1; i++)
    heal_string += effect_string[i];

  this.hp += this.parse_num_expr(heal_string, e, false);
  if (this.hp > this.max_hp)
    this.hp = this.max_hp;

  return prev_hp;
};
// Adds a given damage value to the damage dealt variable, which is used for end-of-simulation logging.
Fighter.prototype.add_dmg_value = function (val) {
  this.damage_dealt += val;
};
// Checks if this unit deals weapon effective damage to the enemy.
Fighter.prototype.check_weapon_effective = function (e) {
  if (this.weapon_effective.length == 0)
    return false;

  var enemy_susceptibilities = new Array();
  if (e.get_weap_susceptible_list() != undefined) {
    e.get_weap_susceptible_list().forEach((item) => {
      enemy_susceptibilities.push(item);
    });
  }
  enemy_susceptibilities.push(e.get_weapon_type());

  var susc_string = "";
  if (enemy_susceptibilities.length > 0) {
    for (var i = 0; i < enemy_susceptibilities.length; i++)
      susc_string += enemy_susceptibilities[i] + " ";
  }

  for (var i = 0; i < enemy_susceptibilities.length; i++)
    if (this.weapon_effective.includes(enemy_susceptibilities[i]))
      return true;

  return false;
};
Fighter.prototype.reset_single_hit_flags = function () {
  this.neutralizes_scaled_mitigation = false;
  this.mitigation_mirror_active = false;
  this.inhibits_special_charge = false;
  this.accelerates_special_charge = false;
};

// Get methods.
Fighter.prototype.get_dmg_dealt = function () {
  return this.damage_dealt;
};
Fighter.prototype.get_max_hp = function () {
  return this.max_hp;
};
Fighter.prototype.get_hp = function () {
  return this.hp;
};
Fighter.prototype.get_permanent_atk = function () {
  return this.permanent_atk;
};
Fighter.prototype.get_permanent_spd = function () {
  return this.permanent_spd;
};
Fighter.prototype.get_permanent_def = function () {
  return this.permanent_def;
};
Fighter.prototype.get_permanent_res = function () {
  return this.permanent_res;
};
Fighter.prototype.get_printed_atk = function () {
  return this.printed_atk;
};
Fighter.prototype.get_printed_spd = function () {
  return this.printed_spd;
};
Fighter.prototype.get_printed_def = function () {
  return this.printed_def;
};
Fighter.prototype.get_printed_res = function () {
  return this.printed_res;
};
Fighter.prototype.get_combat_atk = function () {
  return this.combat_atk;
};
Fighter.prototype.get_combat_spd = function () {
  return this.combat_spd;
};
Fighter.prototype.get_combat_def = function () {
  return this.combat_def;
};
Fighter.prototype.get_combat_res = function () {
  return this.combat_res;
};
Fighter.prototype.get_phantom_spd = function () {
  return this.phantom_spd;
};
Fighter.prototype.get_phantom_res = function () {
  return this.phantom_res;
};
Fighter.prototype.get_effective_atk = function () {
  return this.effective_atk;
};
Fighter.prototype.get_actual_atk_buff = function () {
  if (this.panic_active)
    return this.atk_buff * -1;
  return this.atk_buff;
};
Fighter.prototype.get_actual_spd_buff = function () {
  if (this.panic_active)
    return this.spd_buff * -1;
  return this.spd_buff;
};
Fighter.prototype.get_actual_def_buff = function () {
  if (this.panic_active)
    return this.def_buff * -1;
  return this.def_buff;
};
Fighter.prototype.get_actual_res_buff = function () {
  if (this.panic_active)
    return this.res_buff * -1;
  return this.res_buff;
};
Fighter.prototype.get_actual_atk_penalty = function () {
  return this.atk_penalty;
};
Fighter.prototype.get_actual_spd_penalty = function () {
  return this.spd_penalty;
};
Fighter.prototype.get_actual_def_penalty = function () {
  return this.def_penalty;
};
Fighter.prototype.get_actual_res_penalty = function () {
  return this.res_penalty;
};
Fighter.prototype.get_cooldown = function () {
  return this.cooldown;
};
Fighter.prototype.get_name = function () {
  return this.name;
};
Fighter.prototype.get_color = function () {
  return this.color;
};
Fighter.prototype.get_targeting_flag = function () {
  return this.targeting;
};
Fighter.prototype.get_weapon_name = function () {
  var name = this.weapon.name;
  if (this.refinement != "None")
    name += " (" + this.refinement + ")";

  return name;
};
Fighter.prototype.get_special_name = function () {
  return this.special.name;
};
Fighter.prototype.get_a_skill_name = function () {
  return this.a_skill.name;
};
Fighter.prototype.get_b_skill_name = function () {
  return this.b_skill.name;
};
Fighter.prototype.get_c_skill_name = function () {
  return this.c_skill.name;
};
Fighter.prototype.get_seal_name = function () {
  return this.seal.name;
};
Fighter.prototype.get_movement_type = function () {
  return this.movement_type;
};
Fighter.prototype.get_weapon_type = function () {
  return this.weapon_type;
};
Fighter.prototype.get_range = function () {
  return this.range;
};
Fighter.prototype.get_weap_susceptible_list = function () {
  return this.weapon_effective_susceptible;
};
Fighter.prototype.get_next_atk_bonus_dmg = function () {
  return this.next_atk_bonus_dmg;
};
Fighter.prototype.get_damage = function () {
  return this.damage;
};
Fighter.prototype.get_initiating_flag = function () {
  return this.initiating;
};
Fighter.prototype.get_attacking_flag = function () {
  return this.attacking;
};
Fighter.prototype.get_special_type = function () {
  return this.special.activation_type;
};
Fighter.prototype.get_triangle_status = function () {
  return this.triangle_status;
};
Fighter.prototype.get_colorless_wta_flag = function () {
  return this.has_colorless_wta;
};
Fighter.prototype.get_wrathful_staff_active_flag = function () {
  return this.wrathful_staff_active;
};
Fighter.prototype.get_desperation_flag = function () {
  return this.desperation_active;
};
Fighter.prototype.get_vantage_flag = function () {
  return this.vantage_active;
};
Fighter.prototype.get_strike_twice_flag = function () {
  return this.strikes_twice;
};
Fighter.prototype.get_triangle_amplifier_flag = function () {
  return this.has_triangle_amplifier;
};
Fighter.prototype.get_mitigation_mirror_flag = function () {
  return this.mitigation_mirror_active;
};
Fighter.prototype.get_inhibit_special_charge_flag = function () {
  return this.inhibits_special_charge;
};
Fighter.prototype.get_accelerate_special_charge_flag = function () {
  return this.accelerates_special_charge;
};
Fighter.prototype.get_neutralize_wrathful_staff_flag = function () {
  return this.neutralizes_wrathful_staff;
};
Fighter.prototype.get_neutralize_adaptive_damage_flag = function () {
  return this.neutralizes_adaptive_damage;
};
Fighter.prototype.get_neutralize_counterattack_preventers_flag = function () {
  return this.neutralizes_counterattack_preventers;
};
Fighter.prototype.get_neutralize_follow_up_guarantors_flag = function () {
  return this.neutralizes_follow_up_guarantors;
};
Fighter.prototype.get_neutralize_follow_up_inhibitors_flag = function () {
  return this.neutralizes_follow_up_inhibitors;
};
Fighter.prototype.get_neutralize_special_charge_accelerators_flag = function () {
  return this.neutralizes_special_charge_accelerators;
};
Fighter.prototype.get_neutralize_special_charge_inhibitors_flag = function () {
  return this.neutralizes_special_charge_inhibitors;
};
Fighter.prototype.get_neutralize_weapon_effective_flag = function () {
  return this.neutralizes_weapon_effective;
};
Fighter.prototype.get_neutralize_movement_effective_flag = function () {
  return this.neutralizes_movement_effective;
};
Fighter.prototype.get_neutralize_triangle_amplifier_flag = function () {
  return this.neutralizes_triangle_amplifier;
};
Fighter.prototype.get_neutralize_scaled_mitigation_flag = function () {
  return this.neutralizes_scaled_mitigation;
};
Fighter.prototype.get_neutralize_external_skills_flag = function () {
  return this.neutralizes_external_skills;
};
Fighter.prototype.get_reverse_triangle_amplifier_flag = function () {
  return this.reverses_triangle_amplifier;
};
Fighter.prototype.get_eff_damage_flag = function () {
  return this.deals_effective_damage;
};
Fighter.prototype.get_counterattack_flag = function () {
  return this.can_counterattack;
};
Fighter.prototype.get_follow_up_flag = function () {
  return this.can_follow_up;
};
Fighter.prototype.get_special_activating_flag = function () {
  return this.special_activating;
};
Fighter.prototype.get_panic_flag = function () {
  return this.panic_active;
};
Fighter.prototype.get_guard_flag = function () {
  return this.guard_active;
};
Fighter.prototype.get_extra_movement_flag = function () {
  return this.bonus_mov_active;
};

// Set methods

Fighter.prototype.set_assumed_atk_buff = function (val) {
  if (val == "") {
    val = 0;
  }
  else {
    val = parseInt(val);
  }
  this.assumed_atk_buff = val;
  this.atk_buff = val;
};
Fighter.prototype.set_assumed_spd_buff = function (val) {
  if (val == "") {
    val = 0;
  }
  else {
    val = parseInt(val);
  }
  this.assumed_spd_buff = val;
  this.spd_buff = val;
};
Fighter.prototype.set_assumed_def_buff = function (val) {
  if (val == "") {
    val = 0;
  }
  else {
    val = parseInt(val);
  }
  this.assumed_def_buff = val;
  this.def_buff = val;
};
Fighter.prototype.set_assumed_res_buff = function (val) {
  if (val == "") {
    val = 0;
  }
  else {
    val = parseInt(val);
  }
  this.assumed_res_buff = val;
  this.res_buff = val;
};
Fighter.prototype.set_assumed_atk_boost = function (val) {
  if (val == "") {
    val = 0;
  }
  else {
    val = parseInt(val);
  }
  this.assumed_atk_boost = val;
};
Fighter.prototype.set_assumed_spd_boost = function (val) {
  if (val == "") {
    val = 0;
  }
  else {
    val = parseInt(val);
  }
  this.assumed_spd_boost = val;
};
Fighter.prototype.set_assumed_def_boost = function (val) {
  if (val == "") {
    val = 0;
  }
  else {
    val = parseInt(val);
  }
  this.assumed_def_boost = val;
};
Fighter.prototype.set_assumed_res_boost = function (val) {
  if (val == "") {
    val = 0;
  }
  else {
    val = parseInt(val);
  }
  this.assumed_res_boost = val;
};
Fighter.prototype.set_assumed_atk_penalty = function (val) {
  if (val == "") {
    val = 0;
  }
  else {
    val = parseInt(val);
  }
  this.assumed_atk_penalty = val;
  this.atk_penalty = val;
};
Fighter.prototype.set_assumed_spd_penalty = function (val) {
  if (val == "") {
    val = 0;
  }
  else {
    val = parseInt(val);
  }
  this.assumed_spd_penalty = val;
  this.spd_penalty = val;
};
Fighter.prototype.set_assumed_def_penalty = function (val) {
  if (val == "") {
    val = 0;
  }
  else {
    val = parseInt(val);
  }
  this.assumed_def_penalty = val;
  this.def_penalty = val;
};
Fighter.prototype.set_assumed_res_penalty = function (val) {
  if (val == "") {
    val = 0;
  }
  else {
    val = parseInt(val);
  }
  this.assumed_res_penalty = val;
  this.res_debuff = val;
};
Fighter.prototype.set_start_hp = function (val) {
  this.start_hp = val;
};
Fighter.prototype.set_damage = function (value) {
  this.damage = value;
};
Fighter.prototype.set_initiating_flag = function (value) {
  this.initiating = value;
};
Fighter.prototype.set_attacking_flag = function (value) {
  this.attacking = value;
};
Fighter.prototype.set_first_hit_flag = function (value) {
  this.first_hit = value;
};
Fighter.prototype.set_hitting_consecutively_flag = function (value) {
  this.hitting_consecutively = value;
};
Fighter.prototype.set_following_up_flag = function (value) {
  this.following_up = value;
};
Fighter.prototype.set_special_activating_flag = function (value) {
  this.special_activating = value;
};
Fighter.prototype.set_control_flag = function (value) {
  this.control = value;
};
Fighter.prototype.set_targeting_flag = function (e_def, e_res) {
  if (this.deals_adaptive_damage) {
    if (e_def < e_res)
      this.targeting = "def";
    else
      this.targeting = "res";
  }
  else if (this.targets_def) {
    this.targeting = "def";
  }
  else if (this.targets_res) {
    this.targeting = "res";
  }
  else {
    if (physical_weapons.includes(this.weapon_type))
      this.targeting = "def";
    else {
      this.targeting = "res";
    }
  }
};
Fighter.prototype.set_adaptive_damage_flag = function (value) {
  this.deals_adaptive_damage = value;
};
Fighter.prototype.set_targets_flag = function (effect_string) {
  var reader = "";

  // the first 8 characters of effect_string are "targets("
  for (var i = 8; effect_string[i] != ")"; i++) {
    reader += effect_string[i];
  }

  if (reader == "def") {
    this.targets_def = true;
    return "Def";
  }
  else if (reader == "res") {
    this.targets_res = true;
    return "Res";
  }
};
Fighter.prototype.set_strike_twice_flag = function (value) {
  this.strikes_twice = value;
};
Fighter.prototype.set_counterattack_flag = function (value) {
  this.can_counterattack = value;
};
Fighter.prototype.set_follow_up_flag = function (value) {
  this.can_follow_up = value;
};
Fighter.prototype.set_desperation_flag = function (value) {
  this.desperation_active = value;
};
Fighter.prototype.set_vantage_flag = function (value) {
  this.vantage_active = value;
};
Fighter.prototype.set_triangle_status = function (value) {
  this.triangle_status = value;
};
Fighter.prototype.set_colorless_wta_flag = function (value) {
  this.has_colorless_wta = value;
};
Fighter.prototype.set_wrathful_staff_active_flag = function (value) {
  this.wrathful_staff_active = value;
};
Fighter.prototype.set_triangle_amplifier_flag = function (value) {
  this.has_triangle_amplifier = value
};
Fighter.prototype.set_mitigation_mirror_flag = function (value) {
  this.mitigation_mirror_active = value;
};
Fighter.prototype.set_inhibit_special_charge_flag = function (value) {
  this.inhibits_special_charge = value;
};
Fighter.prototype.set_accelerate_special_charge_flag = function () {
  this.accelerates_special_charge = value;
};
Fighter.prototype.set_neutralize_wrathful_staff_flag = function (value) {
  this.neutralizes_wrathful_staff = value;
};
Fighter.prototype.set_neutralize_adaptive_damage_flag = function (value) {
  this.neutralizes_adaptive_damage = value;
};
Fighter.prototype.set_neutralize_counterattack_preventers_flag = function (value) {
  this.neutralizes_counterattack_preventers = value;
};
Fighter.prototype.set_neutralize_follow_up_guarantors_flag = function (value) {
  this.neutralizes_follow_up_guarantors = value;
};
Fighter.prototype.set_neutralize_follow_up_inhibitors_flag = function (value) {
  this.neutralizes_follow_up_inhibitors = value;
};
Fighter.prototype.set_neutralize_special_charge_accelerators_flag = function (value) {
  this.neutralizes_special_charge_accelerators = value;
};
Fighter.prototype.set_neutralize_special_charge_inhibitors_flag = function (value) {
  this.neutralizes_special_charge_inhibitors = value;
};
Fighter.prototype.set_neutralize_weapon_effective_flag = function (value) {
  this.neutralizes_weapon_effective = value
};
Fighter.prototype.set_neutralize_movement_effective_flag = function (value) {
  this.neutralizes_movement_effective = value;
};
Fighter.prototype.set_neutralize_triangle_amplifier_flag = function (value) {
  this.neutralizes_triangle_amplifier = value;
};
Fighter.prototype.set_neutralize_external_skills_flag = function (value) {
  this.neutralizes_external_skills = value;
};
Fighter.prototype.set_reverse_triangle_amplifier_flag = function (value) {
  this.reverses_triangle_amplifier = value;
};
Fighter.prototype.set_eff_damage_flag = function (value) {
  this.deals_effective_damage = value
};
Fighter.prototype.set_neutralize_bonus_flags = function (effect_string) {
  var reader = "";

  // The string of actual buffs to be negated starts at string index 19.
  // The first characters are "neutralize_bonuses(".
  for (var i = 19; i < effect_string.length; i++) {
    if (effect_string[i] == "," || i == effect_string.length - 1) {
      switch (reader) {
        case "e_atk_buff":
          this.atk_buff_neutralized = true;
          break;
        case "e_spd_buff":
          this.spd_buff_neutralized = true;
          break;
        case "e_def_buff":
          this.def_buff_neutralized = true;
          break;
        case "e_res_buff":
          this.res_buff_neutralized = true;
          break;
        default:
          console.log("Invalid buff name " + reader + " was encountered while setting bonus neutralization flags");
      }
      reader = "";
    }
    else
      reader += effect_string[i];
  }
};
Fighter.prototype.set_neutralize_penalty_flags = function (effect_string) {
  var reader = "";
  var log_string = "";
  var neutralized_penalties = new Array();

  // The first 21 characters of effect_string are "neutralize_penalties(".
  for (var i = 21; i < effect_string.length; i++) {
    if (effect_string[i] == "," || i == effect_string.length - 1) {
      switch(reader) {
        case "atk_penalty":
          this.atk_penalty_neutralized = true;
          if (this.atk_penalty > 0 || this.atk_buff < 0 || (this.atk_buff > 0 && this.panic_active))
            neutralized_penalties.push("Atk")
          break;
        case "spd_penalty":
          this.spd_penalty_neutralized = true;
          if (this.spd_penalty > 0 || this.spd_buff < 0 || (this.spd_buff > 0 && this.panic_active))
            neutralized_penalties.push("Spd");
          break;
        case "def_penalty":
          this.def_penalty_neutralized = true;
          if (this.def_penalty > 0 || this.def_buff < 0 || (this.def_buff > 0 && this.panic_active))
            neutralized_penalties.push("Def");
          break;
        case "res_penalty":
          this.res_penalty_neutralized = true;
          if (this.res_penalty > 0 || this.res_buff < 0 || (this.res_buff > 0 && this.panic_active))
            neutralized_penalties.push("Res");
          break;
        default:
          console.log("Invalid penalty name " + reader + " was encountered while setting penalty neutralization flags.");
      }
      reader = "";
    }
    else
      reader += effect_string[i];
  }

  if (neutralized_penalties.length == 0) {
    return ", but there were no penalties to neutralize.<br />";
  }
  else if (neutralized_penalties.length == 1) {
    return ". The " + neutralized_penalties[0] + " penalty was neutralized.<br />";
  }
  else {
    for (var i = 0; i < neutralized_penalties.length - 1; i++)
      log_string += neutralized_penalties[i] + ", ";
    return ". The " + log_string + " and " + neutralized_penalties[neutralized_penalties.length - 1] + " penalties were neutralized.<br />";
  }
};
Fighter.prototype.set_skill_inputs = function (mode, boolean_input, number_input) {
  switch (mode) {
    case "weapon":
      this.weap_user_boolean_input = boolean_input;
      this.weap_user_number_input = number_input;
      break;
    case "special":
      this.spec_user_boolean_input = boolean_input;
      this.spec_user_number_input = number_input;
      break;
    case "A":
      this.a_user_boolean_input = boolean_input;
      this.a_user_number_input = number_input;
      break;
    case "B":
      this.b_user_boolean_input = boolean_input;
      this.b_user_number_input = number_input;
      break;
    case "C":
      this.c_user_boolean_input = boolean_input;
      this.c_user_number_input = number_input;
      break;
    case "S":
      this.seal_user_boolean_input = boolean_input;
      this.seal_user_number_input = number_input;
      break;
  }
};
Fighter.prototype.set_neutralize_scaled_mitigation_flag = function (value) {
  this.neutralizes_scaled_mitigation = value;
};
Fighter.prototype.set_next_atk_bonus_dmg = function (value) {
  this.next_atk_bonus_dmg = value;
};
Fighter.prototype.set_skill_miracle_activated_flag = function (value) {
  this.skill_miracle_activated = value;
};
Fighter.prototype.set_extra_movement_flag = function (value) {
  this.bonus_mov_active = value;
};
Fighter.prototype.set_transformed_flag = function (value) {
  this.transformed_input = value;
};
Fighter.prototype.set_panic_flag = function (value) {
  this.panic_active = value;
};
Fighter.prototype.set_guard_flag = function (value) {
  this.guard_active = value;
};
Fighter.prototype.set_isolation_flag = function (value) {
  this.isolation_active = value;
};
Fighter.prototype.set_gravity_flag = function (value) {
  this.gravity_active = value;
};
Fighter.prototype.set_flash_flag = function (value) {
  this.flash_active = value;
  if (this.flash_active) {
    this.counterattack_preventer_effects.push(new Effect("counterattack_preventer", "[0]", "Flash status", "external"));
  }
};
Fighter.prototype.set_trilemma_flag = function (value) {
  this.trilemma_active = value;
  if (this.trilemma_active) {
    this.triangle_amplifier_effects.push(new Effect("triangle_amplifier", "[0]", "Trilemma status", "external"));
  }
};
Fighter.prototype.set_bonus_doubler_flag = function (value) {
  this.bonus_doubler_active = value;
  if (this.bonus_doubler_active) {
    this.flat_stat_boost_effects.push(new Effect("flat_stat_boost(combat_atk,max(atk_buff,0)&combat_spd,max(spd_buff,0)&combat_def,max(def_buff,0)&combat_res,max(res_buff,0))", "[0]", "Bonus Doubler status", "external"));
  }
};
Fighter.prototype.set_divine_fang_flag = function (value) {
  this.divine_fang_active = value;
  if (this.divine_fang_active) {
    this.weapon_eff_effects.push(new Effect("weap_eff(RD,BD,GD,ND)", "[0]", "Divine Fang status", "external"));
  }
};
Fighter.prototype.set_neutralize_dragon_armor_eff_flag = function (value) {
  this.neutralize_dragon_armor_effective_active = value;
  if (this.neutralize_dragon_armor_effective_active) {
    this.neutralize_weap_eff_effects.push(new Effect("neutralize_weapon_effective", "[weap_check(RD,BD,GD,ND)|eff_susc_check(RD,BD,GD,ND)]", "Neutralize Dragon/Armor Effective Status", "external"));
    this.neutralize_mov_eff_effects.push(new Effect("neutralize_movement_effective", "[mov_check(A)]", "Neutralize Dragon/Armor Effective Status", "external"));
  }
};
Fighter.prototype.set_dominance_flag = function (value) {
  this.dominance_active = value;
  if (this.dominance_active) {
    this.bonus_damage_effects.push(new Effect("bonus_damage(e_penalty_sum;max=none)", "[0]", "Dominance Status", "external"));
  }
};
Fighter.prototype.set_desperation_status_flag = function (value) {
  this.desperation_status_active = value;
  if (this.desperation_status_active) {
    this.desperation_effects.push(new Effect("desperation", "[boolean_check(initiating,true)]", "Desperation Status", "external"));
  }
};
Fighter.prototype.set_geirskogul_support_flag = function (value) {
  this.geirskogul_support_active = value;
  if (this.geirskogul_support_active) {
    this.special_charge_accelerator_effects.push(new Effect("special_charge_accelerator", "[weap_check(P)&boolean_check(initiating,false)]", "Geirsk\xF6gul support", "external"));
    this.flat_stat_boost_effects.push(new Effect("flat_stat_boost(combat_atk,3&combat_spd,3&combat_def,3&combat_res,3)", "[weap_check(P)]", "Geirsk\xF6gul support", "external"));
  }
};
Fighter.prototype.set_inf_breath_support_flag = function (value) {
  this.inf_breath_support_active = value;
  if (this.inf_breath_support_active) {
    this.special_charge_accelerator_effects.push(new Effect("special_charge_accelerator", "[mov_check(I)&boolean_check(initiating,false)]", "Infantry Breath support", "external"));
    this.flat_stat_boost_effects.push(new Effect("flat_stat_boost(combat_def,2&combat_res,2)", "[mov_check(I)&boolean_check(initiating,false)]", "Infantry Breath support", "external"));
  }
};
Fighter.prototype.set_inf_rush_support_flag = function (value) {
  this.inf_rush_support_active = value;
  if (this.inf_rush_support_active) {
    this.special_charge_accelerator_effects.push(new Effect("special_charge_accelerator", "[mov_check(I)&boolean_check(attacking,true)&comp(combat_atk>e_combat_atk)]", "Infantry Rush support", "external"));
  }
};
Fighter.prototype.set_inf_flash_support_flag = function (value) {
  this.inf_flash_support_active = value;
  if (this.inf_flash_support_active) {
    this.special_charge_accelerator_effects.push(new Effect("special_charge_accelerator", "[mov_check(I)&boolean_check(attacking,true)&comp(combat_comparison_spd>e_combat_comparison_spd)]", "Infantry Flash support", "external"));
  }
};
Fighter.prototype.set_inf_hexblade_support_flag = function (value) {
  this.inf_hexblade_support_active = value;
  if (this.inf_hexblade_support_active) {
    this.adaptive_damage_effects.push(new Effect("adaptive_damage", "[mov_check(I)&weap_check(S,L,A,RB,BB,GB,NB,RK,BK,GK,NK)]", "Infantry Hexblade support", "external"));
    this.flat_stat_boost_effects.push(new Effect("flat_stat_boost(combat_atk,2&combat_spd,2)", "[mov_check(I)&weap_check(S,L,A,RB,BB,GB,NB,RK,BK,GK,NK)]", "Infantry Hexblade support", "external"));
  }
};
Fighter.prototype.set_cg_stacks = function (value) {
  this.cg_stacks = parseInt(value);
  if (this.cg_stacks > 0) {
    var stack_value = this.cg_stacks * 4;
    this.flat_stat_boost_effects.push(new Effect("flat_stat_boost(combat_def," + stack_value + "&combat_res," + stack_value + ")", "[e_weap_check(1rng)]", "Close Guard support", "external"));
  }
};
Fighter.prototype.set_dg_stacks = function (value) {
  this.dg_stacks = parseInt(value);
  if (this.dg_stacks > 0) {
    var stack_value = this.dg_stacks * 4;
    this.flat_stat_boost_effects.push(new Effect("flat_stat_boost(combat_def," + stack_value + "&combat_res," + stack_value + ")", "[e_weap_check(2rng)]", "Distant Guard support", "external"));
  }
};
Fighter.prototype.set_nearby_allies = function (one, two, three) {
  this.adjacent_allies = parseInt(one);
  this.two_space_allies = parseInt(two);
  this.three_space_allies = parseInt(three);
};
