import type { InventoryItem, StockMovement, ExpiryStatus, MovementType } from '../types';


export class InventoryService {
  /**
   * Calculates dynamic expiry status based on days remaining
   */
  public static calculateExpiryStatus(expiryDateStr: string): ExpiryStatus {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const expDate = new Date(expiryDateStr);
    expDate.setHours(0, 0, 0, 0);

    const diffDays = Math.ceil((expDate.getTime() - today.getTime()) / (1000 * 3600 * 24));

    if (diffDays <= 0) return 'EXPIRED';
    if (diffDays <= 30) return 'URGENT EXPIRY';
    if (diffDays <= 90) return 'EXPIRING SOON';
    return 'SAFE';
  }

  /**
   * Processes a stock movement and updates current item quantity and status
   */
  public static processStockMovement(
    item: InventoryItem,
    quantity: number,
    type: MovementType,
    performedBy: string,
    reason: string
  ): { updatedItem: InventoryItem; movementRecord: StockMovement } {
    let newQty = item.currentQuantity;

    if (type === 'STOCK IN' || type === 'RETURN') {
      newQty += quantity;
    } else if (type === 'STOCK OUT' || type === 'EXPIRED' || type === 'DAMAGED') {
      newQty = Math.max(0, newQty - quantity);
    } else if (type === 'ADJUSTMENT') {
      newQty = quantity;
    }

    let status: InventoryItem['status'] = this.calculateExpiryStatus(item.expiryDate);
    if (newQty <= item.minimumStockLevel && status === 'SAFE') {
      status = 'LOW STOCK';
    }

    const updatedItem: InventoryItem = {
      ...item,
      currentQuantity: newQty,
      status,
    };

    const movementRecord: StockMovement = {
      id: `mov-${Date.now()}`,
      itemId: item.id,
      itemName: item.name,
      quantity,
      type,
      performedBy,
      timestamp: new Date().toISOString(),
      reason,
    };

    return { updatedItem, movementRecord };
  }
}
