import { Schema, type } from "@colyseus/schema";
import { Unit, InventoryType } from "./Unit";
import helpers from "../../shared/helpers";
import { Item } from "./Item";
import { DBHero } from "../db/Hero";
import { MoveEvent } from "../core/Movement";
import { EquipedItems } from "../core/EquipedItems";

export class SkinProperties extends Schema {
  @type("number") klass: number;
  @type("number") hair: number;
  @type("number") hairColor: number;
  @type("number") eye: number;
  @type("number") body: number;
}

export class Player extends Unit {
  @type("string") name: string;
  @type(SkinProperties) properties = new SkinProperties();

  @type("number") gold: number;
  @type("number") diamond: number;

  @type("number") latestProgress: number;

  constructor (id, hero: DBHero) {
    super(id, hero)
    this.type = helpers.ENTITIES.PLAYER

    this.latestProgress = hero.latestProgress;

    this.name = hero.name
    this.lvl = hero.lvl || 1

    // skin properties
    this.properties.klass = hero.klass;
    this.properties.hair = hero.hair;
    this.properties.hairColor = hero.hairColor;
    this.properties.eye = hero.eye;
    this.properties.body = hero.body;

    this.gold = hero.gold || 0;
    this.diamond = hero.diamond || 0;

    this.hpRegeneration = 1;
  }

  useItem(inventoryType: InventoryType, itemId: string) {
    const inventory = this[inventoryType];
    const item: Item = inventory.slots[itemId];

    if (item && item.use(this, this.state)) {
      inventory.remove(itemId);
    }
  }

  inventoryDrag(fromInventoryType: InventoryType, toInventoryType: InventoryType, itemId: string, switchItemId: string) {
    const fromInventory = this[fromInventoryType];
    const toInventory = this[toInventoryType]

    const item = fromInventory.getItem(itemId);
    const switchItem = toInventory.getItem(switchItemId);

    if (item && switchItem) {
      // @colyseus/schema workaround
      if ((toInventory instanceof EquipedItems)) {
        fromInventory.remove(itemId);
        fromInventory.add(switchItem);
        toInventory.add(item, true);

      } else {
        // without workaround: https://github.com/colyseus/schema/issues/26
        fromInventory.remove(itemId);
        toInventory.remove(switchItemId);

        fromInventory.add(switchItem);
        toInventory.add(item);
      }

    } else if (item && toInventory.hasAvailability()) {
      fromInventory.remove(itemId);
      toInventory.add(item);
    }
  }

  dropItem(inventoryType: InventoryType, itemId: string) {
    const inventory = this[inventoryType];
    const item: Item = inventory.getItem(itemId)

    if (item && inventory.remove(itemId)) {
      this.state.dropItemFrom(this, item.clone());
    }
  }

  onMove (moveEvent: MoveEvent, prevX, prevY, currentX, currentY) {
    super.onMove(moveEvent, prevX, prevY, currentX, currentY)

    if (this.position.target) {
      this.state.checkOverlapingEntities(moveEvent, currentX, currentY)
    }
  }

}
