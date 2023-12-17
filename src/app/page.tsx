import { OrderList } from "@/components/order-list";

export default function Home() {
  return (
    <main className="p-0">
      <div
        style={{
          backgroundImage: "url(/kitchen-interior-photo.png)",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          backgroundSize: "cover",
          position: "absolute",
          width: "100vw",
          height: "100vh",
          filter: "brightness(0.4) blur(4px)",
        }}
      ></div>

      <OrderList />
    </main>
  );
}
