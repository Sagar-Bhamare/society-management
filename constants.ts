
import type { User, Resident, Invoice, Complaint, Amenity, Notice, UserRole, Visitor, Patrol, Incident, Vehicle, Notification, Payment, Expense, QuotationRequest, MaintenanceConfig, Tenant, CommitteeMember } from './types';

export const USERS: Record<UserRole, User> = {
  Admin: { id: 'user-1', name: 'Admin User', email: 'admin@auraliva.com', role: 'Admin', avatar: 'https://i.pravatar.cc/150?u=admin', contact: '9876543210' },
  Secretary: { id: 'user-2', name: 'Society Secretary', email: 'secretary@auraliva.com', role: 'Secretary', avatar: 'https://i.pravatar.cc/150?u=secretary', contact: '9876543211' },
  Treasurer: { id: 'user-3', name: 'Society Treasurer', email: 'treasurer@auraliva.com', role: 'Treasurer', avatar: 'https://i.pravatar.cc/150?u=treasurer', contact: '9876543212' },
  Security: { id: 'user-4', name: 'Security Head', email: 'security@auraliva.com', role: 'Security', avatar: 'https://i.pravatar.cc/150?u=security', contact: '9876543213' },
  Resident: { id: 'user-5', name: 'John Doe', email: 'john.doe@auraliva.com', role: 'Resident', avatar: 'https://i.pravatar.cc/150?u=resident', flatNo: 'A-101', contact: '9876543214' },
};

export const TENANT_JD: Tenant = {
  id: 'ten-jd',
  name: 'Priya Singh',
  contact: '8888888888',
  moveInDate: '2024-05-15',
  agreementDoc: 'priya_agreement.pdf',
  aadhaarDoc: 'priya_aadhaar.pdf',
  panDoc: 'priya_pan_card.pdf',
  photo: 'priya_photo.jpg',
  policeVerificationDoc: 'priya_police_verification.pdf',
};


export const RESIDENTS: Resident[] = [
  { id: 'res-jd', name: 'John Doe', wing: 'A', flatNo: 'A-101', contact: '9876543214', status: 'Active', tenant: TENANT_JD },
  { id: 'res-2', name: 'Bob Williams', wing: 'B', flatNo: 'B-204', contact: '9876543211', status: 'Active' },
  { id: 'res-3', name: 'Charlie Brown', wing: 'A', flatNo: 'A-302', contact: '9876543212', status: 'Inactive' },
  { id: 'res-4', name: 'Diana Miller', wing: 'C', flatNo: 'C-101', contact: '9876543213', status: 'Active' },
  { id: 'res-5', name: 'Ethan Davis', wing: 'B', flatNo: 'B-405', contact: '9876543214', status: 'Active' },
];

export const INVOICES: Invoice[] = [
  { id: 'inv-1', invoiceNumber: 'INV001', residentName: 'Alice Johnson', amount: 5000, dueDate: '2024-08-10', status: 'Paid' },
  { id: 'inv-2', invoiceNumber: 'INV002', residentName: 'Bob Williams', amount: 5500, dueDate: '2024-08-10', status: 'Pending' },
  { id: 'inv-3', invoiceNumber: 'INV003', residentName: 'Diana Miller', amount: 5000, dueDate: '2024-07-10', status: 'Overdue', fine: 250 },
  { id: 'inv-4', invoiceNumber: 'INV004', residentName: 'Ethan Davis', amount: 6000, dueDate: '2024-08-10', status: 'Pending Verification', paymentScreenshot: 'https://via.placeholder.com/400x800.png?text=Payment+Screenshot' },
  { id: 'inv-5', invoiceNumber: 'INV005', residentName: 'John Doe', amount: 5200, dueDate: '2024-08-10', status: 'Pending' },
  { id: 'inv-6', invoiceNumber: 'INV006', residentName: 'John Doe', amount: 5000, dueDate: '2024-07-10', status: 'Overdue', fine: 250 },
];

