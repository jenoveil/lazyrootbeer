/*
  Auto pop root beer when you pop brooch, self buff skills, or 1 second into boss enrage
*/
const Command = require('command');
const BROOCH = [51028,51011], // marrow or quatre brooch trigger rootbeer
  ROOTBEER = 80081;
// Steroid skill IDs
/* const LANCER_ARUSH = 67279064;
const WARRIOR_DG = 67309064;
const SLAYER_ICB = 67309064;
const SORC_MB = 67449064;
const VALK_RAG = 67228964;
const ZERK_BL = 67319064;
const ZERK_FR = 67189464; */
const STEROID = [67279064,67309064,67449064,67228964,67319064,67189464]

module.exports = function lazyrootbeer(dispatch) {
  const command = Command(dispatch);
  let cid,
    job,
    enabled = true,
    enrageEnabled = true,
    steroidEnabled = true,
    broochEnabled = true,
    location,
    harrowhold = false,
    enraged = false,
    bosses = new Set()

    dispatch.hook('S_LOGIN', 1, event =>{
      ({cid, model} = event);
      job = (model - 10101) % 100;
    })
  	dispatch.hook('C_PLAYER_LOCATION', 1, event =>{location = event})
    // disable auto popping root beer in p4 hh
    dispatch.hook('S_LOAD_TOPO', 1, event => {
      if (event.zone == 9950) harrowhold = true
    })
    dispatch.hook('S_BOSS_GAGE_INFO', 3, (event) => {
      bosses.add("" + event.id);
    })
    dispatch.hook('S_DESPAWN_NPC', 1, (event) => {
      if (bosses.delete("" + event.target)) enraged = false
    })

    dispatch.hook('S_NPC_STATUS', 1, (event) => {
      if (!enrageEnabled || !enabled || harrowhold) return
      if (!bosses.has("" + event.creature)) return

      if (event.enraged == 1 && !enraged) {
        enraged = true;
        delay = setTimeout(drinkBeer,1000); // 1 second delay
      }
      else if (event.enraged == 0 && enraged) {
        enraged = false;
      }
    })

    dispatch.hook('C_START_SKILL', 1, (event) => {
      if (steroidEnabled && STEROID.includes(event.skill))
        delay = setTimeout(drinkBeer,150);
    });

    dispatch.hook('C_USE_ITEM', 1, event =>{
      if(broochEnabled && BROOCH.includes(event.item)) {
        delay = setTimeout(drinkBeer,150);
      }
    })

  command.add('lazy', (cmd) => {
    switch (cmd) {
      case 'enrage': {
        enrageEnabled = !enrageEnabled;
        command.message('Rootbeer on enrage '+(enrageEnabled ? 'enabled' : 'disabled')+'.');
        break;
      }
      case 'steroid': {
        steroidEnabled = !steroidEnabled;
        command.message('Rootbeer on steroid '+(steroidEnabled ? 'enabled' : 'disabled')+'.');
        break;
      }
      case 'brooch': {
        broochEnabled = !broochEnabled;
        command.message('Rootbeer on brooch '+(broochEnabled ? 'enabled' : 'disabled')+'.');
        break;
      }
    }
    enabled = !enabled;
    command.message('Lazy root beer '+(enabled ? 'enabled' : 'disabled')+'.');
  })

  function drinkBeer() {
    clearTimeout(delay)
    dispatch.toServer('C_USE_ITEM', 1, {
      ownerId: cid,
      item: ROOTBEER,
      id: 0,
      unk1: 0,
      unk2: 0,
      unk3: 0,
      unk4: 1,
      unk5: 0,
      unk6: 0,
      unk7: 0,
      x: location.x1,
      y: location.y1,
      z: location.z1,
      w: location.w,
      unk8: 0,
      unk9: 0,
      unk10: 0,
      unk11: 1
    })
  }

}
