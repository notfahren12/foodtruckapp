export type DemoPermitSeed = {
  title: string;
  jurisdiction: string;
  permitNumber: string;
  issuedDate: string;
  expirationDate: string;
  status: 'current' | 'expiring_soon' | 'expired' | 'missing' | 'pending';
  notes: string;
  requirementMatchTerms: string[];
};

export type DemoDocumentSeed = {
  title: string;
  jurisdiction: string;
  permitNumber: string;
  issuedDate: string;
  expirationDate: string;
  status: 'uploaded' | 'expiring_soon' | 'expired' | 'missing';
  documentType:
    | 'business_license'
    | 'health_permit'
    | 'fire_inspection'
    | 'commissary_agreement'
    | 'insurance'
    | 'vehicle_registration'
    | 'sales_tax_license';
  notes: string;
};

export type DemoInspectionSeed = {
  title: string;
  jurisdiction: string;
  inspectionType: 'health' | 'fire' | 'city' | 'county' | 'other';
  status: 'scheduled' | 'passed' | 'failed' | 'needs_reschedule';
  scheduledDate: string | null;
  completedDate: string | null;
  notes: string;
};

export const DEMO_SEED_TAG = '[DEMO_COMPLIANCE_V1]';

export function buildDemoComplianceData(businessName: string): {
  permits: DemoPermitSeed[];
  documents: DemoDocumentSeed[];
  inspections: DemoInspectionSeed[];
} {
  const issuedTo = businessName || 'River City Kitchen Co.';

  const permits: DemoPermitSeed[] = [
    {
      title: 'Food Service Permit',
      jurisdiction: 'Birmingham',
      permitNumber: 'BH-FSP-742931',
      issuedDate: '2026-01-11',
      expirationDate: '2027-01-10',
      status: 'current',
      notes: `${DEMO_SEED_TAG} Issued to ${issuedTo}. Verify with local office.`,
      requirementMatchTerms: ['food', 'health'],
    },
    {
      title: 'Fire Safety Inspection Certificate',
      jurisdiction: 'Hoover',
      permitNumber: 'HV-FIR-195804',
      issuedDate: '2025-11-09',
      expirationDate: '2026-11-08',
      status: 'expiring_soon',
      notes: `${DEMO_SEED_TAG} Renewal window is near. Requirement source needed.`,
      requirementMatchTerms: ['fire'],
    },
    {
      title: 'Business License',
      jurisdiction: 'Pelham',
      permitNumber: 'PL-BIZ-552610',
      issuedDate: '2025-04-01',
      expirationDate: '2026-03-31',
      status: 'expired',
      notes: `${DEMO_SEED_TAG} Expired in prior cycle. Verify with local office.`,
      requirementMatchTerms: ['business', 'city', 'license'],
    },
    {
      title: 'County Vendor Approval',
      jurisdiction: 'Shelby County',
      permitNumber: 'SC-VEN-370125',
      issuedDate: '2026-02-14',
      expirationDate: '2027-02-13',
      status: 'pending',
      notes: `${DEMO_SEED_TAG} In progress review with county office.`,
      requirementMatchTerms: ['county'],
    },
    {
      title: 'Sales Tax Registration',
      jurisdiction: 'Alabama state level',
      permitNumber: 'AL-TAX-882145',
      issuedDate: '2026-01-01',
      expirationDate: '2027-01-01',
      status: 'missing',
      notes: `${DEMO_SEED_TAG} Requirement source needed for state filing cadence.`,
      requirementMatchTerms: ['tax', 'state'],
    },
  ];

  const documents: DemoDocumentSeed[] = [
    {
      title: 'Birmingham Health Permit Packet',
      jurisdiction: 'Birmingham',
      permitNumber: 'DOC-HP-6621',
      issuedDate: '2026-01-11',
      expirationDate: '2027-01-10',
      status: 'uploaded',
      documentType: 'health_permit',
      notes: `${DEMO_SEED_TAG} Clean stand-in packet for UI validation.`,
    },
    {
      title: 'Hoover Fire Inspection Certificate',
      jurisdiction: 'Hoover',
      permitNumber: 'DOC-FI-1892',
      issuedDate: '2025-11-09',
      expirationDate: '2026-11-08',
      status: 'expiring_soon',
      documentType: 'fire_inspection',
      notes: `${DEMO_SEED_TAG} Expires soon; verify with local office.`,
    },
    {
      title: 'Pelham Business License',
      jurisdiction: 'Pelham',
      permitNumber: 'DOC-BL-2207',
      issuedDate: '2025-04-01',
      expirationDate: '2026-03-31',
      status: 'expired',
      documentType: 'business_license',
      notes: `${DEMO_SEED_TAG} Expired stand-in license for task queue testing.`,
    },
    {
      title: 'Commissary Agreement',
      jurisdiction: 'Jefferson County',
      permitNumber: 'DOC-CA-5102',
      issuedDate: '2026-02-01',
      expirationDate: '2027-02-01',
      status: 'uploaded',
      documentType: 'commissary_agreement',
      notes: `${DEMO_SEED_TAG} Requirement source needed.`,
    },
    {
      title: 'Insurance Certificate',
      jurisdiction: 'Alabama state level',
      permitNumber: 'DOC-INS-7345',
      issuedDate: '2026-01-05',
      expirationDate: '2026-12-31',
      status: 'expiring_soon',
      documentType: 'insurance',
      notes: `${DEMO_SEED_TAG} Policy renewal approaching.`,
    },
    {
      title: 'Vehicle Registration',
      jurisdiction: 'Alabaster',
      permitNumber: 'DOC-VR-3004',
      issuedDate: '2026-03-03',
      expirationDate: '2027-03-02',
      status: 'missing',
      documentType: 'vehicle_registration',
      notes: `${DEMO_SEED_TAG} Not yet uploaded.`,
    },
    {
      title: 'Sales Tax License',
      jurisdiction: 'Calera',
      permitNumber: 'DOC-ST-9451',
      issuedDate: '2026-01-01',
      expirationDate: '2026-12-31',
      status: 'uploaded',
      documentType: 'sales_tax_license',
      notes: `${DEMO_SEED_TAG} Verify with local office for municipal obligations.`,
    },
  ];

  const inspections: DemoInspectionSeed[] = [
    {
      title: 'Quarterly Health Inspection',
      jurisdiction: 'Birmingham',
      inspectionType: 'health',
      status: 'scheduled',
      scheduledDate: '2026-08-18T14:00:00Z',
      completedDate: null,
      notes: `${DEMO_SEED_TAG} Scheduled. Not real appointment.`,
    },
    {
      title: 'Annual Fire Safety Check',
      jurisdiction: 'Hoover',
      inspectionType: 'fire',
      status: 'passed',
      scheduledDate: '2026-05-03T15:30:00Z',
      completedDate: '2026-05-03T16:00:00Z',
      notes: `${DEMO_SEED_TAG} Passed stand-in record.`,
    },
    {
      title: 'City Vending Compliance Visit',
      jurisdiction: 'Pelham',
      inspectionType: 'city',
      status: 'failed',
      scheduledDate: '2026-04-12T13:00:00Z',
      completedDate: '2026-04-12T13:40:00Z',
      notes: `${DEMO_SEED_TAG} Needs follow-up.`,
    },
    {
      title: 'County Site Visit',
      jurisdiction: 'Shelby County',
      inspectionType: 'county',
      status: 'needs_reschedule',
      scheduledDate: '2026-07-09T14:30:00Z',
      completedDate: null,
      notes: `${DEMO_SEED_TAG} Not scheduled with confirmed slot.`,
    },
  ];

  return { permits, documents, inspections };
}
