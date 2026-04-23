import { Body, Controller, Get, Post } from '@nestjs/common';
import { CreateTransactionDto, TransactionResponseDto } from '../dto';
import { TransactionService } from '../services/transaction.service';

@Controller('transactions')
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @Get()
  getTransactions(): Promise<TransactionResponseDto[]> {
    return this.transactionService.getTransactions();
  }

  @Post()
  createTransaction(
    @Body() createTransactionDto: CreateTransactionDto,
  ): Promise<TransactionResponseDto> {
    return this.transactionService.createTransaction(createTransactionDto);
  }
}
