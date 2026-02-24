import { useState, useEffect, useCallback } from 'react';
import type { Contract, Risk, Task, DashboardStats } from '@/types';
import {
  contractsApi,
  risksApi,
  tasksApi,
  annotationsApi,
  textEditsApi,
  statsApi,
} from '@/services/api';
import type { Annotation, TextEdit } from '@/services/api';

export type { Annotation, TextEdit };

export function useContracts() {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      setContracts(await contractsApi.list());
    } catch (e) {
      console.error('Failed to fetch contracts', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const create = useCallback(async (contract: Omit<Contract, 'id' | 'createdAt' | 'updatedAt'> & { id?: string; createdAt?: string; updatedAt?: string }) => {
    await contractsApi.create(contract as Parameters<typeof contractsApi.create>[0]);
    await refresh();
  }, [refresh]);

  const update = useCallback(async (contract: Contract) => {
    await contractsApi.update(contract.id, contract);
    await refresh();
  }, [refresh]);

  const remove = useCallback(async (id: string) => {
    await contractsApi.delete(id);
    await refresh();
  }, [refresh]);

  return { contracts, loading, refresh, create, update, remove };
}

export function useContract(id: string | null) {
  const [contract, setContract] = useState<Contract | null>(null);

  useEffect(() => {
    if (id) {
      contractsApi.get(id).then(setContract).catch(() => setContract(null));
    } else {
      setContract(null);
    }
  }, [id]);

  return { contract };
}

export function useRisks(contractId?: string) {
  const [risks, setRisks] = useState<Risk[]>([]);

  const refresh = useCallback(async () => {
    try {
      const params = contractId ? { contractId } : {};
      setRisks(await risksApi.list(params));
    } catch (e) {
      console.error('Failed to fetch risks', e);
    }
  }, [contractId]);

  useEffect(() => { refresh(); }, [refresh]);

  const create = useCallback(async (risk: Risk) => {
    await risksApi.create(risk);
    await refresh();
  }, [refresh]);

  const update = useCallback(async (id: string, updates: Partial<Risk>) => {
    await risksApi.update(id, updates);
    await refresh();
  }, [refresh]);

  return { risks, refresh, create, update };
}

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      setTasks(await tasksApi.list());
    } catch (e) {
      console.error('Failed to fetch tasks', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const create = useCallback(async (task: Omit<Task, 'id'>) => {
    await tasksApi.create(task as Parameters<typeof tasksApi.create>[0]);
    await refresh();
  }, [refresh]);

  const update = useCallback(async (id: string, updates: Partial<Task>) => {
    await tasksApi.update(id, updates);
    await refresh();
  }, [refresh]);

  const remove = useCallback(async (id: string) => {
    await tasksApi.delete(id);
    await refresh();
  }, [refresh]);

  return { tasks, loading, refresh, create, update, remove };
}

export function useStats() {
  const [stats, setStats] = useState<DashboardStats>({
    totalContracts: 0,
    pendingTasks: 0,
    highRisks: 0,
    completionRate: 0,
  });

  const refresh = useCallback(async () => {
    try {
      setStats(await statsApi.dashboard());
    } catch (e) {
      console.error('Failed to fetch stats', e);
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  return { stats, refresh };
}

export function useAnnotations(contractId: string) {
  const [annotations, setAnnotations] = useState<Annotation[]>([]);

  const refresh = useCallback(async () => {
    try {
      setAnnotations(await annotationsApi.list(contractId));
    } catch (e) {
      console.error('Failed to fetch annotations', e);
    }
  }, [contractId]);

  useEffect(() => { refresh(); }, [refresh]);

  const create = useCallback(async (annotation: Annotation) => {
    await annotationsApi.create(annotation);
    await refresh();
  }, [refresh]);

  const remove = useCallback(async (id: string) => {
    await annotationsApi.delete(id);
    await refresh();
  }, [refresh]);

  return { annotations, refresh, create, remove };
}

export function useTextEdits(contractId: string) {
  const [edits, setEdits] = useState<TextEdit[]>([]);

  const refresh = useCallback(async () => {
    try {
      setEdits(await textEditsApi.list(contractId));
    } catch (e) {
      console.error('Failed to fetch text edits', e);
    }
  }, [contractId]);

  useEffect(() => { refresh(); }, [refresh]);

  const create = useCallback(async (edit: TextEdit) => {
    await textEditsApi.create(edit);
    await refresh();
  }, [refresh]);

  const remove = useCallback(async (id: string) => {
    await textEditsApi.delete(id);
    await refresh();
  }, [refresh]);

  return { edits, refresh, create, remove };
}
