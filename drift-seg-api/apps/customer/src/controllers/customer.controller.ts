import { CustomerDocument } from '@app/common/models';
import { CreateCustomerDto, CustomerResponseDto } from '@customer/dto';
import { CustomerQueryService } from '@customer/services/customer-query.service';
import { CustomerCommandService } from '@customer/services/customer-command.service';
import { CustomerService } from '@customer/services/customer.service';
import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import {
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';

@Controller('customer')
@ApiTags('customer')
export class CustomerController {
  constructor(
    private readonly customerService: CustomerService,
    private readonly customerQueryService: CustomerQueryService,
    private readonly customerCommandService: CustomerCommandService,
  ) {}

  @Post('create')
  @ApiBody({ type: CreateCustomerDto })
  @ApiCreatedResponse({ type: CustomerResponseDto })
  createCustomer(
    @Body() createCustomerDto: CreateCustomerDto,
  ): Promise<CustomerResponseDto> {
    return this.customerCommandService.createCustomer(createCustomerDto);
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