export const COMPLAINTS: Complaint[] = [
  { id: 'com-1', title: 'Water leakage in basement', raisedBy: 'Alice Johnson (A-102)', date: '2024-07-28', priority: 'High', status: 'Open', description: 'There is a significant water leakage near the parking spot A-12.' },
  { id: 'com-2', title: 'Playground light not working', raisedBy: 'Bob Williams (B-204)', date: '2024-07-25', priority: 'Medium', status: 'In Progress', description: 'The main floodlight in the childrens playground is flickering and often turns off.' },
  { id: 'com-3', title: 'Stray dogs creating nuisance', raisedBy: 'Diana Miller (C-101)', date: '2024-07-22', priority: 'Low', status: 'Resolved', description: 'A pack of stray dogs has been entering the society at night.' },
  { id: 'com-4', title: 'Lift not working in A-Wing', raisedBy: 'John Doe (A-101)', date: '2024-07-30', priority: 'High', status: 'Open', description: 'The main lift in A-wing has been stuck since this morning.' },
];

export const AMENITIES: Amenity[] = [
    { id: 'am-1', name: 'Clubhouse', image: 'https://images.unsplash.com/photo-1574362848149-11496d93a7c4?q=80&w=800', description: 'Spacious hall for parties and events.' },
    { id: 'am-2', name: 'Gymnasium', image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=800', description: 'Fully equipped with modern fitness machines.' },
    { id: 'am-3', name: 'Swimming Pool', image: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=800', description: 'Clean and well-maintained pool for all ages.' },
    { id: 'am-4', name: 'Tennis Court', image: 'https://images.unsplash.com/photo-1596481921903-06675545a1c3?q=80&w=800', description: 'Professional-grade court for tennis enthusiasts.' },
];

export const NOTICES: Notice[] = [
  { id: 'not-1', title: 'Monthly Maintenance Bill', date: '2024-08-01', category: 'General', content: 'Dear Residents, The maintenance bill for August 2024 has been generated. Please pay before the 10th to avoid late fees.', publishedBy: 'Admin' },
  { id: 'not-2', title: 'Independence Day Celebration', date: '2024-07-30', category: 'Event', content: 'We are excited to announce the Independence Day flag hoisting ceremony on August 15th at 9:00 AM in the society garden. All are invited.', publishedBy: 'Secretary' },
  { id: 'not-3', title: 'Water Supply Disruption', date: '2024-07-29', category: 'Urgent', content: 'Due to urgent pipeline repair work, water supply will be unavailable on July 31st from 10:00 AM to 5:00 PM. Kindly store water in advance.', publishedBy: 'Admin' },
];

export const NOTIFICATIONS: Notification[] = [
    { id: 'notif-1', title: 'New Maintenance Invoice', message: 'Invoice #INV005 for John Doe has been generated.', date: '2024-08-02', read: false, role: 'Admin' },
    { id: 'notif-2', title: 'Complaint Resolved', message: 'Complaint "Stray dogs creating nuisance" has been marked as resolved.', date: '2024-08-01', read: false, role: 'Secretary' },
    { id: 'notif-3', title: 'Payment Received', message: 'Payment of ₹5000 received from Alice Johnson.', date: '2024-08-01', read: true, role: 'Treasurer' },
    { id: 'notif-4', title: 'Amenity Booking Confirmed', message: 'Your booking for the Clubhouse on Aug 10th is confirmed.', date: '2024-07-31', read: false, role: 'Resident' },
    { id: 'notif-5', title: 'High Priority Incident', message: 'Suspicious individual reported near Gate 2.', date: '2024-07-31', read: false, role: 'Security' },
    { id: 'notif-6', title: 'New Notice Published', message: 'An urgent notice regarding water supply has been published.', date: '2024-07-29', read: true, role: 'All' },
    { id: 'notif-7', title: 'Lift Maintenance', message: 'The lift in A-wing will be under maintenance tomorrow.', date: '2024-07-28', read: false, role: 'Resident' },
];

export const VISITORS: Visitor[] = [
    { id: 'vis-1', name: 'Ravi Sharma', contact: '9123456780', vehicleNo: 'MH12AB1234', visitingFlat: 'A-101', purpose: 'Personal Visit', inTime: '10:30 AM', outTime: '11:45 AM', status: 'Exited' },
    { id: 'vis-2', name: 'Priya Mehta', contact: '9123456781', vehicleNo: 'MH14CD5678', visitingFlat: 'B-204', purpose: 'Family Function', inTime: '12:15 PM', outTime: null, status: 'Inside' },
    { id: 'vis-3', name: 'Delivery Agent', contact: '9123456782', vehicleNo: 'MH12EF9012', visitingFlat: 'C-101', purpose: 'Package Delivery', inTime: '02:00 PM', outTime: '02:10 PM', status: 'Exited' },
    { id: 'vis-4', name: 'Amit Singh', contact: '9123456783', vehicleNo: 'MH14GH3456', visitingFlat: 'B-405', purpose: 'Friend Visit', inTime: '03:30 PM', outTime: null, status: 'Inside' },
];

export const PATROLS: Patrol[] = [
    { id: 'pat-1', routeName: 'Night Round - Wings A & B', guardName: 'Ram Singh', startTime: '11:05 PM', endTime: '11:55 PM', status: 'Completed' },
    { id: 'pat-2', routeName: 'Perimeter Check', guardName: 'Suresh Kumar', startTime: '02:30 PM', endTime: null, status: 'In Progress' },
    { id: 'pat-3', routeName: 'Morning Round - All Wings', guardName: 'Ram Singh', startTime: null, endTime: null, status: 'Scheduled' },
    { id: 'pat-4', routeName: 'Clubhouse & Pool Area', guardName: 'Suresh Kumar', startTime: null, endTime: null, status: 'Scheduled' },
];

export const INCIDENTS: Incident[] = [
    { id: 'inc-1', title: 'Unauthorized Parking', reportedBy: 'Ram Singh', date: '2024-07-30', time: '09:15 PM', severity: 'Low', status: 'Resolved', description: 'Vehicle MH12AB1234 parked in non-designated area. Owner was notified and vehicle moved.' },
    { id: 'inc-2', title: 'Suspicious individual near Gate 2', reportedBy: 'Suresh Kumar', date: '2024-07-31', time: '11:00 AM', severity: 'Medium', status: 'Under Investigation', description: 'An unidentified person was seen loitering near the back gate. Fled when approached.' },
];

export const VEHICLES: Vehicle[] = [
    { id: 'veh-1', vehicleNo: 'MH14CD5678', ownerType: 'Visitor', ownerName: 'Priya Mehta', inTime: '12:15 PM', status: 'Inside', outTime: null },
    { id: 'veh-2', vehicleNo: 'MH14GH3456', ownerType: 'Visitor', ownerName: 'Amit Singh', inTime: '03:30 PM', status: 'Inside', outTime: null },
    { id: 'veh-3', vehicleNo: 'MH04XY5555', ownerType: 'Resident', ownerName: 'Alice Johnson', flatNo: 'A-102', inTime: '08:00 AM', status: 'Inside', outTime: null },
    { id: 'veh-4', vehicleNo: 'MH02YZ6677', ownerType: 'Resident', ownerName: 'Bob Williams', flatNo: 'B-204', inTime: '09:12 AM', status: 'Inside', outTime: null },
];

export const PAYMENTS: Payment[] = [
  { id: 'pay-1', residentName: 'Alice Johnson', amount: 5000, paymentDate: '2024-08-02', invoiceNumber: 'INV001', paymentMethod: 'Credit Card' },
  { id: 'pay-2', residentName: 'Charlie Brown', amount: 4800, paymentDate: '2024-07-28', invoiceNumber: 'INV-OLD-23', paymentMethod: 'UPI' },
  { id: 'pay-3', residentName: 'Ethan Davis', amount: 5500, paymentDate: '2024-07-25', invoiceNumber: 'INV-OLD-21', paymentMethod: 'Bank Transfer' },
  { id: 'pay-4', residentName: 'Diana Miller', amount: 5000, paymentDate: '2024-06-15', invoiceNumber: 'INV-OLD-19', paymentMethod: 'Credit Card' },
];

export const EXPENSES: Expense[] = [
  { id: 'exp-jan-1', date: '2024-01-25', category: 'Utilities', payee: 'City Power Ltd.', amount: 78000, status: 'Paid', description: 'Electricity Bill', receipt: 'jan-electric-bill.pdf' },
  { id: 'exp-jan-2', date: '2024-01-31', category: 'Staff Salary', payee: 'Staff Salaries', amount: 115000, status: 'Paid', description: 'Salaries for Dec 2023' },
  { id: 'exp-feb-1', date: '2024-02-24', category: 'Utilities', payee: 'City Power Ltd.', amount: 82000, status: 'Paid', description: 'Electricity Bill', receipt: 'feb-electric-bill.pdf' },
  { id: 'exp-feb-2', date: '2024-02-29', category: 'Staff Salary', payee: 'Staff Salaries', amount: 115000, status: 'Paid', description: 'Salaries for Jan 2024' },
  { id: 'exp-mar-1', date: '2024-03-15', category: 'Maintenance', payee: 'Garden Services', amount: 12000, status: 'Paid', description: 'Landscaping' },
  { id: 'exp-mar-2', date: '2024-03-26', category: 'Utilities', payee: 'City Power Ltd.', amount: 80000, status: 'Paid', description: 'Electricity Bill', receipt: 'mar-electric-bill.pdf' },
  { id: 'exp-apr-1', date: '2024-04-25', category: 'Utilities', payee: 'City Power Ltd.', amount: 95000, status: 'Paid', description: 'Electricity Bill', receipt: 'apr-electric-bill.pdf' },
  { id: 'exp-apr-2', date: '2024-04-30', category: 'Staff Salary', payee: 'Staff Salaries', amount: 120000, status: 'Paid', description: 'Salaries for Mar 2024' },
  { id: 'exp-may-1', date: '2024-05-20', category: 'Maintenance', payee: 'Lift Maintenance Co.', amount: 22000, status: 'Paid', description: 'Annual Lift Service', receipt: 'lift-service-may.pdf' },
  { id: 'exp-may-2', date: '2024-05-26', category: 'Utilities', payee: 'City Power Ltd.', amount: 105000, status: 'Paid', description: 'Electricity Bill', receipt: 'may-electric-bill.pdf' },
  { id: 'exp-jun-1', date: '2024-06-25', category: 'Utilities', payee: 'City Power Ltd.', amount: 110000, status: 'Paid', description: 'Electricity Bill', receipt: 'jun-electric-bill.pdf' },
  { id: 'exp-jun-2', date: '2024-06-30', category: 'Staff Salary', payee: 'Staff Salaries', amount: 120000, status: 'Paid', description: 'Salaries for May 2024' },
  { id: 'exp-1', date: '2024-07-28', category: 'Maintenance', payee: 'Reliable Plumbing Co.', amount: 15000, status: 'Paid', description: 'Basement water leakage repair', receipt: 'plumbing-invoice-782.pdf' },
  { id: 'exp-2', date: '2024-07-30', category: 'Utilities', payee: 'City Power Ltd.', amount: 85000, status: 'Paid', description: 'Monthly electricity bill for common areas', receipt: 'jul-electric-bill.pdf' },
  { id: 'exp-3', date: '2024-08-01', category: 'Staff Salary', payee: 'Security & Housekeeping Staff', amount: 120000, status: 'Paid', description: 'Salaries for July 2024' },
  { id: 'exp-4', date: '2024-08-02', category: 'Event', payee: 'Decorations & Catering', amount: 25000, status: 'Pending Approval', description: 'Advance for Independence Day celebration' },
  { id: 'exp-5', date: '2024-08-03', category: 'Miscellaneous', payee: 'Office Supplies Inc.', amount: 3500, status: 'Paid', description: 'Stationery for society office', receipt: 'office-supplies-bill-aug.pdf' },
];

export const QUOTATION_REQUESTS: QuotationRequest[] = [
  {
    id: 'quote-1',
    title: 'Building A - Motor Repair',
    description: 'Repair work for the main water motor of Building A, which has been malfunctioning.',
    vendorName: 'Reliable Pumps & Co.',
    amount: 45000,
    quotationFile: 'motor_quote_A.pdf',
    raisedBy: 'Society Secretary',
    dateRaised: '2024-07-28',
    status: 'Pending Treasurer Approval',
  },
  {
    id: 'quote-2',
    title: 'Playground Landscaping',
    description: 'Annual landscaping and maintenance for the children\'s playground area.',
    vendorName: 'GreenScape Gardens',
    amount: 30000,
    quotationFile: 'landscaping_quote.pdf',
    raisedBy: 'Society Secretary',
    dateRaised: '2024-07-25',
    status: 'Pending Committee Approval',
  },
  {
    id: 'quote-3',
    title: 'CCTV Camera Upgrade',
    description: 'Upgrade of 10 old CCTV cameras to new high-definition models for better security coverage.',
    vendorName: 'SecureTech Solutions',
    amount: 85000,
    quotationFile: 'cctv_upgrade.pdf',
    raisedBy: 'Society Secretary',
    dateRaised: '2024-07-22',
    status: 'Committee Approved',
  },
   {
    id: 'quote-4',
    title: 'Clubhouse Repainting',
    description: 'Interior and exterior repainting of the society clubhouse.',
    vendorName: 'Perfect Painters',
    amount: 120000,
    quotationFile: 'clubhouse_paint_quote.pdf',
    raisedBy: 'Society Secretary',
    dateRaised: '2024-07-20',
    status: 'Work Commenced',
    workCommenceDate: '2024-08-05',
    workCommenceNotes: 'Work will begin on Monday and is expected to take 2 weeks. Residents are requested to avoid the clubhouse area during this period.'
  }
];

export const MAINTENANCE_CONFIG: MaintenanceConfig = {
    monthlyAmount: 5000,
    dueDateDay: 10,
    lateFee: 250,
    lateFeeAfterDay: 15,
};

export const COMMITTEE_STRUCTURE: CommitteeMember[] = [
  {
    id: 'cm-1',
    name: 'Mr. Sharma',
    role: 'President',
    contact: '9999988888',
    avatar: 'https://i.pravatar.cc/150?u=president',
    children: [
      {
        id: 'user-2',
        name: 'Society Secretary',
        role: 'Secretary',
        contact: '9876543211',
        avatar: 'https://i.pravatar.cc/150?u=secretary',
        children: [
           {
            id: 'cm-4',
            name: 'Member 1',
            role: 'Committee Member',
            contact: '9876541111',
            avatar: 'https://i.pravatar.cc/150?u=member1',
          },
           {
            id: 'cm-5',
            name: 'Member 2',
            role: 'Committee Member',
            contact: '9876542222',
            avatar: 'https://i.pravatar.cc/150?u=member2',
          },
        ]
      },
      {
        id: 'user-3',
        name: 'Society Treasurer',
        role: 'Treasurer',
        contact: '9876543212',
        avatar: 'https://i.pravatar.cc/150?u=treasurer',
      },
    ]
  }
];

if(RESIDENTS) {} // trick to make sure RESIDENTS is exported
