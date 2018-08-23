// The Fighter class, a fusion of the base stats of a character
// and the stats & properties of their skills.
class Fighter {
  constructor(char, boon, bane, weap, a, b, c, seal, proc, summoner_support, merge_lv, conditional_effects, blessings) {
    // Load properties from the character.
    this.name = char.name;
    this.color = char.color;
    this.hp = this.calculate_stat(char.hp_base, char.hpGP, "neutral");
    this.atk = this.calculate_stat(char.atk_base, char.atkGP, "neutral");
    this.spd = this.calculate_stat(char.spd_base, char.spdGP, "neutral");
    this.def = this.calculate_stat(char.def_base, char.defGP, "neutral");
    this.res = this.calculate_stat(char.res_base, char.resGP, "neutral");
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
          this.hp = this.calculate_stat(char.hp_base, char.hpGP, "boon");
          this.hp_base += 1;
          break;
        case "Atk":
          this.atk = this.calculate_stat(char.atk_base, char.atkGP, "boon");
          this.atk_base += 1;
          break;
        case "Spd":
          this.spd = this.calculate_stat(char.spd_base, char.spdGP, "boon");
          this.spd_base += 1;
          break;
        case "Def":
          this.def = this.calculate_stat(char.def_base, char.defGP, "boon");
          this.def_base += 1;
          break;
        case "Res":
          this.res = this.calculate_stat(char.res_base, char.resGP, "boon");
          this.res_base += 1;
          break;
        // No default case, since "None" is a valid boon selection.
      }
      switch (bane) {
        case "HP":
          this.hp = this.calculate_stat(char.hp_base, char.hpGP, "bane");
          this.hp_base -= 1;
          break;
        case "Atk":
          this.atk = this.calculate_stat(char.atk_base, char.atkGP, "bane");
          this.atk_base -= 1;
          break;
        case "Spd":
          this.spd = this.calculate_stat(char.spd_base, char.spdGP, "bane");
          this.spd_base -= 1;
          break;
        case "Def":
          this.def = this.calculate_stat(char.def_base, char.defGP, "bane");
          this.def_base -= 1;
          break;
        case "Res":
          this.res = this.calculate_stat(char.res_base, char.resGP, "bane");
          this.res_base -= 1;
          break;
        // No default case, since "None" is a valid bane selection.
      }
    }

    // Apply Rank S Summoner Support bonuses.
    if (summoner_support) {
      this.hp += 5;
      this.atk += 2;
      this.spd += 2;
      this.def += 2;
      this.res += 2;
    }

    // Apply blessing bonuses.
    this.hp += blessings[0].hp_boost_perm + blessings[1].hp_boost_perm + blessings[2].hp_boost_perm;
    this.atk += blessings[0].atk_boost_perm + blessings[1].atk_boost_perm + blessings[2].atk_boost_perm;
    this.spd += blessings[0].spd_boost_perm + blessings[1].spd_boost_perm + blessings[2].spd_boost_perm;
    this.def += blessings[0].def_boost_perm + blessings[1].def_boost_perm + blessings[2].def_boost_perm;
    this.res += blessings[0].res_boost_perm + blessings[1].res_boost_perm + blessings[2].res_boost_perm;

    // If a merge level greater than 0 is specified, add stats accordingly.
    if (merge_lv > 0) {
      var labels = ["hp", "atk", "spd", "def", "res"];
      var stats = [this.hp_base, this.atk_base, this.spd_base, this.def_base, this.res_base];

      var sorted_labels = this.two_array_sort(labels, stats);
      var j = 0;
      for (var i = merge_lv; i > 0; i--) {
        if (j >= labels.length) {
          j = 0;
        }
        switch (labels[j]) {
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

        j += 1;
        if (j >= labels.length) {
          j = 0;
        }
        switch (labels[j]) {
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

        j += 1;
      }
    }

    // set various fighter properties.
    this.type = char.type;
    this.weap = char.weap;

    this.weapon = weap;
    this.a_skill = a;
    this.b_skill = b;
    this.c_skill = c;
    this.proc = proc;
    this.seal = seal;

    // set default values for buffs & debuffs.
    this.atk_buff = 0;
    this.spd_buff = 0;
    this.def_buff = 0;
    this.res_buff = 0;

    // set default values for debuffs.
    this.atk_debuff = 0;
    this.spd_debuff = 0;
    this.def_debuff = 0;
    this.res_debuff = 0;
    this.buffs_reversed = false;

    // default values for assumed variables, to be set by the user.
    // buffs
    this.assumed_atk_buff = 0;
    this.assumed_spd_buff = 0;
    this.assumed_def_buff = 0;
    this.assumed_res_buff = 0;

    // auras
    this.assumed_atk_boost = 0;
    this.assumed_spd_boost = 0;
    this.assumed_def_boost = 0;
    this.assumed_res_boost = 0;

    // debuffs
    this.assumed_atk_debuff = 0;
    this.assumed_spd_debuff = 0;
    this.assumed_def_debuff = 0;
    this.assumed_res_debuff = 0;

    // nearby allies
    this.adj_allies = 0;
    this.two_space_allies = 0;

    // Calculate and store the unit's maximum HP.
    this.hp += this.weapon.hp_boost_perm + this.a_skill.hp_boost_perm + this.seal.hp_boost_perm;
    this.hp_max = this.hp;

    // Set up the unit's special cooldown.
    this.cooldown = 0;
    this.reset_cooldown();
    this.cooldown -= this.get_cd_reduce();

    // damage_dealt is a logging variable, used to report amount of damage dealt
    // by the unit during combat (for % HP calculations).
    this.damage_dealt = 0;

    // start_HP helps determine if skills such as breakers or wrathful staff apply.
    this.start_HP = 0;

    // next_atk_bonus_dmg is a variable used to handle damage that is carried over
    // from a previous action (ex. Ice Mirror is a defensive special that grants damage
    // equal to the damage mitigated from a foe's prior attack).
    this.next_atk_bonus_dmg = 0;

    this.conditional_effects = conditional_effects;
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
Fighter.prototype.calculate_stat = function(stat_base, stat_GP, case_type) {
  // Formula is:
  // [base stat] + Math.floor(39 * Math.floor([growth rate] * (1 + .7 * (rarity - 3))))
  // This simulator assumes a rarity of 5. Note that boon stats mean +1 base point/GP, and
  // bane stats mean -1 base point/GP. Finally, growth rate is ((GP + 4) * 5)%
  var base, growth, growth_rate;
  switch (case_type) {
    case "boon":
      base = stat_base + 1;
      growth = (stat_GP + 5) * 5;
      break;
    case "bane":
      base = stat_base - 1;
      growth = (stat_GP + 3) * 5;
      break;
    default:
      base = stat_base;
      growth = (stat_GP + 4) * 5;
  }
  growth_rate = Math.floor(growth * (1 + (.07 * (5 - 3)))) / 100;
  return (base + Math.floor(39 * growth_rate));
};
// Resets the skill cooldown timer.
Fighter.prototype.reset_cooldown = function() {
  this.cooldown = this.proc.cooldown_max + this.weapon.skill_cd_increase - this.weapon.skill_cd_reduction;
};
// Decrements the skill cooldown timer.
Fighter.prototype.decrement_cooldown = function() {
  if (this.cooldown > 0)
    this.cooldown -= 1;
};
// Resets debuffs to the assumed values (set by user).
Fighter.prototype.reset_debuffs = function() {
  this.atk_debuff = this.assumed_atk_debuff;
  this.spd_debuff = this.assumed_spd_debuff;
  this.def_debuff = this.assumed_def_debuff;
  this.res_debuff = this.assumed_res_debuff;
  this.buffs_reversed = false;
};
// Resets buffs to the assumed values (set by user).
Fighter.prototype.reset_buffs = function() {
  this.atk_buff = this.assumed_atk_buff;
  this.spd_buff = this.assumed_spd_buff;
  this.def_buff = this.assumed_def_buff;
  this.res_buff = this.assumed_res_buff;
};
// Adds a given damage value to the damage dealt variable, which is used for end-of-simulation logging.
Fighter.prototype.add_dmg_value = function (val) {
  this.damage_dealt += val;
};

/* ***************************** STAT CALCULATION ***************************** */

// Calculates the attack of the unit; does not include effective damage,
// weapon triangle, etc.
Fighter.prototype.calculate_atk = function(attacker_flag, enemy, in_combat) {
  var enemy_range = enemy.get_range();

  // Reverses buffs if applicable.
 if (this.buffs_reversed) {
    this.atk_buff *= -1;
  }
  // Sets an initial value for atk.
  var atk = this.get_perm_atk() + this.get_assumed_atk_boost() - this.atk_debuff;
  // If buffs are not positive or not negated, add buffs.
  if (this.atk_buff < 0 || this.check_buff_negate(enemy) == "") {
    atk += this.atk_buff;
  }

  if (in_combat) {
    // If the unit in question is at full HP, and has an effect that increases Atk at full HP, include it.
    if (this.get_start_HP() == this.get_HP_max()) {
      atk += this.get_atk_boost_full_hp();
    }
    else {
      atk += this.get_atk_boost_damaged();
    }

    // If the unit has a inverse spur effect, add 2x adjacent allies to atk.
    if (this.get_inverse_spur() == 1) {
      atk += this.get_adj_allies() * 2;
    }

    // Apply effects that boost atk based on enemies in 2 spaces.
    if (this.get_atk_bonus_nearby_ally() > 0) {
      atk += this.get_atk_bonus_nearby_ally() * Math.min((this.adj_allies+this.two_space_allies),3);
    }

    // If the unit's HP is 3+ higher than the enemy's, apply any Fire Boost bonuses.
    if (this.get_start_HP() - enemy.get_start_HP() >= 3) {
      atk += this.get_fire_boost_bonus();
    }

    // If the unit has a "Bond" skill that boosts Atk, and has at least one adjacent ally, apply it.
    if (this.get_atk_bond() > 0 && this.adj_allies > 0) {
      atk += this.get_atk_bond();
    }

    // If the unit in question is the attacker, make sure to include offensive
    // atk bonuses.
    if (attacker_flag) {
      atk += this.get_atk_boost_off();
      if (enemy_range > 1) {
        atk += this.get_distant_atk_off_bonus();
      }
      else {
        atk += this.get_close_atk_off_bonus();
      }
      if (this.conditional_effects) {
        atk += this.get_cond_atk_off_bonus();
      }
    }
    // If the unit is not the attacker, include defensive atk bonuses.
    else {
      atk += this.get_atk_boost_def();
      if (enemy_range > 1) {
        atk += this.get_distant_atk_def_bonus();
      }
      else {
        atk += this.get_close_atk_def_bonus();
      }
      if (this.conditional_effects) {
        atk += this.get_cond_atk_def_bonus();
      }
    }

    // If the unit gets an Atk bonus when the enemy is at full HP, apply it.
    if (enemy.get_start_HP() == enemy.get_HP_max()) {
      atk += this.get_atk_boost_enemy_full_hp();
    }

    // If the unit gets an Atk bonus when below a certain HP threshold, apply it.
    if (this.start_HP / this.hp_max <= .8) {
      atk += this.get_brazen_atk_boost();
    }

    // If the unit has a -blade tome, and buffs are not negative or negated,
    // add buffs to atk.
    if (this.get_blade() == 1 && this.check_buff_negate(enemy) == "") {
      if (this.atk_buff > 0) {
        atk += this.atk_buff;
      }
      if (this.spd_buff > 0) {
        atk += this.spd_buff;
      }
      if (this.def_buff > 0) {
        atk += this.def_buff;
      }
      if (this.res_buff > 0) {
        atk += this.res_buff;
      }
    }

    // If this unit's weapon has an effect that adds enemy debuffs to atk,
    // add the enemy debuffs to atk.
    if (this.weapon.enemy_debuffs_to_atk) {
      if (enemy.get_atk_debuff() > 0) {
        atk += enemy.get_atk_debuff();
      }
      if (enemy.get_spd_debuff() > 0) {
        atk += enemy.get_spd_debuff();
      }
      if (enemy.get_def_debuff() > 0) {
        atk += enemy.get_spd_debuff();
      }
      if (enemy.get_res_debuff() > 0) {
        atk += enemy.get_res_debuff();
      }
    }

    // If this unit's weapon has an effect that adds enemy buffs to atk,
    // add the enemy buffs to atk.
    if (this.weapon.enemy_buffs_to_atk) {
      if (enemy.get_atk_buff() > 0) {
        atk += enemy.get_atk_buff();
      }
      if (enemy.get_spd_buff() > 0) {
        atk += enemy.get_spd_buff();
      }
      if (enemy.get_def_buff() > 0) {
        atk += enemy.get_def_buff();
      }
      if (enemy.get_res_buff() > 0) {
        atk += enemy.get_res_buff();
      }
    }

    // If the enemy unit has an effect that lowers this unit's atk in
    // combat, apply it.
    atk -= enemy.inflicts_combat_atk_penalty(this);
  }

  // If the atk value is negative, and the unit does not have a -blade tome,
  // set it to 0.
  if (atk < 0 && this.get_blade() != 1) {
    atk = 0;
  }

  return atk;
};
// Calculates the effective attack of a unit, including effective damage,
// weapon triangle, etc.
Fighter.prototype.calculate_effective_atk = function (atk, enemy) {
  // Set an initial effective atk value.
  var e_atk = atk;

  // If effective atk is negative, set it to 0.
  if (e_atk < 0) {
    e_atk = 0;
  }

  // Factor in effective damage, if applicable.
  if (this.check_effective_damage(enemy)) {
    e_atk += Math.floor(e_atk * .5);
  }

  // Factor in the weapon triangle bonuses/penalties.
  var wt_result = this.wt_check(enemy);
  if (wt_result == 1) {
    // If the enemy or the unit has a non-self-canceled Triangle Affinity effect...
    if ((enemy.get_wt_amp() == 1 && enemy.get_self_affinity_cancel() == 0) || (this.get_wt_amp() == 1 && this.get_self_affinity_cancel() == 0)) {
      // If the enemy has an effect that cancels ALL foe triangle affinity,
      // e_atk is not amplified by the user's Triangle Affinity skill.
      if (enemy.get_foe_affinity_cancel() == 1 || enemy.get_disadv_foe_affinity_cancel() == 1) {
        e_atk += Math.floor(e_atk * .2);
      }
      // Otherwise, if the foe does not have a skill that reverses Triangle
      // Affinity skills when at a disadvantage, apply a +40% bonus to e_atk.
      // If the foe DOES have such a skill, the matchup is effectively neutral.
      else if (enemy.get_disadv_foe_affinity_reverse() == 0) {
        e_atk += Math.floor(e_atk * .4);
      }
    }
    else {
      e_atk += Math.floor(e_atk * .2);
    }
  }
  else if (wt_result == -1) {
    // If the enemy or the unit has a non-self-canceled Triangle Affinity effect...
    if ((enemy.get_wt_amp() == 1 && enemy.get_self_affinity_cancel() == 0) || (this.get_wt_amp() == 1 && this.get_self_affinity_cancel() == 0)) {
      // If the unit has a skill that cancels foe's Triangle Affinity skills,
      // only a 20% penalty is applied to e_atk.
      if (this.get_foe_affinity_cancel() == 1 || this.get_disadv_foe_affinity_cancel() == 1){
        e_atk -= Math.floor(e_atk * .2);
      }
      // Otherwise, if the unit does not have a skill that reverses Triangle
      // Affinity skills when at a disadvantage, apply a -40% penalty to e_atk.
      // If the unit DOES have such a skill, the matchup is effectively neutral.
      else if (this.get_disadv_foe_affinity_reverse() == 0) {
        e_atk -= Math.floor(e_atk * .4);
      }
    }
    else {
      e_atk -= Math.floor(e_atk * .2);
    }
  }

  // Return the effective atk.
  return e_atk;
};
// Helper function for atk calculation, checks to see if the unit deals effective damage
// to the enemy.
Fighter.prototype.check_effective_damage = function (enemy) {
  if (this.weapon.srd_eff && enemy.get_weap() == "S") {
    return true;
  }
  if (this.weapon.lnc_eff && enemy.get_weap() == "L") {
    return true;
  }
  if (this.weapon.axe_eff && enemy.get_weap() == "A") {
    return true;
  }
  if (this.weapon.rt_eff && enemy.get_weap() == "RT") {
    return true;
  }
  if (this.weapon.bt_eff && enemy.get_weap() == "BT") {
    return true;
  }
  if (this.weapon.gt_eff && enemy.get_weap() == "GT") {
    return true;
  }
  if (this.weapon.rbrth_eff && (enemy.get_weap() == "RD" || enemy.weapon.loptous)) {
    return true;
  }
  if (this.weapon.bbrth_eff && (enemy.get_weap() == "BD" || enemy.weapon.loptous)) {
    return true;
  }
  if (this.weapon.gbrth_eff && (enemy.get_weap() == "GD" || enemy.weapon.loptous)) {
    return true;
  }
  if (this.weapon.nbrth_eff && (enemy.get_weap() == "ND" || enemy.weapon.loptous)) {
    return true;
  }
  if (this.weapon.rbow_eff && enemy.get_weap() == "RB") {
    return true;
  }
  if (this.weapon.bbow_eff && enemy.get_weap() == "BB") {
    return true;
  }
  if (this.weapon.gbow_eff && enemy.get_weap() == "GB") {
    return true;
  }
  if (this.weapon.nbow_eff && enemy.get_weap() == "NB") {
    return true;
  }
  if (this.weapon.r_dgr_eff && enemy.get_weap() == "RK") {
    return true;
  }
  if (this.weapon.b_dgr_eff && enemy.get_weap() == "BK") {
    return true;
  }
  if (this.weapon.g_dgr_eff && enemy.get_weap() == "GK") {
    return true;
  }
  if (this.weapon.n_dgr_eff && enemy.get_weap() == "NK") {
    return true;
  }
  if (this.weapon.stf_eff && enemy.get_weap() == "ST") {
    return true;
  }
  if (this.weapon.inf_eff && enemy.get_type() == "I" && !enemy.get_negate_mov_eff()) {
    return true;
  }
  if (this.weapon.cav_eff && enemy.get_type() == "C" && !enemy.get_negate_mov_eff()) {
    return true;
  }
  if (this.weapon.fly_eff && enemy.get_type() == "F" && !enemy.get_negate_mov_eff()) {
    return true;
  }
  if (this.weapon.arm_eff && enemy.get_type() == "A" && !enemy.get_negate_mov_eff()) {
    return true;
  }
  return false;
};
// Calculates the effective speed of the unit.
Fighter.prototype.calculate_spd = function(attacker_flag, enemy, in_combat) {
  var enemy_range = enemy.get_range();

  // Reverses buffs if applicable.
  if (this.buffs_reversed) {
    this.spd_buff *= -1;
  }
  // Sets an inital value for effective speed.
  var e_spd = this.get_perm_spd() + this.get_assumed_spd_boost() - this.spd_debuff;
  // If buffs are not positive or not negated, add buffs.
  if (this.spd_buff < 0 || this.check_buff_negate(enemy) == "") {
    e_spd += this.spd_buff;
  }

  if (in_combat) {
    // If the unit has a inverse spur effect, add 2x adjacent allies to effective spd.
    if (this.get_inverse_spur() == 1) {
      e_spd += this.get_adj_allies() * 2;
    }

    // Apply effects that boost spd based on enemies in 2 spaces.
    if (this.get_spd_bonus_nearby_ally() > 0) {
      e_spd += this.get_spd_bonus_nearby_ally() * Math.min((this.adj_allies+this.two_space_allies),3);
    }

    // If the unit gets a Spd bonus when the enemy is at full HP, apply it.
    if (enemy.get_start_HP() == enemy.get_HP_max()) {
      e_spd += this.get_spd_boost_enemy_full_hp();
    }

    // If the unit's HP is 3+ higher than the enemy's, apply any Wind Boost bonuses
    if (this.get_start_HP() - enemy.get_start_HP() >= 3) {
      e_spd += this.get_wind_boost_bonus();
    }

    // If the unit in question is at full HP, and has an effect that increases Spd at full HP, include it.
    if (this.get_start_HP() == this.get_HP_max()) {
      e_spd += this.get_spd_boost_full_hp();
    }
    else {
      e_spd += this.get_spd_boost_damaged();
    }

    // If the unit has a "Bond" skill that boosts Spd, and has at least one adjacent ally, apply it.
    if (this.get_spd_bond() > 0 && this.adj_allies > 0) {
      e_spd += this.get_spd_bond();
    }

    // If the unit in question is attacking, make sure to include
    // offensive speed bonuses.
    if (attacker_flag) {
      e_spd += this.get_spd_boost_off();
      if (enemy_range > 1) {
        e_spd += this.get_distant_spd_off_bonus();
      }
      else {
        e_spd += this.get_close_spd_off_bonus();
      }
      if (this.conditional_effects) {
        e_spd += this.get_cond_spd_off_bonus();
      }
    }
    // If the unit is not attacking, include defensive speed bonuses.
    else {
      e_spd += this.get_spd_boost_def();
      if (enemy_range > 1) {
        e_spd += this.get_distant_spd_def_bonus();
      }
      else {
        e_spd += this.get_close_spd_def_bonus();
      }
      if (this.conditional_effects) {
        e_spd += this.get_cond_spd_def_bonus();
      }
    }

    // If the unit gets a Spd bonus when below a certain HP threshold, apply it.
    if (this.start_HP / this.hp_max <= .8) {
      e_spd += this.get_brazen_spd_boost();
    }
  }

  // If the effective spd is negative, set it to 0.
  if (e_spd < 0) {
    e_spd = 0;
  }

  // Return the effective spd.
  return e_spd;
};
// Calculates the effective def of the unit.
Fighter.prototype.calculate_def = function(attacker_flag, enemy, in_combat) {
  var enemy_range = enemy.get_range();

  var enemy_start_hp = enemy.get_start_HP();

  // Reverses buffs if applicable.
  if (this.buffs_reversed) {
    this.def_buff *= -1;
  }
  // Sets an initial value for the effective def.
  var e_def = this.get_perm_def() + this.get_assumed_def_boost() - this.def_debuff;
  // If buffs are not positive or not negated, add buffs.
  if (this.def_buff < 0 || this.check_buff_negate(enemy) == "") {
    e_def += this.def_buff;
  }

  if (in_combat) {
    // If the unit has a inverse spur effect, add 2x adjacent allies to effective def.
    if (this.get_inverse_spur() == 1) {
      e_def += this.get_adj_allies() * 2;
    }

    // Apply effects that boost def based on enemies in 2 spaces.
    if (this.get_def_bonus_nearby_ally() > 0) {
      e_def += this.get_def_bonus_nearby_ally() * Math.min((this.adj_allies+this.two_space_allies),3);
    }

    // Apply any Earth Boost bonuses, if necessary.
    if ((this.get_start_HP() - enemy_start_hp) >= 3) {
      e_def += this.get_earth_boost_bonus();
    }

    // If the unit has a "Bond" skill that boosts Def, and has at least one adjacent ally, apply it.
    if (this.get_def_bond() > 0 && this.adj_allies > 0) {
      e_def += this.get_def_bond();
    }

    // If the unit in quesiton is attacking, add offensive def bonuses.
    if (attacker_flag) {
      e_def += this.get_def_boost_off();
      if (enemy_range > 1) {
        e_def += this.get_distant_def_off_bonus();
      }
      else {
        e_def += this.get_close_def_off_bonus();
      }
      if (this.conditional_effects) {
        e_def += this.get_cond_def_off_bonus();
      }
    }
    // If the unit in question is defending, add defensive def bonuses.
    else {
      e_def += this.get_def_boost_def();
      if (enemy_range > 1) {
        e_def += this.get_distant_def_def_bonus();
      }
      else {
        e_def += this.get_close_def_def_bonus();
      }
      // Special case! Vidofnir provides a def bonus when defending, but only against
      // Axes, Lances, and Swords.
      if (enemy.get_weap() == "A" || enemy.get_weap() == "L" || enemy.get_weap() == "S") {
        e_def += this.get_def_boost_def_vs_ALS();
      }
      if (this.conditional_effects) {
        e_def += this.get_cond_def_def_bonus();
      }
    }

    // If the unit in question is at full HP, and has an effect that increases Def at full HP, include it.
    if (this.get_start_HP() == this.get_HP_max()) {
      e_def += this.get_def_boost_full_hp();
    }
    else {
      e_def += this.get_def_boost_damaged();
    }

    // Special case! Account for Tyrfing if necessary.
    if (this.get_start_HP() <= Math.floor(this.get_HP_max()/2)) {
      e_def += this.weapon.def_boost_below50;
    }

    // If the unit gets a Def bonus when below a certain HP threshold, apply it.
    if (this.start_HP / this.hp_max <= .8) {
      e_def += this.get_brazen_def_boost();
    }
  }

  // If the effective def is negative, set it to 0.
  if (e_def < 0) {
    e_def = 0;
  }

  // Return the effective def.
  return e_def;
};
// Calculates the effective res of the unit.
Fighter.prototype.calculate_res = function(attacker_flag, enemy, in_combat) {
  var enemy_range = enemy.get_range();

  var enemy_start_hp = enemy.get_start_HP();

  // Reverse buffs if applicable.
  if (this.buffs_reversed) {
    this.res_buff *= -1;
  }
  // Sets an initial value for the effective res.
  var e_res = this.get_perm_res() + this.get_assumed_res_boost() - this.res_debuff;
  // If buffs are not positive or not negated, add buffs.
  if (this.res_buff < 0 || this.check_buff_negate(enemy) == "") {
    e_res += this.res_buff;
  }

  if (in_combat) {
    // If the unit has a inverse spur effect, add 2x adjacent allies to effective res.
    if (this.get_inverse_spur() == 1) {
      e_res += this.get_adj_allies() * 2;
    }

    // Apply effects that boost spd based on enemies in 2 spaces.
    if (this.get_res_bonus_nearby_ally() > 0) {
      e_res += this.get_res_bonus_nearby_ally() * Math.min((this.adj_allies+this.two_space_allies),3);
    }

    // Apply any Water Boost bonuses, if necessary.
    if ((this.get_start_HP() - enemy_start_hp) >= 3) {
      e_res += this.get_water_boost_bonus();
    }

    // If the unit has a "Bond" skill that boosts Res, and has at least one adjacent ally, apply it.
    if (this.get_res_bond() > 0 && this.adj_allies > 0) {
      e_res += this.get_res_bond();
    }

    // If the unit in question is attacking, make sure to include
    // offensive res bonuses.
    if (attacker_flag == 1) {
      e_res += this.get_res_boost_off();
      if (enemy_range > 1) {
        e_res += this.get_distant_res_off_bonus();
      }
      else {
        e_res += this.get_close_res_off_bonus();
      }
      if (this.conditional_effects) {
        e_res += this.get_cond_res_off_bonus();
      }
    }
    // If the unit in question is defending, make sure to include
    // defensive res bonuses.
    else {
      e_res += this.get_res_boost_def();
      if (enemy_range > 1) {
        e_res += this.get_distant_res_def_bonus();
      }
      else {
        e_res += this.get_close_res_def_bonus();
      }
      if (this.conditional_effects) {
        e_res += this.get_cond_res_def_bonus();
      }
    }

    // If the unit gets a Res bonus when below a certain HP threshold, apply it.
    if (this.start_HP / this.hp_max <= .8) {
      e_res += this.get_brazen_res_boost();
    }

    // If the unit in question is at full HP, and has an effect that increases Res at full HP, include it.
    if (this.get_start_HP() == this.get_HP_max()) {
      e_res += this.get_res_boost_full_hp();
    }
    else {
      e_res += this.get_res_boost_damaged();
    }
  }

  // If the effective res is negative, set it to 0.
  if (e_res < 0) {
    e_res = 0;
  }

  // Return the effective res.
  return e_res;
};

/* ************************** END OF STAT CALCULATION ************************** */

/* Input:
    -attacker_flag: whether or not this unit is the active unit.
    -enemy: this unit's enemy.
    -in_combat: whether or not this scenario is being evaluated in or out of combat.
   Output:
    -String detailing the status of this unit's field and combat buffs, and weapon
     triangle status.
*/
Fighter.prototype.precombat_report_stats = function (attacker_flag, enemy, in_combat) {
  var report = "", temp = "";
  var enemy_range = enemy.get_range();
  // The names of combat_buff properties, to be passed into the combat_buff_reporting
  // function. This should be an array of 4 elements, one for each stat, in the order
  // Atk, Spd, Def, Res.
  var property_names;

  // The magnitude of the buff.
  var magnitudes;

  // Reporting for a reversed buff status effect.
  if (this.buffs_reversed) {
    report += this.get_name() + "'s field buffs are reversed this combat!<br>";
  }
  // Reporting for buff neutralization by the enemy.
  if (this.check_buff_negate(enemy) != "" && !this.buffs_reversed) {
    report += this.get_name() + "'s field buffs are neutralized by " + enemy.get_name() + "'s " + this.check_buff_negate(enemy) + "!<br>";
  }
  if (in_combat) {
    // Reporting for full HP stat bonuses.
    if (this.get_start_HP() == this.get_HP_max()) {
      property_names = new Array("atk_boost_full_hp", "spd_boost_full_hp", "def_boost_full_hp", "res_boost_full_hp");
      magnitudes = new Array(1, 1, 1, 1);
      report += this.combat_buff_reporting(this.get_name(), this.weapon, property_names, magnitudes);
      report += this.combat_buff_reporting(this.get_name(), this.a_skill, property_names, magnitudes);
    }
    // Reporting for <100% HP stat bonuses.
    else {
      property_names = new Array("atk_boost_damaged", "spd_boost_damaged", "def_boost_damaged", "res_boost_damaged");
      magnitudes = new Array(1, 1, 1, 1);
      report += this.combat_buff_reporting(this.get_name(), this.weapon, property_names, magnitudes);
    }
    // Reporting for "Brazen" stat bonuses.
    if (this.start_HP / this.hp_max <= .8) {
      property_names = new Array("brazen_atk_boost", "brazen_spd_boost", "brazen_def_boost", "brazen_res_boost");
      magnitudes = new Array(1, 1, 1, 1);
      report += this.combat_buff_reporting(this.get_name(), this.a_skill, property_names, magnitudes);
      report += this.combat_buff_reporting(this.get_name(), this.weapon, property_names, magnitudes);
    }
    // Reporting for stat bonuses granted when enemy is at full HP.
    if (enemy.get_start_HP() == enemy.get_HP_max()) {
      property_names = new Array("atk_boost_enemy_full_hp", "spd_boost_enemy_full_hp", "def_boost_enemy_full_hp", "res_boost_enemy_full_hp");
      magnitudes = new Array(1, 1, 1, 1);
      report += this.combat_buff_reporting(this.get_name(), this.weapon, property_names, magnitudes);
    }
    // Reporting for adjacency stat bonus effects (inverse spur, bonds).
    if (this.get_adj_allies() > 0) {
      if (this.get_inverse_spur()) {
        report += this.get_name() + " receives a combat buff of Atk/Spd/Def/Res+" + this.get_adj_allies() * 2 + " from " + this.weapon.name + "!<br />";
      }
      property_names = new Array("atk_bond", "spd_bond", "def_bond", "res_bond");
      magnitudes = new Array(1, 1, 1, 1);
      report += this.combat_buff_reporting(this.get_name(), this.weapon, property_names, magnitudes);
      report += this.combat_buff_reporting(this.get_name(), this.a_skill, property_names, magnitudes);
    }
    // Reporting for nearby stat bonus effects (Inverse drives).
    if (this.get_atk_bonus_nearby_ally() > 0 || this.get_spd_bonus_nearby_ally() > 0 || this.get_def_bonus_nearby_ally() > 0 || this.get_res_bonus_nearby_ally() > 0) {
      if (this.get_adj_allies() + this.get_two_space_allies() > 0) {
        property_names = new Array("atk_bonus_nearby_ally", "spd_bonus_nearby_ally", "def_bonus_nearby_ally", "res_bonus_nearby_ally");
        var mag = Math.min((this.get_adj_allies() + this.get_two_space_allies()), 3);
        magnitudes = new Array(mag, mag, mag, mag);
        report += this.combat_buff_reporting(this.get_name(), this.weapon, property_names, magnitudes);
      }
    }
    // Reporting for "[Element] Boost" effects.
    if (this.get_start_HP() - enemy.get_start_HP() >= 3) {
      property_names = new Array("fire_boost_bonus", "wind_boost_bonus", "earth_boost_bonus", "water_boost_bonus");
      magnitudes = new Array(1, 1, 1, 1);
      report += this.combat_buff_reporting(this.get_name(), this.a_skill, property_names, magnitudes);
    }
    // Reporting for bonuses granted when this unit initiates combat.
    if (attacker_flag) {
      property_names = new Array("atk_boost_off", "spd_boost_off", "def_boost_off", "res_boost_off");
      magnitudes = new Array(1, 1, 1, 1);
      report += this.combat_buff_reporting(this.get_name(), this.weapon, property_names, magnitudes);
      report += this.combat_buff_reporting(this.get_name(), this.a_skill, property_names, magnitudes);

      if (enemy_range > 1) {
        property_names = new Array("distant_atk_off_bonus", "distant_spd_off_bonus", "distant_def_off_bonus", "distant_res_off_bonus");
        magnitudes = new Array(1, 1, 1, 1);
        report += this.combat_buff_reporting(this.get_name(), this.weapon, property_names, magnitudes);
      }
      else {
        property_names = new Array("close_atk_off_bonus", "close_spd_off_bonus", "close_def_off_bonus", "close_spd_off_bonus");
        magnitudes = new Array(1, 1, 1, 1);
        report += this.combat_buff_reporting(this.get_name() , this.weapon, property_names, magnitudes);
      }

      // Reporting for Conditional Effects.
      if (this.conditional_effects) {
        property_names = new Array("cond_atk_off_bonus", "cond_spd_off_bonus", "cond_def_off_bonus", "cond_res_off_bonus");
        magnitudes = new Array(1, 1, 1, 1);
        report += this.combat_buff_reporting(this.get_name(), this.weapon, property_names, magnitudes);
        report += this.combat_buff_reporting(this.get_name(), this.a_skill, property_names, magnitudes);
      }
    }
    // Reporting for bonuses granted when the enemy initiates combat.
    else {
      property_names = new Array("atk_boost_def", "spd_boost_def", "def_boost_def", "res_boost_def");
      magnitudes = new Array(1, 1, 1, 1);
      report += this.combat_buff_reporting(this.get_name(), this.weapon, property_names, magnitudes);
      report += this.combat_buff_reporting(this.get_name(), this.a_skill, property_names, magnitudes);

      if (enemy_range > 1) {
        property_names = new Array("distant_atk_def_bonus", "distant_spd_def_bonus", "distant_def_def_bonus", "distant_res_def_bonus");
        magnitudes = new Array(1, 1, 1, 1);
        report += this.combat_buff_reporting(this.get_name(), this.weapon, property_names, magnitudes);
        report += this.combat_buff_reporting(this.get_name(), this.a_skill, property_names, magnitudes);
        report += this.combat_buff_reporting(this.get_name(), this.seal, property_names, magnitudes);
      }
      else {
        property_names = new Array("close_atk_def_bonus", "close_spd_def_bonus", "close_def_def_bonus", "close_res_def_bonus");
        magnitudes = new Array(1, 1, 1, 1);
        report += this.combat_buff_reporting(this.get_name(), this.weapon, property_names, magnitudes);
        report += this.combat_buff_reporting(this.get_name(), this.a_skill, property_names, magnitudes);
        report += this.combat_buff_reporting(this.get_name(), this.seal, property_names, magnitudes);

        // SPECIAL CASE! Vidofnir provides Def+7 when an enemy wielding an Axe, Lance, or Sword
        // initiates combat.
        if ((enemy.get_weap() == "A" || enemy.get_weap() == "L" || enemy.get_weap() == "S") && this.get_def_boost_def_vs_ALS() > 0) {
          report += this.get_name() + " receives a combat buff of Def+" + this.get_def_boost_def_vs_ALS() + " from " + this.weapon.name + "!<br />";
        }
      }

      // Reporting for Conditional Effects.
      if (this.conditional_effects) {
        property_names = new Array("cond_atk_def_bonus", "cond_spd_def_bonus", "cond_def_def_bonus", "cond_res_def_bonus");
        magnitudes = new Array(1, 1, 1, 1);
        report += this.combat_buff_reporting(this.get_name(), this.weapon, property_names, magnitudes);
        report += this.combat_buff_reporting(this.get_name(), this.a_skill, property_names, magnitudes);
      }
    }
    // SPECIAL CASE! Tyrfing provides Def+4 when the unit's HP is 50% or lower
    // at the start of combat.
    if ((this.get_start_HP() <= Math.floor(this.get_HP_max()/2)) && this.weapon.def_boost_below50 > 0) {
      report += this.get_name() + " receives a combat buff of Def+" + this.weapon.def_boost_below50 + " from " + this.weapon.name + "!<br />";
    }

    var bonus_atk = 0;
    // Reporting for -blade tome buff to Atk conversion.
    if (this.get_blade() && this.check_buff_negate(enemy) == "") {
      if (this.atk_buff > 0) {
        bonus_atk += this.atk_buff;
      }
      if (this.spd_buff > 0) {
        bonus_atk += this.spd_buff;
      }
      if (this.def_buff > 0) {
        bonus_atk += this.def_buff;
      }
      if (this.res_buff > 0) {
        bonus_atk += this.res_buff;
      }

      if (bonus_atk > 0) {
        report += this.get_name() + " receives bonus Atk = the total value of his/her buffs (" + bonus_atk + ") from " + this.weapon.name + "!<br />";
        bonus_atk = 0;
      }
    }
    // Reporting for enemy debuff to Atk conversion.
    if (this.weapon.enemy_debuffs_to_atk) {
      if (enemy.get_atk_debuff() > 0) {
        bonus_atk += enemy.get_atk_debuff();
      }
      if (enemy.get_spd_debuff() > 0) {
        bonus_atk += enemy.get_spd_debuff();
      }
      if (enemy.get_def_debuff() > 0) {
        bonus_atk += enemy.get_spd_debuff();
      }
      if (enemy.get_res_debuff() > 0) {
        bonus_atk += enemy.get_res_debuff();
      }

      if (bonus_atk > 0) {
        report += this.get_name() + " receives bonus Atk = the total value of the enemy's debuffs (" + bonus_atk + ") from " + this.weapon.name + "!<br />";
        bonus_atk = 0;
      }
    }
    // Reporting for enemy buff to Atk conversion.
    if (this.weapon.enemy_buffs_to_atk) {
      if (enemy.get_atk_buff() > 0) {
        bonus_atk += enemy.get_atk_buff();
      }
      if (enemy.get_spd_buff() > 0) {
        bonus_atk += enemy.get_spd_buff();
      }
      if (enemy.get_def_buff() > 0) {
        bonus_atk += enemy.get_spd_buff();
      }
      if (enemy.get_res_buff() > 0) {
        bonus_atk += enemy.get_res_buff();
      }

      if (bonus_atk > 0) {
        report += this.get_name() + " receives bonus Atk = the total value of the enemy's buffs (" + bonus_atk + ") from " + this.weapon.name + "!<br />";
        bonus_atk = 0;
      }
    }
    // Special case! Reporting for when this unit's Loptous inflicts an Atk penalty on the enemy.
    if (enemy.weapon.loptous && (!this.weapon.rbrth_eff && !this.weapon.bbrth_eff && !this.weapon.gbrth_eff && !this.weapon.nbrth_eff)) {
      report += this.get_name() + " receives a Atk-6 penalty due to not having a dragon effective weapon from " + enemy.name + "'s " + enemy.weapon.name + "!<br />";
    }
  }

  var atk = this.calculate_atk(attacker_flag, enemy, in_combat);
  if (atk < 0) {
    atk = 0;
  }

  // Reporting for effective attack modifications (effective damage, triangle advantage)
  if (this.check_effective_damage(enemy)) {
    atk += Math.floor(atk * .5);
    report += this.get_name() + " receives a +50% Atk bonus from Effective Damage dealt by " + this.weapon.name + " (" + atk + " Atk)!<br />";
  }
  else if (this.effective_damage_canceled(enemy)) {
    report += this.get_name() + "'s Effective Damage from his/her " + this.weapon.name + " is neutralized by " + enemy.get_name() + "'s " + enemy.a_skill.name + " (" + atk + " Atk)!<br />";
  }

  var wt_result = this.wt_check(enemy);
  if (wt_result == 1) {
    // Reporting for self-canceled Triangle Affinity skills.
    if (this.get_wt_amp() == 1 && this.get_self_affinity_cancel() == 1) {
      report += this.name + "'s " + this.b_skill.name + " cancels his/her own Triangle Affinity skill!<br />";
    }

    // If the enemy or the unit has a non-self-canceled Triangle Affinity effect...
    if ((enemy.get_wt_amp() == 1 && enemy.get_self_affinity_cancel() == 0) || (this.get_wt_amp() == 1 && this.get_self_affinity_cancel() == 0)) {
      // If the enemy has an effect that cancels ALL foe triangle affinity,
      // effective atk is not amplified by the user's Triangle Affinity skill.
      if (enemy.get_foe_affinity_cancel() == 1 || enemy.get_disadv_foe_affinity_cancel() == 1) {
        atk += Math.floor(atk * .2);
        report += this.name + "'s Triangle Affinity skill is canceled by " + enemy.get_name() + "'s " + enemy.b_skill.name + ", and receives a +20% Atk bonus from Triangle Advantage (" + atk + " Atk)!<br />";
      }
      // Otherwise, if the foe does not have a skill that reverses Triangle
      // Affinity skills when at a disadvantage, apply a +40% bonus to effective atk.
      // If the foe DOES have such a skill, the matchup is effectively neutral.
      else if (enemy.get_disadv_foe_affinity_reverse() == 0) {
        atk += Math.floor(atk * .4);
        report += this.name + " receives a +40% Atk bonus from Triangle Advantage (" + atk + " Atk)!<br />";
      }
      else {
        report += this.name + "'s Triangle Affinity skill is reversed by " + enemy.get_name() + "'s " + enemy.b_skill.name + ", and receives a +0% Atk bonus from Triangle Advantage (" + atk + " Atk)!<br />";
      }
    }
    else {
      atk += Math.floor(atk * .2);
      report += this.name + " receives a +20% Atk bonus from Triangle Advantage (" + atk + " Atk)!<br />";
    }
  }
  else if (wt_result == -1) {
    // If the enemy or the unit has a non-self-canceled Triangle Affinity effect...
    if ((enemy.get_wt_amp() == 1 && enemy.get_self_affinity_cancel() == 0) || (this.get_wt_amp() == 1 && this.get_self_affinity_cancel() == 0)) {
      // If the unit has a skill that cancels foe's Triangle Affinity skills,
      // only a 20% penalty is applied to e_atk.
      if (this.get_foe_affinity_cancel() == 1 || this.get_disadv_foe_affinity_cancel() == 1) {
        atk -= Math.floor(atk * .2);
        report += this.name + "'s " + this.b_skill.name + " cancels " + enemy.get_name() + "'s Triangle Affinity skill, and receives a -20% Atk pentalty from Triangle Disadvantage (" + atk + " Atk)!<br />";
      }
      // Otherwise, if the unit does not have a skill that reverses Triangle
      // Affinity skills when at a disadvantage, apply a -40% penalty to e_atk.
      // If the unit DOES have such a skill, the matchup is effectively neutral.
      else if (this.get_disadv_foe_affinity_reverse() == 0) {
        atk -= Math.floor(atk * .4);
        report += this.name + " receives a -40% Atk penalty from Triangle Disadvantage (" + atk + " Atk)!<br />";
      }
      else {
        report += this.name + "'s " + this.b_skill.name + " reverses " + enemy.get_name() + "'s Triangle Affinity skill, and receives a -0% Atk penalty from Triangle Disadvantage (" + atk + " Atk)!<br />";
      }
    }
    else {
      atk -= Math.floor(atk * .2);
      report += this.name + " receives a -20% Atk penalty from Triangle Disadvantage (" + atk + " Atk)!<br />";
    }
  }

  return report;
};
/* Helper function for precombat_report_stats.
  Input:
    -unit_name: Name of the unit being assessed combat buffs.
    -skill: Skill that potentially provides the combat buffs.
    -properties: A 4-element array that holds the names of the properties that
                 potentially hold the values of combat buffs. The properties
                 should be in the order Atk, Spd, Def, Res.
    -magnitude: A multiplier for each combat buff. Usually 1, but sometimes
                a combat buff will scale based on an unkown factor (ex. Inverse
                Drives).

   Output:
    -String detailing all combat buffs received from the skill.
*/
Fighter.prototype.combat_buff_reporting = function (unit_name, skill, properties, magnitudes) {
  var output = "";
  if (skill[properties[0]] > 0) {
    output += "Atk+" + skill[properties[0]]*magnitudes[0];
  }
  if (skill[properties[1]] > 0) {
    if (output != "") {
      output += "/";
    }
    output += "Spd+" + skill[properties[1]]*magnitudes[1];
  }
  if (skill[properties[2]] > 0) {
    if (output != "") {
      output += "/";
    }
    output += "Def+" + skill[properties[2]]*magnitudes[2];
  }
  if (skill[properties[3]] > 0) {
    if (output != "") {
      output += "/";
    }
    output += "Res+" + skill[properties[3]]*magnitudes[3];
  }
  if (output != "") {
    output = unit_name + " receives a combat buff of " + output + " from " + skill.name + "!<br />";
  }
  return output;
};
// Helper function for precombat_report_stats.
// Input: This unit's enemy.
// Output: Whether or not this unit's effective damage is canceled by an enemy skill.
Fighter.prototype.effective_damage_canceled = function (enemy) {
  if (this.weapon.inf_eff && enemy.get_type() == "I" && enemy.get_negate_mov_eff()) {
    return true;
  }
  if (this.weapon.cav_eff && enemy.get_type() == "C" && enemy.get_negate_mov_eff()) {
    return true;
  }
  if (this.weapon.fly_eff && enemy.get_type() == "F" && enemy.get_negate_mov_eff()) {
    return true;
  }
  if (this.weapon.arm_eff && enemy.get_type() == "A" && enemy.get_negate_mov_eff()) {
    return true;
  }
  return false;
};

// Subtracts combat damage from the unit's HP.
Fighter.prototype.apply_damage = function(dmg) {
  this.hp -= dmg;
  if (this.hp < 0) {
    this.hp = 0;
  }
  return dmg;
};
// Checks to see who has the weapon triangle advantage.
// Returns 1 if this unit has WTA. Returns -1 if enemy has WTA.
// Returns 0 if neither has WTA.
Fighter.prototype.wt_check = function(enemy) {
  if ((this.color == "R" && enemy.get_color() == "G") || (this.color == "G" && enemy.get_color() == "B") || (this.color == "B" && enemy.get_color() == "R") || (this.get_colorless_wta() == 1 && enemy.get_color() == "N"))
    return 1;
  else if ((this.color == "G" && enemy.get_color() == "R") || (this.color == "R" && enemy.get_color() == "B") || (this.color == "B" && enemy.get_color() == "G") || (enemy.get_colorless_wta() == 1 && this.color == "N"))
    return -1;
  else
    return 0;
};
// Adds HP to the unit.
Fighter.prototype.add_HP = function(health) {
  this.hp += health;
  if (this.hp > this.hp_max) {
    this.hp = this.hp_max;
  }
};
// Checks to see if the unit's buffs are negated by the enemy.
// Returns either an empty string (buffs are not negated), or the source
// of buff negation.
Fighter.prototype.check_buff_negate = function (enemy) {
  var weap_type_negate = "", mov_type_negate = "";
  switch (this.get_weap()) {
    case "S":
      weap_type_negate = enemy.get_negate_srd_buffs();
      break;
    case "L":
      weap_type_negate = enemy.get_negate_lnc_buffs();
      break;
    case "A":
      weap_type_negate = enemy.get_negate_axe_buffs();
      break;
    case "RT":
      weap_type_negate = enemy.get_negate_rt_buffs();
      break;
    case "BT":
      weap_type_negate = enemy.get_negate_bt_buffs();
      break;
    case "GT":
      weap_type_negate = enemy.get_negate_gt_buffs();
      break;
    case "RB":
      weap_type_negate = enemy.get_negate_rbow_buffs();
      break;
    case "BB":
      weap_type_negate = enemy.get_negate_bbow_buffs();
      break;
    case "GB":
      weap_type_negate = enemy.get_negate_gbow_buffs();
      break;
    case "NB":
      weap_type_negate = enemy.get_negate_nbow_buffs();
      break;
    case "RK":
      weap_type_negate = enemy.get_negate_r_dgr_buffs();
      break;
    case "BK":
      weap_type_negate = enemy.get_negate_b_dgr_buffs();
      break;
    case "GK":
      weap_type_negate = enemy.get_negate_g_dgr_buffs();
      break;
    case "NK":
      weap_type_negate = enemy.get_negate_n_dgr_buffs();
      break;
    case "ST":
      weap_type_negate = enemy.get_negate_stf_buffs();
      break;
    case "RD":
      weap_type_negate = enemy.get_negate_rbrth_buffs();
      break;
    case "BD":
      weap_type_negate = enemy.get_negate_bbrth_buffs();
      break;
    case "GD":
      weap_type_negate = enemy.get_negate_gbrth_buffs();
      break;
    default:
      weap_type_negate = enemy.get_negate_nbrth_buffs();
  }

  switch (this.get_type()) {
    case "A":
      mov_type_negate = enemy.get_negate_arm_buffs();
      break;
    case "C":
      mov_type_negate = enemy.get_negate_cav_buffs();
      break;
    case "I":
      mov_type_negate = enemy.get_negate_inf_buffs();
      break;
    case "F":
      mov_type_negate = enemy.get_negate_fly_buffs();
      break;
  }

  if (weap_type_negate != "") {
    return weap_type_negate;
  }
  else {
    return mov_type_negate;
  }
  //return (weap_type_negate || mov_type_negate);
};

/* Checks to see if the unit meets the stat requirements for skills that increase
 * skill charge rates (Heavy Blade, Ayra's Blade, etc.)
 *
 * Input:
 *  -enemy: the enemy unit.
 *  -attacker_active: True when this unit is the active unit. False otherwise.
 *  -is_attacking: True when this unit is dealing damage. False when this unit is
 *                 receiving damage.
 * Output:
 *  -The highest bonus cooldown value out of all applicable factors.
 */
Fighter.prototype.bonus_cd_applies = function (enemy, attacker_active, is_attacking) {
  return Math.max(this.get_atk_bonus_cd(enemy, attacker_active, is_attacking), this.get_spd_bonus_cd(enemy, attacker_active, is_attacking), this.get_attacking_bonus_cd(attacker_active, is_attacking), this.get_defending_bonus_cd(attacker_active, is_attacking), this.get_special_bonus_cd(enemy), this.get_cond_bonus_cd(is_attacking));
};
// Initializes a counter to hold the number of active sources of generic (i.e. not tied to
// any conditions besides initiating or defending) guaranteed follow-up. Increments the
// counter for each active source, returning the counter at the end.
Fighter.prototype.follow_up_thresh_applies = function (is_active) {
  var counter = 0;
  if ((is_active && this.b_skill.follow_up_off) || (!is_active && this.b_skill.follow_up_def)) {
    if (this.start_HP / this.hp_max >= this.b_skill.follow_up_thresh) {
      counter += 1;
    }
  }
  if ((is_active && this.weapon.follow_up_off) || (!is_active && this.weapon.follow_up_def)) {
    if (this.start_HP / this.hp_max >= this.weapon.follow_up_thresh) {
      counter += 1;
    }
  }
  if ((is_active && this.seal.follow_up_off) || (!is_active && this.seal.follow_up_def)) {
    if (this.start_HP / this.hp_max >= this.seal.follow_up_thresh) {
      counter += 1;
    }
  }
  if (this.conditional_effects && ((is_active && this.weapon.cond_follow_up_off) || (!is_active && this.weapon.cond_follow_up_def))) {
    if (this.start_HP / this.hp_max >= this.weapon.cond_follow_up_thresh) {
      counter += 1;
    }
  }
  return counter;
};
// Checks to see if the unit meets the HP requirement for Brash Assault.
Fighter.prototype.brash_assault_applies = function(can_counter) {
  var hp_thresh = Math.max(this.weapon.brash_assault_thresh, this.b_skill.brash_assault_thresh, this.seal.brash_assault_thresh);
  return (hp_thresh > 0 && (this.start_HP / this.hp_max <= hp_thresh) && can_counter);
};
// Checks to see if the unit meets the HP requirement for Hardy Bearing.
Fighter.prototype.hardy_bearing_applies = function () {
  if (this.weapon.hardy_bearing_thresh != 0 || this.seal.hardy_bearing_thresh != 0) {
    return ((this.startHP / this.hp_max) >= this.weapon.hardy_bearing_thresh)
            ||
            ((this.start_HP / this.hp_max) >= this.seal.hardy_bearing_thresh);
  }
  return false;
};
// Gets the source of the unit's Hardy Bearing effect.
Fighter.prototype.get_hardy_bearing_source = function () {
  if (this.weapon.hardy_bearing_thresh != 0) {
    return this.weapon.name;
  }
  if (this.seal.hardy_bearing_thresh != 0) {
    return this.seal.name;
  }
  return false;
};
// Checks to see if the unit meets the HP requirement for Desperation, and Desperation is not
// negated by a Hardy Bearing effect.
Fighter.prototype.desperation_applies = function(enemy) {
  var desperation_thresh = Math.max(this.weapon.desperation_thresh, this.b_skill.desperation_thresh);
  var result = ((this.start_HP / this.hp_max) <= desperation_thresh);
  if (result) {
    if (this.get_hardy_bearing_thresh() != 0) {
      combat_log += this.get_name() + "'s " + this.get_hardy_bearing_source() + " negates his/her order-of-combat altering effects (" + this.get_desperation_source() + ")!<br>";
      return false;
    }
    if (enemy.hardy_bearing_applies()) {
      combat_log += enemy.get_name() + "'s " + enemy.get_hardy_bearing_source() + " negates " + this.get_name() + "'s order-of-combat altering effects (" + this.get_desperation_source() + ")!<br>";
      return false;
    }
  }
  return result;
};
Fighter.prototype.get_desperation_source = function () {
  var source = "", thresh = 0;
  if (this.weapon.desperation_thresh > 0) {
    thresh = this.weapon.desperation_thresh;
    source = this.weapon.name;
  }
  if (this.b_skill.desperation_thresh > 0) {
    if (this.b_skill.desperation_thresh > thresh) {
      thresh = this.b_skill.desperation_thresh;
      source = this.b_skill.name;
    }
  }
  return source;
};
// Checks to see if the unit meets the HP requirement for Vantage, and Vantage is not negated
// by a Hardy Bearing effect.
Fighter.prototype.vantage_applies = function(enemy) {
  var vantage_thresh = this.b_skill.vantage_thresh;
  var result = ((this.hp / this.hp_max) <= vantage_thresh);
  if (result) {
    if (this.get_hardy_bearing_thresh() != 0) {
      combat_log += this.get_name() + "'s " + this.get_hardy_bearing_source() + " negates his/her order-of-combat altering effects (" + this.get_vantage_source() + ")!<br>";
      return false;
    }
    if (enemy.hardy_bearing_applies()) {
      combat_log += enemy.get_name() + "'s " + enemy.get_hardy_bearing_source() + " negates " + this.get_name() + "'s order-of-combat altering effects (" + this.get_vantage_source() + ")!<br>";
      return false;
    }
  }

  return result;
};
// Gets the source of the unit's Vantage effect.
Fighter.prototype.get_vantage_source = function () {
  return this.b_skill.name;
};
// Checks to see if the unit meets the HP requirement for Guard.
Fighter.prototype.guard_applies = function () {
  return ((this.start_HP >= (this.hp_max * this.get_guard_threshold())) && this.get_guard_threshold() > 0);
};
Fighter.prototype.get_guard_source = function () {
  return this.b_skill.name;
};
// Checks to see if the unit meets the HP requirement for Wrathful Staff.
Fighter.prototype.wrathful_staff_applies = function () {
  if (this.weapon.wrathful_staff_threshold != 0 || this.b_skill.wrathful_staff_threshold != 0) {
    return ((this.start_HP / this.hp_max) >= this.weapon.wrathful_staff_threshold)
           ||
           ((this.start_HP / this.hp_max) >= this.b_skill.wrathful_staff_threshold);
  }
  else {
    return false;
  }
};
Fighter.prototype.get_wrathful_staff_source = function () {
  if ((this.start_HP / this.hp_max) >= this.weapon.wrathful_staff_threshold && this.weapon.wrathful_staff_threshold != 0) {
    return this.weapon.name;
  }
  if ((this.start_HP / this.hp_max) >= this.b_skill.wrathful_staff_threshold && this.b_skill.wrathful_staff_threshold != 0) {
    return this.b_skill.name;
  }
};
// Checks to see if the unit meets the HP requirement for Dazzling Staff.
Fighter.prototype.dazzling_staff_applies = function () {
  if (this.weapon.dazzling_staff_threshold != 0 || this.b_skill.dazzling_staff_threshold != 0) {
    return ((this.start_HP / this.hp_max) >= this.weapon.dazzling_staff_threshold)
           ||
           ((this.start_HP / this.hp_max) >= this.b_skill.dazzling_staff_threshold);
  }
  else {
    return false;
  }
};
Fighter.prototype.get_dazzling_staff_source = function () {
  if ((this.start_HP / this.hp_max) >= this.weapon.dazzling_staff_threshold && this.weapon.dazzling_staff_threshold != 0) {
    return this.weapon.name;
  }
  if ((this.start_HP / this.hp_max) >= this.b_skill.dazzling_staff_threshold && this.b_skill.dazzling_staff_threshold != 0) {
    return this.b_skill.name;
  }
};
// Checks to see if the unit meets the HP requirement for Wary Fighter.
Fighter.prototype.wary_fighter_applies = function () {
  var wary_fighter_thresh = this.b_skill.wary_fighter_thresh;
  return (wary_fighter_thresh > 0) && (this.start_HP / this.hp_max >= wary_fighter_thresh);
};
// Checks to see if the unit has a breaker for the enemy weapon type, and if so, checks to see if
// the unit meets the HP requirement to have it active.
Fighter.prototype.breaker_applies = function(enemy_weap) {
  var inhibitor_count = 0;

  if (((this.start_HP / this.hp_max) >= this.b_skill.breaker_thresh) && this.b_skill.breaker == enemy_weap) {
    inhibitor_count += 1;
  }
  if (((this.start_HP / this.hp_max) >= this.weapon.breaker_thresh) && this.weapon.breaker == enemy_weap) {
    inhibitor_count += 1;
  }
  return inhibitor_count;
};
Fighter.prototype.def_follow_up_inhibition_applies = function (attacker_active, enemy, in_combat) {
  if (this.weapon.great_flame_def_thresh > 0 && (this.calculate_def(attacker_active, enemy, in_combat) - enemy.calculate_def(!attacker_active, this, in_combat) >= this.weapon.great_flame_def_thresh)) {
    return true;
  }
  if (this.weapon.brynhildr_def_thresh > 0 && enemy.get_range() == 2 && (this.calculate_def(attacker_active, enemy, in_combat) - enemy.calculate_def(!attacker_active, this, in_combat) >= this.weapon.brynhildr_def_thresh)) {
  	return true;
  }

  else {
    return false;
  }
};
Fighter.prototype.cond_follow_up_inhibition_applies = function (attacker_active, enemy) {
  if (this.conditional_effects) {
    return this.weapon.cond_foe_follow_up_inhibit;
  }
  return false;
};
Fighter.prototype.double_lion_applies = function () {
  if ((this.weapon.double_lion || this.b_skill.double_lion) && this.start_HP == this.hp_max) {
    return true;
  }
  return false;
};
// Determines the magnitude of the atk penalty that this unit inflicts on
// his/her enemy.
Fighter.prototype.inflicts_combat_atk_penalty = function (enemy) {
  var penalty = 0;

  // If the user has Loptous, then a -6 Atk penalty is inflicted on all foes that do not
  // have dragon-effective weaponry.
  if (this.weapon.loptous && (!enemy.weapon.rbrth_eff && !enemy.weapon.bbrth_eff && !enemy.weapon.gbrth_eff && !enemy.weapon.nbrth_eff)) {
    penalty = 6;
  }

  return penalty;
};
// Calculates the permanent raw atk of the unit, active in all scenarios.
Fighter.prototype.get_perm_atk = function () {
  return this.atk + this.weapon.atk_boost_perm + this.a_skill.atk_boost_perm + this.seal.atk_boost_perm;
};
// Calculates the permanent raw spd of the unit, active in all scenarios.
Fighter.prototype.get_perm_spd = function () {
  return this.spd + this.weapon.spd_boost_perm + this.a_skill.spd_boost_perm + this.seal.spd_boost_perm;
};
// Calculates the permanent raw def of the unit, active in all scenarios.
Fighter.prototype.get_perm_def = function () {
  return this.def + this.weapon.def_boost_perm + this.a_skill.def_boost_perm + this.seal.def_boost_perm;
};
// Calculates the permanent raw res of the unit, active in all scenarios.
Fighter.prototype.get_perm_res = function () {
  return this.res + this.weapon.res_boost_perm + this.a_skill.res_boost_perm + this.seal.res_boost_perm;
};
// Applies burn damage.
Fighter.prototype.apply_burn = function() {
  var val = this.get_burn() - this.weapon.heal_after_attack();

  if (this.get_start_HP() == this.get_HP_max()) {
    val += this.get_burn_full_hp();
  }
  this.hp -= val;
  if (this.hp <= 0) {
    this.hp = 1;
  }
};
// Applies damage from a pre-combat special (AoE).
Fighter.prototype.apply_precombat_dmg = function(attacker, defender, mult) {
  var atk;
  var def;

  atk = attacker.calculate_atk(true, defender, false);
  if (attacker.get_weap() == "S" || attacker.get_weap() == "L" || attacker.get_weap() == "A" ||
      attacker.get_weap() == "RB" || attacker.get_weap() == "BB" || attacker.get_weap() == "GB" || attacker.get_weap() == "NB" ||
      attacker.get_weap() == "RK" || attacker.get_weap() == "BK" || attacker.get_weap() == "GK" || attacker.get_weap() == "NK") {
    def = defender.calculate_def(false, attacker, false);
  }
  else {
    def = defender.calculate_res(false, attacker, false) + defender.get_res_buff() + defender.get_assumed_res_boost() - defender.get_res_debuff();
  }

  // Calculate the dmg for the special.
  var dmg = Math.floor((atk - def) * mult);
  // If dmg is negative, set it to 0. Note that calculate_atk() will not zero negative values
  // if the unit has a -blade tome, and that -blade tome bonuses are applied in the
  // calculate_effective_atk() function to avoid conflicts with Heavy Blade (or similar).
  if (dmg < 0) {
    dmg = 0;
  }
  dmg += attacker.get_skill_dmg_bonus();
  defender.reduce_HP(dmg);

  return dmg;
};
// Reduces HP without KOing (Poison Strike, Deathly Dagger, etc.)
Fighter.prototype.reduce_HP = function(value) {
  this.hp -= value;
  if (this.hp <= 0) {
    this.hp = 1;
  }
};
// Revives a unit, resetting everything to default values (overridden by user input when applicable).
Fighter.prototype.revive = function() {
  this.hp = this.hp_max;
  this.reset_cooldown();
  this.reset_debuffs();
  this.reset_buffs();
  this.damage_dealt = 0;
  this.cooldown -= this.get_cd_reduce();;
};

/* TO DO: See if the instances of these functions can be replaced with the set methods below. */
Fighter.prototype.apply_atk_buff = function(val) {
  this.atk_buff = Math.max(this.atk_buff, val);
};
Fighter.prototype.apply_spd_buff = function(val) {
  this.spd_buff = Math.max(this.spd_buff, val);
};
Fighter.prototype.apply_def_buff = function(val) {
  this.def_buff = Math.max(this.def_buff, val);
};
Fighter.prototype.apply_res_buff = function(val) {
  this.res_buff = Math.max(this.res_buff, val);
};
/* End of functions that might need removing. */

// Get methods.
Fighter.prototype.get_name = function() {
  return this.name;
};
Fighter.prototype.get_HP = function() {
  return this.hp;
};
Fighter.prototype.get_HP_max = function() {
  return this.hp_max;
};
Fighter.prototype.get_atk_buff = function() {
  return this.atk_buff;
};
Fighter.prototype.get_spd_buff = function() {
  return this.spd_buff;
};
Fighter.prototype.get_def_buff = function() {
  return this.def_buff;
};
Fighter.prototype.get_res_buff = function() {
  return this.res_buff;
};
Fighter.prototype.get_atk_debuff = function() {
  return this.atk_debuff;
};
Fighter.prototype.get_spd_debuff = function () {
  return this.spd_debuff;
};
Fighter.prototype.get_def_debuff = function() {
  return this.def_debuff;
};
Fighter.prototype.get_res_debuff = function () {
  return this.res_debuff;
};
Fighter.prototype.get_atk_boost_off = function () {
  return this.weapon.atk_boost_off + this.a_skill.atk_boost_off;
};
Fighter.prototype.get_spd_boost_off = function () {
  return this.weapon.spd_boost_off + this.a_skill.spd_boost_off;
};
Fighter.prototype.get_def_boost_off = function () {
  return this.weapon.def_boost_off + this.a_skill.def_boost_off;
};
Fighter.prototype.get_res_boost_off = function () {
  return this.weapon.res_boost_off + this.a_skill.res_boost_off;
};
Fighter.prototype.get_atk_boost_def = function () {
  return this.weapon.atk_boost_def + this.a_skill.atk_boost_def;
};
Fighter.prototype.get_spd_boost_def = function () {
  return this.weapon.spd_boost_def + this.a_skill.spd_boost_def;
};
Fighter.prototype.get_def_boost_def = function () {
  return this.weapon.def_boost_def + this.a_skill.def_boost_def;
};
Fighter.prototype.get_res_boost_def = function () {
  return this.weapon.res_boost_def + this.a_skill.res_boost_def;
};
Fighter.prototype.get_color = function() {
  return this.color;
};
Fighter.prototype.get_colorless_wta = function() {
  return this.weapon.colorless_wta;
};
Fighter.prototype.get_type = function() {
  return this.type;
};
Fighter.prototype.get_wt_amp = function() {
  return Math.max(this.weapon.wt_amp + this.a_skill.wt_amp);
};
Fighter.prototype.get_negate_mov_eff = function() {
  return this.a_skill.negate_mov_eff || this.seal.negate_mov_eff;
};
Fighter.prototype.get_range = function() {
  return this.weapon.range;
};
Fighter.prototype.get_cooldown = function() {
  return this.cooldown;
};
Fighter.prototype.get_next_atk_bonus_dmg = function () {
  return this.next_atk_bonus_dmg;
};
Fighter.prototype.get_proc_name = function() {
  return this.proc.name;
};
Fighter.prototype.get_dmg_mult_proc = function() {
  return this.proc.dmg_mult_proc;
};
Fighter.prototype.get_dmg_taken_mult_proc = function() {
  return this.proc.dmg_taken_mult_proc;
};
Fighter.prototype.get_spd_as_dmg_proc = function () {
  return this.proc.spd_as_dmg_proc;
};
Fighter.prototype.get_def_as_dmg_proc = function() {
  return this.proc.def_as_dmg_proc;
};
Fighter.prototype.get_res_as_dmg_proc = function() {
  return this.proc.res_as_dmg_proc;
};
Fighter.prototype.get_def_reduce_proc = function() {
  return this.proc.def_reduce_proc;
};
Fighter.prototype.get_second_turn_proc = function() {
  return this.proc.second_turn_proc;
};
Fighter.prototype.get_precombat_atk_mult_proc = function() {
  return this.proc.precombat_atk_mult_proc;
};
Fighter.prototype.get_heal_on_hit_proc = function() {
  // Add any skill-based augmentations (ex. Solar Brace), if applicable.
  var to_return = this.proc.heal_on_hit_proc;

  if (this.b_skill.spec_bonus_heal > 0 && this.proc.activates_on_hit) {
    to_return += this.b_skill.spec_bonus_heal;
  }

  return to_return;
};
Fighter.prototype.get_atk_mult_proc = function() {
  return this.proc.atk_mult_proc;
};
Fighter.prototype.get_one_rng_reduce_proc = function() {
  return this.proc.one_rng_reduce_proc;
};
Fighter.prototype.get_two_rng_reduce_proc = function() {
  return this.proc.two_rng_reduce_proc;
};
Fighter.prototype.get_miracle_proc = function() {
  return this.proc.miracle_proc;
};
Fighter.prototype.get_mitig_to_dmg_proc = function () {
  return this.proc.mitig_to_dmg_proc;
};
Fighter.prototype.get_any_range_counter = function() {
  return Math.max(this.weapon.any_range_counter, this.a_skill.any_range_counter);
};
Fighter.prototype.get_weap = function() {
  return this.weap;
};
Fighter.prototype.get_brave = function() {
  return this.weapon.brave;
};
Fighter.prototype.get_brave_def = function () {
  return this.weapon.brave_def;
};
Fighter.prototype.get_heal_on_hit = function() {
  return this.weapon.heal_on_hit;
};
Fighter.prototype.get_burn = function() {
  return this.a_skill.burn + this.weapon.burn;
};
Fighter.prototype.get_defiant_atk = function() {
  return Math.max(this.weapon.defiant_atk, this.a_skill.defiant_atk);
};
Fighter.prototype.get_defiant_spd = function() {
  return this.a_skill.defiant_spd;
};
Fighter.prototype.get_defiant_def = function() {
  return this.a_skill.defiant_def;
};
Fighter.prototype.get_defiant_res = function() {
  return this.a_skill.defiant_res;
};
Fighter.prototype.get_weap_name = function() {
  return this.weapon.name;
};
Fighter.prototype.get_blade = function() {
  return this.weapon.blade;
};
Fighter.prototype.get_hit_1rng_weaker_def_stat = function () {
  return this.weapon.hit_1rng_weaker_def_stat;
};
Fighter.prototype.get_hit_2rng_weaker_def_stat = function () {
  return this.weapon.hit_2rng_weaker_def_stat;
};
Fighter.prototype.get_buffs_reversed = function() {
  return this.buffs_reversed;
};
Fighter.prototype.get_buff_reverse_on_hit = function() {
  return this.weapon.buff_reverse_on_hit;
};
Fighter.prototype.get_skill_dmg_bonus = function() {
  var dmg = this.weapon.skill_dmg_bonus;
  if (dmg > 0) {
    combat_log += this.name + "'s " + this.weapon.name + " adds +" + dmg + " damage to his/her attack.<br>";
  }
  if (this.b_skill.skill_dmg_bonus > 0) {
    dmg += this.b_skill.skill_dmg_bonus;
    combat_log += this.name + "'s " + this.b_skill.name + " adds +" + this.b_skill.skill_dmg_bonus + " damage to his/her attack.<br>";
  }
  if (this.b_skill.wrath_skill_dmg_bonus > 0 && (this.hp/this.hp_max) <= this.b_skill.wrath_threshold && this.proc.activates_on_hit) {
    dmg += this.b_skill.wrath_skill_dmg_bonus;
    combat_log += this.name + "'s " + this.b_skill.name + " adds +" + this.b_skill.wrath_skill_dmg_bonus + " damage to his/her attack.<br>";
  }
  if (this.weapon.wrath_skill_dmg_bonus > 0 && (this.hp/this.hp_max) <= this.weapon.wrath_threshold && this.proc.activates_on_hit) {
    dmg += this.weapon.wrath_skill_dmg_bonus;
    combat_log += this.name + "'s " + this.weapon.name + " adds +" + this.weapon.wrath_skill_dmg_bonus + " damage to his/her attack.<br>";
  }
  return dmg;
};
Fighter.prototype.get_light_brand_dmg_bonus = function (enemy, attacker_active) {
  if (this.weapon.light_brand_bonus > 0 && (enemy.calculate_def(!attacker_active, this, true) >= (enemy.calculate_res(!attacker_active, this, true) + 5))) {
    combat_log += this.name + "'s " + this.weapon.name + " adds +" + this.weapon.light_brand_bonus + " damage to his/her attack.<br>";
    return this.weapon.light_brand_bonus;
  }
  return 0;
};
Fighter.prototype.get_excess_spd_to_dmg = function (enemy, attacker_active) {
  var own_spd = this.calculate_spd(attacker_active, enemy, true) + this.get_skl_compare_spd_boost();
  var enemy_spd = enemy.calculate_spd(!attacker_active, this, true) + enemy.get_skl_compare_spd_boost();
  bonus_dmg = 0;
  if (this.weapon.excess_spd_to_dmg > 0 && own_spd > enemy_spd) {
    bonus_dmg = Math.min(7, Math.floor((own_spd - enemy_spd) * .7));
  }
  if (bonus_dmg > 0) {
    combat_log += this.name + "'s " + this.weapon.name + " adds +" + bonus_dmg + " damage to his/her attack.<br>";
  }
  return bonus_dmg;
};
Fighter.prototype.get_heal_after_attack = function() {
  return this.weapon.heal_after_attack;
};
// Checks to see if the unit negates the enemy's counterattack.
Fighter.prototype.negates_counter = function (enemy) {
  var weap_type_negate = "", mov_type_negate = "";
  switch (enemy.get_weap()) {
    case "S":
      weap_type_negate = this.get_negate_srd_counter();
      break;
    case "L":
      weap_type_negate = this.get_negate_lnc_counter();
      break;
    case "A":
      weap_type_negate = this.get_negate_axe_counter();
      break;
    case "RT":
      weap_type_negate = this.get_negate_rt_counter();
      break;
    case "BT":
      weap_type_negate = this.get_negate_bt_counter();
      break;
    case "GT":
      weap_type_negate = this.get_negate_gt_counter();
      break;
    case "RB":
      weap_type_negate = this.get_negate_rbow_counter();
      break;
    case "BB":
      weap_type_negate = this.get_negate_bbow_counter();
      break;
    case "GB":
      weap_type_negate = this.get_negate_gbow_counter();
      break;
    case "NB":
      weap_type_negate = this.get_negate_nbow_counter();
      break;
    case "RK":
      weap_type_negate = this.get_negate_r_dgr_counter();
      break;
    case "BK":
      weap_type_negate = this.get_negate_b_dgr_counter();
      break;
    case "GK":
      weap_type_negate = this.get_negate_g_dgr_counter();
      break;
    case "NK":
      weap_type_negate = this.get_negate_n_dgr_counter();
      break;
    case "ST":
      weap_type_negate = this.get_negate_stf_counter();
      break;
    case "RD":
      weap_type_negate = this.get_negate_rbrth_counter();
      break;
    case "BD":
      weap_type_negate = this.get_negate_bbrth_counter();
      break;
    case "GD":
      weap_type_negate = this.get_negate_gbrth_counter();
      break;
    default:
      weap_type_negate = this.get_negate_nbrth_counter();
  }

  switch (enemy.get_type()) {
    case "A":
      mov_type_negate = this.get_negate_arm_counter();
      break;
    case "C":
      mov_type_negate = this.get_negate_cav_counter();
      break;
    case "I":
      mov_type_negate = this.get_negate_inf_counter();
      break;
    case "F":
      mov_type_negate = this.get_negate_fly_counter();
      break;
  }

  if (weap_type_negate != "") {
    return weap_type_negate;
  }
  if (mov_type_negate != "") {
    return mov_type_negate;
  }
  return "";
};
Fighter.prototype.get_negate_self_counter = function() {
  if (this.weapon.negate_self_counter) {
    return this.weapon.name;
  }
  return "";
};
Fighter.prototype.get_negate_srd_counter = function () {
  if (this.weapon.negate_srd_counter) {
    return this.weapon.name;
  }
  if (this.b_skill.negate_srd_counter) {
    return this.b_skill.name;
  }
  return "";
};
Fighter.prototype.get_negate_lnc_counter = function () {
  if (this.weapon.negate_lnc_counter) {
    return this.weapon.name;
  }
  if (this.b_skill.negate_lnc_counter) {
    return this.b_skill.name;
  }
  return "";
};
Fighter.prototype.get_negate_axe_counter = function () {
  if (this.weapon.negate_axe_counter) {
    return this.weapon.name;
  }
  if (this.b_skill.negate_axe_counter) {
    return this.b_skill.name;
  }
  return "";
};
Fighter.prototype.get_negate_rt_counter = function () {
  if (this.weapon.negate_rt_counter) {
    return this.weapon.name;
  }
  if (this.b_skill.negate_rt_counter) {
    return this.b_skill.name;
  }
  return "";
};
Fighter.prototype.get_negate_bt_counter = function () {
  if (this.weapon.negate_bt_counter) {
    return this.weapon.name;
  }
  if (this.b_skill.negate_bt_counter) {
    return this.b_skill.name;
  }
  return "";
};
Fighter.prototype.get_negate_gt_counter = function () {
  if (this.weapon.negate_gt_counter) {
    return this.weapon.name;
  }
  if (this.b_skill.negate_gt_counter) {
    return this.b_skill.name;
  }
  return "";
};
Fighter.prototype.get_negate_rbow_counter = function () {
  if (this.weapon.negate_rbow_counter) {
    return this.weapon.name;
  }
  if (this.b_skill.negate_rbow_counter) {
    return this.b_skill.name;
  }
  return "";
};
Fighter.prototype.get_negate_bbow_counter = function () {
  if (this.weapon.negate_bbow_counter) {
    return this.weapon.name;
  }
  if (this.b_skill.negate_bbow_counter) {
    return this.b_skill.name;
  }
  return "";
};
Fighter.prototype.get_negate_gbow_counter = function () {
  if (this.weapon.negate_gbow_counter) {
    return this.weapon.name;
  }
  if (this.b_skill.negate_gbow_counter) {
    return this.b_skill.name;
  }
  return "";
};
Fighter.prototype.get_negate_nbow_counter = function () {
  if (this.weapon.negate_nbow_counter) {
    return this.weapon.name;
  }
  if (this.b_skill.negate_nbow_counter) {
    return this.b_skill.name;
  }
  return "";
};
Fighter.prototype.get_negate_r_dgr_counter = function () {
  if (this.weapon.negate_r_dgr_counter) {
    return this.weapon.name;
  }
  if (this.b_skill.negate_r_dgr_counter) {
    return this.b_skill.name;
  }
  return "";
};
Fighter.prototype.get_negate_b_dgr_counter = function () {
  if (this.weapon.negate_b_dgr_counter) {
    return this.weapon.name;
  }
  if (this.b_skill.negate_b_dgr_counter) {
    return this.b_skill.name;
  }
  return "";
};
Fighter.prototype.get_negate_g_dgr_counter = function () {
  if (this.weapon.negate_g_dgr_counter) {
    return this.weapon.name;
  }
  if (this.b_skill.negate_g_dgr_counter) {
    return this.b_skill.name;
  }
  return "";
};
Fighter.prototype.get_negate_n_dgr_counter = function () {
  if (this.weapon.negate_n_dgr_counter) {
    return this.weapon.name;
  }
  if (this.b_skill.negate_n_dgr_counter) {
    return this.b_skill.name;
  }
  return "";
};
Fighter.prototype.get_negate_stf_counter = function () {
  if (this.weapon.negate_stf_counter) {
    return this.weapon.name;
  }
  if (this.b_skill.negate_stf_counter) {
    return this.b_skill.name;
  }
  return "";
};
Fighter.prototype.get_negate_rbrth_counter = function () {
  if (this.weapon.negate_rbrth_counter) {
    return this.weapon.name;
  }
  if (this.b_skill.negate_rbrth_counter) {
    return this.b_skill.name;
  }
  return "";
};
Fighter.prototype.get_negate_bbrth_counter = function () {
  if (this.weapon.negate_bbrth_counter) {
    return this.weapon.name;
  }
  if (this.b_skill.negate_bbrth_counter) {
    return this.b_skill.name;
  }
  return "";
};
Fighter.prototype.get_negate_gbrth_counter = function () {
  if (this.weapon.negate_gbrth_counter) {
    return this.weapon.name;
  }
  if (this.b_skill.negate_gbrth_counter) {
    return this.b_skill.name;
  }
  return "";
};
Fighter.prototype.get_negate_nbrth_counter = function () {
  if (this.weapon.negate_nbrth_counter) {
    return this.weapon.name;
  }
  if (this.b_skill.negate_nbrth_counter) {
    return this.b_skill.name;
  }
  return "";
};
Fighter.prototype.get_negate_inf_counter = function () {
  if (this.weapon.negate_inf_counter) {
    return this.weapon.name;
  }
  if (this.b_skill.negate_inf_counter) {
    return this.b_skill.name;
  }
  return "";
};
Fighter.prototype.get_negate_fly_counter = function () {
  if (this.weapon.negate_fly_counter) {
    return this.weapon.name;
  }
  if (this.b_skill.negate_fly_counter) {
    return this.b_skill.name;
  }
  return "";
};
Fighter.prototype.get_negate_cav_counter = function () {
  if (this.weapon.negate_cav_counter) {
    return this.weapon.name;
  }
  if (this.b_skill.negate_cav_counter) {
    return this.b_skill.name;
  }
  return "";
};
Fighter.prototype.get_negate_arm_counter = function () {
  if (this.weapon.negate_arm_counter) {
    return this.weapon.name;
  }
  if (this.b_skill.negate_arm_counter) {
    return this.b_skill.name;
  }
  return "";
};
Fighter.prototype.get_windsweep_threshold = function() {
  return this.b_skill.windsweep_threshold;
};
Fighter.prototype.get_windsweep_source = function () {
  return this.b_skill.name;
};
Fighter.prototype.get_watersweep_threshold = function () {
  return this.b_skill.watersweep_threshold;
};
Fighter.prototype.get_watersweep_source = function () {
  return this.b_skill.name;
};
Fighter.prototype.get_guard_threshold = function () {
  return this.b_skill.guard_threshold;
};
Fighter.prototype.get_assumed_atk_boost = function () {
  return this.assumed_atk_boost;
};
Fighter.prototype.get_assumed_spd_boost = function () {
  return this.assumed_spd_boost;
};
Fighter.prototype.get_assumed_def_boost = function() {
  return this.assumed_def_boost;
};
Fighter.prototype.get_assumed_res_boost = function() {
  return this.assumed_res_boost;
};
Fighter.prototype.get_dmg_dealt = function () {
  return this.damage_dealt;
};
// Gets the applicable cd bonus from Heavy Blade & similar effets.
Fighter.prototype.get_atk_bonus_cd = function (enemy, attacker_flag, is_attacking) {
  var bonus_cd = 0;
  if (!is_attacking) {
    return bonus_cd;
  }
  // Evaluate whether the A Passive 1) exists and 2) applies. If so, set bonus_cd to the
  // A Passive's bonus_cd_amt value.
  if (this.a_skill.atk_bonus_cd_thresh > 0 && ((this.calculate_atk(attacker_flag, enemy, true) - enemy.calculate_atk(!attacker_flag, this, true)) >= this.a_skill.atk_bonus_cd_thresh)) {
    bonus_cd = this.a_skill.bonus_cd_amt;
  }

  // Evaluate whether the Weapon Heavy Blade effect 1) exists and 2) applies. If so, set
  // bonus_cd to the max of the current value and the weapon's bonus_cd_amt value.
  if (this.weapon.atk_bonus_cd_thresh > 0 && ((this.calculate_atk(attacker_flag, enemy, true) - enemy.calculate_atk(!attacker_flag, this, true)) >= this.weapon.atk_bonus_cd_thresh)) {
    bonus_cd = Math.max(bonus_cd, this.weapon.bonus_cd_amt);
  }

  // Evaluate whether the Seal Heavy Blade effect 1) exists and 2) applies. If so, set
  // bonus_cd to the max of the current value and the weapon's bonus_cd_amt value.
  if (this.seal.atk_bonus_cd_thresh > 0 && ((this.calculate_atk(attacker_flag, enemy, true) - enemy.calculate_atk(!attacker_flag, this, true)) >= this.seal.atk_bonus_cd_thresh)) {
    bonus_cd = Math.max(bonus_cd, this.seal.bonus_cd_amt);
  }

  return bonus_cd;
};
// Gets the applicable cd bonus from Ayra's Blade & similar effects.
Fighter.prototype.get_spd_bonus_cd = function (enemy, attacker_flag, is_attacking) {
  var bonus_cd = 0;
  if (!is_attacking) {
    return bonus_cd;
  }
  // Evaluate whether the Weapon "Flashing Blade" effect 1) exists and 2) applies. If so,
  // set the bonus_cd to the weapon's bonus_cd_amt value.
  if (this.weapon.spd_bonus_cd_thresh > 0 && ((this.calculate_spd(attacker_flag, enemy, true) - enemy.calculate_spd(!attacker_flag, this, true) + this.get_skl_compare_spd_boost()) >= this.weapon.spd_bonus_cd_thresh)) {
    bonus_cd = this.weapon.bonus_cd_amt;
  }
  if (this.a_skill.spd_bonus_cd_thresh > 0 && ((this.calculate_spd(attacker_flag, enemy, true) - enemy.calculate_spd(!attacker_flag, this, true) + this.get_skl_compare_spd_boost()) >= this.a_skill.spd_bonus_cd_thresh)) {
    bonus_cd = Math.max(bonus_cd, this.a_skill.bonus_cd_amt);
  }
  if (this.seal.spd_bonus_cd_thresh > 0 && ((this.calculate_spd(attacker_flag, enemy, true) - enemy.calculate_spd(!attacker_flag, this, true) + this.get_skl_compare_spd_boost()) >= this.seal.spd_bonus_cd_thresh)) {
    bonus_cd = Math.max(bonus_cd, this.seal.bonus_cd_amt);
  }
  return bonus_cd;
};
Fighter.prototype.get_attacking_bonus_cd = function (attacker_flag, is_attacking) {
  var bonus_cd = 0;

  if (this.b_skill.cd_charge_off > 0 && (this.start_HP / this.hp_max) >= this.b_skill.cd_charge_off_thresh && attacker_flag) {
    bonus_cd = this.b_skill.cd_charge_off;
  }

  if (this.b_skill.cd_charge_off_per_atk > 0 && attacker_flag && is_attacking) {
    bonus_cd = Math.max(bonus_cd, this.b_skill.cd_charge_off_per_atk);
  }

  return bonus_cd;
};
Fighter.prototype.get_defending_bonus_cd = function (attacker_flag, is_attacking) {
  var bonus_cd = 0;

  if (this.weapon.cd_charge_def > 0 && (this.start_HP / this.hp_max) >= this.weapon.cd_charge_def_thresh && !attacker_flag) {
    bonus_cd = this.weapon.cd_charge_def;
  }
  if (this.a_skill.cd_charge_def > 0 && (this.start_HP / this.hp_max) >= this.a_skill.cd_charge_def_thresh && !attacker_flag) {
    bonus_cd = Math.max(bonus_cd, this.a_skill.cd_charge_def);
  }
  if (this.b_skill.cd_charge_def > 0 && (this.start_HP / this.hp_max) >= this.b_skill.cd_charge_def_thresh && !attacker_flag) {
    bonus_cd = this.b_skill.cd_charge_def;
  }

  if (this.b_skill.cd_charge_def_per_atk > 0 && !attacker_flag && is_attacking) {
    bonus_cd = Math.max(bonus_cd, this.b_skill.cd_charge_def_per_atk);
  }
  return bonus_cd;
};
Fighter.prototype.get_special_bonus_cd = function (enemy) {
  var bonus_cd = 0;

  if (this.weapon.felicias_plate_cd_bonus > 0 && (enemy.get_weap() == "RT" || enemy.get_weap() == "BT" || enemy.get_weap() == "GT")) {
    bonus_cd += this.weapon.felicias_plate_cd_bonus;
  }

  return bonus_cd;
};
Fighter.prototype.get_bonus_cd_amt = function (skill) {
  return skill.bonus_cd_amt;
};
Fighter.prototype.get_cd_charge_def_per_atk = function () {
  var charge = 0;

  if (this.b_skill.cd_charge_def_per_atk > 0 && (this.start_HP / this.hp_max >= this.get_cd_charge_hp_thresh(this.b_skill))) {
    charge = this.b_skill.cd_charge_def_per_atk;
  }

  return charge;
};
Fighter.prototype.get_cd_charge_hp_thresh = function (skill) {
  return skill.cd_charge_hp_thresh;
};
Fighter.prototype.get_cond_bonus_cd = function (is_attacking) {
  if (this.conditional_effects && is_attacking) {
    return this.weapon.cond_bonus_cd_per_atk;
  }

  return 0;
};
Fighter.prototype.get_atk_boost_full_hp = function () {
  return this.weapon.atk_boost_full_hp + this.a_skill.atk_boost_full_hp;
};
Fighter.prototype.get_spd_boost_full_hp = function () {
  return this.weapon.spd_boost_full_hp + this.a_skill.spd_boost_full_hp;
};
Fighter.prototype.get_def_boost_full_hp = function () {
  return this.weapon.def_boost_full_hp + this.a_skill.def_boost_full_hp;
};
Fighter.prototype.get_res_boost_full_hp = function () {
  return this.weapon.res_boost_full_hp + this.a_skill.res_boost_full_hp;
};
Fighter.prototype.get_burn_full_hp = function () {
  return this.weapon.burn_full_hp;
};
Fighter.prototype.get_atk_boost_damaged = function () {
  return this.weapon.atk_boost_damaged;
};
Fighter.prototype.get_spd_boost_damaged = function () {
  return this.weapon.spd_boost_damaged;
};
Fighter.prototype.get_def_boost_damaged = function () {
  return this.weapon.def_boost_damaged;
};
Fighter.prototype.get_res_boost_damaged = function () {
  return this.weapon.res_boost_damaged;
};
Fighter.prototype.get_distant_atk_off_bonus = function () {
  return this.weapon.distant_atk_off_bonus;
};
Fighter.prototype.get_distant_spd_off_bonus = function () {
  return this.weapon.distant_spd_off_bonus;
};
Fighter.prototype.get_distant_def_off_bonus = function () {
  return this.weapon.distant_def_off_bonus;
};
Fighter.prototype.get_distant_res_off_bonus = function () {
  return this.weapon.distant_res_off_bonus;
};
Fighter.prototype.get_distant_atk_def_bonus = function () {
  return this.weapon.distant_atk_def_bonus;
};
Fighter.prototype.get_distant_spd_def_bonus = function () {
  return this.weapon.distant_spd_def_bonus;
};
Fighter.prototype.get_distant_def_def_bonus = function () {
  return this.a_skill.distant_def_def_bonus + this.seal.distant_def_def_bonus + this.weapon.distant_def_def_bonus;
};
Fighter.prototype.get_distant_res_def_bonus = function () {
  return this.a_skill.distant_res_def_bonus + this.seal.distant_res_def_bonus + this.weapon.distant_res_def_bonus;
};
Fighter.prototype.get_close_atk_off_bonus = function () {
  return this.weapon.close_atk_off_bonus;
};
Fighter.prototype.get_close_spd_off_bonus = function () {
  return this.weapon.close_spd_off_bonus;
};
Fighter.prototype.get_close_def_off_bonus = function () {
  return this.weapon.close_def_off_bonus;
};
Fighter.prototype.get_close_res_off_bonus = function () {
  return this.weapon.close_res_off_bonus;
};
Fighter.prototype.get_close_atk_def_bonus = function () {
  return this.weapon.close_atk_def_bonus;
};
Fighter.prototype.get_close_spd_def_bonus = function () {
  return this.weapon.close_spd_def_bonus;
};
Fighter.prototype.get_close_def_def_bonus = function () {
  return this.weapon.close_def_def_bonus + this.a_skill.close_def_def_bonus + this.seal.close_def_def_bonus;
};
Fighter.prototype.get_close_res_def_bonus = function () {
  return this.weapon.close_res_def_bonus + this.a_skill.close_res_def_bonus + this.seal.close_res_def_bonus;
};
Fighter.prototype.get_inverse_spur = function () {
  return this.weapon.inverse_spur;
};
Fighter.prototype.get_adj_allies = function () {
  return this.adj_allies;
};
Fighter.prototype.get_two_space_allies = function () {
  return this.two_space_allies;
};
Fighter.prototype.get_atk_bonus_nearby_ally = function () {
  return this.weapon.atk_bonus_nearby_ally;
};
Fighter.prototype.get_spd_bonus_nearby_ally = function () {
  return this.weapon.spd_bonus_nearby_ally;
};
Fighter.prototype.get_def_bonus_nearby_ally = function () {
  return this.weapon.def_bonus_nearby_ally;
};
Fighter.prototype.get_res_bonus_nearby_ally = function () {
  return this.weapon.res_bonus_nearby_ally;
};
Fighter.prototype.get_earth_boost_bonus = function () {
  return this.a_skill.earth_boost_bonus;
};
Fighter.prototype.get_water_boost_bonus = function () {
  return this.a_skill.water_boost_bonus;
};
Fighter.prototype.get_wrathful_staff_threshold = function () {
  return this.b_skill.wrathful_staff_threshold;
};
Fighter.prototype.get_start_HP = function () {
  return this.start_HP;
};
Fighter.prototype.get_atk_boost_enemy_full_hp = function () {
  return this.weapon.atk_boost_enemy_full_hp;
};
Fighter.prototype.get_spd_boost_enemy_full_hp = function () {
  return this.weapon.spd_boost_enemy_full_hp;
};
Fighter.prototype.get_fire_boost_bonus = function () {
  return this.a_skill.fire_boost_bonus;
};
Fighter.prototype.get_wind_boost_bonus = function () {
  return this.a_skill.wind_boost_bonus;
};
Fighter.prototype.get_skl_compare_spd_boost = function() {
  return this.seal.skl_compare_spd_boost;
};
Fighter.prototype.get_skl_compare_spd_boost_source = function () {
  return this.seal.name;
};
Fighter.prototype.get_def_spec_cd_reduce = function () {
  return this.b_skill.def_spec_cd_reduce;
};
Fighter.prototype.get_def_spec_dmg_reduce = function () {
  return this.b_skill.def_spec_dmg_reduce;
};
Fighter.prototype.get_def_spec_dmg_reduce_source = function () {
  return this.b_skill.name;
};
Fighter.prototype.get_self_affinity_cancel = function () {
  return this.b_skill.self_affinity_cancel;
};
Fighter.prototype.get_foe_affinity_cancel = function () {
  return this.b_skill.foe_affinity_cancel;
};
Fighter.prototype.get_disadv_foe_affinity_cancel = function () {
  return this.b_skill.disadv_foe_affinity_cancel;
};
Fighter.prototype.get_disadv_foe_affinity_reverse = function () {
  return this.b_skill.disadv_foe_affinity_reverse;
};
Fighter.prototype.get_def_boost_def_vs_ALS = function () {
  return this.weapon.def_boost_def_vs_ALS;
};
Fighter.prototype.get_consec_hit_mitig = function () {
  return this.weapon.consec_hit_mitig;
};
Fighter.prototype.get_ALS_consec_hit_mitig = function () {
  return this.seal.ALS_consec_hit_mitig;
};
Fighter.prototype.get_tome_consec_hit_mitig = function () {
  return this.seal.tome_consec_hit_mitig;
};
Fighter.prototype.get_missile_consec_hit_mitig = function () {
  return this.seal.missile_consec_hit_mitig;
};
Fighter.prototype.get_distant_consec_hit_mitig = function () {
  return this.b_skill.distant_consec_hit_mitig;
};
Fighter.prototype.get_first_tome_hit_mitig = function () {
  return this.weapon.first_tome_hit_mitig;
};
Fighter.prototype.get_negate_srd_buffs = function () {
  var source = "";
  if (this.weapon.negate_srd_buffs) {
    source = this.weapon.name;
  }
  else if (this.b_skill.negate_srd_buffs) {
    source = this.b_skill.name;
  }
  return source;
  //return Math.max(this.weapon.negate_srd_buffs, this.b_skill.negate_srd_buffs);
};
Fighter.prototype.get_negate_lnc_buffs = function () {
  var source = "";
  if (this.weapon.negate_lnc_buffs) {
    source = this.weapon.name;
  }
  else if (this.b_skill.negate_lnc_buffs) {
    source = this.b_skill.name;
  }
  return source;
  //return Math.max(this.weapon.negate_lnc_buffs, this.b_skill.negate_lnc_buffs);
};
Fighter.prototype.get_negate_axe_buffs = function () {
  var source = "";
  if (this.weapon.negate_axe_buffs) {
    source = this.weapon.name;
  }
  else if (this.b_skill.negate_axe_buffs) {
    source = this.b_skill.name;
  }
  return source;
  //return Math.max(this.weapon.negate_axe_buffs, this.b_skill.negate_axe_buffs);
};
Fighter.prototype.get_negate_rt_buffs = function () {
  var source = "";
  if (this.weapon.negate_rt_buffs) {
    source = this.weapon.name;
  }
  else if (this.b_skill.negate_rt_buffs) {
    source = this.b_skill.name;
  }
  return source;
  //return Math.max(this.weapon.negate_rt_buffs, this.b_skill.negate_rt_buffs);
};
Fighter.prototype.get_negate_bt_buffs = function () {
  var source = "";
  if (this.weapon.negate_bt_buffs) {
    source = this.weapon.name;
  }
  else if (this.b_skill.negate_bt_buffs) {
    source = this.b_skill.name;
  }
  return source;
  //return Math.max(this.weapon.negate_bt_buffs, this.b_skill.negate_bt_buffs);
};
Fighter.prototype.get_negate_gt_buffs = function () {
  var source = "";
  if (this.weapon.negate_gt_buffs) {
    source = this.weapon.name;
  }
  else if (this.b_skill.negate_gt_buffs) {
    source = this.b_skill.name;
  }
  return source;
  //return Math.max(this.weapon.negate_gt_buffs, this.b_skill.negate_gt_buffs);
};
Fighter.prototype.get_negate_rbow_buffs = function () {
  var source = "";
  if (this.weapon.negate_rbow_buffs) {
    source = this.weapon.name;
  }
  else if (this.b_skill.negate_rbow_buffs) {
    source = this.b_skill.name;
  }
  return source;
};
Fighter.prototype.get_negate_bbow_buffs = function () {
  var source = "";
  if (this.weapon.negate_bbow_buffs) {
    source = this.weapon.name;
  }
  else if (this.b_skill.negate_bbow_buffs) {
    source = this.b_skill.name;
  }
  return source;
};
Fighter.prototype.get_negate_gbow_buffs = function () {
  var source = "";
  if (this.weapon.negate_gbow_buffs) {
    source = this.weapon.name;
  }
  else if (this.b_skill.negate_gbow_buffs) {
    source = this.b_skill.name;
  }
  return source;
};
Fighter.prototype.get_negate_nbow_buffs = function () {
  var source = "";
  if (this.weapon.negate_nbow_buffs) {
    source = this.weapon.name;
  }
  else if (this.b_skill.negate_nbow_buffs) {
    source = this.b_skill.name;
  }
  return source;
};
Fighter.prototype.get_negate_r_dgr_buffs = function () {
  var source = "";
  if (this.weapon.negate_r_dgr_buffs) {
    source = this.weapon.name;
  }
  else if (this.b_skill.negate_r_dgr_buffs) {
    source = this.b_skill.name;
  }
  return source;
};
Fighter.prototype.get_negate_b_dgr_buffs = function () {
  var source = "";
  if (this.weapon.negate_b_dgr_buffs) {
    source = this.weapon.name;
  }
  else if (this.b_skill.negate_b_dgr_buffs) {
    source = this.b_skill.name;
  }
  return source;
};
Fighter.prototype.get_negate_g_dgr_buffs = function () {
  var source = "";
  if (this.weapon.negate_g_dgr_buffs) {
    source = this.weapon.name;
  }
  else if (this.b_skill.negate_g_dgr_buffs) {
    source = this.b_skill.name;
  }
  return source;
};
Fighter.prototype.get_negate_n_dgr_buffs = function () {
  var source = "";
  if (this.weapon.negate_n_dgr_buffs) {
    source = this.weapon.name;
  }
  else if (this.b_skill.negate_n_dgr_buffs) {
    source = this.b_skill.name;
  }
  return source;
};
Fighter.prototype.get_negate_stf_buffs = function () {
  var source = "";
  if (this.weapon.negate_stf_buffs) {
    source = this.weapon.name;
  }
  else if (this.b_skill.negate_stf_buffs) {
    source = this.b_skill.name;
  }
  return source;
  //return Math.max(this.weapon.negate_stf_buffs, this.b_skill.negate_stf_buffs);
};
Fighter.prototype.get_negate_rbrth_buffs = function () {
  var source = "";
  if (this.weapon.negate_rbrth_buffs) {
    source = this.weapon.name;
  }
  else if (this.b_skill.negate_rbrth_buffs) {
    source = this.b_skill.name;
  }
  return source;
  //return Math.max(this.weapon.negate_rbrth_buffs, this.b_skill.negate_rbrth_buffs);
};
Fighter.prototype.get_negate_bbrth_buffs = function () {
  var source = "";
  if (this.weapon.negate_bbrth_buffs) {
    source = this.weapon.name;
  }
  else if (this.b_skill.negate_bbrth_buffs) {
    source = this.b_skill.name;
  }
  return source;
  //return Math.max(this.weapon.negate_bbrth_buffs, this.b_skill.negate_bbrth_buffs);
};
Fighter.prototype.get_negate_gbrth_buffs = function () {
  var source = "";
  if (this.weapon.negate_gbrth_buffs) {
    source = this.weapon.name;
  }
  else if (this.b_skill.negate_gbrth_buffs) {
    source = this.b_skill.name;
  }
  return source;
  //return Math.max(this.weapon.negate_gbrth_buffs, this.b_skill.negate_gbrth_buffs);
};
Fighter.prototype.get_negate_nbrth_buffs = function () {
  var source = "";
  if (this.weapon.negate_nbrth_buffs) {
    source = this.weapon.name;
  }
  else if (this.b_skill.negate_nbrth_buffs) {
    source = this.b_skill.name;
  }
  return source;
  //return Math.max(this.weapon.negate_nbrth_buffs, this.b_skill.negate_nbrth_buffs);
};
Fighter.prototype.get_negate_inf_buffs = function () {
  var source = "";
  if (this.weapon.negate_inf_buffs) {
    source = this.weapon.name;
  }
  else if (this.b_skill.negate_inf_buffs) {
    source = this.b_skill.name;
  }
  return source;
  //return Math.max(this.weapon.negate_inf_buffs, this.b_skill.negate_inf_buffs);
};
Fighter.prototype.get_negate_fly_buffs = function () {
  var source = "";
  if (this.weapon.negate_fly_buffs) {
    source = this.weapon.name;
  }
  else if (this.b_skill.negate_fly_buffs) {
    source = this.b_skill.name;
  }
  return source;
  //return Math.max(this.weapon.negate_fly_buffs, this.b_skill.negate_fly_buffs);
};
Fighter.prototype.get_negate_cav_buffs = function () {
  var source = "";
  if (this.weapon.negate_cav_buffs) {
    source = this.weapon.name;
  }
  else if (this.b_skill.negate_cav_buffs) {
    source = this.b_skill.name;
  }
  return source;
  //return Math.max(this.weapon.negate_cav_buffs, this.b_skill.negate_cav_buffs);
};
Fighter.prototype.get_negate_arm_buffs = function () {
  var source = "";
  if (this.weapon.negate_arm_buffs) {
    source = this.weapon.name;
  }
  else if (this.b_skill.negate_arm_buffs) {
    source = this.b_skill.name;
  }
  return source;
  //return Math.max(this.weapon.negate_arm_buffs, this.b_skill.negate_arm_buffs);
};
Fighter.prototype.get_cd_charge_off = function () {

};
Fighter.prototype.get_cd_charge_def = function () {
  return Math.max(this.weapon.cd_charge_def, this.a_skill.cd_charge_def, this.b_skill.cd_charge_def);
};
Fighter.prototype.get_hardy_bearing_thresh = function () {
  var thresh = 0;
  if (this.weapon.hardy_bearing_thresh != 0) {
    thresh = this.weapon.hardy_bearing_thresh;
  }
  if (this.seal.hardy_bearing_thresh != 0) {
    thresh = this.seal.hardy_bearing_thresh;
  }
  return thresh;
};
Fighter.prototype.get_wrath_threshold = function () {
  return this.b_skill.wrath_threshold;
};
Fighter.prototype.get_atk_bond = function () {
  return this.a_skill.atk_bond + this.weapon.atk_bond;
};
Fighter.prototype.get_spd_bond = function () {
  return this.a_skill.spd_bond + this.weapon.spd_bond;
};
Fighter.prototype.get_def_bond = function () {
  return this.a_skill.def_bond + this.weapon.def_bond;
};
Fighter.prototype.get_res_bond = function () {
  return this.a_skill.res_bond + this.weapon.res_bond;
};
Fighter.prototype.get_brazen_atk_boost = function () {
  return this.weapon.brazen_atk_boost + this.a_skill.brazen_atk_boost;
};
Fighter.prototype.get_brazen_spd_boost = function () {
  return this.weapon.brazen_spd_boost + this.a_skill.brazen_spd_boost;
};
Fighter.prototype.get_brazen_def_boost = function () {
  return this.weapon.brazen_def_boost + this.a_skill.brazen_def_boost;
};
Fighter.prototype.get_brazen_res_boost = function () {
  return this.weapon.brazen_res_boost + this.a_skill.brazen_res_boost;
};
Fighter.prototype.get_cond_atk_off_bonus = function () {
  return this.weapon.cond_atk_off_bonus + this.a_skill.cond_atk_off_bonus;
};
Fighter.prototype.get_cond_spd_off_bonus = function () {
  return this.weapon.cond_spd_off_bonus + this.a_skill.cond_spd_off_bonus;
};
Fighter.prototype.get_cond_def_off_bonus = function () {
  return this.weapon.cond_def_off_bonus + this.a_skill.cond_def_off_bonus;
};
Fighter.prototype.get_cond_res_off_bonus = function () {
  return this.weapon.cond_res_off_bonus + this.a_skill.cond_res_off_bonus;
};
Fighter.prototype.get_cond_atk_def_bonus = function () {
  return this.weapon.cond_atk_def_bonus + this.a_skill.cond_atk_def_bonus;
};
Fighter.prototype.get_cond_spd_def_bonus = function () {
  return this.weapon.cond_spd_def_bonus + this.a_skill.cond_spd_def_bonus;
};
Fighter.prototype.get_cond_def_def_bonus = function () {
  return this.weapon.cond_def_def_bonus + this.a_skill.cond_def_def_bonus;
};
Fighter.prototype.get_cond_res_def_bonus = function () {
  return this.weapon.cond_res_def_bonus + this.a_skill.cond_res_def_bonus;
};
Fighter.prototype.get_thani_mitigation = function () {
  return this.weapon.thani_mitigation;
};
Fighter.prototype.get_cd_reduce = function () {
  return this.seal.cd_reduce + this.b_skill.cd_reduce;
};
Fighter.prototype.apply_ploys = function (enemy) {
  var res = this.get_perm_res() + this.res_buff - this.res_debuff;
  var enemy_res = enemy.get_perm_res();

  if (res < enemy_res) {
    this.set_assumed_atk_debuff(enemy.get_atk_ploy());
    this.set_assumed_spd_debuff(enemy.get_spd_ploy());
    this.set_assumed_def_debuff(enemy.get_def_ploy());
    this.set_assumed_res_debuff(enemy.get_res_ploy());

    return true;
  }
  return false;
};
Fighter.prototype.get_atk_ploy = function () {
  return Math.max(this.weapon.atk_ploy, this.c_skill.atk_ploy, this.seal.atk_ploy);
};
Fighter.prototype.get_spd_ploy = function () {
  return Math.max(this.weapon.spd_ploy, this.c_skill.spd_ploy, this.seal.spd_ploy);
};
Fighter.prototype.get_def_ploy = function () {
  return Math.max(this.weapon.def_ploy, this.c_skill.def_ploy, this.seal.def_ploy);
};
Fighter.prototype.get_res_ploy = function () {
  return Math.max(this.weapon.res_ploy, this.c_skill.res_ploy, this.seal.res_ploy);
};
Fighter.prototype.get_brave_source = function (is_active) {
  if (is_active) {
    if (this.weapon.brave || this.weapon.double_lion) {
      return this.weapon.name;
    }
    if (this.b_skill.double_lion) {
      return this.b_skill.name;
    }
  }
  else {
    if (this.weapon.brave_def) {
      return this.weapon.name;
    }
  }
};
/*Fighter.prototype.get_effect_source = function () {
  return this.effect_source;
};*/
// Set methods
Fighter.prototype.set_start_HP = function (val) {
  this.start_HP = val;
};
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
Fighter.prototype.set_assumed_atk_debuff = function (val) {
  if (val == "") {
    val = 0;
  }
  else {
    val = parseInt(val);
  }
  this.assumed_atk_debuff = val;
  this.atk_debuff = val;
};
Fighter.prototype.set_assumed_spd_debuff = function (val) {
  if (val == "") {
    val = 0;
  }
  else {
    val = parseInt(val);
  }
  this.assumed_spd_debuff = val;
  this.spd_debuff = val;
};
Fighter.prototype.set_assumed_def_debuff = function (val) {
  if (val == "") {
    val = 0;
  }
  else {
    val = parseInt(val);
  }
  this.assumed_def_debuff = val;
  this.def_debuff = val;
};
Fighter.prototype.set_assumed_res_debuff = function (val) {
  if (val == "") {
    val = 0;
  }
  else {
    val = parseInt(val);
  }
  this.assumed_res_debuff = val;
  this.res_debuff = val;
};
Fighter.prototype.set_adj_allies = function (val) {
  if (val == "") {
    val = 0;
  }
  else {
    val = parseInt(val);
  }
  this.adj_allies = val;
};
Fighter.prototype.set_two_space_allies = function (val) {
  if (val == "") {
    val = 0;
  }
  else {
    val = parseInt(val);
  }
  this.two_space_allies = val;
};
Fighter.prototype.set_next_atk_bonus_dmg = function (val) {
  this.next_atk_bonus_dmg = val;
};
