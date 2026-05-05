export const requirementStatuses = [
  'Unknown',
  'Not Applicable',
  'Missing',
  'In Progress',
  'Submitted',
  'Waiting',
  'Appointment Needed',
  'Complete',
  'Valid',
  'Expiring Soon',
  'Expired',
  'Failed',
  'Reinspection Needed',
  'Rejected',
  'Needs Review',
] as const;

export const requirementCategories = [
  'Startup',
  'Health Inspection',
  'Fire Inspection',
  'City License',
  'County Requirement',
  'Renewal',
  'Event',
  'Insurance',
  'Commissary',
  'Equipment',
  'Vehicle',
  'Tax/Revenue',
  'Other',
] as const;

export const checklistSegments = [
  'Startup',
  'Fire Inspection',
  'Health Inspection',
  'Renewal',
  'Event',
] as const;

export const documentTypes = [
  'PDF',
  'Image',
  'Photo Evidence',
  'Certificate',
  'Permit',
  'Inspection Report',
  'Insurance COI',
  'Business License',
  'Commissary Agreement',
  'Fire Tag',
  'Health Permit',
  'Truck Photo',
  'VIN/Plate Photo',
  'Other',
] as const;
