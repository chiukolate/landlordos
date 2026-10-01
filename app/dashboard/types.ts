export type Property = {
  id: string;
  name: string;
  address: string;
};

export type Unit = {
  id: string;
  property_id: string;
  unit_number: string;
  monthly_rent: number | null;
  status: string;
};

export type Tenant = {
  id: string;
  first_name: string;
  last_name: string;
};

export type ActiveLease = {
  id: string;
  start_date: string;
  monthly_rent: number;
  tenant_id: string;
  unit_id: string;
};

export type DashboardData = {
  property: Property;
  propertyUnits: Unit[];
  activeLeases: ActiveLease[];
  tenants: Tenant[];
};