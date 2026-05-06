import { CustomerDocument } from '@app/common/models';
import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import {
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CreateCustomerDto, CustomerResponseDto } from '../dto';
import { CustomerQueryService } from '../services';
import { CustomerService } from '../services/customer.service';

@Controller('customer')
@ApiTags('customer')
export class CustomerController {
  constructor(
    private readonly customerService: CustomerService,
    private readonly customerQueryService: CustomerQueryService,
  ) {}

  @Post('create')
  @ApiBody({ type: CreateCustomerDto })
  @ApiCreatedResponse({ type: CustomerResponseDto })
  create(
    @Body() createCustomerDto: CreateCustomerDto,
  ): Promise<CustomerResponseDto> {
    return this.customerService.createCustomer(createCustomerDto);
  }

  @Get()
  @ApiOkResponse({ type: CustomerResponseDto, isArray: true })
  getCustomers(): Promise<CustomerResponseDto[]> {
    return this.customerQueryService.getCustomers();
  }

  // @Get(':id')
  // @ApiOkResponse({ type: CustomerResponseDto })
  // findOne(@Param('id') id: string): Promise<CustomerDocument> {
  //   return this.customerService.getCustomerById(id);
  // }

  // @Patch(':id')
  // @ApiBody({ type: UpdateCustomerDto })
  // @ApiOkResponse({ type: CustomerResponseDto })
  // update(
  //   @Param('id') id: string,
  //   @Body() updateCustomerDto: UpdateCustomerDto,
  // ): Promise<CustomerDocument> {
  //   return this.customerService.updateCustomer(id, updateCustomerDto);
  // }

  @Delete(':id')
  @ApiOkResponse({ type: CustomerResponseDto })
  remove(@Param('id') id: string): Promise<CustomerDocument> {
    return this.customerService.removeCustomer(id);
  }
}
