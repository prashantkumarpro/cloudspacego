import { apiClient } from "@/lib/api/client";

export interface StorageQuotaResponse {
  used: number;
  limit: number;
  remaining: number;
  percentage: number;
  plan: string;
}

export const getStorageQuota = async (): Promise<StorageQuotaResponse> => {
  const response = await apiClient.get<StorageQuotaResponse>("/user/storage");
  return response.data;
};
