export const ROLES = {
  CLIENT: 'client',
  COURIER: 'courier',
  ADMIN: 'admin',
  SUPERVISOR: 'supervisor',
  MANAGER: 'manager',
  OWNER: 'owner'
};

export const ORDER_STATUS = {
  PENDING: 'Pending',
  PAYMENT_VERIFIED: 'Payment_Verified',
  VEHICLE_ASSIGNED: 'Vehicle_Assigned',
  ON_DELIVERY: 'On_Delivery',
  WAITING_VERIFICATION: 'Waiting_Verification',
  VERIFIED: 'Verified',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled'
};

export const STEPS = [
  'Pending',
  'Payment_Verified',
  'Vehicle_Assigned',
  'On_Delivery',
  'Waiting_Verification',
  'Verified',
  'Completed'
];

export const DEMO_CREDENTIALS = [
  { role: 'client1', roleName: 'Client', icon: 'User' },
  { role: 'courier1', roleName: 'Courier', icon: 'Package' },
  { role: 'admin1', roleName: 'Admin', icon: 'Settings' },
  { role: 'supervisor1', roleName: 'Supervisor', icon: 'Shield' },
  { role: 'manager1', roleName: 'Manager', icon: 'BarChart' },
  { role: 'owner1', roleName: 'Owner', icon: 'Crown' }
];

export const ROUTE_TYPES = [
  { value: 'in_city', label: 'In City Freight (Sepeda / Gerobak / Truk Uap)' },
  { value: 'inter_city', label: 'Inter City Line (Lokomotif Uap / Kapal Uap)' }
];
