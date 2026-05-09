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
export type DocumentStatus = 'missing' | 'uploaded' | 'expiring_soon' | 'expired';
export type DocumentType =
  | 'business_license'
  | 'health_permit'
  | 'fire_inspection'
  | 'commissary_agreement'
  | 'insurance'
  | 'driver_license'
  | 'vehicle_registration'
  | 'sales_tax_license'
  | 'other';
export type InspectionStatus = 'scheduled' | 'passed' | 'failed' | 'cancelled' | 'needs_reschedule';
export type InspectionType = 'health' | 'fire' | 'city' | 'county' | 'other';

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

export type DocumentRow = {
  id: string;
  business_id: string;
  truck_id: string | null;
  permit_id: string | null;
  document_type: DocumentType;
  name: string;
  file_path: string | null;
  permit_number: string | null;
  issued_date: string | null;
  expiration_date: string | null;
  status: DocumentStatus;
  extracted_text: string | null;
  extracted_confidence: number | null;
  auto_detected: boolean;
  notes: string | null;
  created_at: string;
  updated_at: string;
  trucks: Pick<TruckRow, 'id' | 'name'> | null;
  truck_permits: Pick<TruckPermitRow, 'id'> & {
    permit_requirements: (Pick<PermitRequirementRow, 'id' | 'name'> & {
      jurisdictions: Pick<JurisdictionRow, 'id' | 'name'> | null;
    }) | null;
  } | null;
};

