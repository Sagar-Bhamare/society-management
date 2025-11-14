
export type UserRole = 'Admin' | 'Secretary' | 'Treasurer' | 'Security' | 'Resident';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
  flatNo?: string;
  contact?: string;
}

export interface Tenant {
  id:string;
  name: string;
  contact: string;
  moveInDate: string;
  moveOutDate?: string;
  agreementDoc: string; // filename
  aadhaarDoc: string; // filename
  panDoc: string; // filename
  photo: string; // filename
  policeVerificationDoc: string; // filename
}

export interface Resident {
  id:string;
  name: string;
  wing: string;
  flatNo: string;
  contact: string;
  status: 'Active' | 'Inactive';
  tenant?: Tenant;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  residentName: string;
  amount: number;
  dueDate: string;
  status: 'Paid' | 'Pending' | 'Overdue' | 'Pending Verification';
  paymentScreenshot?: string;
  fine?: number;
}

export type ComplaintPriority = 'High' | 'Medium' | 'Low';
export type ComplaintStatus = 'Open' | 'In Progress' | 'Resolved';

export interface Complaint {
  id: string;
  title: string;
  raisedBy: string;
  date: string;
  priority: ComplaintPriority;
  status: ComplaintStatus;
  description: string;
}

export interface Amenity {
  id: string;
  name: string;
  image: string;
  description: string;
}

export interface Notice {
  id: string;
  title: string;
  date: string;
  category: 'Maintenance' | 'Event' | 'Urgent' | 'General';
  content: string;
  publishedBy: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  date: string;
  read: boolean;
  role: UserRole | 'All';
}

export interface Visitor {
  id: string;
  name: string;
  contact: string;
  vehicleNo: string;
  visitingFlat: string;
  purpose?: string;
  inTime: string;
  outTime: string | null;
  status: 'Inside' | 'Exited';
}

export type PatrolStatus = 'Scheduled' | 'In Progress' | 'Completed';

export interface Patrol {
    id: string;
    routeName: string;
    guardName: string;
    startTime: string | null;
    endTime: string | null;
    status: PatrolStatus;
}

export type IncidentSeverity = 'Low' | 'Medium' | 'High';
export type IncidentStatus = 'Reported' | 'Under Investigation' | 'Resolved';

export interface Incident {
    id: string;
    title: string;
    reportedBy: string;
    date: string;
    time: string;
    severity: IncidentSeverity;
    status: IncidentStatus;
    description: string;
}

export interface Vehicle {
    id: string;
    vehicleNo: string;
    ownerType: 'Resident' | 'Visitor';
    ownerName: string;
    flatNo?: string;
    inTime: string;
    outTime: string | null;
    status: 'Inside' | 'Exited';
}

export interface Payment {
  id: string;
  residentName: string;
  amount: number;
  paymentDate: string;
  invoiceNumber: string;
  paymentMethod: 'Credit Card' | 'UPI' | 'Bank Transfer';
}

export type ExpenseCategory = 'Maintenance' | 'Utilities' | 'Staff Salary' | 'Event' | 'Miscellaneous';
export type ExpenseStatus = 'Paid' | 'Pending Approval' | 'Rejected';

export interface Expense {
  id: string;
  date: string;
  category: ExpenseCategory;
  payee: string;
  amount: number;
  status: ExpenseStatus;
  description: string;
  receipt?: string;
}

export type QuotationStatus = 'Pending Treasurer Approval' | 'Pending Committee Approval' | 'Committee Approved' | 'Rejected by Treasurer' | 'Work Commenced';

export interface QuotationRequest {
  id: string;
  title: string;
  description: string;
  vendorName: string;
  amount: number;
  quotationFile: string;
  raisedBy: string;
  dateRaised: string;
  status: QuotationStatus;
  workCommenceDate?: string;
  workCommenceNotes?: string;
}

export interface MaintenanceConfig {
  monthlyAmount: number;
  dueDateDay: number;
  lateFee: number;
  lateFeeAfterDay: number;
}

export interface CommitteeMember {
  id: string;
  name: string;
  role: string;
  contact: string;
  avatar: string;
  children?: CommitteeMember[];
}
