import EventEmitter from "events";

type Item = {
  name: string;
  // options: string[];
  substitutions: string[];
};

type Order = {
  timestamp: Date;
  id: number;
  destination: "dining-room" | "takeout";
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

      await new Promise((r) => setTimeout(r, Math.random() * 20000 + 10000));
    }
  }

  subscribe(fn: (order: Order) => void) {
    this.emitter.addListener("order", fn);
  }

  generateOrder() {
    const order: Order = {
      timestamp: new Date(),
      id: this.orderId++,
      destination: "dining-room",
      status: "received",
      items: [],
      notes: [],
    };

    const itemcount = getRandomInt(MIN_ORDER_ITEMS, MAX_ORDER_ITEMS);

    for (let i = 0; i < itemcount; i++) {
      let itemIdx = getRandomInt(0, ITEMS.length - 1);

      order.items.push({ ...ITEMS[itemIdx], substitutions: [] });
    }

    return order;
  }
}

function getRandomInt(min, max) {
  // Math.floor() rounds down to the nearest integer
  // Math.random() generates a random floating-point number between 0 (inclusive) and 1 (exclusive)
  // The expression (max - min + 1) ensures that the range is inclusive of both min and max
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
