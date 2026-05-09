import type { DocumentType } from './db';
import type { JurisdictionRow, TruckPermitRow, TruckRow } from './db';

export type KnownJurisdiction = Pick<JurisdictionRow, 'id' | 'name'>;
export type KnownTruck = TruckRow;
export type KnownPermit = TruckPermitRow;

/** Structured output from OCR + rule-based parsing (Document Auto-Parse v1). */
export type ParsedDocumentResult = {
  documentType: string | null;
  name: string | null;
  permitNumber: string | null;
  issuedDate: string | null;
  expirationDate: string | null;
  jurisdictionId: string | null;
  jurisdictionName: string | null;
  truckId: string | null;
  permitId: string | null;
  businessName: string | null;
  confidence: number;
  extractedText: string;
  notes: string | null;
};

/** Alias for screens that still refer to "ParsedDocumentData". */
export type ParsedDocumentData = ParsedDocumentResult;

function normalizeText(value: string): string {
  return value.toLowerCase().replace(/\s+/g, ' ').trim();
}

function normalizePlate(value: string): string {
  return value.replace(/[\s-]/g, '').toUpperCase();
}

export function parseDateCandidate(raw: string): string | null {
  const cleaned = raw.replace(/[^\d/-]/g, ' ').trim();
  const iso = cleaned.match(/\b(20\d{2})[-/](\d{1,2})[-/](\d{1,2})\b/);
  if (iso?.[1] && iso[2] && iso[3]) {
    return `${iso[1]}-${iso[2].padStart(2, '0')}-${iso[3].padStart(2, '0')}`;
  }
  const us = cleaned.match(/\b(\d{1,2})[-/](\d{1,2})[-/](20\d{2})\b/);
  if (us?.[1] && us[2] && us[3]) {
    return `${us[3]}-${us[1].padStart(2, '0')}-${us[2].padStart(2, '0')}`;
  }
  const monthNames = [
    'january',
    'february',
    'march',
    'april',
    'may',
    'june',
    'july',
    'august',
    'september',
    'october',
    'november',
    'december',
  ];
  const monthAbbr = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
  const lower = raw.toLowerCase();
  for (let mi = 0; mi < 12; mi++) {
    const re = new RegExp(`\\b(${monthNames[mi]}|${monthAbbr[mi]})\\.?\\s+(\\d{1,2}),?\\s+(20\\d{2})\\b`, 'i');
    const m = lower.match(re);
    if (m?.[2] && m[3]) {
      const day = m[2].padStart(2, '0');
      const y = m[3];
      const mm = String(mi + 1).padStart(2, '0');
      return `${y}-${mm}-${day}`;
    }
  }
  return null;
}

const EXPIRATION_LABELS = [
  'expiration date',
  'expires',
  'expire',
  'exp date',
  'exp.',
  'valid until',
  'valid through',
  'renewal due',
  'policy period',
  'registration expires',
  'end date',
];

const ISSUED_LABELS = [
  'issued date',
  'date issued',
  'issue date',
  'effective date',
  'effective',
  'start date',
];

const NUMBER_LABELS = [
  'permit number',
  'license number',
  'certificate number',
  'registration number',
  'policy number',
  'agreement number',
  'permit no',
  'license no',
  'certificate no',
  'registration no',
  'permit #',
  'license #',
  'policy #',
  'account number',
];

export function detectDocumentType(rawText: string): DocumentType {
  const text = normalizeText(rawText);

  if (/\bdriver\s*['']?s?\s*license\b/i.test(rawText) || text.includes('drivers license')) {
    return 'driver_license';
  }
  if (
    text.includes('health permit') ||
    text.includes('food establishment') ||
    text.includes('mobile food unit') ||
    text.includes('food service')
  ) {
    return 'health_permit';
  }
  if (
    text.includes('fire inspection') ||
    text.includes('fire marshal') ||
    text.includes('life safety') ||
    text.includes('fire department')
  ) {
    return 'fire_inspection';
  }
  if (text.includes('business license') || text.includes('mobile vendor license') || text.includes('vendor license')) {
    return 'business_license';
  }
  if (text.includes('commissary') || text.includes('commercial kitchen')) {
    return 'commissary_agreement';
  }
  if (
    text.includes('certificate of insurance') ||
    text.includes('liability insurance') ||
    /\bcoi\b/.test(text) ||
    (text.includes('insurance') && text.includes('policy'))
  ) {
    return 'insurance';
  }
  if (
    text.includes('vehicle registration') ||
    (text.includes('registration') && (text.includes('motor') || text.includes('vehicle'))) ||
    (text.includes('license plate') && text.includes('registration'))
  ) {
    return 'vehicle_registration';
  }
  if (text.includes('sales tax') || text.includes('tax license') || text.includes('department of revenue')) {
    return 'sales_tax_license';
  }

  return 'other';
}

