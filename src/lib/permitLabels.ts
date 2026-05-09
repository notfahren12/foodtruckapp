import type { TruckPermitRow } from './db';

function requirementCategoryLabel(permit: TruckPermitRow): string {
  const type = permit.permit_requirements?.requirement_type ?? 'other';
  switch (type) {
    case 'health':
      return 'Health permit';
    case 'fire':
      return 'Fire review';
    case 'business':
    case 'city':
      return 'Business license';
    case 'county':
      return 'County requirement';
    case 'vehicle':
      return 'Vehicle registration';
    case 'tax':
      return 'Sales tax';
    case 'insurance':
      return 'Insurance';
    case 'state':
      return 'State requirement';
    default:
      return 'Permit';
  }
}

/** Short picker line: “Birmingham — Health permit” */
export function formatRelatedPermitLabel(permit: TruckPermitRow): string {
  const jurisdiction = permit.permit_requirements?.jurisdictions?.name ?? 'Unknown territory';
  const category = requirementCategoryLabel(permit);
  return `${jurisdiction} — ${category}`;
}
