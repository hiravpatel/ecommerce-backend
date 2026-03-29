import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ObjectId } from 'mongodb';
import { RESPONSE_MESSAGES } from 'src/common/constants/response-messages.constant';
import { objectIdToString, toObjectId } from 'src/common/database/object-id.util';
import { slugify } from 'src/common/utils/slug.util';
import { CategoryRepository } from 'src/modules/categories/data/repositories/category.repository';
import { InventoryRepository } from 'src/modules/inventory/data/repositories/inventory.repository';
import { UserRole } from 'src/modules/users/data/entities/user.entity';
import { UserRepository } from 'src/modules/users/data/repositories/user.repository';
import { VendorRepository } from 'src/modules/vendors/data/repositories/vendor.repository';
import { ProductImageRepository } from '../../data/repositories/product-image.repository';
import { ProductRepository } from '../../data/repositories/product.repository';
import { ProductVariantRepository } from '../../data/repositories/product-variant.repository';
import {
  Product,
  ProductImage,
  ProductStatus,
  ProductVariant,
} from '../../data/entities/product.entity';
import { CreateProductDto } from '../../presentation/dto/create-product.dto';
import { ProductListQueryDto } from '../../presentation/dto/product-list-query.dto';
import { UpdateProductDto } from '../../presentation/dto/update-product.dto';

import { VendorStatus } from 'src/modules/vendors/data/entities/vendor.entity';

