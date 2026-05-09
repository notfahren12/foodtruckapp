import { buildDemoComplianceData, DEMO_SEED_TAG } from '../data/demoComplianceData';
import type { BusinessRow, DocumentStatus, TruckRow, TruckPermitRow, TruckPermitStatus } from './db';
import {
  createDocument,
  createMissingTruckPermitsForTruck,
  getDocumentsForBusiness,
  getTruckPermits,
  textOrNull,
  updateDocument,
} from './db';
import { supabase } from './supabase';

const DEFAULT_TRUCK_NOTES = `${DEMO_SEED_TAG} Seeded for UI testing only.`;

function pickPermitStatus(status: TruckPermitStatus): TruckPermitStatus {
  if (status === 'missing' || status === 'pending' || status === 'current' || status === 'expiring_soon' || status === 'expired') {
    return status;
  }
  return 'missing';
}

function pickDocumentStatus(status: DocumentStatus): DocumentStatus {
  if (status === 'missing' || status === 'uploaded' || status === 'expiring_soon' || status === 'expired') {
    return status;
  }
  return 'uploaded';
}

export async function seedDemoComplianceDataForBusiness(
  business: BusinessRow,
  trucks: TruckRow[],
): Promise<{ error: string | null; inserted: { permitsUpdated: number; documentsCreated: number; inspectionsCreated: number } }> {
  const activeTruck = trucks[0];
  if (!activeTruck) {
    return {
      error: 'No truck found. Add a truck first.',
      inserted: { permitsUpdated: 0, documentsCreated: 0, inspectionsCreated: 0 },
    };
  }

  const payload = buildDemoComplianceData(business.name);
  let permitsUpdated = 0;
  let documentsCreated = 0;
  let inspectionsCreated = 0;

  const seededPermits = await createMissingTruckPermitsForTruck(activeTruck.id);
  if (seededPermits.error) {
    return { error: seededPermits.error.message, inserted: { permitsUpdated, documentsCreated, inspectionsCreated } };
  }

  const permitsResult = await getTruckPermits(activeTruck.id);
  if (permitsResult.error) {
    return { error: permitsResult.error.message, inserted: { permitsUpdated, documentsCreated, inspectionsCreated } };
  }

  const permitsByTerm = new Map<string, TruckPermitRow>();
  permitsResult.data.forEach((permit) => {
    const name = permit.permit_requirements?.name?.toLowerCase() ?? '';
    if (!name) return;
    name.split(' ').forEach((token) => {
      if (token.length > 2) permitsByTerm.set(token, permit);
    });
  });

  for (const demoPermit of payload.permits) {
    let matched: TruckPermitRow | undefined;
    for (const term of demoPermit.requirementMatchTerms) {
      matched = permitsByTerm.get(term.toLowerCase());
      if (matched) break;
    }
    if (!matched) continue;

    const updateRes = await updateDocumentCompatiblePermit(matched.id, {
      status: pickPermitStatus(demoPermit.status),
      issued_date: demoPermit.issuedDate,
      expiration_date: demoPermit.expirationDate,
      permit_number: demoPermit.permitNumber,
      notes: textOrNull(`${demoPermit.notes} ${DEFAULT_TRUCK_NOTES}`),
    });
    if (!updateRes) permitsUpdated += 1;
  }

  const docsResult = await getDocumentsForBusiness(business.id);
  if (docsResult.error) {
    return { error: docsResult.error.message, inserted: { permitsUpdated, documentsCreated, inspectionsCreated } };
  }
  const existingDocNames = new Set(
    docsResult.data
      .filter((doc) => doc.notes?.includes(DEMO_SEED_TAG))
      .map((doc) => doc.name.toLowerCase()),
  );

  for (const demoDoc of payload.documents) {
    if (existingDocNames.has(demoDoc.title.toLowerCase())) continue;
    const docRes = await createDocument({
      business_id: business.id,
      truck_id: activeTruck.id,
      permit_id: null,
      document_type: demoDoc.documentType,
      name: demoDoc.title,
      expiration_date: demoDoc.expirationDate,
      status: pickDocumentStatus(demoDoc.status),
      notes: textOrNull(`${demoDoc.notes} Permit #${demoDoc.permitNumber}. Issued ${demoDoc.issuedDate}.`),
    });
    if (!docRes.error) documentsCreated += 1;
  }

  const { data: existingInspections, error: inspectionsReadError } = await supabase
    .from('inspections')
    .select('id, notes')
    .eq('truck_id', activeTruck.id);
  if (inspectionsReadError) {
    return { error: inspectionsReadError.message, inserted: { permitsUpdated, documentsCreated, inspectionsCreated } };
  }
  const hasSeededInspection = (existingInspections ?? []).some((row) => row.notes?.includes(DEMO_SEED_TAG));
  if (!hasSeededInspection) {
    for (const item of payload.inspections) {
      const { error } = await supabase.from('inspections').insert({
        truck_id: activeTruck.id,
        jurisdiction_id: null,
        inspection_type: item.inspectionType,
        status: item.status,
        scheduled_date: item.scheduledDate,
        completed_date: item.completedDate,
        notes: `${item.title} • ${item.jurisdiction}. ${item.notes}`,
      });
      if (!error) inspectionsCreated += 1;
    }
  }

  return {
    error: null,
    inserted: { permitsUpdated, documentsCreated, inspectionsCreated },
  };
}

async function updateDocumentCompatiblePermit(
  permitId: string,
  payload: {
    status: TruckPermitStatus;
    issued_date: string | null;
    expiration_date: string | null;
    permit_number: string | null;
    notes: string | null;
  },
): Promise<Error | null> {
  const { error } = await supabase.from('truck_permits').update(payload).eq('id', permitId);
  return error ? new Error(error.message) : null;
}
