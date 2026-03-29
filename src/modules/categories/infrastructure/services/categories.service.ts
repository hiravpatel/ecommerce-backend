import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ObjectId } from 'mongodb';
import { RESPONSE_MESSAGES } from 'src/common/constants/response-messages.constant';
import { objectIdToString, toObjectId } from 'src/common/database/object-id.util';
import { slugify } from 'src/common/utils/slug.util';
import { AttributeValueRepository } from '../../data/repositories/attribute-value.repository';
import { CategoryAttributeRepository } from '../../data/repositories/category-attribute.repository';
import { CategoryRepository } from '../../data/repositories/category.repository';
import {
  AttributeValue,
  Category,
  CategoryAttribute,
} from '../../data/entities/category.entity';
import { CategoryListQueryDto } from '../../presentation/dto/category-list-query.dto';
import { CreateAttributeValuesDto } from '../../presentation/dto/create-attribute-values.dto';
import { CreateCategoryAttributeDto } from '../../presentation/dto/create-category-attribute.dto';
import { CreateCategoryDto } from '../../presentation/dto/create-category.dto';
import { UpdateCategoryAttributeDto } from '../../presentation/dto/update-category-attribute.dto';
import { UpdateCategoryDto } from '../../presentation/dto/update-category.dto';

type CategoryTreeNode = ReturnType<CategoriesService['serializeCategory']> & {
  children: CategoryTreeNode[];
};

@Injectable()
export class CategoriesService {
  constructor(
    private readonly categoryRepository: CategoryRepository,
    private readonly categoryAttributeRepository: CategoryAttributeRepository,
    private readonly attributeValueRepository: AttributeValueRepository,
  ) {}

  async listCategories(query: CategoryListQueryDto) {
    const categories = await this.categoryRepository.findBy({} as never);
    const search = query.search?.trim().toLowerCase();
    const filtered = categories.filter((category) => {
      if (query.isActive !== undefined && category.isActive !== query.isActive) {
        return false;
      }

      if (query.parentId !== undefined) {
        const requestedParentId = query.parentId === '' ? null : query.parentId;
        if (objectIdToString(category.parentId) !== requestedParentId) {
          return false;
        }
      }

      if (!search) {
        return true;
      }

      return [category.name, category.slug, category.description ?? ''].some((value) =>
        value.toLowerCase().includes(search),
      );
    });

    const sorted = filtered.sort((left, right) => {
      if (left.level !== right.level) {
        return left.level - right.level;
      }

      if (left.sortOrder !== right.sortOrder) {
        return left.sortOrder - right.sortOrder;
      }

      return left.name.localeCompare(right.name);
    });

    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const totalItems = sorted.length;
    const totalPages = totalItems === 0 ? 0 : Math.ceil(totalItems / limit);
    const items = sorted.slice((page - 1) * limit, page * limit);

    return {
      items: items.map((category) => this.serializeCategory(category)),
      pagination: {
        page,
        limit,
        totalItems,
        totalPages,
      },
    };
  }

  async getCategoryTree() {
    const categories = await this.categoryRepository.findBy({ isActive: true });
    const nodes: CategoryTreeNode[] = categories.map((category) => ({
      ...this.serializeCategory(category),
      children: [],
    }));

    const byId = new Map(nodes.map((node) => [node.id, node]));
    const roots: typeof nodes = [];

    for (const node of nodes) {
      if (!node.parentId) {
        roots.push(node);
        continue;
      }

      const parentNode = byId.get(node.parentId);
      if (parentNode) {
        parentNode.children.push(node);
      }
    }

    return roots.sort((left, right) => left.sortOrder - right.sortOrder);
  }

  async getCategoryDetails(categoryId: string) {
    const category = await this.getCategoryById(categoryId);
    return this.serializeCategory(category);
  }

  async createCategory(dto: CreateCategoryDto, imageUrl?: string | null) {
    const slug = dto.slug?.trim() ? slugify(dto.slug) : slugify(dto.name);
    await this.ensureUniqueCategorySlug(slug);

    const parentCategory = dto.parentId ? await this.getCategoryById(dto.parentId) : null;

    const category = this.categoryRepository.create({
      parentId: parentCategory?._id ?? null,
      name: dto.name.trim(),
      slug,
      description: dto.description?.trim() || null,
      imageUrl: imageUrl ?? (dto.imageUrl?.trim() || null),
      path: this.buildCategoryPath(parentCategory, slug),
      level: parentCategory ? parentCategory.level + 1 : 0,
      isActive: dto.isActive ?? true,
      sortOrder: dto.sortOrder ?? 0,
      metaTitle: dto.metaTitle?.trim() || null,
      metaDescription: dto.metaDescription?.trim() || null,
    });

    const savedCategory = await this.categoryRepository.save(category);
    return this.serializeCategory(savedCategory);
  }

