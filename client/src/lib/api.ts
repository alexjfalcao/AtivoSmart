import { apiRequest } from "./queryClient";
import type { Operation, InsertOperation } from "@shared/schema";

export const operationsApi = {
  getAll: (): Promise<Operation[]> =>
    fetch("/api/operations").then(res => res.json()),

  getById: (id: string): Promise<Operation> =>
    fetch(`/api/operations/${id}`).then(res => res.json()),

  create: (data: InsertOperation): Promise<Operation> =>
    apiRequest("POST", "/api/operations", data).then(res => res.json()),

  update: (id: string, data: Partial<InsertOperation>): Promise<Operation> =>
    apiRequest("PUT", `/api/operations/${id}`, data).then(res => res.json()),

  delete: (id: string): Promise<void> =>
    apiRequest("DELETE", `/api/operations/${id}`).then(() => {}),
};
