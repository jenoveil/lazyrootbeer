/*
  Auto pop root beer when you pop brooch, or 1 second into boss enrage
*/
const Command = require('command');
const TRIGGER_ITEM = [51028,51011], // marrow or quatre brooch trigger rootbeer
  ROOTBEER = 80081;

module.exports = function lazyrootbeer(dispatch) {
  const command = Command(dispatch);
  let cid,
    enabled = true,
    location,
    harrowhold = false,
    enraged = false,
    bosses = new Set()

    dispatch.hook('S_LOGIN', 1, event =>{cid = event.cid})
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
      if (!enabled || harrowhold) return
      if (!bosses.has("" + event.creature)) return

      if (event.enraged == 1 && !enraged) {
        drinkBeer();
        enraged = true;
      }
      else if (event.enraged == 0 && enraged) {
        enraged = false;
      }
    })

    dispatch.hook('C_USE_ITEM', 1, event =>{
      if(TRIGGER_ITEM.includes(event.item)) {
        drinkBeer();
      }
    })

  command.add('lazyrootbeer', () => {
    enabled = !enabled;
    command.message('Lazy root beer '+(enabled ? 'enabled' : 'disabled')+'.');
  })

  function drinkBeer() {
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
