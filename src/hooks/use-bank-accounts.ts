import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/api";
import { invalidateQueryKeys } from "@/lib/query/invalidate";
import { queryKeys } from "@/lib/query/keys";
import type {
  BusinessBankAccount,
  BusinessBankAccountsListResponse,
  CreateBusinessBankAccountRequest,
  UpdateBusinessBankAccountRequest,
} from "@/types/bank-account";

export function useBusinessBankAccounts(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: queryKeys.business.bankAccounts(),
    queryFn: async () => {
      const res = await api.get<BusinessBankAccountsListResponse>("/business/bank-accounts");
      return res.data;
    },
    enabled: options?.enabled ?? true,
    staleTime: 60_000,
  });
}

export function useCreateBusinessBankAccount() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: CreateBusinessBankAccountRequest) => {
      const res = await api.post<BusinessBankAccount>("/business/bank-accounts", body);
      return res.data;
    },
    onSuccess: () => {
      invalidateQueryKeys(qc, [queryKeys.business.bankAccounts(), queryKeys.business.profile()]);
    },
  });
}

export function useUpdateBusinessBankAccount() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (vars: { bankAccountId: number; body: UpdateBusinessBankAccountRequest }) => {
      const res = await api.patch<BusinessBankAccount>(
        `/business/bank-accounts/${vars.bankAccountId}`,
        vars.body,
      );
      return res.data;
    },
    onSuccess: () => {
      invalidateQueryKeys(qc, [queryKeys.business.bankAccounts(), queryKeys.business.profile()]);
    },
  });
}

export function useDeleteBusinessBankAccount() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (bankAccountId: number) => {
      await api.delete(`/business/bank-accounts/${bankAccountId}`);
    },
    onSuccess: () => {
      invalidateQueryKeys(qc, [queryKeys.business.bankAccounts(), queryKeys.business.profile()]);
    },
  });
}
