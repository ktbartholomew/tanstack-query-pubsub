import { Order } from "@/server/order-service";
import classes from "./order-ticket.module.css";

export function OrderTicket(props: { order: Order }) {
  return (
    <div
      className={`${classes.orderTicket}  shadow-lg  w-[30ch] grow-0 shrink-0`}
    >
      <div className="bg-white p-4 text-xs text-black font-mono">
        <div className="text-center border-b border-dashed border-black mb-4">
          <div>
            <strong>Socket Burger</strong>
          </div>
          <div>{new Date(props.order.timestamp).toLocaleString()}</div>
          <div>Order #: {props.order.id}</div>
          <div className="uppercase my-4">
            {props.order.destination.replaceAll("-", " ")}
          </div>
        </div>
        <div className="text-left">
          {props.order.items.map((item, i) => (
            <div key={i} className="mb-2">
              1 {item.name}
              {item.substitutions.map((sub, j) => (
                <div key={j} className="ml-4 text-red-500 uppercase">
                  {sub}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
