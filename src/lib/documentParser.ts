type ParsedDocumentData = {
  documentType?:
    | 'health_permit'
    | 'fire_inspection'
    | 'business_license'
    | 'insurance'
    | 'commissary_agreement'
    | 'vehicle_registration'
    | 'sales_tax_license'
    | 'other';
  name?: string;
  permitNumber?: string;
  issuedDate?: string;
  expirationDate?: string;
  jurisdictionName?: string;
  businessName?: string;
  confidence: number;
  rawText: string;
};

const JURISDICTIONS = [
  'Birmingham',
  'Hoover',
  'Pelham',
  'Alabaster',
  'Calera',
  'Columbiana',
  'Shelby County',
  'Jefferson County',
  'Alabama',
];

function normalizeText(value: string): string {
  return value.toLowerCase().replace(/\s+/g, ' ').trim();
}

function parseDateCandidate(raw: string): string | undefined {
  const cleaned = raw.replace(/[^\d/-]/g, '').trim();
  const iso = cleaned.match(/\b(20\d{2})[-/](\d{1,2})[-/](\d{1,2})\b/);
  if (iso && iso[1] && iso[2] && iso[3]) {
    const y = iso[1];
    const m = iso[2];
    const d = iso[3];
    return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
  }
  const us = cleaned.match(/\b(\d{1,2})[-/](\d{1,2})[-/](20\d{2})\b/);
  if (us && us[1] && us[2] && us[3]) {
    const m = us[1];
    const d = us[2];
    const y = us[3];
    return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
  }
  return undefined;
}

export function detectDocumentType(rawText: string): ParsedDocumentData['documentType'] {
  const text = normalizeText(rawText);
  if (text.includes('health permit')) return 'health_permit';
  if (text.includes('fire inspection') || text.includes('fire safety')) return 'fire_inspection';
  if (text.includes('business license')) return 'business_license';
  if (text.includes('insurance')) return 'insurance';
  if (text.includes('commissary')) return 'commissary_agreement';
  if (text.includes('vehicle registration')) return 'vehicle_registration';
  if (text.includes('sales tax')) return 'sales_tax_license';
  return 'other';
}

function extractDateByLabels(rawText: string, labels: string[]): string | undefined {
  const lines = rawText.split(/\r?\n/);
  for (const line of lines) {
    const normalized = normalizeText(line);
    const matched = labels.some((label) => normalized.includes(label));
    if (!matched) continue;
    const date = parseDateCandidate(line);
    if (date) return date;
  }
  return undefined;
}

export function extractExpirationDate(rawText: string): string | undefined {
  return extractDateByLabels(rawText, ['expires', 'expiration', 'valid through', 'renewal due']);
}

export function extractIssuedDate(rawText: string): string | undefined {
  return extractDateByLabels(rawText, ['issued', 'issue date', 'date issued', 'effective']);
}

export function extractPermitNumber(rawText: string): string | undefined {
  const lines = rawText.split(/\r?\n/);
  for (const line of lines) {
    const normalized = normalizeText(line);
    const hasLabel = ['permit no', 'license no', 'certificate no', 'registration no', 'permit #', 'license #'].some((label) =>
      normalized.includes(label),
    );
    if (!hasLabel) continue;
    const candidate = line.match(/([A-Z0-9]{2,}[-/][A-Z0-9-]{2,}|[A-Z]{2,}-\d{3,}|\d{5,})/i);
    if (candidate?.[1]) return candidate[1].toUpperCase();
  }
  return undefined;
}

export function extractJurisdiction(rawText: string): string | undefined {
  const normalized = normalizeText(rawText);
  return JURISDICTIONS.find((jurisdiction) => normalized.includes(jurisdiction.toLowerCase()));
}

export function extractBusinessName(rawText: string): string | undefined {
  const lines = rawText.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  const companyLine = lines.find((line) => /(llc|inc|co\.|company|foods|kitchen|catering)/i.test(line));
  return companyLine || undefined;
}

export function parseDocumentText(rawText: string): ParsedDocumentData {
  const docType = detectDocumentType(rawText);
  const expiration = extractExpirationDate(rawText);
  const issued = extractIssuedDate(rawText);
  const permitNo = extractPermitNumber(rawText);
  const jurisdiction = extractJurisdiction(rawText);
  const businessName = extractBusinessName(rawText);

  let confidence = 0.2;
  if (docType && docType !== 'other') confidence += 0.2;
  if (expiration) confidence += 0.2;
  if (issued) confidence += 0.15;
  if (permitNo) confidence += 0.15;
  if (jurisdiction) confidence += 0.1;

  const nameByType: Record<NonNullable<ParsedDocumentData['documentType']>, string> = {
    health_permit: 'Health Permit',
    fire_inspection: 'Fire Inspection',
    business_license: 'Business License',
    insurance: 'Insurance Certificate',
    commissary_agreement: 'Commissary Agreement',
    vehicle_registration: 'Vehicle Registration',
    sales_tax_license: 'Sales Tax License',
    other: 'Document',
  };

  return {
    documentType: docType,
    name: nameByType[docType ?? 'other'],
    permitNumber: permitNo,
    issuedDate: issued,
    expirationDate: expiration,
    jurisdictionName: jurisdiction,
    businessName,
    confidence: Math.max(0, Math.min(1, confidence)),
    rawText,
  };
}

export type { ParsedDocumentData };
