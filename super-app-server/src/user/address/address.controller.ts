import { Controller, Get, Post, Delete, Patch, Body, Param, UseGuards } from '@nestjs/common';
import { AddressService } from './address.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { CreateAddressDto } from './dto/create-address.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AddressEntity } from './entities/address.entity';

@ApiTags('Addresses')
@Controller('addresses')
export class AddressController {
  constructor(private readonly addressService: AddressService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Tạo địa chỉ mới cho người dùng' })
  @ApiResponse({ status: 201, description: 'Tạo thành công', type: AddressEntity })
  @ApiResponse({ status: 400, description: 'Dữ liệu đầu vào không hợp lệ' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async createAddress(
    @CurrentUser() user: { id: string },
    @Body() dto: CreateAddressDto,
  ) {
    return this.addressService.createAddress(user.id, dto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Lấy danh sách địa chỉ của người dùng hiện tại' })
  @ApiResponse({ status: 200, description: 'Lấy danh sách thành công', type: [AddressEntity] })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getMyAddresses(@CurrentUser() user: { id: string }) {
    return this.addressService.getMyAddresses(user.id);
  }

  @Patch(':id/default')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Đặt địa chỉ làm mặc định' })
  @ApiResponse({ status: 200, description: 'Đặt mặc định thành công', type: AddressEntity })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Không có quyền sở hữu địa chỉ này' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy địa chỉ' })
  async setDefaultAddress(
    @CurrentUser() user: { id: string },
    @Param('id') addressId: string,
  ) {
    return this.addressService.setDefaultAddress(user.id, addressId);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Xóa địa chỉ' })
  @ApiResponse({ status: 200, description: 'Xóa thành công' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Không có quyền sở hữu địa chỉ này' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy địa chỉ' })
  async deleteAddress(
    @CurrentUser() user: { id: string },
    @Param('id') addressId: string,
  ) {
    return this.addressService.deleteAddress(user.id, addressId);
  }
}
