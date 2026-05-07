import { TransactionResponseDto } from '@customer/dto/transition/transaction.response.dto';
import { TransactionRepository } from '@customer/repositories/transaction.repository';
import { toTransactionResponse } from '@customer/utils';
import { Injectable } from '@nestjs/common';

@Injectable()
export class TransactionQueryService {
  constructor(private readonly transactionRepository: TransactionRepository) {}

  async getTransactions(
    page: number = 1,
    limit: number = 10,
  ): Promise<TransactionResponseDto[]> {
    const safePage = Math.max(page, 1);
    const safeLimit = Math.max(limit, 1);
    const skip = (safePage - 1) * safeLimit;
    const transactions = await this.transactionRepository.find(
      {},
      {
        skip,
        limit: safeLimit,
      },
    );
    return transactions.map(toTransactionResponse);
  }
}
