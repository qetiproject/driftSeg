import { PaginatedTransactionsResponseDto } from '@customer/dto';
import { TransactionRepository } from '@customer/repositories/transaction.repository';
import { toTransactionResponse } from '@customer/utils';
import { Injectable } from '@nestjs/common';

@Injectable()
export class TransactionQueryService {
  constructor(private readonly transactionRepository: TransactionRepository) {}

  async getTransactions(
    page: number = 1,
    limit: number = 10,
  ): Promise<PaginatedTransactionsResponseDto> {
    const safePage = Math.max(page, 1);
    const safeLimit = Math.max(limit, 1);
    const skip = (safePage - 1) * safeLimit;
    const filter = {};
    const transactions = await this.transactionRepository.find(filter, {
      skip,
      limit: safeLimit,
    });
    const totalItems = await this.transactionRepository.countDocuments(filter);
    const totalPages = Math.ceil(totalItems / safeLimit);

    return {
      items: transactions.map(toTransactionResponse),
      totalItems,
      totalPages,
      page: safePage,
      limit: safeLimit,
    };
  }
}
