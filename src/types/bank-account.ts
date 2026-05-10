/**
 * Business bank accounts — CRUD at `/business/bank-accounts`.
 * Field names are camelCase for JSON bodies.
 */

export interface BusinessBankAccount {
  id: number;
  businessId?: number;
  label?: string | null;
  accountHolderName: string;
  /** Full digits as stored; UI may mask for display */
  bankAccountNumber: string;
  bankName: string;
  branchName: string;
  ifscCode: string;
  bankCity: string;
  bankState: string;
  isDefault?: boolean;
  displayOrder?: number | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface BusinessBankAccountsListResponse {
  bankAccounts: BusinessBankAccount[];
  count: number;
}

export interface CreateBusinessBankAccountRequest {
  accountHolderName: string;
  bankAccountNumber: string;
  bankName: string;
  branchName: string;
  ifscCode: string;
  bankCity: string;
  bankState: string;
  label?: string | null;
  isDefault?: boolean;
  displayOrder?: number | null;
}

export type UpdateBusinessBankAccountRequest = Partial<CreateBusinessBankAccountRequest>;
