'use strict';

var Item = require('../Item')

  , helpers  = require('../../../shared/helpers')

class ManaHeal extends Item {

  constructor (position) {
    super(helpers.ENTITIES.LIFE_HEAL, position)
  }

  pick (player, state) {
    let heal = Math.floor(Math.random() * 10)+10
    player.mp.current += heal
    state.createTextEvent("+" + heal, player.position, 'blue', 100)

    return true;
  }

}

module.exports = ManaHeal


