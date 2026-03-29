import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { RESPONSE_MESSAGES } from 'src/common/constants/response-messages.constant';
import { Public } from 'src/common/decorators/public.decorator';
import { ResponseMessage } from 'src/common/decorators/response-message.decorator';
import { Roles } from 'src/common/decorators/roles.decorator';
import {
  ApiStandardErrorResponse,
  ApiSuccessResponse,
} from 'src/common/swagger/api-response.decorator';
import { buildUploadUrl, createDiskStorage } from 'src/common/utils/file-upload.util';
import { UserRole } from 'src/modules/users/data/entities/user.entity';
import { CategoriesService } from '../../infrastructure/services/categories.service';
import { CategoryAttributeDto } from '../dto/category-attribute.dto';
import { CategoryDto } from '../dto/category.dto';
import { CategoryListQueryDto } from '../dto/category-list-query.dto';
import { CategoryListResponseDto } from '../dto/category-list-response.dto';
import { CategoryTreeDto } from '../dto/category-tree.dto';
import { CreateAttributeValuesDto } from '../dto/create-attribute-values.dto';
import { CreateCategoryAttributeDto } from '../dto/create-category-attribute.dto';
import { CreateCategoryDto } from '../dto/create-category.dto';
import { UpdateCategoryAttributeDto } from '../dto/update-category-attribute.dto';
import { UpdateCategoryDto } from '../dto/update-category.dto';

type UploadedFormFile = {
  filename: string;
};

