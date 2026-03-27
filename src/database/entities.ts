import { PasswordResetToken, RefreshToken } from 'src/modules/auth/data/entities/refresh-token.entity';
import { Cart, CartItem } from 'src/modules/cart/data/entities/cart.entity';
import {
  AttributeValue,
  Category,
  CategoryAttribute,
} from 'src/modules/categories/data/entities/category.entity';
import {
  Coupon,
  PayoutLineItem,
  VendorPayout,
} from 'src/modules/commissions/data/entities/commissions.entity';
import { Inventory, InventoryLog } from 'src/modules/inventory/data/entities/inventory.entity';
import { Notification } from 'src/modules/notifications/data/entities/notifications.entity';
import {
  Order,
  OrderItem,
  OrderStatusHistory,
  SubOrder,
} from 'src/modules/orders/data/entities/orders.entity';
import { Payment, Refund } from 'src/modules/payments/data/entities/payments.entity';
import {
  Brand,
  Product,
  ProductImage,
  ProductVariant,
  VariantAttributeValue,
} from 'src/modules/products/data/entities/product.entity';
import { ReturnRequest } from 'src/modules/returns/data/entities/return-request.entity';
import { Review } from 'src/modules/reviews/data/entities/reviews.entity';
import {
  Shipment,
  ShipmentTrackingEvent,
} from 'src/modules/shipping/data/entities/shipping.entity';
import { User, UserAddress } from 'src/modules/users/data/entities/user.entity';
import {
  Vendor,
  VendorBankAccount,
  VendorKycDocument,
} from 'src/modules/vendors/data/entities/vendor.entity';
import { SchemaMigration } from './entities/schema-migration.entity';

export const appEntities = [
  SchemaMigration,
  User,
  UserAddress,
  RefreshToken,
  PasswordResetToken,
  Vendor,
  VendorBankAccount,
  VendorKycDocument,
  Category,
  CategoryAttribute,
  AttributeValue,
  Brand,
  Product,
  ProductVariant,
  VariantAttributeValue,
  ProductImage,
  Inventory,
  InventoryLog,
  Cart,
  CartItem,
  Order,
  SubOrder,
  OrderItem,
  OrderStatusHistory,
  Payment,
  Refund,
  Shipment,
  ShipmentTrackingEvent,
  ReturnRequest,
  Review,
  Notification,
  VendorPayout,
  PayoutLineItem,
  Coupon,
];
