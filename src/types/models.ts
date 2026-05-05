import {
  checklistSegments,
  documentTypes,
  requirementCategories,
  requirementStatuses,
} from '../constants/statuses';

export type UserRole = 'Owner' | 'Admin' | 'Manager' | 'Driver/Operator' | 'Bookkeeper' | 'Read-only';
export type PlanTier = 'Free' | 'Pro' | 'Agency/Consultant';
export type JurisdictionType = 'state' | 'county' | 'city' | 'event' | 'agency';
export type RequirementCategory = (typeof requirementCategories)[number];
export type RequirementStatus = (typeof requirementStatuses)[number];
export type ChecklistSegment = (typeof checklistSegments)[number];
export type AppliesTo = 'business' | 'truck' | 'event' | 'user';
export type DocumentType = (typeof documentTypes)[number];
export type DocumentStatus = 'Valid' | 'Expiring Soon' | 'Expired' | 'Missing' | 'Archived';
export type AppointmentStatus =
  | 'Appointment Requested'
  | 'Appointment Confirmed'
  | 'Inspection Completed'
  | 'Passed'
  | 'Failed'
  | 'Reinspection Needed'
  | 'Cancelled'
  | 'Missed';
export type AppointmentType = 'Fire Inspection' | 'Health Inspection' | 'Business License' | 'Event Check-In' | 'Renewal';
export type EventStatus = 'Planned' | 'Confirmed' | 'Needs Documents' | 'Ready' | 'Complete';
export type VerificationStatus = 'Verified' | 'Needs Review' | 'Draft';
export type NotificationType =
  | 'expiration reminder'
  | 'renewal window opened'
  | 'appointment reminder'
  | 'missing document reminder'
  | 'overdue alert'
  | 'inspection prep reminder'
  | 'event prep reminder'
  | 'failed inspection correction reminder';

export type QuestionnaireAnswers = {
  usePropane: boolean;
  useGenerator: boolean;
  fryFood: boolean;
  hoodSystem: boolean;
  fireSuppressionSystem: boolean;
  multipleCities: boolean;
  temporaryEvents: boolean;
  commissaryKitchen: boolean;
  employees: boolean;
  prepackagedOnly: boolean;
  eventPermits: boolean;
  insuranceCoiForEvents: boolean;
};

export type UserProfile = {
  id: string;
  email: string;
  fullName: string;
  phone: string;
  createdAt: string;
};

export type Business = {
  id: string;
  ownerUserId: string;
  name: string;
  legalName: string;
  einLast4Optional?: string;
  phone: string;
  email: string;
  address: string;
  createdAt: string;
  planTier: PlanTier;
  quietHours: string;
  notificationsEnabled: boolean;
};

export type BusinessMember = {
  id: string;
  businessId: string;
  userId: string;
  role: UserRole;
  status: 'active' | 'invited';
  createdAt: string;
};

export type Truck = {
  id: string;
  businessId: string;
  name: string;
  unitNumber: string;
  vin: string;
  licensePlate: string;
  photoUrl: string;
  notes: string;
  active: boolean;
  createdAt: string;
  fireInspectionStatus: RequirementStatus;
  healthInspectionStatus: RequirementStatus;
  fireSuppressionTag: string;
  extinguisherTag: string;
  propaneSetupNotes: string;
  generatorSetupNotes: string;
};

export type Jurisdiction = {
  id: string;
  name: string;
  type: JurisdictionType;
  state: string;
  county?: string;
  city?: string;
  website?: string;
  phone?: string;
  email?: string;
  address?: string;
  notes?: string;
  active: boolean;
};

export type RequirementTemplate = {
  id: string;
  jurisdictionId: string;
  title: string;
  description: string;
  category: RequirementCategory;
  appliesTo: AppliesTo;
  requiredDocumentType?: DocumentType;
  renewalIntervalDays?: number;
  renewalWindowDays?: number;
  defaultReminderDays: number[];
  sourceAgency: string;
  sourceUrl?: string;
  sourceContact?: string;
  lastVerifiedAt?: string;
  verificationStatus: VerificationStatus;
  appliesIfJson?: Record<string, boolean>;
  checklistOrder: number;
  active: boolean;
};

