import { CreateTransactionDto, TransactionResponseDto } from '@customer/dto';
import { TransactionCommandFacade } from '@customer/services/facades/transaction-command.facade';
import { Injectable } from '@nestjs/common';

@Injectable()
export class TransactionCommandService {
  constructor(
    private readonly transactionCommandFacade: TransactionCommandFacade,
  ) {}

  async createTransaction(
    dto: CreateTransactionDto,
  ): Promise<TransactionResponseDto> {
    return this.transactionCommandFacade.createTransaction(dto);
  }
}