export type InspectionRow = {
  id: string;
  truck_id: string;
  jurisdiction_id: string | null;
  inspection_type: InspectionType;
  scheduled_date: string | null;
  completed_date: string | null;
  status: InspectionStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
  jurisdictions: JurisdictionRow | null;
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

function normalizeDocumentRows(rows: any[]): DocumentRow[] {
  return rows.map((row) => {
    const truck = unwrapRelation(row.trucks) as { id: string; name: string } | null;
    const permit = unwrapRelation(row.truck_permits) as any;
    const requirement = permit ? (unwrapRelation(permit.permit_requirements) as any) : null;
    return {
      id: row.id,
      business_id: row.business_id,
      truck_id: row.truck_id ?? null,
      permit_id: row.permit_id ?? null,
      document_type: row.document_type as DocumentType,
      name: row.name,
      file_path: row.file_path ?? null,
      permit_number: row.permit_number ?? null,
      issued_date: row.issued_date ?? null,
      expiration_date: row.expiration_date ?? null,
      status: row.status as DocumentStatus,
      extracted_text: row.extracted_text ?? null,
      extracted_confidence:
        typeof row.extracted_confidence === 'number' ? row.extracted_confidence : row.extracted_confidence ? Number(row.extracted_confidence) : null,
      auto_detected: Boolean(row.auto_detected),
      notes: row.notes ?? null,
      created_at: row.created_at,
      updated_at: row.updated_at,
      trucks: truck ? { id: truck.id, name: truck.name } : null,
      truck_permits: permit
        ? {
            id: permit.id,
            permit_requirements: requirement
              ? {
                  id: requirement.id,
                  name: requirement.name,
                  jurisdictions: requirement.jurisdictions
                    ? {
                        id: requirement.jurisdictions.id,
                        name: requirement.jurisdictions.name,
                      }
                    : null,
                }
              : null,
          }
        : null,
    };
  });
}

function normalizeInspectionRows(rows: any[]): InspectionRow[] {
  return rows.map((row) => ({
    id: row.id,
    truck_id: row.truck_id,
    jurisdiction_id: row.jurisdiction_id ?? null,
    inspection_type: row.inspection_type as InspectionType,
    scheduled_date: row.scheduled_date ?? null,
    completed_date: row.completed_date ?? null,
    status: row.status as InspectionStatus,
    notes: row.notes ?? null,
    created_at: row.created_at,
    updated_at: row.updated_at,
    jurisdictions: unwrapRelation(row.jurisdictions) as JurisdictionRow | null,
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

export type CreateDocumentPayload = {
  business_id: string;
  truck_id: string | null;
  permit_id: string | null;
  document_type: DocumentType;
  name: string;
  permit_number?: string | null;
  issued_date?: string | null;
  expiration_date: string | null;
  status: DocumentStatus;
  extracted_text?: string | null;
  extracted_confidence?: number | null;
  auto_detected?: boolean;
  notes: string | null;
};

export type UpdateDocumentPayload = Partial<
  Pick<
    DocumentRow,
    | 'truck_id'
    | 'permit_id'
    | 'document_type'
    | 'name'
    | 'file_path'
    | 'permit_number'
    | 'issued_date'
    | 'expiration_date'
    | 'status'
    | 'extracted_text'
    | 'extracted_confidence'
    | 'auto_detected'
    | 'notes'
  >
>;

function documentSelectQuery() {
  return `
    id,
    business_id,
    truck_id,
    permit_id,
    document_type,
    name,
    file_path,
    permit_number,
    issued_date,
    expiration_date,
    status,
    extracted_text,
    extracted_confidence,
    auto_detected,
    notes,
    created_at,
    updated_at,
    trucks (
      id,
      name
    ),
    truck_permits (
      id,
      permit_requirements (
        id,
        name,
        jurisdictions (
          id,
          name
        )
      )
    )
  `;
}

export async function getDocumentsForBusiness(
  businessId: string,
): Promise<{ data: DocumentRow[]; error: Error | null }> {
  const { data, error } = await supabase
    .from('documents')
    .select(documentSelectQuery())
    .eq('business_id', businessId)
    .order('created_at', { ascending: false });

  if (error) {
    return { data: [], error: new Error(error.message) };
  }
  return { data: normalizeDocumentRows((data ?? []) as any[]), error: null };
}

export async function getDocumentsForTruck(
  truckId: string,
): Promise<{ data: DocumentRow[]; error: Error | null }> {
  const { data, error } = await supabase
    .from('documents')
    .select(documentSelectQuery())
    .eq('truck_id', truckId)
    .order('created_at', { ascending: false });

  if (error) {
    return { data: [], error: new Error(error.message) };
  }
  return { data: normalizeDocumentRows((data ?? []) as any[]), error: null };
}

export async function createDocument(
  payload: CreateDocumentPayload,
): Promise<{ data: DocumentRow | null; error: Error | null }> {
  const { data, error } = await supabase.from('documents').insert(payload).select(documentSelectQuery()).maybeSingle();

  if (error) {
    return { data: null, error: new Error(error.message) };
  }
  if (!data) return { data: null, error: null };
  return { data: normalizeDocumentRows([data as any])[0] ?? null, error: null };
}

export async function updateDocument(
  documentId: string,
  updates: UpdateDocumentPayload,
): Promise<{ data: DocumentRow | null; error: Error | null }> {
  const { data, error } = await supabase
    .from('documents')
    .update(updates)
    .eq('id', documentId)
    .select(documentSelectQuery())
    .maybeSingle();

  if (error) {
    return { data: null, error: new Error(error.message) };
  }
  if (!data) return { data: null, error: null };
  return { data: normalizeDocumentRows([data as any])[0] ?? null, error: null };
}

export async function deleteDocument(documentId: string): Promise<{ error: Error | null }> {
  const { error } = await supabase.from('documents').delete().eq('id', documentId);
  if (error) return { error: new Error(error.message) };
  return { error: null };
}

export async function getInspectionsForTruck(
  truckId: string,
): Promise<{ data: InspectionRow[]; error: Error | null }> {
  const { data, error } = await supabase
    .from('inspections')
    .select(
      `
      id,
      truck_id,
      jurisdiction_id,
      inspection_type,
      scheduled_date,
      completed_date,
      status,
      notes,
      created_at,
      updated_at,
      jurisdictions (
        id,
        name,
        type,
        state
      )
      `,
    )
    .eq('truck_id', truckId)
    .order('scheduled_date', { ascending: true });

  if (error) {
    return { data: [], error: new Error(error.message) };
  }
  return { data: normalizeInspectionRows((data ?? []) as any[]), error: null };
}