@ApiTags('Categories')
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Public()
  @Get()
  @ResponseMessage(RESPONSE_MESSAGES.CATEGORY.LIST_FETCHED)
  @ApiOperation({ summary: 'List categories with search, filter, and pagination' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 10 })
  @ApiQuery({ name: 'search', required: false, example: 'mobile' })
  @ApiQuery({ name: 'parentId', required: false, example: '67e4f0f78a6ef35a3b4f1001' })
  @ApiQuery({ name: 'isActive', required: false, example: true })
  @ApiSuccessResponse({
    status: HttpStatus.OK,
    message: RESPONSE_MESSAGES.CATEGORY.LIST_FETCHED,
    type: CategoryListResponseDto,
    example: {
      items: [
        {
          id: '67e4f0f78a6ef35a3b4f2001',
          parentId: '67e4f0f78a6ef35a3b4f1001',
          name: 'Mobiles',
          slug: 'mobiles',
          description: 'Smartphones and accessories',
          imageUrl: '/uploads/categories/mobiles.png',
          path: 'electronics/mobiles',
          level: 1,
          isActive: true,
          sortOrder: 0,
          metaTitle: 'Buy mobiles online',
          metaDescription: 'Explore mobile phones and accessories',
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
  listCategories(@Query() query: CategoryListQueryDto) {
    return this.categoriesService.listCategories(query);
  }

  @Public()
  @Get('tree')
  @ResponseMessage(RESPONSE_MESSAGES.CATEGORY.TREE_FETCHED)
  @ApiOperation({ summary: 'Get active category tree' })
  @ApiSuccessResponse({
    status: HttpStatus.OK,
    message: RESPONSE_MESSAGES.CATEGORY.TREE_FETCHED,
    type: CategoryTreeDto,
    example: [
      {
        id: '67e4f0f78a6ef35a3b4f1001',
        parentId: null,
        name: 'Electronics',
        slug: 'electronics',
        description: 'Electronic products',
        imageUrl: null,
        path: 'electronics',
        level: 0,
        isActive: true,
        sortOrder: 0,
        metaTitle: null,
        metaDescription: null,
        createdAt: '2026-03-28T08:00:00.000Z',
        updatedAt: '2026-03-28T08:00:00.000Z',
        children: [
          {
            id: '67e4f0f78a6ef35a3b4f2001',
            parentId: '67e4f0f78a6ef35a3b4f1001',
            name: 'Mobiles',
            slug: 'mobiles',
            description: 'Smartphones and accessories',
            imageUrl: null,
            path: 'electronics/mobiles',
            level: 1,
            isActive: true,
            sortOrder: 0,
            metaTitle: null,
            metaDescription: null,
            createdAt: '2026-03-28T08:00:00.000Z',
            updatedAt: '2026-03-28T08:00:00.000Z',
            children: [],
          },
        ],
      },
    ],
  })
  getCategoryTree() {
    return this.categoriesService.getCategoryTree();
  }

  @Public()
  @Get(':categoryId')
  @ResponseMessage(RESPONSE_MESSAGES.CATEGORY.DETAILS_FETCHED)
  @ApiOperation({ summary: 'Get category details' })
  @ApiSuccessResponse({
    status: HttpStatus.OK,
    message: RESPONSE_MESSAGES.CATEGORY.DETAILS_FETCHED,
    type: CategoryDto,
    example: {
      id: '67e4f0f78a6ef35a3b4f2001',
      parentId: '67e4f0f78a6ef35a3b4f1001',
      name: 'Mobiles',
      slug: 'mobiles',
      description: 'Smartphones and accessories',
      imageUrl: '/uploads/categories/mobiles.png',
      path: 'electronics/mobiles',
      level: 1,
      isActive: true,
      sortOrder: 0,
      metaTitle: 'Buy mobiles online',
      metaDescription: 'Explore mobile phones and accessories',
      createdAt: '2026-03-28T08:00:00.000Z',
      updatedAt: '2026-03-28T08:00:00.000Z',
    },
  })
  getCategoryDetails(@Param('categoryId') categoryId: string) {
    return this.categoriesService.getCategoryDetails(categoryId);
  }

  @Public()
  @Get(':categoryId/attributes')
  @ResponseMessage(RESPONSE_MESSAGES.CATEGORY.ATTRIBUTES_FETCHED)
  @ApiOperation({ summary: 'List category attributes and values' })
  @ApiSuccessResponse({
    status: HttpStatus.OK,
    message: RESPONSE_MESSAGES.CATEGORY.ATTRIBUTES_FETCHED,
    example: [
      {
        id: '67e4f0f78a6ef35a3b4f4001',
        categoryId: '67e4f0f78a6ef35a3b4f2001',
        name: 'Color',
        slug: 'color',
        type: 'select',
        isRequired: true,
        isFilterable: true,
        isVariantDefining: true,
        sortOrder: 0,
        values: [
          {
            id: '67e4f0f78a6ef35a3b4f4101',
            attributeId: '67e4f0f78a6ef35a3b4f4001',
            value: 'Black',
            hexColor: '#000000',
            sortOrder: 0,
          },
        ],
      },
    ],
  })
  listCategoryAttributes(@Param('categoryId') categoryId: string) {
    return this.categoriesService.listCategoryAttributes(categoryId);
  }

  @Post()
  @ApiBearerAuth('bearer')
  @Roles(UserRole.ADMIN)
  @UseInterceptors(
    FileInterceptor('image', {
      storage: createDiskStorage('categories'),
    }),
  )
  @ResponseMessage(RESPONSE_MESSAGES.CATEGORY.CREATED)
  @ApiOperation({ summary: 'Create category' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['name'],
      properties: {
        parentId: { type: 'string', example: '67e4f0f78a6ef35a3b4f1001' },
        name: { type: 'string', example: 'Mobiles' },
        slug: { type: 'string', example: 'mobiles' },
        description: { type: 'string', example: 'Smartphones and accessories' },
        imageUrl: { type: 'string', example: '/uploads/categories/mobiles.png' },
        image: { type: 'string', format: 'binary' },
        isActive: { type: 'boolean', example: true },
        sortOrder: { type: 'number', example: 0 },
        metaTitle: { type: 'string', example: 'Buy mobiles online' },
        metaDescription: {
          type: 'string',
          example: 'Explore mobile phones and accessories',
        },
      },
    },
  })
  @ApiSuccessResponse({
    status: HttpStatus.CREATED,
    message: RESPONSE_MESSAGES.CATEGORY.CREATED,
    type: CategoryDto,
    example: {
      id: '67e4f0f78a6ef35a3b4f2001',
      parentId: '67e4f0f78a6ef35a3b4f1001',
      name: 'Mobiles',
      slug: 'mobiles',
      description: 'Smartphones and accessories',
      imageUrl: '/uploads/categories/1711599999999-mobiles.png',
      path: 'electronics/mobiles',
      level: 1,
      isActive: true,
      sortOrder: 0,
      metaTitle: 'Buy mobiles online',
      metaDescription: 'Explore mobile phones and accessories',
      createdAt: '2026-03-28T08:00:00.000Z',
      updatedAt: '2026-03-28T08:00:00.000Z',
    },
  })
  createCategory(
    @Body() dto: CreateCategoryDto,
    @UploadedFile() image?: UploadedFormFile,
  ) {
    return this.categoriesService.createCategory(
      dto,
      image ? buildUploadUrl('categories', image.filename) : undefined,
    );
  }

  @Put(':categoryId')
  @ApiBearerAuth('bearer')
  @Roles(UserRole.ADMIN)
  @UseInterceptors(
    FileInterceptor('image', {
      storage: createDiskStorage('categories'),
    }),
  )
  @ResponseMessage(RESPONSE_MESSAGES.CATEGORY.UPDATED)
  @ApiOperation({ summary: 'Update category' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        parentId: { type: 'string', example: '67e4f0f78a6ef35a3b4f1001' },
        name: { type: 'string', example: 'Mobiles & Tablets' },
        slug: { type: 'string', example: 'mobiles-tablets' },
        description: { type: 'string', example: 'Updated category description' },
        imageUrl: { type: 'string', example: '/uploads/categories/mobiles.png' },
        image: { type: 'string', format: 'binary' },
        isActive: { type: 'boolean', example: true },
        sortOrder: { type: 'number', example: 1 },
        metaTitle: { type: 'string', example: 'Updated meta title' },
        metaDescription: { type: 'string', example: 'Updated meta description' },
      },
    },
  })
  @ApiSuccessResponse({
    status: HttpStatus.OK,
    message: RESPONSE_MESSAGES.CATEGORY.UPDATED,
    type: CategoryDto,
    example: {
      id: '67e4f0f78a6ef35a3b4f2001',
      parentId: '67e4f0f78a6ef35a3b4f1001',
      name: 'Mobiles & Tablets',
      slug: 'mobiles-tablets',
      description: 'Updated category description',
      imageUrl: '/uploads/categories/1711599999999-mobiles.png',
      path: 'electronics/mobiles-tablets',
      level: 1,
      isActive: true,
      sortOrder: 1,
      metaTitle: 'Updated meta title',
      metaDescription: 'Updated meta description',
      createdAt: '2026-03-28T08:00:00.000Z',
      updatedAt: '2026-03-28T09:00:00.000Z',
    },
  })
  updateCategory(
    @Param('categoryId') categoryId: string,
    @Body() dto: UpdateCategoryDto,
    @UploadedFile() image?: UploadedFormFile,
  ) {
    return this.categoriesService.updateCategory(
      categoryId,
      dto,
      image ? buildUploadUrl('categories', image.filename) : undefined,
    );
  }

  @Post(':categoryId/attributes')
  @ApiBearerAuth('bearer')
  @Roles(UserRole.ADMIN)
  @ResponseMessage(RESPONSE_MESSAGES.CATEGORY.ATTRIBUTE_CREATED)
  @ApiOperation({ summary: 'Create category attribute' })
  @ApiBody({ type: CreateCategoryAttributeDto })
  @ApiSuccessResponse({
    status: HttpStatus.CREATED,
    message: RESPONSE_MESSAGES.CATEGORY.ATTRIBUTE_CREATED,
    type: CategoryAttributeDto,
    example: {
      id: '67e4f0f78a6ef35a3b4f4001',
      categoryId: '67e4f0f78a6ef35a3b4f2001',
      name: 'Color',
      slug: 'color',
      type: 'select',
      isRequired: true,
      isFilterable: true,
      isVariantDefining: true,
      sortOrder: 0,
      values: [],
    },
  })
  createCategoryAttribute(
    @Param('categoryId') categoryId: string,
    @Body() dto: CreateCategoryAttributeDto,
  ) {
    return this.categoriesService.createCategoryAttribute(categoryId, dto);
  }

  @Put(':categoryId/attributes/:attributeId')
  @ApiBearerAuth('bearer')
  @Roles(UserRole.ADMIN)
  @ResponseMessage(RESPONSE_MESSAGES.CATEGORY.ATTRIBUTE_UPDATED)
  @ApiOperation({ summary: 'Update category attribute' })
  @ApiBody({ type: UpdateCategoryAttributeDto })
  @ApiSuccessResponse({
    status: HttpStatus.OK,
    message: RESPONSE_MESSAGES.CATEGORY.ATTRIBUTE_UPDATED,
    type: CategoryAttributeDto,
    example: {
      id: '67e4f0f78a6ef35a3b4f4001',
      categoryId: '67e4f0f78a6ef35a3b4f2001',
      name: 'Storage',
      slug: 'storage',
      type: 'select',
      isRequired: true,
      isFilterable: true,
      isVariantDefining: true,
      sortOrder: 1,
      values: [],
    },
  })
  updateCategoryAttribute(
    @Param('categoryId') categoryId: string,
    @Param('attributeId') attributeId: string,
    @Body() dto: UpdateCategoryAttributeDto,
  ) {
    return this.categoriesService.updateCategoryAttribute(categoryId, attributeId, dto);
  }

  @Post('attributes/:attributeId/values')
  @ApiBearerAuth('bearer')
  @Roles(UserRole.ADMIN)
  @ResponseMessage(RESPONSE_MESSAGES.CATEGORY.ATTRIBUTE_VALUES_CREATED)
  @ApiOperation({ summary: 'Replace attribute values' })
  @ApiBody({ type: CreateAttributeValuesDto })
  @ApiSuccessResponse({
    status: HttpStatus.CREATED,
    message: RESPONSE_MESSAGES.CATEGORY.ATTRIBUTE_VALUES_CREATED,
    example: [
      {
        id: '67e4f0f78a6ef35a3b4f4101',
        attributeId: '67e4f0f78a6ef35a3b4f4001',
        value: 'Black',
        hexColor: '#000000',
        sortOrder: 0,
      },
    ],
  })
  createAttributeValues(
    @Param('attributeId') attributeId: string,
    @Body() dto: CreateAttributeValuesDto,
  ) {
    return this.categoriesService.createAttributeValues(attributeId, dto);
  }
}