export function extractDocumentTitle(rawText: string): string | null {
  const lines = rawText
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  for (const line of lines.slice(0, 12)) {
    if (line.length < 3 || line.length > 120) continue;
    const lower = normalizeText(line);
    if (/^(page|www\.|http)/i.test(line)) continue;
    if (
      lower.includes('permit') ||
      lower.includes('license') ||
      lower.includes('certificate') ||
      lower.includes('insurance') ||
      lower.includes('registration')
    ) {
      return line.replace(/\s+/g, ' ').trim();
    }
  }

  const first = lines.find((l) => l.length >= 4 && l.length <= 100);
  return first ?? null;
}

export function extractPermitNumber(rawText: string): string | null {
  const lines = rawText.split(/\r?\n/);
  for (const line of lines) {
    const normalized = normalizeText(line);
    const hasLabel = NUMBER_LABELS.some((label) => normalized.includes(label));
    if (!hasLabel) continue;

    const afterColon = line.split(/[:#]/).slice(1).join(':').trim();
    const candidatePool = afterColon.length >= 2 ? `${afterColon} ${line}` : line;

    const patterns = [
      /\b([A-Z]{1,4}[- ]?\d{4,})\b/i,
      /\b(\d{5,}[A-Z]?)\b/,
      /\b([A-Z]{2,}-\d{3,}-\d{2,})\b/,
      /\b([A-Z0-9]{2,}[-/][A-Z0-9-]{3,})\b/i,
    ];
    for (const re of patterns) {
      const m = candidatePool.match(re);
      if (m?.[1] && m[1].length >= 4) {
        return m[1].replace(/\s+/g, ' ').trim().toUpperCase();
      }
    }
  }
  return null;
}

function extractDateNearLabels(rawText: string, labels: string[], preferLater = false): string | null {
  const lines = rawText.split(/\r?\n/);
  const found: string[] = [];

  for (const line of lines) {
    const normalized = normalizeText(line);
    const matched = labels.some((label) => normalized.includes(label));
    if (!matched) continue;

    const inlineDate =
      parseDateCandidate(line) ??
      parseDateCandidate(line.replace(/^[^:]*:\s*/, ''));
    if (inlineDate) found.push(inlineDate);

    const tail = line.split(/[:#]/).pop() ?? line;
    const d = parseDateCandidate(tail);
    if (d) found.push(d);
  }

  if (!found.length) {
    const global = rawText.match(/\b20\d{2}[-/](\d{1,2})[-/](\d{1,2})\b/g);
    if (global?.length) {
      const parsed = global.map((g) => parseDateCandidate(g)).filter(Boolean) as string[];
      found.push(...parsed);
    }
  }

  if (!found.length) return null;
  found.sort();
  const first = found[0];
  const last = found[found.length - 1];
  if (first == null || last == null) return null;
  return preferLater ? last : first;
}

export function extractExpirationDate(rawText: string): string | null {
  return extractDateNearLabels(rawText, EXPIRATION_LABELS, true);
}

export function extractIssuedDate(rawText: string): string | null {
  return extractDateNearLabels(rawText, ISSUED_LABELS, false);
}

export function extractJurisdiction(rawText: string, knownJurisdictions: KnownJurisdiction[]): string | null {
  const normalized = normalizeText(rawText);
  const sorted = [...knownJurisdictions].sort((a, b) => b.name.length - a.name.length);
  for (const j of sorted) {
    const n = normalizeText(j.name);
    if (n.length >= 2 && normalized.includes(n)) {
      return j.name;
    }
  }

  const FALLBACK = [
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
  for (const name of FALLBACK.sort((a, b) => b.length - a.length)) {
    if (normalized.includes(name.toLowerCase())) return name;
  }
  return null;
}

function jurisdictionIdFromName(name: string | null, knownJurisdictions: KnownJurisdiction[]): string | null {
  if (!name) return null;
  const n = normalizeText(name);
  const row = knownJurisdictions.find((j) => normalizeText(j.name) === n);
  return row?.id ?? null;
}

export function extractBusinessName(rawText: string): string | null {
  const lines = rawText.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  for (const line of lines.slice(0, 15)) {
    if (line.length < 3 || line.length > 80) continue;
    if (/(llc|inc\.?|l\.l\.c|corp\.?|company|foods|catering|kitchen|restaurant)/i.test(line)) {
      return line.replace(/\s+/g, ' ').trim();
    }
  }
  return null;
}

function extractVehicleNotes(rawText: string, matchedTruck: KnownTruck | null): string | null {
  const parts: string[] = [];
  const vinMatch = rawText.match(/\b([A-HJ-NPR-Z0-9]{17})\b/i);
  if (vinMatch?.[1]) {
    const vin = vinMatch[1].toUpperCase();
    if (!matchedTruck?.vin || normalizePlate(vin) === normalizePlate(matchedTruck.vin ?? '')) {
      parts.push(`VIN detected: ${vin}`);
    }
  }

  const plateMatch = rawText.match(/\b(?:plate|tag|license)\s*[#:]?\s*([A-Z0-9]{3,8})\b/i);
  if (plateMatch?.[1]) {
    parts.push(`Plate text: ${plateMatch[1].toUpperCase()}`);
  }

  return parts.length ? parts.join(' · ') : null;
}

export function matchTruck(rawText: string, knownTrucks: KnownTruck[]): string | null {
  if (!knownTrucks.length) return null;
  const text = rawText.toUpperCase();
  const normFull = normalizeText(rawText);

  for (const truck of knownTrucks) {
    if (truck.vin?.trim()) {
      const vin = truck.vin.trim().toUpperCase();
      if (vin.length >= 11 && text.includes(vin)) {
        return truck.id;
      }
    }
    if (truck.license_plate?.trim()) {
      const p = normalizePlate(truck.license_plate);
      if (p.length >= 4) {
        const plateRegex = new RegExp(`\\b${p.replace(/(.)/g, '$1\\s*')}\\b`, 'i');
        if (plateRegex.test(text) || text.replace(/\s/g, '').includes(p)) {
          return truck.id;
        }
      }
    }
    const name = truck.name.trim();
    if (name.length >= 3 && normFull.includes(normalizeText(name))) {
      return truck.id;
    }
  }
  return null;
}

function requirementTypeForDocumentType(dt: DocumentType): string | null {
  switch (dt) {
    case 'health_permit':
      return 'health';
    case 'fire_inspection':
      return 'fire';
    case 'business_license':
      return 'business';
    case 'commissary_agreement':
      return 'other';
    case 'insurance':
      return 'insurance';
    case 'vehicle_registration':
      return 'vehicle';
    case 'sales_tax_license':
      return 'tax';
    case 'driver_license':
      return 'other';
    default:
      return null;
  }
}

export function matchPermit(
  rawText: string,
  knownPermits: KnownPermit[],
  opts: {
    documentType: DocumentType;
    jurisdictionId: string | null;
    truckId: string | null;
  },
): string | null {
  const { documentType, jurisdictionId, truckId } = opts;
  if (!truckId) {
    return null;
  }
  const candidates = knownPermits.filter((p) => p.truck_id === truckId);
  if (!candidates.length) return null;

  const text = normalizeText(rawText);
  const wantType = requirementTypeForDocumentType(documentType);

  let best: { id: string; score: number } | null = null;

  for (const p of candidates) {
    const req = p.permit_requirements;
    if (!req) continue;

    let score = 0;

    if (jurisdictionId && req.jurisdiction_id === jurisdictionId) {
      score += 6;
    }

    if (wantType && req.requirement_type === wantType) {
      score += 4;
    }

    const reqName = normalizeText(req.name);
    const tokens = reqName.split(/[^a-z0-9]+/).filter((t) => t.length > 3);
    for (const t of tokens) {
      if (text.includes(t)) score += 1;
    }

    if (req.jurisdictions?.name && text.includes(normalizeText(req.jurisdictions.name))) {
      score += 2;
    }

    if (!best || score > best.score) {
      best = { id: p.id, score };
    }
  }

  if (best && best.score >= 4) {
    return best.id;
  }
  return null;
}

function defaultTitleForType(dt: DocumentType): string {
  const labels: Record<DocumentType, string> = {
    health_permit: 'Health permit',
    fire_inspection: 'Fire inspection',
    business_license: 'Business license',
    commissary_agreement: 'Commissary agreement',
    insurance: 'Insurance certificate',
    driver_license: 'Driver license',
    vehicle_registration: 'Vehicle registration',
    sales_tax_license: 'Sales tax license',
    other: 'Document',
  };
  return labels[dt] ?? 'Document';
}

function buildSummaryNotes(args: {
  businessName: string | null;
  jurisdictionName: string | null;
  vehicleNotes: string | null;
  permitNumber: string | null;
}): string | null {
  const lines: string[] = [];
  if (args.businessName) lines.push(`Business: ${args.businessName}`);
  if (args.jurisdictionName) lines.push(`Territory: ${args.jurisdictionName}`);
  if (args.vehicleNotes) lines.push(args.vehicleNotes);
  if (args.permitNumber) lines.push(`ID / No.: ${args.permitNumber}`);
  if (!lines.length) return null;
  return lines.join('\n');
}

export function parseDocumentText(
  rawText: string,
  knownJurisdictions: KnownJurisdiction[],
  knownTrucks: KnownTruck[],
  knownPermits: KnownPermit[],
): ParsedDocumentResult {
  const extractedText = rawText.trim();
  if (!extractedText.length) {
    return {
      documentType: null,
      name: null,
      permitNumber: null,
      issuedDate: null,
      expirationDate: null,
      jurisdictionId: null,
      jurisdictionName: null,
      truckId: null,
      permitId: null,
      businessName: null,
      confidence: 0,
      extractedText: '',
      notes: null,
    };
  }

  const docType = detectDocumentType(rawText);
  const jurisdictionName = extractJurisdiction(rawText, knownJurisdictions);
  const jurisdictionId = jurisdictionIdFromName(jurisdictionName, knownJurisdictions);

  const truckId = matchTruck(rawText, knownTrucks);

  const permitId = matchPermit(rawText, knownPermits, {
    documentType: docType,
    jurisdictionId,
    truckId,
  });

  const permitNumber = extractPermitNumber(rawText);
  const issuedDate = extractIssuedDate(rawText);
  const expirationDate = extractExpirationDate(rawText);
  const businessName = extractBusinessName(rawText);

  const titleFromDoc = extractDocumentTitle(rawText);
  const name =
    titleFromDoc ??
    (businessName ? `${defaultTitleForType(docType)} — ${businessName}` : defaultTitleForType(docType));

  const matchedTruck = truckId ? knownTrucks.find((t) => t.id === truckId) ?? null : null;
  const vehicleNotes = extractVehicleNotes(rawText, matchedTruck);

  let confidence = 0.15;
  if (docType !== 'other') confidence += 0.2;
  if (expirationDate) confidence += 0.18;
  if (issuedDate) confidence += 0.12;
  if (permitNumber) confidence += 0.12;
  if (jurisdictionName) confidence += 0.1;
  if (businessName) confidence += 0.05;
  if (truckId) confidence += 0.08;
  if (permitId) confidence += 0.1;

  const notes = buildSummaryNotes({
    businessName,
    jurisdictionName,
    vehicleNotes,
    permitNumber,
  });

  confidence = Math.max(0, Math.min(1, confidence));

  return {
    documentType: docType,
    name,
    permitNumber,
    issuedDate,
    expirationDate,
    jurisdictionId,
    jurisdictionName,
    truckId,
    permitId,
    businessName,
    confidence,
    extractedText,
    notes,
  };
}
