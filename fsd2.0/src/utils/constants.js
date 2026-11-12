export const ROLES = {
  ADMIN: 'admin',
  OPERATIONS_MANAGER: 'operations_manager',
  MAINTENANCE_ENGINEER: 'maintenance_engineer',
  INSPECTOR: 'inspector',
};

export const ROLE_LABELS = {
  admin: 'System Administrator',
  operations_manager: 'Operations Manager',
  maintenance_engineer: 'Maintenance Engineer',
  inspector: 'QA & NDT Inspector',
};

export const TURBINE_STATUSES = {
  ONLINE: { label: 'ONLINE', badgeClass: 'bg-white text-black border-white' },
  MAINTENANCE: { label: 'MAINTENANCE', badgeClass: 'bg-neutral-800 text-neutral-200 border-neutral-600' },
  WARNING: { label: 'WARNING', badgeClass: 'bg-amber-500/10 text-amber-300 border-amber-500/30' },
  OFFLINE: { label: 'OFFLINE', badgeClass: 'bg-zinc-900 text-zinc-500 border-zinc-700' },
};

export const WORK_ORDER_STATUSES = ['Scheduled', 'In Progress', 'Completed', 'Overdue'];
export const WORK_ORDER_PRIORITIES = ['Critical', 'High', 'Medium', 'Low'];

export const INSPECTION_TYPES = [
  'Blade Inspection',
  'Gearbox Inspection',
  'Electrical Inspection',
  'Foundation Inspection',
  'Subsea Inspection',
  'Structural Inspection',
];

export const MARINE_LIMITS = {
  MAX_WAVE_HEIGHT_CTV: 1.8, // meters
  MAX_WAVE_HEIGHT_SOV: 2.5, // meters
  MAX_WIND_SPEED_ROPE: 12.0, // m/s
  CUT_IN_WIND_SPEED: 3.0,
  RATED_WIND_SPEED: 12.5,
  CUT_OUT_WIND_SPEED: 25.0,
};
