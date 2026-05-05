import { colors } from '../../constants/colors';
import { DocumentRecord, DocumentStatus, InspectionResult, Requirement, RequirementStatus, Truck } from '../../types/models';
import { getDaysUntilExpiration, isPast, isWithinDays } from '../dates';

export type ComplianceBreakdown = {
  score: number;
  missingItems: number;
  overdueItems: number;
  expiringSoonItems: number;
  unknownItems: number;
  failedItems: number;
  validItems: number;
};

export function getRequirementStatus(requirement: Requirement): RequirementStatus {
  if (requirement.status === 'Complete' && requirement.expirationDate) {
    const daysUntilExpiration = getDaysUntilExpiration(requirement.expirationDate);
    if (daysUntilExpiration !== null && daysUntilExpiration < 0) return 'Expired';
    if (daysUntilExpiration !== null && daysUntilExpiration <= 30) return 'Expiring Soon';
    return 'Valid';
  }

  if (requirement.expirationDate && isPast(requirement.expirationDate)) {
    return 'Expired';
  }

  if (requirement.expirationDate && isWithinDays(requirement.expirationDate, 30)) {
    return 'Expiring Soon';
  }

  return requirement.status;
}

export function getDocumentStatus(document: DocumentRecord): DocumentStatus {
  if (!document.expirationDate) {
    return document.status;
  }

  const daysUntilExpiration = getDaysUntilExpiration(document.expirationDate);
  if (daysUntilExpiration === null) {
    return document.status;
  }

  if (daysUntilExpiration < 0) return 'Expired';
  if (daysUntilExpiration <= 30) return 'Expiring Soon';
  return 'Valid';
}

export function calculateComplianceScore(
  requirements: Requirement[],
  documents: DocumentRecord[],
  inspectionResults: InspectionResult[] = [],
): ComplianceBreakdown {
  let score = 100;
  let missingItems = 0;
  let overdueItems = 0;
  let expiringSoonItems = 0;
  let unknownItems = 0;
  let failedItems = 0;
  let validItems = 0;

  requirements.forEach((requirement) => {
    const status = getRequirementStatus(requirement);
    switch (status) {
      case 'Missing':
        missingItems += 1;
        score -= 14;
        break;
      case 'Expired':
      case 'Rejected':
        overdueItems += 1;
        score -= 16;
        break;
      case 'Expiring Soon':
      case 'Appointment Needed':
        expiringSoonItems += 1;
        score -= 8;
        break;
      case 'Unknown':
      case 'Needs Review':
      case 'Waiting':
        unknownItems += 1;
        score -= 5;
        break;
      case 'Failed':
      case 'Reinspection Needed':
        failedItems += 1;
        score -= 18;
        break;
      case 'Valid':
      case 'Complete':
        validItems += 1;
        break;
      default:
        score -= 3;
    }
  });

  documents.forEach((document) => {
    const status = getDocumentStatus(document);
    if (status === 'Expired') {
      overdueItems += 1;
      score -= 8;
    } else if (status === 'Expiring Soon') {
      expiringSoonItems += 1;
      score -= 4;
    } else if (status === 'Valid') {
      validItems += 1;
    }
  });

  inspectionResults.forEach((result) => {
    if (result.result === 'Failed' || result.result === 'Reinspection Needed') {
      failedItems += 1;
      score -= 10;
    }
  });

  return {
    score: Math.max(18, Math.min(100, score)),
    missingItems,
    overdueItems,
    expiringSoonItems,
    unknownItems,
    failedItems,
    validItems,
  };
}

export function getUpcomingItems<T extends { dueDate?: string; expirationDate?: string; startTime?: string }>(
  items: T[],
  withinDays = 30,
) {
  return items.filter((item) => {
    const relevantDate = item.dueDate ?? item.expirationDate ?? item.startTime;
    const diff = getDaysUntilExpiration(relevantDate);
    return diff !== null && diff >= 0 && diff <= withinDays;
  });
}

export function getOverdueItems<T extends { dueDate?: string; expirationDate?: string }>(items: T[]) {
  return items.filter((item) => isPast(item.dueDate ?? item.expirationDate));
}

export function getMissingItems(requirements: Requirement[]) {
  return requirements.filter((requirement) => {
    const status = getRequirementStatus(requirement);
    return status === 'Missing' || status === 'Unknown' || status === 'Appointment Needed';
  });
}

export function getHighestRiskTruck(
  trucks: Truck[],
  requirements: Requirement[],
  documents: DocumentRecord[],
  inspectionResults: InspectionResult[] = [],
) {
  return trucks.reduce<{ truck: Truck | null; score: number }>(
    (current, truck) => {
      const truckRequirements = requirements.filter((requirement) => requirement.truckId === truck.id);
      const truckDocuments = documents.filter((document) => document.truckId === truck.id);
      const truckInspections = inspectionResults.filter((result) => result.truckId === truck.id);
      const score = calculateComplianceScore(truckRequirements, truckDocuments, truckInspections).score;

      if (current.truck === null || score < current.score) {
        return { truck, score };
      }

      return current;
    },
    { truck: null, score: 101 },
  );
}

export function getStatusTone(status: RequirementStatus | DocumentStatus) {
  if (status === 'Valid' || status === 'Complete') return colors.success;
  if (status === 'Expiring Soon' || status === 'Appointment Needed' || status === 'Waiting') return colors.warning;
  if (
    status === 'Expired' ||
    status === 'Failed' ||
    status === 'Rejected' ||
    status === 'Reinspection Needed' ||
    status === 'Missing'
  ) {
    return colors.danger;
  }
  return colors.info;
}
