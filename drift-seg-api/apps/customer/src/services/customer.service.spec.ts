// /// <reference types="jest" />
// import { CustomerStatusEnum } from '@app/common/enum/status.enum';
// import {
//     NotFoundException,
//     UnprocessableEntityException,
// } from '@nestjs/common';
// import { Test, TestingModule } from '@nestjs/testing';
// import { CUSTOMER_ERROR_MESSAGES } from '../constants/error-messages';
// import { CreateCustomerDto } from '../dto';
// import { UpdateCustomerDto } from '../dto/customer/update-customer.dto';
// import { CustomerRepository } from '../repositories/customer.repository';
// import { TransactionRepository } from '../repositories/transaction.repository';
// import { CustomerService } from './customer.service';

// describe('CustomerService', () => {
//   let service: CustomerService;

//   const repositoryMock = {
//     create: jest.fn(),
//     findOne: jest.fn(),
//     find: jest.fn(),
//     findOneAndUpdate: jest.fn(),
//     findOneAndDelete: jest.fn(),
//   };
//   const transactionRepositoryMock = {
//     deleteManyByCustomerId: jest.fn(),
//   };

//   beforeEach(async () => {
//     jest.clearAllMocks();

//     const module: TestingModule = await Test.createTestingModule({
//       providers: [
//         CustomerService,
//         {
//           provide: CustomerRepository,
//           useValue: repositoryMock,
//         },
//         {
//           provide: TransactionRepository,
//           useValue: transactionRepositoryMock,
//         },
//       ],
//     }).compile();

//     service = module.get<CustomerService>(CustomerService);
//   });

//   describe('createCustomer', () => {
//     it('creates customer with default status and totalSpent', async () => {
//       const payload: CreateCustomerDto = {
//         firstName: 'John',
//         lastName: 'Doe',
//         email: 'john@doe.com',
//       };

//       repositoryMock.findOne.mockRejectedValueOnce(new Error('not found'));
//       repositoryMock.create.mockResolvedValueOnce({
//         _id: 'c-1',
//         ...payload,
//         totalSpent: 0,
//         status: CustomerStatusEnum.INACTIVE,
//       });

//       const result = await service.createCustomer(payload);

//       expect(repositoryMock.create).toHaveBeenCalledWith({
//         ...payload,
//         totalSpent: 0,
//         status: CustomerStatusEnum.INACTIVE,
//       });
//       expect(result).toEqual({
//         _id: 'c-1',
//         firstName: 'John',
//         lastName: 'Doe',
//         email: 'john@doe.com',
//         totalSpent: 0,
//         status: CustomerStatusEnum.INACTIVE,
//       });
//     });

//     it('throws when email already exists', async () => {
//       const payload: CreateCustomerDto = {
//         firstName: 'John',
//         lastName: 'Doe',
//         email: 'john@doe.com',
//       };

//       repositoryMock.findOne.mockResolvedValueOnce({
//         _id: 'existing-id',
//         ...payload,
//       });

//       const resultPromise = service.createCustomer(payload);

//       await expect(resultPromise).rejects.toBeInstanceOf(
//         UnprocessableEntityException,
//       );
//       await expect(resultPromise).rejects.toThrow(
//         CUSTOMER_ERROR_MESSAGES.EMAIL_ALREADY_EXISTS,
//       );
//       expect(repositoryMock.create).not.toHaveBeenCalled();
//     });
//   });

//   describe('getCustomers', () => {
//     it('maps repository entities to response DTO', async () => {
//       repositoryMock.find.mockResolvedValueOnce([
//         {
//           _id: 'c-1',
//           firstName: 'Jane',
//           lastName: 'Roe',
//           email: 'jane@roe.com',
//           totalSpent: 99,
//           status: CustomerStatusEnum.ACTIVE,
//         },
//       ]);

//       const result = await service.getCustomers();

//       expect(result).toEqual([
//         {
//           _id: 'c-1',
//           firstName: 'Jane',
//           lastName: 'Roe',
//           email: 'jane@roe.com',
//           totalSpent: 99,
//           status: CustomerStatusEnum.ACTIVE,
//         },
//       ]);
//     });

//     it('applies fallback values when totalSpent/status are missing', async () => {
//       repositoryMock.find.mockResolvedValueOnce([
//         {
//           _id: 'c-2',
//           firstName: 'Fallback',
//           lastName: 'User',
//           email: 'fallback@user.com',
//         },
//       ]);

//       const result = await service.getCustomers();

//       expect(result).toEqual([
//         {
//           _id: 'c-2',
//           firstName: 'Fallback',
//           lastName: 'User',
//           email: 'fallback@user.com',
//           totalSpent: 0,
//           status: CustomerStatusEnum.INACTIVE,
//         },
//       ]);
//     });
//   });

//   describe('getCustomerById', () => {
//     it('delegates to repository.findOne with id filter', async () => {
//       const customer = { _id: 'c-10', email: 'id@test.com' };
//       repositoryMock.findOne.mockResolvedValueOnce(customer);

//       const result = await service.getCustomerById('c-10');

//       expect(repositoryMock.findOne).toHaveBeenCalledWith({ _id: 'c-10' });
//       expect(result).toBe(customer);
//     });
//   });

//   describe('updateCustomer', () => {
//     it('delegates to repository.findOneAndUpdate with $set payload', async () => {
//       const updatePayload: UpdateCustomerDto = {
//         firstName: 'Updated',
//       };
//       const updated = {
//         _id: 'c-20',
//         firstName: 'Updated',
//         lastName: 'Doe',
//         email: 'update@test.com',
//       };
//       repositoryMock.findOneAndUpdate.mockResolvedValueOnce(updated);

//       const result = await service.updateCustomer('c-20', updatePayload);

//       expect(repositoryMock.findOneAndUpdate).toHaveBeenCalledWith(
//         { _id: 'c-20' },
//         { $set: updatePayload },
//       );
//       expect(result).toBe(updated);
//     });
//   });

//   describe('removeCustomer', () => {
//     it('returns deleted customer when found', async () => {
//       const deletedCustomer = {
//         _id: 'c-30',
//         firstName: 'Delete',
//         lastName: 'Me',
//         email: 'delete@me.com',
//       };
//       repositoryMock.findOneAndDelete.mockResolvedValueOnce(deletedCustomer);

//       const result = await service.removeCustomer('c-30');

//       expect(repositoryMock.findOneAndDelete).toHaveBeenCalledWith({
//         _id: 'c-30',
//       });
//       expect(
//         transactionRepositoryMock.deleteManyByCustomerId,
//       ).toHaveBeenCalledWith('c-30');
//       expect(result).toBe(deletedCustomer);
//     });

//     it('throws NotFoundException when customer does not exist', async () => {
//       repositoryMock.findOneAndDelete.mockResolvedValueOnce(null);

//       const resultPromise = service.removeCustomer('missing-id');

//       await expect(resultPromise).rejects.toBeInstanceOf(NotFoundException);
//       await expect(resultPromise).rejects.toThrow(
//         CUSTOMER_ERROR_MESSAGES.CUSTOMER_NOT_FOUND,
//       );
//       expect(
//         transactionRepositoryMock.deleteManyByCustomerId,
//       ).not.toHaveBeenCalled();
//     });
//   });
// });
