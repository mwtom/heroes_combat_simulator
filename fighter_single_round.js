// The Fighter class, a fusion of the base stats of a character
// and the stats & properties of their skills.
class Fighter {
  constructor(char, boon, bane, weap, a, b, c, seal, proc, summoner_support, merge_lv) {
    // Load properties from the character.
    this.name = char.name;
    this.color = char.color;
    this.hp = char.hp40;
    this.atk = char.atk40;
    this.spd = char.spd40;
    this.def = char.def40;
    this.res = char.res40;
    this.hp_base = char.hp_base;
    this.atk_base = char.atk_base;
    this.spd_base = char.spd_base;
    this.def_base = char.def_base;
    this.res_base = char.res_base;
    // Only calculate boon/bane if character is not neutral-locked, and the
    // selected boon is not the same as the selected bane.
    // Update lv. 40 stats (obvious reasons) AND base stats (merge calcs).
    if (char.n_lock != 1 && (boon != bane)) {
      switch (boon) {
        case "HP":
          this.hp = this.calculate_stat(char.hp_base, char.hp40, "boon");
          this.hp_base += 1;
          break;
        case "Atk":
          this.atk = this.calculate_stat(char.atk_base, char.atk40, "boon");
          this.atk_base += 1;
          break;
        case "Spd":
          this.spd = this.calculate_stat(char.spd_base, char.spd40, "boon");
          this.spd_base += 1;
          break;
        case "Def":
          this.def = this.calculate_stat(char.def_base, char.def40, "boon");
          this.def_base += 1;
          break;
        case "Res":
          this.res = this.calculate_stat(char.res_base, char.res40, "boon");
          this.res_base += 1;
          break;
        // No default case, since "None" is a valid boon selection.
      }
      switch (bane) {
        case "HP":
          this.hp = this.calculate_stat(char.hp_base, char.hp40, "bane");
          this.hp_base -= 1;
          break;
        case "Atk":
          this.atk = this.calculate_stat(char.atk_base, char.atk40, "bane");
          this.atk_base -= 1;
          break;
        case "Spd":
          this.spd = this.calculate_stat(char.spd_base, char.spd40, "bane");
          this.spd_base -= 1;
          break;
        case "Def":
          this.def = this.calculate_stat(char.def_base, char.def40, "bane");
          this.def_base -= 1;
          break;
        case "Res":
          this.res = this.calculate_stat(char.res_base, char.res40, "bane");
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

    // adjacent allies
    this.adj_allies = 0;

    // Calculate and store the unit's maximum HP.
    this.hp += this.weapon.hp_boost_perm + this.a_skill.hp_boost_perm + this.seal.hp_boost_perm;
    this.hp_max = this.hp;

    // Set up the unit's special cooldown.
    this.cooldown = 0;
    this.reset_cooldown();
    //this.cooldown -= this.seal.cd_reduce;

    // damage_dealt is a logging variable, used to report amount of damage dealt
    // by the unit during combat (for % HP calculations).
    this.damage_dealt = 0;

    // start_HP helps determine if skills such as breakers or wrathful staff apply.
    this.start_HP = 0;

    // next_atk_bonus_dmg is a variable used to handle damage that is carried over
    // from a previous action (ex. Ice Mirror is a defensive special that grants damage
    // equal to the damage mitigated from a foe's prior attack).
    this.next_atk_bonus_dmg = 0;
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
Fighter.prototype.calculate_stat = function(stat_base, stat_40, case_type) {
  // growth tiers
  var growth_tiers = new Array(8, 10, 13, 15, 17, 19, 22, 24, 26, 28, 30, 33, 35, 37);

  var i = 0;
  for (i = 0; (stat_40 - stat_base) != growth_tiers[i] && i < growth_tiers.length; i++);

  // Boon stats are +1 growth tier, +1 point.
  if (case_type == "boon")
    return stat_40 + (growth_tiers[i + 1] - growth_tiers[i]) + 1;
  // Bane stats are -1 growth tier, -1 point.
  else
    return stat_40 - (growth_tiers[i] - growth_tiers[i - 1]) - 1;
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
  // Reverses buffs if applicable.
 if (this.buffs_reversed) {
    this.atk_buff *= -1;
  }
  // Sets an initial value for atk.
  var atk = this.get_perm_atk() + this.get_assumed_atk_boost() - this.atk_debuff;
  // If buffs are not positive or not negated, add buffs.
  if (this.atk_buff < 0 || !this.check_buff_negate(enemy)) {
    atk += this.atk_buff;
  }

  if (in_combat) {
    // If the unit in question is at full HP, and has an effect that increases Atk at full HP, include it.
    if (this.get_start_HP() == this.get_HP_max()) {
      atk += this.get_atk_boost_full_hp();
    }

    // If the unit has a inverse spur effect, add 2x adjacent allies to atk.
    if (this.get_inverse_spur() == 1) {
      atk += this.get_adj_allies() * 2;
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
    }
    // If the unit is not the attacker, include defensive atk bonuses.
    else {
      atk += this.get_atk_boost_def();
    }

    // If the unit gets an Atk bonus when the enemy is at full HP, apply it.
    if (enemy.get_start_HP() == enemy.get_HP_max()) {
      atk += this.get_atk_boost_enemy_full_hp();
    }

    // If the unit gets an Atk bonus when below a certain HP threshold, apply it.
    if (this.start_HP / this.hp_max <= this.a_skill.brazen_atk_thresh) {
      atk += this.a_skill.brazen_atk_boost;
    }

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
  }

  // If the atk value is negative, and the unit does not have a -blade tome,
  // set it to 0. Note that this function is used for Heavy Blade calculation,
  // which does not factor in -blade tome bonuses.
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

  // If the unit has a -blade tome, and buffs are not negative or negated,
  // add buffs to effective atk.
  if (this.get_blade() == 1 && !this.check_buff_negate(enemy)) {
    if (this.atk_buff > 0) {
      e_atk += this.atk_buff;
    }
    if (this.spd_buff > 0) {
      e_atk += this.spd_buff;
    }
    if (this.def_buff > 0) {
      e_atk += this.def_buff;
    }
    if (this.res_buff > 0) {
      e_atk += this.res_buff;
    }
  }

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
  if (enemy.get_negate_eff() > 0) {
    return false;
  }
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
  if (this.weapon.rbrth_eff && (enemy.get_weap() == "D" && enemy.get_color() == "R")) {
    return true;
  }
  if (this.weapon.bbrth_eff && (enemy.get_weap() == "D" && enemy.get_color() == "B")) {
    return true;
  }
  if (this.weapon.gbrth_eff && (enemy.get_weap() == "D" && enemy.get_color() == "G")) {
    return true;
  }
  if (this.weapon.bow_eff && enemy.get_weap() == "B") {
    return true;
  }
  if (this.weapon.dgr_eff && enemy.get_weap() == "K") {
    return true;
  }
  if (this.weapon.stf_eff && enemy.get_weap() == "ST") {
    return true;
  }
  if (this.weapon.inf_eff && enemy.get_type() == "I") {
    return true;
  }
  if (this.weapon.cav_eff && enemy.get_type() == "C") {
    return true;
  }
  if (this.weapon.fly_eff && enemy.get_type() == "F") {
    return true;
  }
  if (this.weapon.arm_eff && enemy.get_type() == "A") {
    return true;
  }
  return false;
};
// Calculates the effective speed of the unit.
Fighter.prototype.calculate_spd = function(attacker_flag, enemy, in_combat) {
  // Reverses buffs if applicable.
  if (this.buffs_reversed) {
    this.spd_buff *= -1;
  }
  // Sets an inital value for effective speed.
  var e_spd = this.get_perm_spd() + this.get_assumed_spd_boost() - this.spd_debuff;
  // If buffs are not positive or not negated, add buffs.
  if (this.spd_buff < 0 || !this.check_buff_negate(enemy)) {
    e_spd += this.spd_buff;
  }

  if (in_combat) {
    // If the unit has a inverse spur effect, add 2x adjacent allies to effective spd.
    if (this.get_inverse_spur() == 1) {
      e_spd += this.get_adj_allies() * 2;
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

    // If the unit has a "Bond" skill that boosts Spd, and has at least one adjacent ally, apply it.
    if (this.get_spd_bond() > 0 && this.adj_allies > 0) {
      e_spd += this.get_spd_bond();
    }

    // If the unit in question is attacking, make sure to include
    // offensive speed bonuses.
    if (attacker_flag) {
      e_spd += this.get_spd_boost_off();
    }
    // If the unit is not attacking, include defensive speed bonuses.
    else {
      e_spd += this.get_spd_boost_def();
    }


    // If the unit gets a Spd bonus when below a certain HP threshold, apply it.
    if (this.start_HP / this.hp_max <= this.a_skill.brazen_spd_thresh) {
      e_spd += this.a_skill.brazen_spd_boost;
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
  var combat_range = enemy.get_range();
  var enemy_start_hp = enemy.get_start_HP();

  // Reverses buffs if applicable.
  if (this.buffs_reversed) {
    this.def_buff *= -1;
  }
  // Sets an initial value for the effective def.
  var e_def = this.get_perm_def() + this.get_assumed_def_boost() - this.def_debuff;
  // If buffs are not positive or not negated, add buffs.
  if (this.def_buff < 0 || !this.check_buff_negate(enemy)) {
    e_def += this.def_buff;
  }

  if (in_combat) {
    // If the unit has a inverse spur effect, add 2x adjacent allies to effective def.
    if (this.get_inverse_spur() == 1) {
      e_def += this.get_adj_allies() * 2;
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
    }
    // If the unit in question is defending, add defensive def bonuses.
    else {
      e_def += this.get_def_boost_def();
      if (combat_range > 1) {
        e_def += this.get_distant_def_bonus();
      }
      if (combat_range == 1) {
        e_def += this.get_close_def_bonus();
      }
      // Special case! Vidofnir provides a def bonus when defending, but only against
      // Axes, Lances, and Swords.
      if (enemy.get_weap() == "A" || enemy.get_weap() == "L" || enemy.get_weap() == "S") {
        e_def += this.get_def_boost_def_vs_ALS();
      }
    }

    // If the unit in question is at full HP, and has an effect that increases Def at full HP, include it.
    if (this.get_start_HP() == this.get_HP_max()) {
      e_def += this.get_def_boost_full_hp();
    }

    // Special case! Account for Tyrfing if necessary.
    if (this.hp < Math.floor(this.hp/2)) {
      e_def += this.weapon.def_boost_under50();
    }

    // If the unit gets a Def bonus when below a certain HP threshold, apply it.
    if (this.start_HP / this.hp_max <= this.a_skill.brazen_def_thresh) {
      e_def += this.a_skill.brazen_def_boost;
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
  var combat_range = enemy.get_range();
  var enemy_start_hp = enemy.get_start_HP();

  // Reverse buffs if applicable.
  if (this.buffs_reversed) {
    this.res_buff *= -1;
  }
  // Sets an initial value for the effective res.
  var e_res = this.get_perm_res() + this.get_assumed_res_boost() - this.res_debuff;
  // If buffs are not positive or not negated, add buffs.
  if (this.res_buff < 0 || !this.check_buff_negate(enemy)) {
    e_res += this.res_buff;
  }

  if (in_combat) {
    // If the unit has a inverse spur effect, add 2x adjacent allies to effective res.
    if (this.get_inverse_spur() == 1) {
      e_res += this.get_adj_allies() * 2;
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
    }
    // If the unit in question is defending, make sure to include
    // defensive res bonuses.
    else {
      e_res += this.get_res_boost_def();
      if (combat_range > 1) {
        e_res += this.get_distant_res_bonus();
      }
      if (combat_range == 1) {
        e_res += this.get_close_res_bonus();
      }

      // If the unit gets a Res bonus when below a certain HP threshold, apply it.
      if (this.start_HP / this.hp_max <= this.a_skill.brazen_res_thresh) {
        e_res += this.a_skill.brazen_res_boost;
      }
    }

    // If the unit in question is at full HP, and has an effect that increases Res at full HP, include it.
    if (this.get_start_HP() == this.get_HP_max()) {
      e_res += this.get_res_boost_full_hp();
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
// Checks to see if the unit's buffs are negated by the enemy
Fighter.prototype.check_buff_negate = function (enemy) {
  var weap_type_negate = false, mov_type_negate = false;
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
    case "B":
      weap_type_negate = enemy.get_negate_bow_buffs();
      break;
    case "K":
      weap_type_negate = enemy.get_negate_dgr_buffs();
      break;
    case "ST":
      weap_type_negate = enemy.get_negate_stf_buffs();
      break;
    case "D":
      if (this.get_color == "R") {
        weap_type_negate = enemy.get_negate_rbrth_buffs();
        break;
      }
      else if (this.get_color == "B") {
        weap_type_negate = enemy.get_negate_bbrth_buffs();
        break;
      }
      else {
        weap_type_negate = enemy.get_negate_gbrth_buffs();
        break;
      }
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

  return (weap_type_negate || mov_type_negate);
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
  return Math.max(this.get_atk_bonus_cd(enemy, attacker_active, is_attacking), this.get_spd_bonus_cd(enemy, attacker_active, is_attacking), this.get_attacking_bonus_cd(attacker_active, is_attacking), this.get_defending_bonus_cd(attacker_active, is_attacking));
};
Fighter.prototype.follow_up_thresh_applies = function (is_active) {
  // -Instantiate the HP threshold at something that cannot possibly be met.
  // -Then, as active sources of automatic follow up are detected, change hp_thresh to
  //   the lowest value between the current hp_thresh and the detected source.
  // -Finally, check to see if the unit meets the HP threshold.
  var hp_thresh = 2;
  if (this.b_skill.follow_up_thresh > 0 && ((is_active && this.b_skill.follow_up_off) || (!is_active && this.b_skill.follow_up_def))) {
    hp_thresh = this.b_skill.follow_up_thresh;
  }
  if (this.weapon.follow_up_thresh > 0 && ((is_active && this.weapon.follow_up_off) || (!is_active && this.weapon.follow_up_def))) {
    hp_thresh = Math.min(hp_thresh, this.weapon.follow_up_thresh);
  }
  return (hp_thresh > 0 && (this.start_HP / this.hp_max) >= hp_thresh);
};
// Checks to see if the unit meets the HP requirement for Brash Assault.
Fighter.prototype.brash_assault_applies = function(can_counter) {
  var hp_thresh = Math.max(this.weapon.brash_assault_thresh, this.b_skill.brash_assault_thresh, this.seal.brash_assault_thresh);
  return (hp_thresh > 0 && (this.start_HP / this.hp_max <= hp_thresh) && can_counter);
};
// Checks to see if the unit meets the HP requirement for Hardy Bearing.
Fighter.prototype.hardy_bearing_applies = function () {
  var hp_thresh = this.get_hardy_bearing_thresh();
  return (hp_thresh != 0) && ((this.start_HP / this.hp_max) >= hp_thresh);
};
// Gets the source of the unit's Hardy Bearing effect.
Fighter.prototype.get_hardy_bearing_source = function () {
  return this.seal.name;
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
Fighter.prototype.wary_fighter_applies = function() {
  var wary_fighter_thresh = this.b_skill.wary_fighter_thresh;
  return (wary_fighter_thresh > 0) && (this.start_HP / this.hp_max >= wary_fighter_thresh);
};
// Checks to see if the unit has a breaker for the enemy weapon type, and if so, checks to see if
// the unit meets the HP requirement to have it active.
Fighter.prototype.breaker_applies = function(enemy_weap) {
  return ((((this.start_HP / this.hp_max) >= .5) && this.b_skill.breaker == enemy_weap) || this.weapon.full_breaker == enemy_weap);
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
  if (attacker.get_weap() == "S" || attacker.get_weap() == "L" || attacker.get_weap() == "A" || attacker.get_weap() == "B" || attacker.get_weap() == "K") {
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
  //this.cooldown -= this.seal.cd_reduce;
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
Fighter.prototype.get_negate_eff = function() {
  return this.a_skill.negate_eff;
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
  return this.proc.heal_on_hit_proc;
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
  if (this.b_skill.wrath_skill_dmg_bonus > 0 && (this.hp/this.hp_max) <= this.b_skill.wrath_threshold && this.proc.activates_on_hit) {
    dmg += this.b_skill.wrath_skill_dmg_bonus;
    combat_log += this.name + "'s " + this.b_skill.name + " adds +" + this.b_skill.wrath_skill_dmg_bonus + " damage to his/her attack.<br>";
  }
  return dmg;
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
    case "B":
      weap_type_negate = this.get_negate_bow_counter();
      break;
    case "K":
      weap_type_negate = this.get_negate_dgr_counter();
      break;
    case "ST":
      weap_type_negate = this.get_negate_stf_counter();
      break;
    case "D":
      if (enemy.get_color == "R") {
        weap_type_negate = this.get_negate_rbrth_counter();
        break;
      }
      else if (enemy.get_color == "B") {
        weap_type_negate = this.get_negate_bbrth_counter();
        break;
      }
      else {
        weap_type_negate = this.get_negate_gbrth_counter();
        break;
      }
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
Fighter.prototype.get_negate_bow_counter = function () {
  if (this.weapon.negate_bow_counter) {
    return this.weapon.name;
  }
  if (this.b_skill.negate_bow_counter) {
    return this.b_skill.name;
  }
  return "";
};
Fighter.prototype.get_negate_dgr_counter = function () {
  if (this.weapon.negate_dgr_counter) {
    return this.weapon.name;
  }
  if (this.b_skill.negate_dgr_counter) {
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
  return bonus_cd;
};
Fighter.prototype.get_attacking_bonus_cd = function (attacker_flag, is_attacking) {
  var bonus_cd = 0;

  if (this.b_skill.cd_charge_off_per_atk > 0 && attacker_flag && is_attacking) {
    bonus_cd = this.b_skill.cd_charge_off_per_atk;
  }

  return bonus_cd;
};
Fighter.prototype.get_defending_bonus_cd = function (attacker_flag, is_attacking) {
  var bonus_cd = 0;
  // Steady Breath
  if (this.get_cd_charge_def() > 0 && !attacker_flag) {
    bonus_cd = this.get_cd_charge_def();
  }
  if (this.b_skill.cd_charge_def_per_atk > 0 && !attacker_flag && is_attacking) {
    bonus_cd = Math.max(bonus_cd, this.b_skill.cd_charge_def_per_atk);
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
Fighter.prototype.get_atk_boost_full_hp = function () {
  return this.weapon.atk_boost_full_hp;
};
Fighter.prototype.get_spd_boost_full_hp = function () {
  return this.weapon.spd_boost_full_hp;
};
Fighter.prototype.get_def_boost_full_hp = function () {
  return this.weapon.def_boost_full_hp;
};
Fighter.prototype.get_res_boost_full_hp = function () {
  return this.weapon.res_boost_full_hp;
};
Fighter.prototype.get_burn_full_hp = function () {
  return this.weapon.burn_full_hp;
};
Fighter.prototype.get_distant_def_bonus = function () {
  return this.a_skill.distant_def_bonus + this.seal.distant_def_bonus + this.weapon.distant_def_bonus;
};
Fighter.prototype.get_distant_res_bonus = function () {
  return this.a_skill.distant_res_bonus + this.seal.distant_res_bonus + this.weapon.distant_res_bonus;
};
Fighter.prototype.get_close_def_bonus = function () {
  return this.a_skill.close_def_bonus + this.seal.close_def_bonus;
};
Fighter.prototype.get_close_res_bonus = function () {
  return this.a_skill.close_res_bonus + this.seal.close_res_bonus;
};
Fighter.prototype.get_inverse_spur = function () {
  return this.weapon.inverse_spur;
};
Fighter.prototype.get_adj_allies = function () {
  return this.adj_allies;
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
  return Math.max(this.weapon.negate_srd_buffs, this.b_skill.negate_srd_buffs);
};
Fighter.prototype.get_negate_lnc_buffs = function () {
  return Math.max(this.weapon.negate_lnc_buffs, this.b_skill.negate_lnc_buffs);
};
Fighter.prototype.get_negate_axe_buffs = function () {
  return Math.max(this.weapon.negate_axe_buffs, this.b_skill.negate_axe_buffs);
};
Fighter.prototype.get_negate_rt_buffs = function () {
  return Math.max(this.weapon.negate_rt_buffs, this.b_skill.negate_rt_buffs);
};
Fighter.prototype.get_negate_bt_buffs = function () {
  return Math.max(this.weapon.negate_bt_buffs, this.b_skill.negate_bt_buffs);
};
Fighter.prototype.get_negate_gt_buffs = function () {
  return Math.max(this.weapon.negate_gt_buffs, this.b_skill.negate_gt_buffs);
};
Fighter.prototype.get_negate_bow_buffs = function () {
  return Math.max(this.weapon.negate_bow_buffs, this.b_skill.negate_bow_buffs);
};
Fighter.prototype.get_negate_dgr_buffs = function () {
  return Math.max(this.weapon.negate_dgr_buffs, this.b_skill.negate_dgr_buffs);
};
Fighter.prototype.get_negate_stf_buffs = function () {
  return Math.max(this.weapon.negate_stf_buffs, this.b_skill.negate_stf_buffs);
};
Fighter.prototype.get_negate_rbrth_buffs = function () {
  return Math.max(this.weapon.negate_rbrth_buffs, this.b_skill.negate_rbrth_buffs);
};
Fighter.prototype.get_negate_bbrth_buffs = function () {
  return Math.max(this.weapon.negate_bbrth_buffs, this.b_skill.negate_bbrth_buffs);
};
Fighter.prototype.get_negate_gbrth_buffs = function () {
  return Math.max(this.weapon.negate_gbrth_buffs, this.b_skill.negate_gbrth_buffs);
};
Fighter.prototype.get_negate_inf_buffs = function () {
  return Math.max(this.weapon.negate_inf_buffs, this.b_skill.negate_inf_buffs);
};
Fighter.prototype.get_negate_fly_buffs = function () {
  return Math.max(this.weapon.negate_fly_buffs, this.b_skill.negate_fly_buffs);
};
Fighter.prototype.get_negate_cav_buffs = function () {
  return Math.max(this.weapon.negate_cav_buffs, this.b_skill.negate_cav_buffs);
};
Fighter.prototype.get_negate_arm_buffs = function () {
  return Math.max(this.weapon.negate_arm_buffs, this.b_skill.negate_arm_buffs);
};
Fighter.prototype.get_cd_charge_def = function () {
  return this.a_skill.cd_charge_def;
};
Fighter.prototype.get_hardy_bearing_thresh = function () {
  return this.seal.hardy_bearing_thresh;
};
Fighter.prototype.get_wrath_threshold = function () {
  return this.b_skill.wrath_threshold;
};
Fighter.prototype.get_atk_bond = function () {
  return this.a_skill.atk_bond;
};
Fighter.prototype.get_spd_bond = function () {
  return this.a_skill.spd_bond;
};
Fighter.prototype.get_def_bond = function () {
  return this.a_skill.def_bond;
};
Fighter.prototype.get_res_bond = function () {
  return this.a_skill.res_bond;
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
Fighter.prototype.set_next_atk_bonus_dmg = function (val) {
  this.next_atk_bonus_dmg = val;
};
