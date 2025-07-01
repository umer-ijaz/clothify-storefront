import { useDeliveryPriceStore } from "@/context/deliveryPriceContext";

export default function DeliveryPriceTest() {
  const { deliveryPrice, initializeDeliveryPrice } = useDeliveryPriceStore();

  const handleRefreshPrice = () => {
    initializeDeliveryPrice();
  };

  return (
    <div className="p-4 border rounded bg-gray-50 m-4">
      <h3 className="text-lg font-semibold mb-2">Delivery Price Test</h3>
      <p className="mb-2">Current Delivery Price: €{deliveryPrice}</p>
      <button 
        onClick={handleRefreshPrice}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Refresh from Firebase
      </button>
    </div>
  );
}
