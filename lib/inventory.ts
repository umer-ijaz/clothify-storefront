import { doc, getDoc, updateDoc, writeBatch } from "firebase/firestore";
import { firestore, auth } from "@/lib/firebaseConfig";

interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  color?: string;
  size?: string;
  stock?: number;
}

interface InventoryUpdateResult {
  success: boolean;
  errors: string[];
  outOfStockItems: string[];
}

/**
 * Updates product inventory after a successful order
 * Reduces stock quantities for each item in the cart
 * @param cartItems - Array of cart items with quantities to deduct
 * @returns Promise<InventoryUpdateResult> - Result of the inventory update operation
 */
export async function updateProductInventory(
  cartItems: CartItem[]
): Promise<InventoryUpdateResult> {
  
  // Check authentication status
  const currentUser = auth.currentUser;
  
  if (!currentUser) {
    console.error("❌ User not authenticated for inventory update!");
    return {
      success: false,
      errors: ["User not authenticated"],
      outOfStockItems: [],
    };
  }
  
  const result: InventoryUpdateResult = {
    success: true,
    errors: [],
    outOfStockItems: [],
  };

  if (!cartItems || cartItems.length === 0) {
    result.errors.push("No cart items provided");
    result.success = false;
    return result;
  }

  // Use a batch to ensure all updates happen atomically
  const batch = writeBatch(firestore);
  const updatedProducts: string[] = [];

  try {
    // Process each cart item
    for (const item of cartItems) {
      
      try {
        // Try to find the product in both collections
        let productRef;
        let productDoc;
        let collectionName = "";

        // Check v_products first
        const mainProductRef = doc(firestore, "v_products", item.id);
        const mainProductDoc = await getDoc(mainProductRef);

        if (mainProductDoc.exists()) {
          productRef = mainProductRef;
          productDoc = mainProductDoc;
          collectionName = "v_products";
        } else {
          // Check v_flashSaleItems
          const flashSaleRef = doc(firestore, "v_flashSaleItems", item.id);
          const flashSaleDoc = await getDoc(flashSaleRef);

          if (flashSaleDoc.exists()) {
            productRef = flashSaleRef;
            productDoc = flashSaleDoc;
            collectionName = "v_flashSaleItems";
          } else {
            result.errors.push(`Product ${item.name} (ID: ${item.id}) not found in any collection`);
            result.success = false;
            continue;
          }
        }

        const productData = productDoc.data();
        const currentStock = productData?.stock || 0;
        

        // Check if we have enough stock
        if (currentStock < item.quantity) {
          result.outOfStockItems.push(
            `${item.name} - Requested: ${item.quantity}, Available: ${currentStock}`
          );
          result.errors.push(
            `Insufficient stock for ${item.name}. Requested: ${item.quantity}, Available: ${currentStock}`
          );
          result.success = false;
          continue;
        }

        // Calculate new stock
        const newStock = currentStock - item.quantity;

        // Add update to batch
        const updateData = {
          stock: newStock,
          updatedAt: new Date().toISOString(),
        };
        
        
        batch.update(productRef, updateData);

        updatedProducts.push(`${item.name} (${collectionName}): ${currentStock} → ${newStock}`);

      } catch (itemError) {
        console.error(`❌ Error processing item ${item.name}:`, itemError);
        result.errors.push(`Failed to process ${item.name}: ${itemError}`);
        result.success = false;
      }
    }

    // If there were any errors, don't proceed with the batch
    if (!result.success) {
      console.error("❌ Inventory update failed with errors:", result.errors);
      return result;
    }

    
    // Commit all updates in a single batch
    await batch.commit();

    return result;
  } catch (error) {
    console.error("❌ BATCH INVENTORY UPDATE FAILED:", error);
    console.error("📄 Error details:", {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });
    result.success = false;
    result.errors.push(`Batch update failed: ${error}`);
    return result;
  }
}

/**
 * Validates if all cart items have sufficient stock before proceeding with order
 * @param cartItems - Array of cart items to validate
 * @returns Promise<InventoryUpdateResult> - Validation result without updating stock
 */
