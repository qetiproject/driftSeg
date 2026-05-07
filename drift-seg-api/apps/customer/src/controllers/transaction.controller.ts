import { CreateTransactionDto } from '@customer/dto/transition/create-transaction.dto';
import { TransactionResponseDto } from '@customer/dto/transition/transaction.response.dto';
import { TransactionCommandService } from '@customer/services/transaction/transaction-command.service';
import { TransactionQueryService } from '@customer/services/transaction/transaction-query.service';
import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import {
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';

@Controller('transaction')
@ApiTags('transaction')
export class TransactionController {
  constructor(
    private readonly transactionCommandService: TransactionCommandService,
    private readonly transactionQueryService: TransactionQueryService,
  ) {}

  @Get()
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    example: 1,
    description: 'Page number',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    example: 10,
    description: 'Limit items',
  })
  @ApiOkResponse({ type: TransactionResponseDto, isArray: true })
  getTransactions(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ): Promise<TransactionResponseDto[]> {
    return this.transactionQueryService.getTransactions(page, limit);
  }

  @Post('create')
  @ApiBody({ type: CreateTransactionDto })
  @ApiCreatedResponse({ type: TransactionResponseDto })
  createTransaction(
    @Body() createTransactionDto: CreateTransactionDto,
  ): Promise<TransactionResponseDto> {
    return this.transactionCommandService.createTransaction(
      createTransactionDto,
    );
  }
}
