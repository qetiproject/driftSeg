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
import {
  CreateCustomerDto,
  CustomerResponseDto,
  UpdateCustomerDto,
} from '../dto';
import { CustomerService } from '../services/customer.service';

@Controller('customers')
@ApiTags('customers')
export class CustomerController {
  constructor(private readonly customerService: CustomerService) {}

  @Post()
  @ApiBody({ type: CreateCustomerDto })
  @ApiCreatedResponse({ type: CustomerResponseDto })
  create(
    @Body() createCustomerDto: CreateCustomerDto,
  ): Promise<CustomerResponseDto> {
    return this.customerService.createCustomer(createCustomerDto);
  }

  @Get()
  @ApiOkResponse({ type: CustomerResponseDto, isArray: true })
  findAll(): Promise<CustomerResponseDto[]> {
    return this.customerService.getCustomers();
  }

  @Get(':id')
  @ApiOkResponse({ type: CustomerResponseDto })
  findOne(@Param('id') id: string) {
    return this.customerService.getCustomerById(id);
  }

  @Patch(':id')
  @ApiBody({ type: UpdateCustomerDto })
  @ApiOkResponse({ type: CustomerResponseDto })
  update(
    @Param('id') id: string,
    @Body() updateCustomerDto: UpdateCustomerDto,
  ) {
    return this.customerService.updateCustomer(id, updateCustomerDto);
  }

  @Delete(':id')
  @ApiOkResponse({ type: CustomerResponseDto })
  remove(@Param('id') id: string) {
    return this.customerService.removeCustomer(id);
  }
}