  async updateCategory(categoryId: string, dto: UpdateCategoryDto, imageUrl?: string | null) {
    const category = await this.getCategoryById(categoryId);

    let parentCategory = category.parentId
      ? await this.categoryRepository.findOneBy({ _id: category.parentId })
      : null;

    if (dto.parentId !== undefined) {
      if (objectIdToString(category._id) === dto.parentId) {
        throw new ConflictException(RESPONSE_MESSAGES.CATEGORY.INVALID_PARENT);
      }

      parentCategory = dto.parentId ? await this.getCategoryById(dto.parentId) : null;

      if (parentCategory && category.path.startsWith(`${parentCategory.path}/`)) {
        throw new ConflictException(RESPONSE_MESSAGES.CATEGORY.INVALID_PARENT);
      }

      category.parentId = parentCategory?._id ?? null;
    }

    if (dto.name !== undefined) {
      category.name = dto.name.trim();
    }

    if (dto.slug !== undefined || dto.name !== undefined || dto.parentId !== undefined) {
      const nextSlug = dto.slug?.trim() ? slugify(dto.slug) : slugify(category.name);
      await this.ensureUniqueCategorySlug(nextSlug, category._id);
      category.slug = nextSlug;
      category.path = this.buildCategoryPath(parentCategory, nextSlug);
      category.level = parentCategory ? parentCategory.level + 1 : 0;
    }

    if (dto.description !== undefined) {
      category.description = dto.description.trim() || null;
    }

    if (imageUrl !== undefined) {
      category.imageUrl = imageUrl;
    } else if (dto.imageUrl !== undefined) {
      category.imageUrl = dto.imageUrl.trim() || null;
    }

    if (dto.isActive !== undefined) {
      category.isActive = dto.isActive;
    }

    if (dto.sortOrder !== undefined) {
      category.sortOrder = dto.sortOrder;
    }

    if (dto.metaTitle !== undefined) {
      category.metaTitle = dto.metaTitle.trim() || null;
    }

    if (dto.metaDescription !== undefined) {
      category.metaDescription = dto.metaDescription.trim() || null;
    }

    await this.categoryRepository.save(category);
    await this.syncDescendantPaths(category);
    return this.serializeCategory(category);
  }

  async listCategoryAttributes(categoryId: string) {
    const category = await this.getCategoryById(categoryId);
    const attributes = await this.categoryAttributeRepository.findByCategoryId(category._id);

    return Promise.all(attributes.map((attribute) => this.serializeAttribute(attribute)));
  }

  async createCategoryAttribute(categoryId: string, dto: CreateCategoryAttributeDto) {
    const category = await this.getCategoryById(categoryId);
    const slug = dto.slug?.trim() ? slugify(dto.slug) : slugify(dto.name);
    await this.ensureUniqueAttributeSlug(category._id, slug);

    const attribute = this.categoryAttributeRepository.create({
      categoryId: category._id,
      name: dto.name.trim(),
      slug,
      type: dto.type,
      isRequired: dto.isRequired ?? false,
      isFilterable: dto.isFilterable ?? true,
      isVariantDefining: dto.isVariantDefining ?? false,
      sortOrder: dto.sortOrder ?? 0,
    });

    const savedAttribute = await this.categoryAttributeRepository.save(attribute);
    return this.serializeAttribute(savedAttribute);
  }

  async updateCategoryAttribute(
    categoryId: string,
    attributeId: string,
    dto: UpdateCategoryAttributeDto,
  ) {
    const category = await this.getCategoryById(categoryId);
    const attribute = await this.getCategoryAttribute(category._id, attributeId);

    if (dto.name !== undefined) {
      attribute.name = dto.name.trim();
    }

    if (dto.slug !== undefined || dto.name !== undefined) {
      const nextSlug = dto.slug?.trim() ? slugify(dto.slug) : slugify(attribute.name);
      await this.ensureUniqueAttributeSlug(category._id, nextSlug, attribute._id);
      attribute.slug = nextSlug;
    }

    if (dto.type !== undefined) {
      attribute.type = dto.type;
    }

    if (dto.isRequired !== undefined) {
      attribute.isRequired = dto.isRequired;
    }

    if (dto.isFilterable !== undefined) {
      attribute.isFilterable = dto.isFilterable;
    }

    if (dto.isVariantDefining !== undefined) {
      attribute.isVariantDefining = dto.isVariantDefining;
    }

    if (dto.sortOrder !== undefined) {
      attribute.sortOrder = dto.sortOrder;
    }

    await this.categoryAttributeRepository.save(attribute);
    return this.serializeAttribute(attribute);
  }

