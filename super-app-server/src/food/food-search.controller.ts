import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { FoodSearchService } from './food-search.service';
import { FoodSearchQueryDto, FoodDiscoveryQueryDto } from './dto/food-search.dto';

@ApiTags('Food Search & Discovery')
@Controller('food')
export class FoodSearchController {
  constructor(private readonly searchService: FoodSearchService) {}

  @Get('search')
  @ApiOperation({ summary: 'Tìm kiếm tổng hợp món ăn & nhà hàng (Hỗ trợ bộ lọc và phân trang)' })
  async searchCombined(@Query() query: FoodSearchQueryDto) {
    return this.searchService.searchCombined(query);
  }

  @Get('search/restaurants')
  @ApiOperation({ summary: 'Tìm kiếm danh sách nhà hàng (Lọc trạng thái, rating, voucher, freeship, khoảng cách GPS)' })
  async searchRestaurants(@Query() query: FoodSearchQueryDto) {
    return this.searchService.searchRestaurants(query);
  }

  @Get('search/menu-items')
  @ApiOperation({ summary: 'Tìm kiếm danh sách món ăn (Lọc giá, rating, danh mục, nhà hàng)' })
  async searchMenuItems(@Query() query: FoodSearchQueryDto) {
    return this.searchService.searchMenuItems(query);
  }

  @Get('discovery')
  @ApiOperation({ summary: 'Khám phá trang chủ Food (Nhà hàng nổi bật, Rating cao, Gần bạn, Đang mở cửa, Có khuyến mãi, Món bán chạy)' })
  async getDiscovery(@Query() query: FoodDiscoveryQueryDto) {
    return this.searchService.getDiscovery(query);
  }
}
