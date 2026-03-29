import { Body, Controller, Get, HttpStatus, Param, Put, Query } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { RESPONSE_MESSAGES } from 'src/common/constants/response-messages.constant';
import { ResponseMessage } from 'src/common/decorators/response-message.decorator';
import { Roles } from 'src/common/decorators/roles.decorator';
import {
  ApiStandardErrorResponse,
  ApiSuccessResponse,
} from 'src/common/swagger/api-response.decorator';
import { UserRole } from 'src/modules/users/data/entities/user.entity';
import { VendorsService } from '../../infrastructure/services/vendors.service';
import { UpdateVendorStatusDto } from '../dto/update-vendor-status.dto';
import { VendorListQueryDto } from '../dto/vendor-list-query.dto';
import { VendorProfileDto } from '../dto/vendor-profile.dto';

@ApiTags('Admin Vendors')
@ApiBearerAuth('bearer')
@Roles(UserRole.ADMIN)
@Controller('admin/vendors')
export class AdminVendorsController {
  constructor(private readonly vendorsService: VendorsService) {}

  @Get()
  @ResponseMessage(RESPONSE_MESSAGES.VENDOR.LIST_FETCHED)
  @ApiOperation({ summary: 'List vendors for admin review' })
  @ApiQuery({ name: 'search', required: false, example: 'electronics' })
  @ApiQuery({ name: 'status', required: false, example: 'pending' })
  @ApiSuccessResponse({
    status: HttpStatus.OK,
    message: RESPONSE_MESSAGES.VENDOR.LIST_FETCHED,
    example: [
      {
        id: '67e4f0f78a6ef35a3b4f2e99',
        userId: '67e4f0f78a6ef35a3b4f2e11',
        businessName: 'John Electronics Store',
        businessSlug: 'john-electronics-store',
        description: 'Multi-brand electronics seller',
        logoUrl: null,
        bannerUrl: null,
        status: 'pending',
        commissionRate: 10,
        gstin: '27ABCDE1234F1Z5',
        panNumber: 'ABCDE1234F',
        kycStatus: 'submitted',
        bankAccountId: '67e4f0f78a6ef35a3b4f2f00',
        totalRevenue: 0,
        rating: 0,
        totalOrders: 0,
        createdAt: '2026-03-27T12:00:00.000Z',
        updatedAt: '2026-03-27T13:00:00.000Z',
      },
    ],
  })
  listVendors(@Query() query: VendorListQueryDto) {
    return this.vendorsService.listVendors(query);
  }

  @Get(':vendorId')
  @ResponseMessage(RESPONSE_MESSAGES.VENDOR.PROFILE_FETCHED)
  @ApiOperation({ summary: 'Get vendor details for admin review' })
  @ApiSuccessResponse({
    status: HttpStatus.OK,
    message: RESPONSE_MESSAGES.VENDOR.PROFILE_FETCHED,
    type: VendorProfileDto,
    example: {
      id: '67e4f0f78a6ef35a3b4f2e99',
      userId: '67e4f0f78a6ef35a3b4f2e11',
      businessName: 'John Electronics Store',
      businessSlug: 'john-electronics-store',
      description: 'Multi-brand electronics seller',
      logoUrl: null,
      bannerUrl: null,
      status: 'pending',
      commissionRate: 10,
      gstin: '27ABCDE1234F1Z5',
      panNumber: 'ABCDE1234F',
      kycStatus: 'submitted',
      bankAccountId: '67e4f0f78a6ef35a3b4f2f00',
      totalRevenue: 0,
      rating: 0,
      totalOrders: 0,
      createdAt: '2026-03-27T12:00:00.000Z',
      updatedAt: '2026-03-27T13:00:00.000Z',
    },
  })
  @ApiStandardErrorResponse({
    status: HttpStatus.NOT_FOUND,
    message: RESPONSE_MESSAGES.VENDOR.PROFILE_NOT_FOUND,
    error: 'Not Found',
  })
  getVendor(@Param('vendorId') vendorId: string) {
    return this.vendorsService.getVendorById(vendorId);
  }

  @Put(':vendorId/status')
  @ResponseMessage(RESPONSE_MESSAGES.VENDOR.STATUS_UPDATED)
  @ApiOperation({ summary: 'Approve, reject, or suspend a vendor' })
  @ApiBody({ type: UpdateVendorStatusDto })
  @ApiSuccessResponse({
    status: HttpStatus.OK,
    message: RESPONSE_MESSAGES.VENDOR.STATUS_UPDATED,
    type: VendorProfileDto,
    example: {
      id: '67e4f0f78a6ef35a3b4f2e99',
      userId: '67e4f0f78a6ef35a3b4f2e11',
      businessName: 'John Electronics Store',
      businessSlug: 'john-electronics-store',
      description: 'Multi-brand electronics seller',
      logoUrl: null,
      bannerUrl: null,
      status: 'approved',
      commissionRate: 10,
      gstin: '27ABCDE1234F1Z5',
      panNumber: 'ABCDE1234F',
      kycStatus: 'verified',
      bankAccountId: '67e4f0f78a6ef35a3b4f2f00',
      totalRevenue: 0,
      rating: 0,
      totalOrders: 0,
      createdAt: '2026-03-27T12:00:00.000Z',
      updatedAt: '2026-03-28T10:00:00.000Z',
    },
  })
  @ApiStandardErrorResponse({
    status: HttpStatus.NOT_FOUND,
    message: RESPONSE_MESSAGES.VENDOR.PROFILE_NOT_FOUND,
    error: 'Not Found',
  })
  updateVendorStatus(
    @Param('vendorId') vendorId: string,
    @Body() dto: UpdateVendorStatusDto,
  ) {
    return this.vendorsService.updateVendorStatus(vendorId, dto);
  }
}
