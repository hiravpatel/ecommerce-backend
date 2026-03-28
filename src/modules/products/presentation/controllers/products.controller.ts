import { Body, Controller, Get, HttpStatus, Param, Post, Put, Query } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { RESPONSE_MESSAGES } from 'src/common/constants/response-messages.constant';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { ResponseMessage } from 'src/common/decorators/response-message.decorator';
import { Roles } from 'src/common/decorators/roles.decorator';
import {
  ApiStandardErrorResponse,
  ApiSuccessResponse,
} from 'src/common/swagger/api-response.decorator';
import { UserRole } from 'src/modules/users/data/entities/user.entity';
import { ProductsService } from '../../infrastructure/services/products.service';
import { CreateProductDto } from '../dto/create-product.dto';
import { ProductListQueryDto } from '../dto/product-list-query.dto';
import { ProductListResponseDto } from '../dto/product-list-response.dto';
import { ProductDto } from '../dto/product.dto';
import { UpdateProductDto } from '../dto/update-product.dto';

@ApiTags('Products')
@ApiBearerAuth('bearer')
@Roles(UserRole.VENDOR)
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get('me')
  @ResponseMessage(RESPONSE_MESSAGES.PRODUCT.LIST_FETCHED)
  @ApiOperation({ summary: 'List current vendor products' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 10 })
  @ApiQuery({ name: 'search', required: false, example: 'iphone' })
  @ApiQuery({ name: 'status', required: false, example: 'draft' })
  @ApiQuery({ name: 'categoryId', required: false, example: '67e4f0f78a6ef35a3b4f2001' })
  @ApiSuccessResponse({
    status: HttpStatus.OK,
    message: RESPONSE_MESSAGES.PRODUCT.LIST_FETCHED,
    type: ProductListResponseDto,
    example: {
      items: [
        {
          id: '67e4f0f78a6ef35a3b4f3001',
          uuid: '550e8400-e29b-41d4-a716-446655440010',
          vendorId: '67e4f0f78a6ef35a3b4f2e99',
          categoryId: '67e4f0f78a6ef35a3b4f2001',
          brandId: null,
          name: 'iPhone 16 Pro',
          slug: 'iphone-16-pro',
          description: 'Latest flagship smartphone',
          shortDescription: 'Premium Apple smartphone',
          status: 'draft',
          rejectionReason: null,
          basePrice: 79999,
          tags: ['smartphone', 'apple'],
          isFeatured: false,
          metaTitle: 'Buy iPhone 16 Pro online',
          metaDescription: 'Latest iPhone 16 Pro from trusted vendor',
          rating: 0,
          reviewCount: 0,
          variants: [],
          images: [],
          createdAt: '2026-03-28T08:00:00.000Z',
          updatedAt: '2026-03-28T08:00:00.000Z',
        },
      ],
      pagination: {
        page: 1,
        limit: 10,
        totalItems: 1,
        totalPages: 1,
      },
    },
  })
  listVendorProducts(
    @CurrentUser('uuid') userUuid: string,
    @Query() query: ProductListQueryDto,
  ) {
    return this.productsService.listVendorProducts(userUuid, query);
  }

  @Get('me/:productId')
  @ResponseMessage(RESPONSE_MESSAGES.PRODUCT.DETAILS_FETCHED)
  @ApiOperation({ summary: 'Get current vendor product details' })
  @ApiSuccessResponse({
    status: HttpStatus.OK,
    message: RESPONSE_MESSAGES.PRODUCT.DETAILS_FETCHED,
    type: ProductDto,
    example: {
      id: '67e4f0f78a6ef35a3b4f3001',
      uuid: '550e8400-e29b-41d4-a716-446655440010',
      vendorId: '67e4f0f78a6ef35a3b4f2e99',
      categoryId: '67e4f0f78a6ef35a3b4f2001',
      brandId: null,
      name: 'iPhone 16 Pro',
      slug: 'iphone-16-pro',
      description: 'Latest flagship smartphone',
      shortDescription: 'Premium Apple smartphone',
      status: 'draft',
      rejectionReason: null,
      basePrice: 79999,
      tags: ['smartphone', 'apple'],
      isFeatured: false,
      metaTitle: 'Buy iPhone 16 Pro online',
      metaDescription: 'Latest iPhone 16 Pro from trusted vendor',
      rating: 0,
      reviewCount: 0,
      variants: [
        {
          id: '67e4f0f78a6ef35a3b4f3101',
          productId: '67e4f0f78a6ef35a3b4f3001',
          sku: 'JES-IPHONE16-BLK-128',
          name: 'Black / 128 GB',
          price: 79999,
          comparePrice: 84999,
          costPrice: 72000,
          weightGrams: 320,
          isActive: true,
          sortOrder: 0,
          quantityOnHand: 25,
          quantityReserved: 0,
          quantityAvailable: 25,
          reorderLevel: 5,
        },
      ],
      images: [
        {
          id: '67e4f0f78a6ef35a3b4f3201',
          productId: '67e4f0f78a6ef35a3b4f3001',
          variantId: null,
          url: 'https://cdn.example.com/products/iphone-16-front.jpg',
          altText: 'Front view',
          isPrimary: true,
          sortOrder: 0,
        },
      ],
      createdAt: '2026-03-28T08:00:00.000Z',
      updatedAt: '2026-03-28T08:00:00.000Z',
    },
  })
  @ApiStandardErrorResponse({
    status: HttpStatus.NOT_FOUND,
    message: RESPONSE_MESSAGES.PRODUCT.NOT_FOUND,
    error: 'Not Found',
  })
  getVendorProduct(
    @CurrentUser('uuid') userUuid: string,
    @Param('productId') productId: string,
  ) {
    return this.productsService.getVendorProduct(userUuid, productId);
  }

  @Post()
  @ResponseMessage(RESPONSE_MESSAGES.PRODUCT.CREATED)
  @ApiOperation({ summary: 'Create a vendor product with variants and inventory' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['categoryId', 'name', 'variants'],
      properties: {
        categoryId: { type: 'string', example: '67e4f0f78a6ef35a3b4f2001' },
        brandId: { type: 'string', example: '67e4f0f78a6ef35a3b4f2101' },
        name: { type: 'string', example: 'iPhone 16 Pro' },
        slug: { type: 'string', example: 'iphone-16-pro' },
        description: { type: 'string', example: 'Latest flagship smartphone' },
        shortDescription: { type: 'string', example: 'Premium Apple smartphone' },
        status: { type: 'string', example: 'draft' },
        tags: {
          type: 'string',
          example: '["smartphone","apple","premium"]',
        },
        metaTitle: { type: 'string', example: 'Buy iPhone 16 Pro online' },
        metaDescription: {
          type: 'string',
          example: 'Latest iPhone 16 Pro from trusted vendor',
        },
        variants: {
          type: 'string',
          example:
            '[{"sku":"JES-IPHONE16-BLK-128","name":"Black / 128 GB","price":79999,"comparePrice":84999,"costPrice":72000,"weightGrams":320,"isActive":true,"sortOrder":0,"quantityOnHand":25,"quantityReserved":0,"reorderLevel":5}]',
        },
        images: {
          type: 'string',
          example:
            '[{"url":"https://cdn.example.com/products/iphone-16-front.jpg","altText":"Front view","isPrimary":true,"sortOrder":0}]',
        },
      },
    },
  })
  @ApiSuccessResponse({
    status: HttpStatus.CREATED,
    message: RESPONSE_MESSAGES.PRODUCT.CREATED,
    type: ProductDto,
    example: {
      id: '67e4f0f78a6ef35a3b4f3001',
      uuid: '550e8400-e29b-41d4-a716-446655440010',
      vendorId: '67e4f0f78a6ef35a3b4f2e99',
      categoryId: '67e4f0f78a6ef35a3b4f2001',
      brandId: null,
      name: 'iPhone 16 Pro',
      slug: 'iphone-16-pro',
      description: 'Latest flagship smartphone',
      shortDescription: 'Premium Apple smartphone',
      status: 'draft',
      rejectionReason: null,
      basePrice: 79999,
      tags: ['smartphone', 'apple'],
      isFeatured: false,
      metaTitle: 'Buy iPhone 16 Pro online',
      metaDescription: 'Latest iPhone 16 Pro from trusted vendor',
      rating: 0,
      reviewCount: 0,
      variants: [
        {
          id: '67e4f0f78a6ef35a3b4f3101',
          productId: '67e4f0f78a6ef35a3b4f3001',
          sku: 'JES-IPHONE16-BLK-128',
          name: 'Black / 128 GB',
          price: 79999,
          comparePrice: 84999,
          costPrice: 72000,
          weightGrams: 320,
          isActive: true,
          sortOrder: 0,
          quantityOnHand: 25,
          quantityReserved: 0,
          quantityAvailable: 25,
          reorderLevel: 5,
        },
      ],
      images: [],
      createdAt: '2026-03-28T08:00:00.000Z',
      updatedAt: '2026-03-28T08:00:00.000Z',
    },
  })
  createProduct(@CurrentUser('uuid') userUuid: string, @Body() dto: CreateProductDto) {
    return this.productsService.createProduct(userUuid, dto);
  }

  @Put(':productId')
  @ResponseMessage(RESPONSE_MESSAGES.PRODUCT.UPDATED)
  @ApiOperation({ summary: 'Update a vendor product with full product payload' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        categoryId: { type: 'string', example: '67e4f0f78a6ef35a3b4f2001' },
        brandId: { type: 'string', example: '67e4f0f78a6ef35a3b4f2101' },
        name: { type: 'string', example: 'iPhone 16 Pro Max' },
        slug: { type: 'string', example: 'iphone-16-pro-max' },
        description: { type: 'string', example: 'Updated flagship smartphone' },
        shortDescription: { type: 'string', example: 'Updated premium Apple smartphone' },
        status: { type: 'string', example: 'pending_approval' },
        tags: {
          type: 'string',
          example: '["smartphone","apple","new-launch"]',
        },
        metaTitle: { type: 'string', example: 'Buy iPhone 16 Pro Max online' },
        metaDescription: {
          type: 'string',
          example: 'Latest iPhone 16 Pro Max from trusted vendor',
        },
        variants: {
          type: 'string',
          example:
            '[{"sku":"JES-IPHONE16-BLK-256","name":"Black / 256 GB","price":89999,"comparePrice":94999,"costPrice":81000,"weightGrams":325,"isActive":true,"sortOrder":0,"quantityOnHand":15,"quantityReserved":0,"reorderLevel":5}]',
        },
        images: {
          type: 'string',
          example:
            '[{"url":"https://cdn.example.com/products/iphone-16-max-front.jpg","altText":"Front view","isPrimary":true,"sortOrder":0}]',
        },
      },
    },
  })
  @ApiSuccessResponse({
    status: HttpStatus.OK,
    message: RESPONSE_MESSAGES.PRODUCT.UPDATED,
    type: ProductDto,
    example: {
      id: '67e4f0f78a6ef35a3b4f3001',
      uuid: '550e8400-e29b-41d4-a716-446655440010',
      vendorId: '67e4f0f78a6ef35a3b4f2e99',
      categoryId: '67e4f0f78a6ef35a3b4f2001',
      brandId: null,
      name: 'iPhone 16 Pro Max',
      slug: 'iphone-16-pro-max',
      description: 'Updated flagship smartphone',
      shortDescription: 'Updated premium Apple smartphone',
      status: 'pending_approval',
      rejectionReason: null,
      basePrice: 89999,
      tags: ['smartphone', 'apple', 'new-launch'],
      isFeatured: false,
      metaTitle: 'Buy iPhone 16 Pro Max online',
      metaDescription: 'Latest iPhone 16 Pro Max from trusted vendor',
      rating: 0,
      reviewCount: 0,
      variants: [],
      images: [],
      createdAt: '2026-03-28T08:00:00.000Z',
      updatedAt: '2026-03-28T09:00:00.000Z',
    },
  })
  updateProduct(
    @CurrentUser('uuid') userUuid: string,
    @Param('productId') productId: string,
    @Body() dto: UpdateProductDto,
  ) {
    return this.productsService.updateProduct(userUuid, productId, dto);
  }
}
