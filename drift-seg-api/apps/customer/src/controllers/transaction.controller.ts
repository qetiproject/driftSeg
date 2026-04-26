import { Body, Controller, Get, Post } from '@nestjs/common';
import {
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CreateTransactionDto, TransactionResponseDto } from '../dto';
import { TransactionService } from '../services/transaction.service';

@Controller('transaction')
@ApiTags('transaction')
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @Get('all')
  @ApiOkResponse({ type: TransactionResponseDto, isArray: true })
  getTransactions(): Promise<TransactionResponseDto[]> {
    return this.transactionService.getTransactions();
  }

  @Post('create')
  @ApiBody({ type: CreateTransactionDto })
  @ApiCreatedResponse({ type: TransactionResponseDto })
  createTransaction(
    @Body() createTransactionDto: CreateTransactionDto,
  ): Promise<TransactionResponseDto> {
    return this.transactionService.createTransaction(createTransactionDto);
  }
}
