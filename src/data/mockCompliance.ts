export type PermitStatus = 'Missing' | 'Uploaded' | 'Expiring Soon' | 'Current';

export type MockPermit = {
  id: string;
  name: string;
  jurisdiction: string;
  status: PermitStatus;
  expirationPlaceholder: string;
};

export const PERMIT_JURISDICTIONS = [
  'Birmingham',
  'Hoover',
  'Pelham',
  'Alabaster',
  'Calera',
  'Columbiana',
  'Shelby County',
  'Jefferson County',
] as const;

const STATUS_CYCLE: PermitStatus[] = ['Current', 'Expiring Soon', 'Missing', 'Uploaded'];

const PERMIT_NAMES = ['Mobile food vendor permit', 'General business license'] as const;

function buildPermits(): MockPermit[] {
  const rows: MockPermit[] = [];
  PERMIT_JURISDICTIONS.forEach((jurisdiction, jIndex) => {
    PERMIT_NAMES.forEach((name, pIndex) => {
      const status = STATUS_CYCLE[(jIndex + pIndex) % STATUS_CYCLE.length]!;
      const slug = `${jurisdiction}-${name}`.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      const expirationPlaceholder =
        status === 'Missing'
          ? 'Not on file (placeholder)'
          : status === 'Uploaded'
            ? 'Pending review — placeholder'
            : status === 'Expiring Soon'
              ? 'Exp: 45 days (placeholder)'
              : 'Exp: Dec 31, 2026 (placeholder)';
      rows.push({
        id: `${slug}-${pIndex}`,
        name,
        jurisdiction,
        status,
        expirationPlaceholder,
      });
    });
  });
  return rows;
}

export const MOCK_PERMITS: MockPermit[] = buildPermits();

export type DashboardSummary = {
  complianceHeadline: string;
  complianceDetail: string;
  expiringSoonHeadline: string;
  expiringSoonDetail: string;
  missingDocsHeadline: string;
  missingDocsDetail: string;
  upcomingInspectionsHeadline: string;
  upcomingInspectionsDetail: string;
};

export const MOCK_DASHBOARD_SUMMARY: DashboardSummary = {
  complianceHeadline: 'Action needed',
  complianceDetail:
    'Based on placeholder data, finish uploads for Hoover and Pelham before your next event window.',
  expiringSoonHeadline: 'Expiring soon',
  expiringSoonDetail: '3 permits or certificates are within a renewal window (placeholder).',
  missingDocsHeadline: 'Missing documents',
  missingDocsDetail: '2 required uploads are still outstanding for the selected truck (placeholder).',
  upcomingInspectionsHeadline: 'Upcoming inspections',
  upcomingInspectionsDetail: 'Next scheduled visit: Health — Jun 12 (placeholder).',
};

export const DOCUMENT_CATEGORIES = [
  'Business license',
  'Health permit',
  'Fire inspection',
  'Commissary agreement',
  'Insurance',
  'Driver license',
  'Vehicle registration',
  'Sales tax license',
] as const;

export type DocumentCategory = (typeof DOCUMENT_CATEGORIES)[number];

export type MockUploadedDocument = {
  id: string;
  category: DocumentCategory;
  fileName: string;
  uploadedAtLabel: string;
};

export const MOCK_UPLOADED_DOCUMENTS: MockUploadedDocument[] = [
  {
    id: 'doc-bl',
    category: 'Business license',
    fileName: 'business-license-placeholder.pdf',
    uploadedAtLabel: 'Uploaded Mar 4 (placeholder)',
  },
  {
    id: 'doc-hp',
    category: 'Health permit',
    fileName: 'county-health-placeholder.pdf',
    uploadedAtLabel: 'Uploaded Feb 19 (placeholder)',
  },
];

export type InspectionType = 'Health' | 'Fire' | 'City vending' | 'County requirement';

export type MockUpcomingInspection = {
  id: string;
  title: string;
  jurisdiction: string;
  dateLabel: string;
  type: InspectionType;
};

export const MOCK_UPCOMING_INSPECTIONS: MockUpcomingInspection[] = [
  {
    id: 'insp-1',
    title: 'Annual health inspection',
    jurisdiction: 'Shelby County',
    dateLabel: 'Jun 12, 2026 (placeholder)',
    type: 'Health',
  },
  {
    id: 'insp-2',
    title: 'Fire equipment review',
    jurisdiction: 'Hoover',
    dateLabel: 'Jul 3, 2026 (placeholder)',
    type: 'Fire',
  },
];

export const MOCK_INSPECTION_CHECKLISTS: Record<InspectionType, string[]> = {
  Health: [
    'Handwash station staged and stocked (placeholder)',
    'Temperature logs available on device (placeholder)',
    'Commissary agreement current (placeholder)',
  ],
  Fire: [
    'Fire extinguisher tagged and accessible (placeholder)',
    'Propane cylinders secured per vendor checklist (placeholder)',
    'Generator clearance documented if applicable (placeholder)',
  ],
  'City vending': [
    'Vendor permit displayed copy ready (placeholder)',
    'Menu matches licensed categories (placeholder)',
    'Waste disposal plan summarized (placeholder)',
  ],
  'County requirement': [
    'County health approval packet assembled (placeholder)',
    'Sales tax registration snapshot saved (placeholder)',
    'Insurance COI matches named insured (placeholder)',
  ],
};

export type MockTruck = {
  id: string;
  name: string;
};

export const MOCK_TRUCKS: MockTruck[] = [
  { id: 'truck-1', name: 'Truck 1 — Taste & Tide' },
  { id: 'truck-2', name: 'Truck 2 — Smoke Ring BBQ' },
];
