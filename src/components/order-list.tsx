"use client";

import { OrderTicket } from "./order-ticket";
import { useOrders } from "./use-orders";

const metalgradient = `
linear-gradient(180deg, hsl(0,0%,78%)  0%, 
hsl(0,0%,90%) 47%, 
hsl(0,0%,78%) 53%,
hsl(0,0%,70%)100%)
`;

export function OrderList() {
  const { orders } = useOrders();

  return (
    <>
      <div
        className="shadow-sm"
        style={{
          backgroundImage: metalgradient,
          height: "4rem",
          width: "100vw",
          position: "relative",
          zIndex: "1",
          marginBottom: "-0.5rem",
        }}
      ></div>
      {!orders.length ? (
        <div className="mt-8 mx-auto p-8 bg-white text-black relative max-w-prose rounded-lg text-center">
          New orders will appear here
        </div>
      ) : null}
      <div className="flex flex-nowrap justify-end items-start px-4 gap-4 overflow-hidden max-w-full">
        {orders.map((o) => (
          <OrderTicket order={o} key={o.id} />
        ))}
      </div>
    </>
  );
}
