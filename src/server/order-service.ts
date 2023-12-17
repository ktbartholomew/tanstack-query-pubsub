import EventEmitter from "events";

export type Item = {
  name: string;
  // options: string[];
  substitutions: string[];
};

export type Order = {
  timestamp: Date;
  id: number;
  destination: string;
  status: "received" | "fired" | "fulfilled" | "cancelled";
  items: Item[];
  notes: string[];
};

const MIN_ORDER_ITEMS = 1;
const MAX_ORDER_ITEMS = 8;

const MIN_SUBSTITUTIONS = 0;
const MAX_SUBSTITUTIONS = 2;

const ITEMS: Item[] = [
  {
    name: "Double Burger",
    substitutions: [
      "extra sauce",
      "no lettuce",
      "no onion",
      "no tomato",
      "no sauce",
      "no bread",
    ],
  },
  {
    name: "Cheeseburger",
    substitutions: [
      "extra sauce",
      "no lettuce",
      "no onion",
      "no tomato",
      "no sauce",
      "no bread",
    ],
  },
  {
    name: "Hamburger",
    substitutions: [
      "extra sauce",
      "no lettuce",
      "no onion",
      "no tomato",
      "no sauce",
      "no bread",
    ],
  },
  {
    name: "French Fries",
    substitutions: ["no salt", "well done", "add sauce"],
  },
  {
    name: "Vanilla Shake",
    substitutions: [],
  },
  {
    name: "Strawberry Shake",
    substitutions: [],
  },
  {
    name: "Chocolate Shake",
    substitutions: [],
  },
];

export class OrderService {
  orderId: number;
  emitter: EventEmitter;

  constructor() {
    this.orderId = 100;
    this.emitter = new EventEmitter();
    this.init();
  }

  async init() {
    while (true) {
      this.emitter.emit("order", this.generateOrder());

      await new Promise((r) => setTimeout(r, getRandomInt(2000, 6000)));
    }
  }

  subscribe(fn: (order: Order) => void) {
    this.emitter.addListener("order", fn);
  }

  generateOrder() {
    const order: Order = {
      timestamp: new Date(),
      id: this.orderId++,
      destination: ["dining room", "takeout", "drive thru"][getRandomInt(0, 2)],
      status: "received",
      items: [],
      notes: [],
    };

    const itemcount = getRandomInt(MIN_ORDER_ITEMS, MAX_ORDER_ITEMS);

    for (let i = 0; i < itemcount; i++) {
      const itemIdx = getRandomInt(0, ITEMS.length - 1);
      const item: Item = { ...ITEMS[itemIdx], substitutions: [] };

      if (ITEMS[itemIdx].substitutions.length > 0) {
        const substitutionCount = getRandomInt(
          MIN_SUBSTITUTIONS,
          Math.min(MAX_SUBSTITUTIONS, ITEMS[itemIdx].substitutions.length)
        );

        for (let j = 0; j < substitutionCount; j++) {
          const subIdx = getRandomInt(
            0,
            ITEMS[itemIdx].substitutions.length - 1
          );

          if (
            !item.substitutions.includes(ITEMS[itemIdx].substitutions[subIdx])
          )
            item.substitutions.push(ITEMS[itemIdx].substitutions[subIdx]);
        }
      }

      order.items.push(item);
    }

    return order;
  }
}

function getRandomInt(min: number, max: number): number {
  // Math.floor() rounds down to the nearest integer
  // Math.random() generates a random floating-point number between 0 (inclusive) and 1 (exclusive)
  // The expression (max - min + 1) ensures that the range is inclusive of both min and max
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
