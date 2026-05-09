import type { User } from '@supabase/supabase-js';
import { supabase } from './supabase';

export type ProfileRow = {
  id: string;
  email: string | null;
  full_name: string | null;
  created_at: string;
  updated_at: string;
};

export type BusinessRow = {
  id: string;
  owner_id: string;
  name: string;
  owner_name: string | null;
  phone: string | null;
  email: string | null;
  city: string | null;
  county: string | null;
  created_at: string;
  updated_at: string;
};

export type TruckRow = {
  id: string;
  business_id: string;
  name: string;
  vin: string | null;
  license_plate: string | null;
  make: string | null;
  model: string | null;
  year: number | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type TruckPermitStatus = 'missing' | 'pending' | 'current' | 'expiring_soon' | 'expired';

export type JurisdictionRow = {
  id: string;
  name: string;
  type: 'city' | 'county' | 'state';
  state: string;
};

export type PermitRequirementRow = {
  id: string;
  jurisdiction_id: string;
  name: string;
  description: string | null;
  requirement_type: string;
  renewal_frequency: string | null;
  source_url: string | null;
  notes: string | null;
  is_active: boolean;
  created_at: string;
  jurisdictions: JurisdictionRow | null;
};

export type TruckPermitRow = {
  id: string;
  truck_id: string;
  permit_requirement_id: string | null;
  status: TruckPermitStatus;
  issued_date: string | null;
  expiration_date: string | null;
  permit_number: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  permit_requirements: PermitRequirementRow | null;
};

type MaybeRelation<T> = T | T[] | null;

function unwrapRelation<T>(value: MaybeRelation<T>): T | null {
  if (Array.isArray(value)) {
    return value[0] ?? null;
  }
  return value ?? null;
}

function normalizePermitRequirement(raw: any): PermitRequirementRow | null {
  const requirement = unwrapRelation(raw) as Record<string, any> | null;
  if (!requirement) return null;

  return {
    id: requirement.id,
    jurisdiction_id: requirement.jurisdiction_id,
    name: requirement.name,
    description: requirement.description ?? null,
    requirement_type: requirement.requirement_type ?? 'other',
    renewal_frequency: requirement.renewal_frequency ?? null,
    source_url: requirement.source_url ?? null,
    notes: requirement.notes ?? null,
    is_active: Boolean(requirement.is_active),
    created_at: requirement.created_at,
    jurisdictions: unwrapRelation(requirement.jurisdictions) as JurisdictionRow | null,
  };
}

function normalizeTruckPermitRows(rows: any[]): TruckPermitRow[] {
  return rows.map((row) => ({
    id: row.id,
    truck_id: row.truck_id,
    permit_requirement_id: row.permit_requirement_id ?? null,
    status: row.status as TruckPermitStatus,
    issued_date: row.issued_date ?? null,
    expiration_date: row.expiration_date ?? null,
    permit_number: row.permit_number ?? null,
    notes: row.notes ?? null,
    created_at: row.created_at,
    updated_at: row.updated_at,
    permit_requirements: normalizePermitRequirement(row.permit_requirements),
  }));
}

/** Optional text fields normalized to DB null instead of ''. */
export function textOrNull(value: string | undefined): string | null {
  const t = value?.trim();
  return t?.length ? t : null;
}

export async function getMyBusiness(userId: string): Promise<BusinessRow | null> {
  const { data, error } = await supabase
    .from('businesses')
    .select('*')
    .eq('owner_id', userId)
    .maybeSingle();

  if (error) {
    console.warn('getMyBusiness error:', error.message);
    return null;
  }
  return (data ?? null) as BusinessRow | null;
}

export type CreateBusinessPayload = {
  owner_id: string;
  name: string;
  owner_name: string;
  phone: string;
  email: string;
  city: string;
  county: string;
};

export async function createBusiness(payload: CreateBusinessPayload): Promise<{ data: BusinessRow | null; error: Error | null }> {
  const { data, error } = await supabase.from('businesses').insert(payload).select('*').maybeSingle();

  if (error) {
    return { data: null, error: new Error(error.message) };
  }
  return { data: (data ?? null) as BusinessRow | null, error: null };
}

export type CreateTruckPayload = {
  business_id: string;
  name: string;
  license_plate: string | null;
  vin: string | null;
  make: string | null;
  model: string | null;
  year: number | null;
  is_active: boolean;
};

export async function createTruck(payload: CreateTruckPayload): Promise<{ data: TruckRow | null; error: Error | null }> {
  const { data, error } = await supabase.from('trucks').insert(payload).select('*').maybeSingle();

  if (error) {
    return { data: null, error: new Error(error.message) };
  }
  return { data: (data ?? null) as TruckRow | null, error: null };
}

export async function getMyProfile(userId: string): Promise<{ data: ProfileRow | null; error: Error | null }> {
  const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle();

  if (error) {
    return { data: null, error: new Error(error.message) };
  }
  return { data: (data ?? null) as ProfileRow | null, error: null };
}

export type ProfileRowUpsert = {
  id: string;
  email: string | null;
  full_name: string | null;
};

export async function upsertProfileFromUser(payload: ProfileRowUpsert): Promise<{ error: Error | null }> {
  const { error } = await supabase.from('profiles').upsert(payload, { onConflict: 'id' });
  if (error) {
    return { error: new Error(error.message) };
  }
  return { error: null };
}

/** Ensures a profiles row exists (needed for FK to businesses.owner_id). */
export async function ensureProfileForAuthUser(user: User): Promise<{ error: Error | null }> {
  const { data: existing, error: readError } = await getMyProfile(user.id);
  if (readError) return { error: readError };
  if (existing) return { error: null };

  const metaName = user.user_metadata?.full_name;
  const fullName = typeof metaName === 'string' && metaName.trim().length > 0 ? metaName.trim() : null;

  return upsertProfileFromUser({
    id: user.id,
    email: user.email ?? null,
    full_name: fullName,
  });
}

export async function getMyTrucks(businessId: string): Promise<{ data: TruckRow[]; error: Error | null }> {
  const { data, error } = await supabase.from('trucks').select('*').eq('business_id', businessId).order('created_at', { ascending: true });

  if (error) {
    return { data: [], error: new Error(error.message) };
  }
  return { data: (data ?? []) as TruckRow[], error: null };
}

export async function getActivePermitRequirements(): Promise<{ data: PermitRequirementRow[]; error: Error | null }> {
  const { data, error } = await supabase
    .from('permit_requirements')
    .select(
      `
      id,
      jurisdiction_id,
      name,
      description,
      requirement_type,
      renewal_frequency,
      source_url,
      notes,
      is_active,
      created_at,
      jurisdictions (
        id,
        name,
        type,
        state
      )
      `,
    )
    .eq('is_active', true)
    .order('created_at', { ascending: true });

  if (error) {
    return { data: [], error: new Error(error.message) };
  }
  const mapped = (data ?? []).map((row: any) => ({
    id: row.id,
    jurisdiction_id: row.jurisdiction_id,
    name: row.name,
    description: row.description ?? null,
    requirement_type: row.requirement_type ?? 'other',
    renewal_frequency: row.renewal_frequency ?? null,
    source_url: row.source_url ?? null,
    notes: row.notes ?? null,
    is_active: Boolean(row.is_active),
    created_at: row.created_at,
    jurisdictions: unwrapRelation(row.jurisdictions) as JurisdictionRow | null,
  })) as PermitRequirementRow[];
  return { data: mapped, error: null };
}

export async function getTruckPermits(truckId: string): Promise<{ data: TruckPermitRow[]; error: Error | null }> {
  const { data, error } = await supabase
    .from('truck_permits')
    .select(
      `
      id,
      truck_id,
      permit_requirement_id,
      status,
      issued_date,
      expiration_date,
      permit_number,
      notes,
      created_at,
      updated_at,
      permit_requirements (
        id,
        jurisdiction_id,
        name,
        description,
        requirement_type,
        renewal_frequency,
        source_url,
        notes,
        is_active,
        created_at,
        jurisdictions (
          id,
          name,
          type,
          state
        )
      )
      `,
    )
    .eq('truck_id', truckId)
    .order('created_at', { ascending: true });

  if (error) {
    return { data: [], error: new Error(error.message) };
  }
  return { data: normalizeTruckPermitRows((data ?? []) as any[]), error: null };
}

export async function getTruckPermitById(permitId: string): Promise<{ data: TruckPermitRow | null; error: Error | null }> {
  const { data, error } = await supabase
    .from('truck_permits')
    .select(
      `
      id,
      truck_id,
      permit_requirement_id,
      status,
      issued_date,
      expiration_date,
      permit_number,
      notes,
      created_at,
      updated_at,
      permit_requirements (
        id,
        jurisdiction_id,
        name,
        description,
        requirement_type,
        renewal_frequency,
        source_url,
        notes,
        is_active,
        created_at,
        jurisdictions (
          id,
          name,
          type,
          state
        )
      )
      `,
    )
    .eq('id', permitId)
    .maybeSingle();

  if (error) {
    return { data: null, error: new Error(error.message) };
  }
  if (!data) return { data: null, error: null };
  return { data: normalizeTruckPermitRows([data as any])[0] ?? null, error: null };
}

export async function createMissingTruckPermitsForTruck(
  truckId: string,
): Promise<{ insertedCount: number; error: Error | null }> {
  const [requirementsRes, permitsRes] = await Promise.all([
    getActivePermitRequirements(),
    getTruckPermits(truckId),
  ]);

  if (requirementsRes.error) {
    return { insertedCount: 0, error: requirementsRes.error };
  }
  if (permitsRes.error) {
    return { insertedCount: 0, error: permitsRes.error };
  }

  const existingRequirementIds = new Set(
    permitsRes.data
      .map((permit) => permit.permit_requirement_id)
      .filter((id): id is string => Boolean(id)),
  );

  const missingRequirementIds = requirementsRes.data
    .map((requirement) => requirement.id)
    .filter((id) => !existingRequirementIds.has(id));

  if (!missingRequirementIds.length) {
    return { insertedCount: 0, error: null };
  }

  const rows = missingRequirementIds.map((permitRequirementId) => ({
    truck_id: truckId,
    permit_requirement_id: permitRequirementId,
    status: 'missing' as const,
  }));

  const { error } = await supabase.from('truck_permits').insert(rows);
  if (error) {
    return { insertedCount: 0, error: new Error(error.message) };
  }

  return { insertedCount: rows.length, error: null };
}

export type UpdateTruckPermitPayload = {
  status: TruckPermitStatus;
  issued_date: string | null;
  expiration_date: string | null;
  permit_number: string | null;
  notes: string | null;
};

export async function updateTruckPermit(
  permitId: string,
  payload: UpdateTruckPermitPayload,
): Promise<{ data: TruckPermitRow | null; error: Error | null }> {
  const { data, error } = await supabase
    .from('truck_permits')
    .update(payload)
    .eq('id', permitId)
    .select(
      `
      id,
      truck_id,
      permit_requirement_id,
      status,
      issued_date,
      expiration_date,
      permit_number,
      notes,
      created_at,
      updated_at,
      permit_requirements (
        id,
        jurisdiction_id,
        name,
        description,
        requirement_type,
        renewal_frequency,
        source_url,
        notes,
        is_active,
        created_at,
        jurisdictions (
          id,
          name,
          type,
          state
        )
      )
      `,
    )
    .maybeSingle();

  if (error) {
    return { data: null, error: new Error(error.message) };
  }
  if (!data) return { data: null, error: null };
  return { data: normalizeTruckPermitRows([data as any])[0] ?? null, error: null };
}
