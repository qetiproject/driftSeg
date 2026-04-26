import { CustomerStatusEnum } from '@app/common/enum/status.enum';
import { NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { CUSTOMER_ERROR_MESSAGES } from '../constants/error-messages';
import { CreateCustomerDto } from '../dto';
import { CustomerRepository } from '../repositories/customer.repository';
import { CustomerService } from './customer.service';

describe('CustomerService', () => {
  let service: CustomerService;

  const repositoryMock = {
    create: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
    findOneAndUpdate: jest.fn(),
    findOneAndDelete: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CustomerService,
        {
          provide: CustomerRepository,
          useValue: repositoryMock,
        },
      ],
    }).compile();

    service = module.get<CustomerService>(CustomerService);
  });

  describe('createCustomer', () => {
    it('creates customer with default status and totalSpent', async () => {
      const payload: CreateCustomerDto = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@doe.com',
      };

      repositoryMock.findOne.mockRejectedValueOnce(new Error('not found'));
      repositoryMock.create.mockResolvedValueOnce({
        _id: 'c-1',
        ...payload,
        totalSpent: 0,
        status: CustomerStatusEnum.INACTIVE,
      });

      const result = await service.createCustomer(payload);

      expect(repositoryMock.create).toHaveBeenCalledWith({
        ...payload,
        totalSpent: 0,
        status: CustomerStatusEnum.INACTIVE,
      });
      expect(result).toEqual({
        _id: 'c-1',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@doe.com',
        totalSpent: 0,
        status: CustomerStatusEnum.INACTIVE,
      });
    });

    it('throws when email already exists', async () => {
      const payload: CreateCustomerDto = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@doe.com',
      };

      repositoryMock.findOne.mockResolvedValueOnce({
        _id: 'existing-id',
        ...payload,
      });

      const resultPromise = service.createCustomer(payload);

      await expect(resultPromise).rejects.toBeInstanceOf(
        UnprocessableEntityException,
      );
      await expect(resultPromise).rejects.toThrow(
        CUSTOMER_ERROR_MESSAGES.EMAIL_ALREADY_EXISTS,
      );
      expect(repositoryMock.create).not.toHaveBeenCalled();
    });
  });

  describe('getCustomers', () => {
    it('maps repository entities to response DTO', async () => {
      repositoryMock.find.mockResolvedValueOnce([
        {
          _id: 'c-1',
          firstName: 'Jane',
          lastName: 'Roe',
          email: 'jane@roe.com',
          totalSpent: 99,
          status: CustomerStatusEnum.ACTIVE,
        },
      ]);

      const result = await service.getCustomers();

      expect(result).toEqual([
        {
          _id: 'c-1',
          firstName: 'Jane',
          lastName: 'Roe',
          email: 'jane@roe.com',
          totalSpent: 99,
          status: CustomerStatusEnum.ACTIVE,
        },
      ]);
    });
  });

  describe('removeCustomer', () => {
    it('throws NotFoundException when customer does not exist', async () => {
      repositoryMock.findOneAndDelete.mockResolvedValueOnce(null);

      const resultPromise = service.removeCustomer('missing-id');

      await expect(resultPromise).rejects.toBeInstanceOf(
        NotFoundException,
      );
      await expect(resultPromise).rejects.toThrow(
        CUSTOMER_ERROR_MESSAGES.CUSTOMER_NOT_FOUND,
      );
    });
  });
});
