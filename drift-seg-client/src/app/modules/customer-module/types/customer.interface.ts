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