export type Requirement = {
  id: string;
  businessId: string;
  truckId?: string;
  eventId?: string;
  templateId?: string;
  jurisdictionId?: string;
  title: string;
  description: string;
  category: RequirementCategory;
  status: RequirementStatus;
  dueDate?: string;
  expirationDate?: string;
  renewalWindowStart?: string;
  lastCompletedDate?: string;
  nextActionDate?: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
  appliesTo: AppliesTo;
  sourceAgency: string;
  sourceContact?: string;
  sourceUrl?: string;
  requiredDocumentType?: DocumentType;
  lastVerifiedAt?: string;
};

export type DocumentRecord = {
  id: string;
  businessId: string;
  truckId?: string;
  eventId?: string;
  requirementId?: string;
  title: string;
  documentType: DocumentType;
  fileUrl: string;
  filePath: string;
  mimeType: string;
  status: DocumentStatus;
  issueDate?: string;
  expirationDate?: string;
  version: number;
  isCurrent: boolean;
  uploadedBy: string;
  notes: string;
  createdAt: string;
};

export type Appointment = {
  id: string;
  businessId: string;
  truckId?: string;
  eventId?: string;
  requirementId?: string;
  title: string;
  type: AppointmentType;
  agency: string;
  contactId?: string;
  location: string;
  startTime: string;
  endTime: string;
  status: AppointmentStatus;
  notes: string;
  createdAt: string;
};

export type EventRecord = {
  id: string;
  businessId: string;
  name: string;
  organizerContactId?: string;
  location: string;
  startTime: string;
  endTime: string;
  assignedTruckIds: string[];
  status: EventStatus;
  notes: string;
  vendorPacketUploaded: boolean;
  insuranceCoiRequired: boolean;
  temporaryPermitRequired: boolean;
  healthPermitRequired: boolean;
  fireInspectionRequired: boolean;
  powerWaterRules: string;
  arrivalInstructions: string;
  setupTime: string;
  requiredDocuments: DocumentType[];
  deadlines: string[];
};

export type Contact = {
  id: string;
  businessId?: string;
  jurisdictionId?: string;
  truckId?: string;
  eventId?: string;
  name: string;
  organization: string;
  role: string;
  phone: string;
  email?: string;
  address?: string;
  website?: string;
  notes: string;
  createdAt: string;
};

export type NotificationRecord = {
  id: string;
  businessId: string;
  userId: string;
  requirementId?: string;
  documentId?: string;
  appointmentId?: string;
  eventId?: string;
  title: string;
  body: string;
  notificationType: NotificationType;
  scheduledFor: string;
  sentAt?: string;
  status: 'scheduled' | 'sent' | 'failed';
  createdAt: string;
};

export type InspectionResult = {
  id: string;
  businessId: string;
  truckId: string;
  appointmentId?: string;
  requirementId?: string;
  result: 'Passed' | 'Failed' | 'Reinspection Needed';
  inspectorName: string;
  failureReason?: string;
  correctionNeeded?: string;
  correctionDeadline?: string;
  reinspectionDate?: string;
  notes: string;
  createdAt: string;
};

export type AppSeed = {
  user: UserProfile;
  business: Business;
  members: BusinessMember[];
  trucks: Truck[];
  jurisdictions: Jurisdiction[];
  businessJurisdictionIds: string[];
  truckJurisdictionIds: Record<string, string[]>;
  questionnaire: QuestionnaireAnswers;
  requirementTemplates: RequirementTemplate[];
  requirements: Requirement[];
  documents: DocumentRecord[];
  appointments: Appointment[];
  events: EventRecord[];
  contacts: Contact[];
  notifications: NotificationRecord[];
  inspectionResults: InspectionResult[];
};
