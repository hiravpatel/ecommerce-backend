import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Category } from '../categories/data/entities/category.entity';
import { CategoryRepository } from '../categories/data/repositories/category.repository';
import { Inventory } from '../inventory/data/entities/inventory.entity';
import { InventoryRepository } from '../inventory/data/repositories/inventory.repository';
import { User } from '../users/data/entities/user.entity';
import { UserRepository } from '../users/data/repositories/user.repository';
import { Vendor } from '../vendors/data/entities/vendor.entity';
import { VendorRepository } from '../vendors/data/repositories/vendor.repository';
import { ProductImageRepository } from './data/repositories/product-image.repository';
import { ProductRepository } from './data/repositories/product.repository';
import { ProductVariantRepository } from './data/repositories/product-variant.repository';
import {
  Brand,
  Product,
  ProductImage,
  ProductVariant,
} from './data/entities/product.entity';
import { ProductsService } from './infrastructure/services/products.service';
import { ProductsController } from './presentation/controllers/products.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Vendor, Category, Brand, Product, ProductVariant, ProductImage, Inventory]),
  ],
  controllers: [ProductsController],
  providers: [
    ProductsService,
    UserRepository,
    VendorRepository,
    CategoryRepository,
    ProductRepository,
    ProductVariantRepository,
    ProductImageRepository,
    InventoryRepository,
  ],
})
export class ProductsModule {}