  async createAttributeValues(attributeId: string, dto: CreateAttributeValuesDto) {
    const attribute = await this.getCategoryAttributeById(attributeId);
    await this.attributeValueRepository.deleteByAttributeId(attribute._id);

    const savedValues: AttributeValue[] = [];
    for (const value of dto.values) {
      const attributeValue = this.attributeValueRepository.create({
        attributeId: attribute._id,
        value: value.value.trim(),
        hexColor: value.hexColor?.trim() || null,
        sortOrder: value.sortOrder ?? 0,
      });

      savedValues.push(await this.attributeValueRepository.save(attributeValue));
    }

    return savedValues.map((value) => this.serializeAttributeValue(value));
  }

  private async getCategoryById(categoryId: string) {
    const category = await this.categoryRepository.findOneBy({
      _id: toObjectId(categoryId)!,
    });

    if (!category) {
      throw new NotFoundException(RESPONSE_MESSAGES.CATEGORY.NOT_FOUND);
    }

    return category;
  }

  private async getCategoryAttribute(categoryId: ObjectId, attributeId: string) {
    const attribute = await this.categoryAttributeRepository.findByCategoryIdAndId(
      categoryId,
      toObjectId(attributeId)!,
    );

    if (!attribute) {
      throw new NotFoundException(RESPONSE_MESSAGES.CATEGORY.ATTRIBUTE_NOT_FOUND);
    }

    return attribute;
  }

  private async getCategoryAttributeById(attributeId: string) {
    const attribute = await this.categoryAttributeRepository.findOneBy({
      _id: toObjectId(attributeId)!,
    });

    if (!attribute) {
      throw new NotFoundException(RESPONSE_MESSAGES.CATEGORY.ATTRIBUTE_NOT_FOUND);
    }

    return attribute;
  }

  private async ensureUniqueCategorySlug(slug: string, currentCategoryId?: ObjectId) {
    const existingCategory = await this.categoryRepository.findBySlug(slug);

    if (
      existingCategory &&
      objectIdToString(existingCategory._id) !== objectIdToString(currentCategoryId)
    ) {
      throw new ConflictException(RESPONSE_MESSAGES.CATEGORY.DUPLICATE_SLUG);
    }
  }

  private async ensureUniqueAttributeSlug(
    categoryId: ObjectId,
    slug: string,
    currentAttributeId?: ObjectId,
  ) {
    const attributes = await this.categoryAttributeRepository.findByCategoryId(categoryId);
    const existingAttribute = attributes.find((attribute) => attribute.slug === slug);

    if (
      existingAttribute &&
      objectIdToString(existingAttribute._id) !== objectIdToString(currentAttributeId)
    ) {
      throw new ConflictException(RESPONSE_MESSAGES.CATEGORY.DUPLICATE_ATTRIBUTE_SLUG);
    }
  }

  private buildCategoryPath(parentCategory: Category | null, slug: string) {
    return parentCategory ? `${parentCategory.path}/${slug}` : slug;
  }

  private async syncDescendantPaths(parentCategory: Category) {
    const categories = await this.categoryRepository.findBy({} as never);
    const descendants = categories.filter(
      (category) =>
        category.parentId && objectIdToString(category.parentId) === objectIdToString(parentCategory._id),
    );

    for (const descendant of descendants) {
      descendant.path = `${parentCategory.path}/${descendant.slug}`;
      descendant.level = parentCategory.level + 1;
      await this.categoryRepository.save(descendant);
      await this.syncDescendantPaths(descendant);
    }
  }

  private async serializeAttribute(attribute: CategoryAttribute) {
    const values = await this.attributeValueRepository.findByAttributeId(attribute._id);

    return {
      id: objectIdToString(attribute._id)!,
      categoryId: objectIdToString(attribute.categoryId)!,
      name: attribute.name,
      slug: attribute.slug,
      type: attribute.type,
      isRequired: attribute.isRequired,
      isFilterable: attribute.isFilterable,
      isVariantDefining: attribute.isVariantDefining,
      sortOrder: attribute.sortOrder,
      values: values.map((value) => this.serializeAttributeValue(value)),
    };
  }

  private serializeAttributeValue(value: AttributeValue) {
    return {
      id: objectIdToString(value._id)!,
      attributeId: objectIdToString(value.attributeId)!,
      value: value.value,
      hexColor: value.hexColor ?? null,
      sortOrder: value.sortOrder,
    };
  }

  private serializeCategory(category: Category) {
    return {
      id: objectIdToString(category._id)!,
      parentId: objectIdToString(category.parentId) ?? null,
      name: category.name,
      slug: category.slug,
      description: category.description ?? null,
      imageUrl: category.imageUrl ?? null,
      path: category.path,
      level: category.level,
      isActive: category.isActive,
      sortOrder: category.sortOrder,
      metaTitle: category.metaTitle ?? null,
      metaDescription: category.metaDescription ?? null,
      createdAt: category.createdAt.toISOString(),
      updatedAt: category.updatedAt.toISOString(),
    };
  }
}