@Injectable()
export class ProductsService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly vendorRepository: VendorRepository,
    private readonly categoryRepository: CategoryRepository,
    private readonly productRepository: ProductRepository,
    private readonly productVariantRepository: ProductVariantRepository,
    private readonly productImageRepository: ProductImageRepository,
    private readonly inventoryRepository: InventoryRepository,
  ) {}

  async listVendorProducts(userUuid: string, query: ProductListQueryDto) {
    const vendor = await this.getVendorByUserUuid(userUuid);
    const products = await this.productRepository.findByVendorId(vendor._id);
    const search = query.search?.trim().toLowerCase();
    const filteredProducts = products.filter((product) => {
      if (query.status && product.status !== query.status) {
        return false;
      }

      if (query.categoryId && objectIdToString(product.categoryId) !== query.categoryId) {
        return false;
      }

      if (!search) {
        return true;
      }

      const searchableValues = [
        product.name,
        product.slug,
        product.description ?? '',
        product.shortDescription ?? '',
        ...(product.tags ?? []),
      ];

      return searchableValues.some((value) => value.toLowerCase().includes(search));
    });
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const totalItems = filteredProducts.length;
    const totalPages = totalItems === 0 ? 0 : Math.ceil(totalItems / limit);
    const paginatedProducts = filteredProducts.slice((page - 1) * limit, page * limit);

    return {
      items: await Promise.all(paginatedProducts.map((product) => this.serializeProduct(product))),
      pagination: {
        page,
        limit,
        totalItems,
        totalPages,
      },
    };
  }

  async getVendorProduct(userUuid: string, productId: string) {
    const vendor = await this.getVendorByUserUuid(userUuid);
    const product = await this.getOwnedProduct(vendor._id, productId);
    return this.serializeProduct(product);
  }

  async createProduct(userUuid: string, dto: CreateProductDto) {
    const vendor = await this.getApprovedVendorByUserUuid(userUuid);
    const category = await this.categoryRepository.findOneBy({
      _id: toObjectId(dto.categoryId)!,
      isActive: true,
    });

    if (!category) {
      throw new NotFoundException(RESPONSE_MESSAGES.PRODUCT.CATEGORY_NOT_FOUND);
    }

    const productStatus = this.resolveVendorProductStatus(dto.status);
    const slug = dto.slug?.trim() ? slugify(dto.slug) : slugify(dto.name);
    await this.ensureUniqueProductSlug(slug);
    await this.ensureUniqueVariantSkus(dto.variants);

    const variantsPayload = dto.variants.map((variant) => ({
      ...variant,
      sku: variant.sku.trim().toUpperCase(),
    }));

    const product = this.productRepository.create({
      vendorId: vendor._id,
      categoryId: category._id,
      brandId: toObjectId(dto.brandId) ?? null,
      name: dto.name.trim(),
      slug,
      description: dto.description?.trim() || null,
      shortDescription: dto.shortDescription?.trim() || null,
      status: productStatus,
      rejectionReason: null,
      basePrice: Math.min(...variantsPayload.map((variant) => variant.price)),
      tags: dto.tags?.map((tag) => tag.trim()).filter(Boolean) ?? [],
      isFeatured: false,
      metaTitle: dto.metaTitle?.trim() || null,
      metaDescription: dto.metaDescription?.trim() || null,
      rating: 0,
      reviewCount: 0,
    });

    const savedProduct = await this.productRepository.save(product);
    await this.replaceProductChildren(savedProduct, variantsPayload, dto.images ?? []);

    return this.serializeProduct(savedProduct);
  }

  async updateProduct(userUuid: string, productId: string, dto: UpdateProductDto) {
    const vendor = await this.getApprovedVendorByUserUuid(userUuid);
    const product = await this.getOwnedProduct(vendor._id, productId);

    if (dto.categoryId !== undefined) {
      const category = await this.categoryRepository.findOneBy({
        _id: toObjectId(dto.categoryId)!,
        isActive: true,
      });

      if (!category) {
        throw new NotFoundException(RESPONSE_MESSAGES.PRODUCT.CATEGORY_NOT_FOUND);
      }

      product.categoryId = category._id;
    }

    if (dto.name !== undefined) {
      product.name = dto.name.trim();
    }

    if (dto.slug !== undefined || dto.name !== undefined) {
      const nextSlug = dto.slug?.trim() ? slugify(dto.slug) : slugify(product.name);
      await this.ensureUniqueProductSlug(nextSlug, product._id);
      product.slug = nextSlug;
    }

    if (dto.brandId !== undefined) {
      product.brandId = toObjectId(dto.brandId) ?? null;
    }

    if (dto.description !== undefined) {
      product.description = dto.description.trim() || null;
    }

    if (dto.shortDescription !== undefined) {
      product.shortDescription = dto.shortDescription.trim() || null;
    }

    if (dto.status !== undefined) {
      product.status = this.resolveVendorProductStatus(dto.status);
    }

    if (dto.tags !== undefined) {
      product.tags = dto.tags.map((tag) => tag.trim()).filter(Boolean);
    }

    if (dto.metaTitle !== undefined) {
      product.metaTitle = dto.metaTitle.trim() || null;
    }

    if (dto.metaDescription !== undefined) {
      product.metaDescription = dto.metaDescription.trim() || null;
    }

    const nextVariants = dto.variants?.map((variant) => ({
      ...variant,
      sku: variant.sku.trim().toUpperCase(),
    }));

    if (nextVariants) {
      await this.ensureUniqueVariantSkus(nextVariants, product._id);
      product.basePrice = Math.min(...nextVariants.map((variant) => variant.price));
    }

    await this.productRepository.save(product);

    if (nextVariants || dto.images !== undefined) {
      await this.replaceProductChildren(product, nextVariants ?? [], dto.images ?? []);
    }

    return this.serializeProduct(product);
  }

  private async getVendorByUserUuid(userUuid: string) {
    const user = await this.userRepository.findActiveByUuid(userUuid);

    if (!user || user.role !== UserRole.VENDOR) {
      throw new NotFoundException(RESPONSE_MESSAGES.VENDOR.PROFILE_NOT_FOUND);
    }

    const vendor = await this.vendorRepository.findByUserId(user._id);

    if (!vendor) {
      throw new NotFoundException(RESPONSE_MESSAGES.VENDOR.PROFILE_NOT_FOUND);
    }

    return vendor;
  }

  private async getApprovedVendorByUserUuid(userUuid: string) {
    const vendor = await this.getVendorByUserUuid(userUuid);

    if (vendor.status !== VendorStatus.APPROVED) {
      throw new ForbiddenException(RESPONSE_MESSAGES.VENDOR.APPROVAL_REQUIRED);
    }

    return vendor;
  }

  private async getOwnedProduct(vendorId: ObjectId, productId: string) {
    const product = await this.productRepository.findByVendorIdAndId(
      vendorId,
      toObjectId(productId)!,
    );

    if (!product) {
      throw new NotFoundException(RESPONSE_MESSAGES.PRODUCT.NOT_FOUND);
    }

    return product;
  }

  private resolveVendorProductStatus(status?: ProductStatus) {
    const resolvedStatus = status ?? ProductStatus.DRAFT;

    if (
      resolvedStatus !== ProductStatus.DRAFT &&
      resolvedStatus !== ProductStatus.PENDING_APPROVAL
    ) {
      throw new BadRequestException(RESPONSE_MESSAGES.PRODUCT.INVALID_STATUS);
    }

    return resolvedStatus;
  }

  private async ensureUniqueProductSlug(slug: string, currentProductId?: ObjectId) {
    const existingProduct = await this.productRepository.findBySlug(slug);

    if (
      existingProduct &&
      objectIdToString(existingProduct._id) !== objectIdToString(currentProductId)
    ) {
      throw new ConflictException(RESPONSE_MESSAGES.PRODUCT.DUPLICATE_SLUG);
    }
  }

  private async ensureUniqueVariantSkus(
    variants: Array<{ sku: string }>,
    currentProductId?: ObjectId,
  ) {
    const seenSkus = new Set<string>();

    for (const variant of variants) {
      const normalizedSku = variant.sku.trim().toUpperCase();

      if (seenSkus.has(normalizedSku)) {
        throw new ConflictException(RESPONSE_MESSAGES.PRODUCT.DUPLICATE_SKU);
      }

      seenSkus.add(normalizedSku);

      const existingVariant = await this.productVariantRepository.findBySku(normalizedSku);
      if (
        existingVariant &&
        (!currentProductId ||
          objectIdToString(existingVariant.productId) !== objectIdToString(currentProductId))
      ) {
        throw new ConflictException(RESPONSE_MESSAGES.PRODUCT.DUPLICATE_SKU);
      }
    }
  }

  // Rebuild variants, inventory, and images together so the first module version stays deterministic.
  private async replaceProductChildren(
    product: Product,
    variants: Array<{
      sku: string;
      name: string;
      price: number;
      comparePrice?: number;
      costPrice?: number;
      weightGrams?: number;
      isActive?: boolean;
      sortOrder?: number;
      quantityOnHand: number;
      quantityReserved?: number;
      reorderLevel?: number;
    }>,
    images: Array<{
      url: string;
      altText?: string;
      isPrimary?: boolean;
      sortOrder?: number;
      variantSku?: string;
    }>,
  ) {
    const existingVariants = await this.productVariantRepository.findByProductId(product._id);

    await Promise.all([
      this.productVariantRepository.deleteByProductId(product._id),
      this.productImageRepository.deleteByProductId(product._id),
      ...existingVariants.map((variant) => this.inventoryRepository.deleteByVariantId(variant._id)),
    ]);

    const savedVariants: ProductVariant[] = [];

    for (const variant of variants) {
      const createdVariant = this.productVariantRepository.create({
        productId: product._id,
        sku: variant.sku,
        name: variant.name.trim(),
        price: variant.price,
        comparePrice: variant.comparePrice ?? null,
        costPrice: variant.costPrice ?? null,
        weightGrams: variant.weightGrams ?? null,
        isActive: variant.isActive ?? true,
        sortOrder: variant.sortOrder ?? 0,
      });

      const savedVariant = await this.productVariantRepository.save(createdVariant);
      savedVariants.push(savedVariant);

      const inventory = this.inventoryRepository.create({
        variantId: savedVariant._id,
        quantityOnHand: variant.quantityOnHand,
        quantityReserved: variant.quantityReserved ?? 0,
        reorderLevel: variant.reorderLevel ?? 10,
      });

      await this.inventoryRepository.save(inventory);
    }

    for (const image of images) {
      const normalizedVariantSku = image.variantSku?.trim().toUpperCase();
      const matchingVariant = normalizedVariantSku
        ? savedVariants.find((variant) => variant.sku === normalizedVariantSku)
        : null;

      const productImage = this.productImageRepository.create({
        productId: product._id,
        variantId: matchingVariant?._id ?? null,
        url: image.url.trim(),
        altText: image.altText?.trim() || null,
        isPrimary: image.isPrimary ?? false,
        sortOrder: image.sortOrder ?? 0,
      });

      await this.productImageRepository.save(productImage);
    }
  }

  private async serializeProduct(product: Product) {
    const [variants, images] = await Promise.all([
      this.productVariantRepository.findByProductId(product._id),
      this.productImageRepository.findByProductId(product._id),
    ]);

    const serializedVariants = await Promise.all(
      variants.map(async (variant) => {
        const inventory = await this.inventoryRepository.findByVariantId(variant._id);

        return {
          id: objectIdToString(variant._id)!,
          productId: objectIdToString(variant.productId)!,
          sku: variant.sku,
          name: variant.name,
          price: variant.price,
          comparePrice: variant.comparePrice ?? null,
          costPrice: variant.costPrice ?? null,
          weightGrams: variant.weightGrams ?? null,
          isActive: variant.isActive,
          sortOrder: variant.sortOrder,
          quantityOnHand: inventory?.quantityOnHand ?? 0,
          quantityReserved: inventory?.quantityReserved ?? 0,
          quantityAvailable: inventory?.quantityAvailable ?? 0,
          reorderLevel: inventory?.reorderLevel ?? 10,
        };
      }),
    );

    return {
      id: objectIdToString(product._id)!,
      uuid: product.uuid,
      vendorId: objectIdToString(product.vendorId)!,
      categoryId: objectIdToString(product.categoryId)!,
      brandId: objectIdToString(product.brandId) ?? null,
      name: product.name,
      slug: product.slug,
      description: product.description ?? null,
      shortDescription: product.shortDescription ?? null,
      status: product.status,
      rejectionReason: product.rejectionReason ?? null,
      basePrice: product.basePrice,
      tags: product.tags ?? [],
      isFeatured: product.isFeatured,
      metaTitle: product.metaTitle ?? null,
      metaDescription: product.metaDescription ?? null,
      rating: product.rating,
      reviewCount: product.reviewCount,
      variants: serializedVariants,
      images: images.map((image: ProductImage) => ({
        id: objectIdToString(image._id)!,
        productId: objectIdToString(image.productId)!,
        variantId: objectIdToString(image.variantId) ?? null,
        url: image.url,
        altText: image.altText ?? null,
        isPrimary: image.isPrimary,
        sortOrder: image.sortOrder,
      })),
      createdAt: product.createdAt.toISOString(),
      updatedAt: product.updatedAt.toISOString(),
    };
  }
}