export async function validateInventoryBeforeOrder(
  cartItems: CartItem[]
): Promise<InventoryUpdateResult> {
  const result: InventoryUpdateResult = {
    success: true,
    errors: [],
    outOfStockItems: [],
  };

  if (!cartItems || cartItems.length === 0) {
    result.errors.push("No cart items provided");
    result.success = false;
    return result;
  }

  try {
    for (const item of cartItems) {
      // Try to find the product in both collections
      let productDoc;

      // Check v_products first
      const mainProductRef = doc(firestore, "v_products", item.id);
      const mainProductDocSnapshot = await getDoc(mainProductRef);

      if (mainProductDocSnapshot.exists()) {
        productDoc = mainProductDocSnapshot;
      } else {
        // Check v_flashSaleItems
        const flashSaleRef = doc(firestore, "v_flashSaleItems", item.id);
        const flashSaleDocSnapshot = await getDoc(flashSaleRef);

        if (flashSaleDocSnapshot.exists()) {
          productDoc = flashSaleDocSnapshot;
        } else {
          result.errors.push(`Product ${item.name} (ID: ${item.id}) not found`);
          result.success = false;
          continue;
        }
      }

      const productData = productDoc.data();
      const currentStock = productData?.stock || 0;

      // Check if we have enough stock
      if (currentStock < item.quantity) {
        result.outOfStockItems.push(
          `${item.name} - Requested: ${item.quantity}, Available: ${currentStock}`
        );
        result.errors.push(
          `Insufficient stock for ${item.name}. Requested: ${item.quantity}, Available: ${currentStock}`
        );
        result.success = false;
      }
    }

    return result;
  } catch (error) {
    console.error("Inventory validation failed:", error);
    result.success = false;
    result.errors.push(`Validation failed: ${error}`);
    return result;
  }
}

/**
 * Reverts inventory changes if order fails after inventory was updated
 * @param cartItems - Array of cart items to restore stock for
 * @returns Promise<InventoryUpdateResult> - Result of the revert operation
 */
export async function revertInventoryUpdate(
  cartItems: CartItem[]
): Promise<InventoryUpdateResult> {
  const result: InventoryUpdateResult = {
    success: true,
    errors: [],
    outOfStockItems: [],
  };

  if (!cartItems || cartItems.length === 0) {
    result.errors.push("No cart items provided");
    result.success = false;
    return result;
  }

  const batch = writeBatch(firestore);
  const revertedProducts: string[] = [];

  try {
    for (const item of cartItems) {
      try {
        // Try to find the product in both collections
        let productRef;
        let productDoc;
        let collectionName = "";

        // Check v_products first
        const mainProductRef = doc(firestore, "v_products", item.id);
        const mainProductDoc = await getDoc(mainProductRef);

        if (mainProductDoc.exists()) {
          productRef = mainProductRef;
          productDoc = mainProductDoc;
          collectionName = "v_products";
        } else {
          // Check v_flashSaleItems
          const flashSaleRef = doc(firestore, "v_flashSaleItems", item.id);
          const flashSaleDoc = await getDoc(flashSaleRef);

          if (flashSaleDoc.exists()) {
            productRef = flashSaleRef;
            productDoc = flashSaleDoc;
            collectionName = "v_flashSaleItems";
          } else {
            result.errors.push(`Product ${item.name} (ID: ${item.id}) not found for revert`);
            continue;
          }
        }

        const productData = productDoc.data();
        const currentStock = productData?.stock || 0;
        const restoredStock = currentStock + item.quantity;

        // Add revert update to batch
        batch.update(productRef, {
          stock: restoredStock,
          updatedAt: new Date().toISOString(),
        });

        revertedProducts.push(`${item.name} (${collectionName}): ${currentStock} → ${restoredStock}`);

      } catch (itemError) {
        console.error(`Error reverting item ${item.name}:`, itemError);
        result.errors.push(`Failed to revert ${item.name}: ${itemError}`);
        result.success = false;
      }
    }

    // Commit all reverts in a single batch
    await batch.commit();

    return result;
  } catch (error) {
    console.error("❌ Batch inventory revert failed:", error);
    result.success = false;
    result.errors.push(`Batch revert failed: ${error}`);
    return result;
  }
}
