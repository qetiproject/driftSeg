import { PaginatedResponseDtoFactory } from '@app/common/dto/paginated-response-dto-factory';
import { CustomerResponseDto } from '@customer/dto/customer/customer.response.dto';

export class PaginatedCustomersResponseDto extends PaginatedResponseDtoFactory(
  CustomerResponseDto,
) {}
