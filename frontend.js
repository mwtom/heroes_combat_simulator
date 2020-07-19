// Start up the simulator.
$(document).ready(function() {
  load_data();
  loadUI();
  simulate();
});

// Event Handlers.
$(document).ready(function() {
  // Show/Hide Player Options
  $("#PlayerOptionsHeader").click(function() {
    $("#PlayerOptions").toggle();
  });
  // Show/Hide Enemy Overrides
  $("#EnemyOptionsHeader").click(function() {
    $("#EnemyOptions").toggle();
  });
  // Show/Hide Enemy List
  $("#EnemyListHeader").click(function() {
    $("#EnemyList").toggle();
  });
  // Show/Hide Enemy Filters
  $("#FiltersHeader").click(function() {
    $("#FiltersOptions").toggle();
  });
  // Show/Hide Special Options
  $("#SimulationOptionsHeader").click(function() {
    $("#SimulationOptionsBody").toggle();
  });
  // When the Blessing input is changed, reveal or hide the
  // Legendary Hero Ally options.
  $("#Blessing").change(function() {
    if (document.getElementById("Blessing").value == "(None)") {
      $(".LegAlly").toggle(false);
    }
    else {
      $(".LegAlly").toggle(true);
      add_legendary_heroes();
    }
  });
  $("#EnemyBlessing").change(function() {
    if (document.getElementById("EnemyBlessing").value == "(None)") {
      $(".EnemyLegAlly").toggle(false);
      document.getElementById("EnemyLegAlly1").value = 0;
      document.getElementById("EnemyLegAlly2").value = 0;
      document.getElementById("EnemyLegAlly3").value = 0;
      document.getElementById("EnemyLegAlly4").value = 0;
    }
    else {
      $(".EnemyLegAlly").toggle(true);
      add_enemy_legendary_heroes();
    }
  });
  // Select all colors (filter menu)
  $("#SelectColor").click(function() {
    select_all_colors();
    simulate();
  });
  // Deselect all colors (filter menu)
  $("#DeselectColor").click(function() {
    deselect_all_colors();
    simulate();
  });
  // Select all weapon types (filter menu)
  $("#SelectWeapType").click(function() {
    select_all_weapons();
    simulate();
  });
  // Deselect all weapon types (filter menu)
  $("#DeselectWeapType").click(function() {
    deselect_all_weapons();
    simulate();
  });
  $("#SelectPhysical").click(function() {
    select_physical_weapons();
    simulate();
  });
  $("#SelectMagical").click(function() {
    select_magical_weapons();
    simulate();
  });
  $("#SelectOneRange").click(function() {
    select_one_range_weapons();
    simulate();
  });
  $("#SelectTwoRange").click(function() {
    select_two_range_weapons();
    simulate();
  });
  // Select all movement types (filter menu)
  $("#SelectMovType").click(function() {
    select_all_mov_types();
    simulate();
  });
  // Deselect all movement types (filter menu)
  $("#DeselectMovType").click(function() {
    deselect_all_mov_types();
    simulate();
  });
  // Reload available skills when the Inheritance Breaker
  // checkbox is clicked.
  $("#RuleBreaker, #tcc").click(function() {
    fill_skill_menus("player");
    fill_skill_menus("enemy")
    $(".LegAlly").toggle(false);
  });
  // Run simulation when any input fields are changed.
  $("input").change(function() {
    simulate();
  });
  // Run simulation when any select fields are changed.
  $("select").change(function() {
    check_special_effects("player");
    check_special_effects("enemy");
    simulate();
  });
  // If the weapon is changed, check for refinements. Also update the skill
  // description.
  $("#Weapon").change(function() {
    find_upgrades(document.getElementById("Weapon").value, "player");
    set_skill_icon("player_weapon", Weapons[document.getElementById("Weapon").value]);
    simulate();
  });
  // If the weapon refinement is changed, update the skill icon/description. Note
  // that changing the refinement to "None" should switch the icon & description
  // back to the "Weapon" field (accomplished by using set_skill_icon on
  // "player_weapon").
  $("#WeaponUpgrade").change(function() {
    if (document.getElementById("WeaponUpgrade").value == "None") {
      set_skill_icon("player_weapon", Weapons[document.getElementById("Weapon").value]);
    }
    else {
      set_skill_icon("player_weapon_refined", Weapons[document.getElementById("Weapon").value]);
    }
  });
  /* When skill select fields are changed, update the skill icon/description */
  $("#EnemyWeapon").change(function() {
    find_upgrades(document.getElementById("EnemyWeapon").value, "enemy")
    set_skill_icon("enemy_weapon", Weapons[document.getElementById("EnemyWeapon").value]);
  });
  $("#EnemyWeaponUpgrade").change(function() {
    if (document.getElementById("EnemyWeaponUpgrade").value == "None") {
      set_skill_icon("enemy_weapon", Weapons[document.getElementById("EnemyWeapon").value]);
    }
    else {
      set_skill_icon("enemy_weapon_refined", Weapons[document.getElementById("EnemyWeapon").value]);
    }
  })
  $("#Special").change(function() {
    set_skill_icon("player_special", Procs[document.getElementById("Special").value]);
  });
  $("#EnemySpecial").change(function() {
    set_skill_icon("enemy_special", Procs[document.getElementById("EnemySpecial").value]);
  });
  $("#A").change(function() {
    set_skill_icon("player_a", A_Passives[document.getElementById("A").value]);
  });
  $("#EnemyA").change(function() {
    set_skill_icon("enemy_a", A_Passives[document.getElementById("EnemyA").value]);
  });
  $("#B").change(function() {
    set_skill_icon("player_b", B_Passives[document.getElementById("B").value]);
  });
  $("#EnemyB").change(function() {
    set_skill_icon("enemy_b", B_Passives[document.getElementById("EnemyB").value]);
  });
  $("#C").change(function() {
    set_skill_icon("player_c", C_Passives[document.getElementById("C").value]);
  });
  $("#EnemyC").change(function() {
    set_skill_icon("enemy_c", C_Passives[document.getElementById("EnemyC").value]);
  });
  $("#Seal").change(function() {
    set_skill_icon("player_seal", Seals[document.getElementById("Seal").value]);
  });
  $("#EnemySeal").change(function() {
    set_skill_icon("enemy_seal", Seals[document.getElementById("EnemySeal").value]);
  });
  /* End of skill icon/description changing */
  $("input.Foe_Type").change(function() {
    if (document.getElementById("Base_Foes").checked) {
      $("#Enemy_Override_Table").toggle(true);
      $("#Optimized_Disclaimer").toggle(false);
    }
    else if (document.getElementById("Optimized_Foes").checked) {
      $("#Enemy_Override_Table").toggle(false);
      $("#Optimized_Disclaimer").toggle(true);
    }
  });
  $("#EnemyReset").click(function() {
    reset_enemy_overrides();
    simulate();
  });
  $("#Add_Optimized_Foes").click(function() {
    for (var i = 0; i < Optimized_Chars.length; i++) {
      Enemy_List.push(Optimized_Chars[i]);
    }
    update_enemy_list();
    simulate();
  });
  $("#Add_Current_Foe").click(function() {
    add_current_foe();
  });
  $("#Clear_Enemy_List").click(function() {
    Enemy_List = new Array();
    document.getElementById("Enemies").innerHTML = "";
    simulate();
  });
});
