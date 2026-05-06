import {
  CreateCustomerDto,
  CustomerResponseDto,
  UpdateCustomerDto,
} from '@customer/dto';
import { CustomerCommandService } from '@customer/services/customer-command.service';
import { CustomerQueryService } from '@customer/services/customer-query.service';
import { CustomerService } from '@customer/services/customer.service';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
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

  @Get(':id')
  @ApiOkResponse({ type: CustomerResponseDto })
  getCustomerById(@Param('id') id: string): Promise<CustomerResponseDto> {
    return this.customerQueryService.getCustomerById(id);
  }

  @Patch(':id')
  @ApiBody({ type: UpdateCustomerDto })
  @ApiOkResponse({ type: CustomerResponseDto })
  updateCustomerById(
    @Param('id') id: string,
    @Body() updateCustomerDto: UpdateCustomerDto,
  ): Promise<CustomerResponseDto | null> {
    return this.customerCommandService.updateCustomer(id, updateCustomerDto);
  }

  @Delete(':id')
  @ApiOkResponse({ type: CustomerResponseDto })
  removeCustomer(@Param('id') id: string): Promise<CustomerResponseDto | null> {
    return this.customerService.removeCustomer(id);
  }
}
