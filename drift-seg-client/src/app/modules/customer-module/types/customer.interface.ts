export interface CustomerResponse {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  totalSpent: number;
  status: CustomerStatus;
}

export enum CustomerStatus {
  Inactive = 'inactive',
  Active = 'active',
}

export interface CustomerDetailsResponse extends CustomerResponse {
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateCustomerRequest extends CustomerResponse {}
