// WINDOPS mock API.
// Drop-in replacement for the original REST client: same method names, same
// { success, data } response shapes, but everything is served from the
// hard-coded data in ../data. No server, no database. State lives in memory
// for the session, so acknowledging alerts, creating work orders, etc. work
// until the page is reloaded.

import {
  USERS,
  DEMO_USERS,
  MAINTENANCE,
  INSPECTIONS,
  VESSELS,
  ALERTS,
  REPORTS,
  WEATHER_BASE,
} from '../data/mockData';
import { TURBINES } from '../data/turbines';

const DAY = 24 * 3600 * 1000;
const MIN = 60 * 1000;
const HOUR = 3600 * 1000;
const iso = (ms) => new Date(ms).toISOString();
const clone = (v) => JSON.parse(JSON.stringify(v));
const delay = (ms = 120) => new Promise((r) => setTimeout(r, ms));
const ok = (data, extra = {}) => ({ success: true, ...extra, data });
const fail = (message) => {
  throw new Error(message);
};

// Deterministic pseudo-noise (no Math.random in seeded data)
const noise = (n) => {
  const x = Math.sin(n * 12.9898) * 43758.5453;
  return x - Math.floor(x) - 0.5; // -0.5 .. 0.5
};

// ---------------------------------------------------------------------------
// Build in-memory state once, at module load
// ---------------------------------------------------------------------------
const NOW = Date.now();

const buildHistory = (t) => {
  const log = [];
  const down = t.status === 'OFFLINE' || t.status === 'MAINTENANCE';
  for (let h = 24; h >= 0; h--) {
    const wave = Math.sin((24 - h) / 4) * 0.7;
    const p = down ? 0 : Math.max(0, Math.min(t.capacity, +(t.powerOutput + wave).toFixed(2)));
    const w = Math.max(2, +(t.windSpeed + wave * 0.5).toFixed(1));
    const r = p > 0 ? +(8.0 + (p / 7.5) * 3.5).toFixed(1) : 0;
    const seed = h + t.location.col * 7 + t.location.row * 31;
    log.push({
      timestamp: iso(NOW - h * HOUR),
      powerOutput: p,
      windSpeed: w,
      rotorSpeed: r,
      generatorTemp: Math.round(t.temperature.generator + noise(seed) * 3),
      gearboxTemp: Math.round(t.temperature.gearbox + noise(seed + 101) * 3),
      vibration: +(t.vibration + noise(seed + 202) * 0.2).toFixed(2),
    });
  }
  return log;
};

const turbines = TURBINES.map((t, i) => {
  const { lastMaintenanceDaysAgo, nextInspectionInDays, ...rest } = t;
  const full = {
    _id: `t-${String(i + 1).padStart(3, '0')}`,
    ...clone(rest),
    lastMaintenance: iso(NOW - lastMaintenanceDaysAgo * DAY),
    nextInspection: iso(NOW + nextInspectionInDays * DAY),
  };
  full.historicalLog = buildHistory(full);
  return full;
});

const maintenance = MAINTENANCE.map(({ scheduledInDays, completedInDays, notes, ...m }) => ({
  ...clone(m),
  scheduledDate: iso(NOW + scheduledInDays * DAY),
  ...(completedInDays !== undefined ? { completedAt: iso(NOW + completedInDays * DAY) } : {}),
  notes: (notes || []).map((n) => ({
    author: n.author,
    text: n.text,
    timestamp: iso(NOW - n.minutesAgo * MIN),
  })),
}));

const inspections = INSPECTIONS.map(({ scheduledInDays, completedInDays, ...i }) => ({
  ...clone(i),
  scheduledDate: iso(NOW + scheduledInDays * DAY),
  ...(completedInDays !== undefined ? { completedAt: iso(NOW + completedInDays * DAY) } : {}),
  notes: [],
}));

const vessels = clone(VESSELS);

const alerts = ALERTS.map(({ createdMinutesAgo, acknowledgedMinutesAgo, ...a }) => ({
  ...clone(a),
  createdAt: iso(NOW - createdMinutesAgo * MIN),
  ...(acknowledgedMinutesAgo !== undefined
    ? { acknowledgedAt: iso(NOW - acknowledgedMinutesAgo * MIN) }
    : {}),
}));

const reports = REPORTS.map(({ dateDaysAgo, ...r }) => ({
  ...clone(r),
  date: iso(NOW - dateDaysAgo * DAY),
}));

// Weather + deterministic 48h forecast
const opStatus = (hs, wind) => {
  if (hs > 2.2 || wind > 15) return 'RESTRICTED';
  if (hs > 1.8 || wind > 12) return 'MARGINAL';
  return 'SAFE';
};

const buildForecast = () => {
  const out = [];
  for (let i = 0; i < 48; i += 2) {
    const t = new Date(NOW + i * HOUR);
    const hs = Math.max(1.1, +(2.6 + Math.sin(i / 8) * 0.8).toFixed(1));
    const ws = Math.max(6.0, +(15.0 + Math.sin(i / 6) * 4.5).toFixed(1));
    out.push({
      time: `${String(t.getHours()).padStart(2, '0')}:00`,
      timestamp: t.toISOString(),
      windSpeed: ws,
      windDirection: 'SW 225°',
      waveHeight: hs,
      wavePeriod: +(6.5 + hs * 0.6).toFixed(1),
      visibility: ws > 16 ? 12 : 18,
      precipitation: hs > 2.2 ? 40 : 5,
      operationalStatus: opStatus(hs, ws),
    });
  }
  return out;
};

const weather = {
  ...clone(WEATHER_BASE),
  timestamp: iso(NOW),
  forecast: buildForecast(),
};

let currentUser = null;
const sessionUser = () => {
  if (currentUser) return currentUser;
  try {
    const raw = localStorage.getItem('windops_user');
    if (raw) currentUser = JSON.parse(raw);
  } catch {
    /* ignore */
  }
  return currentUser;
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const matches = (value, search) =>
  String(value ?? '').toLowerCase().includes(String(search).toLowerCase());

const getPath = (obj, path) => path.split('.').reduce((o, k) => (o ? o[k] : undefined), obj);

const sortBy = (list, key, order = 'asc') => {
  const dir = order === 'desc' ? -1 : 1;
  return [...list].sort((a, b) => {
    const av = getPath(a, key);
    const bv = getPath(b, key);
    if (av === bv) return 0;
    return (av > bv ? 1 : -1) * dir;
  });
};

const findBy = (list, idKey, id) => list.find((x) => x[idKey] === id || x._id === id);

// Lightweight turbine power curve (cut-in 3, rated 12.5, cut-out 25 m/s)
const calcPower = (wind, cap = 7.5) => {
  if (wind < 3.0 || wind > 25.0) return 0;
  if (wind >= 12.5) return cap;
  const ratio = (wind - 3.0) / 9.5;
  return Math.min(cap, Math.max(0.1, +(cap * Math.pow(ratio, 2.7)).toFixed(2)));
};

const toCSV = (headers, rows) =>
  [
    headers.join(','),
    ...rows.map((r) =>
      headers
        .map((h) => `"${r[h] !== undefined && r[h] !== null ? String(r[h]).replace(/"/g, '""') : ''}"`)
        .join(',')
    ),
  ].join('\n');

const day = (d) => (d ? String(d).split('T')[0] : '');

// ---------------------------------------------------------------------------
// API (same surface as the original REST client)
// ---------------------------------------------------------------------------
export const api = {
  // Auth ---------------------------------------------------------------
  login: async ({ email, password } = {}) => {
    await delay();
    if (!email || !password) fail('Please provide email and password');
    const user = USERS.find((u) => u.email === String(email).toLowerCase());
    if (!user || user.password !== password) {
      fail('Invalid credentials. Check email and password.');
    }
    const data = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      title: user.title,
      token: `demo-token-${user.role}`,
    };
    currentUser = data;
    return ok(data);
  },
  getMe: async () => {
    await delay(60);
    const u = sessionUser();
    if (!u) fail('Not authorized, no token');
    const { token, ...rest } = u;
    return ok(rest);
  },
  getDemoUsers: async () => {
    await delay(60);
    return ok(clone(DEMO_USERS));
  },

  // Turbines -----------------------------------------------------------
  getTurbines: async (params = {}) => {
    await delay();
    const { status, search, zone, sort = 'turbineId', order = 'asc' } = params;
    let list = turbines;
    if (status && status !== 'ALL') list = list.filter((t) => t.status === String(status).toUpperCase());
    if (zone && zone !== 'ALL') list = list.filter((t) => t.location.zone === zone);
    if (search) list = list.filter((t) => matches(t.turbineId, search) || matches(t.name, search));
    list = sortBy(list, sort, order).map(({ historicalLog, ...rest }) => rest);
    return ok(clone(list), { count: list.length });
  },
  getTurbineById: async (id) => {
    await delay();
    const t = findBy(turbines, 'turbineId', id);
    if (!t) fail(`Turbine ${id} not found`);
    return ok(clone(t));
  },
  getTurbineSummary: async () => {
    await delay(60);
    const total = turbines.length;
    const count = (s) => turbines.filter((t) => t.status === s).length;
    const online = count('ONLINE');
    const totalPower = turbines.reduce(
      (s, t) => s + (t.status === 'ONLINE' || t.status === 'WARNING' ? t.powerOutput : 0),
      0
    );
    const totalCapacity = turbines.reduce((s, t) => s + t.capacity, 0);
    return ok({
      total,
      online,
      maintenance: count('MAINTENANCE'),
      warning: count('WARNING'),
      offline: count('OFFLINE'),
      totalPower: +totalPower.toFixed(1),
      totalCapacity: +totalCapacity.toFixed(1),
      capacityFactor: +((totalPower / totalCapacity) * 100).toFixed(1),
      availabilityRate: +((online / total) * 100).toFixed(1),
      avgWindSpeed: +(turbines.reduce((s, t) => s + t.windSpeed, 0) / total).toFixed(1),
      avgHealth: Math.round(turbines.reduce((s, t) => s + t.healthScore, 0) / total),
    });
  },
  updateTurbine: async (id, data) => {
    await delay();
    const t = findBy(turbines, 'turbineId', id);
    if (!t) fail(`Turbine ${id} not found`);
    Object.assign(t, data);
    const { historicalLog, ...rest } = t;
    return ok(clone(rest));
  },

  // Maintenance --------------------------------------------------------
  getMaintenance: async (params = {}) => {
    await delay();
    const { status, priority, turbine, search } = params;
    let list = maintenance;
    if (status && status !== 'ALL') list = list.filter((m) => m.status === status);
    if (priority && priority !== 'ALL') list = list.filter((m) => m.priority === priority);
    if (turbine && turbine !== 'ALL') list = list.filter((m) => m.turbine === turbine);
    if (search) {
      list = list.filter(
        (m) =>
          matches(m.workOrderId, search) ||
          matches(m.turbine, search) ||
          matches(m.issue, search) ||
          matches(m.assignedTo, search)
      );
    }
    list = sortBy(list, 'scheduledDate', 'asc');
    return ok(clone(list), { count: list.length });
  },
  getMaintenanceSummary: async () => {
    await delay(60);
    const c = (s) => maintenance.filter((m) => m.status === s).length;
    return ok({
      total: maintenance.length,
      scheduled: c('Scheduled'),
      inProgress: c('In Progress'),
      completed: c('Completed'),
      overdue: c('Overdue'),
      critical: maintenance.filter((m) => m.priority === 'Critical' && m.status !== 'Completed').length,
    });
  },
  createMaintenance: async (data) => {
    await delay();
    const user = sessionUser();
    const wo = {
      _id: `wo-new-${maintenance.length + 1}`,
      workOrderId: data.workOrderId || `WO-${1000 + maintenance.length + 1}`,
      turbine: data.turbine,
      issue: data.issue,
      description: data.description || '',
      priority: data.priority || 'Medium',
      assignedTo: data.assignedTo,
      scheduledDate: data.scheduledDate ? new Date(data.scheduledDate).toISOString() : iso(Date.now()),
      status: data.status || 'Scheduled',
      vesselRequired: data.vesselRequired || 'None',
      estimatedHours: data.estimatedHours || 4,
      notes: data.notes
        ? [{ text: data.notes, author: user?.name || 'Operator', timestamp: iso(Date.now()) }]
        : [],
    };
    maintenance.push(wo);
    return ok(clone(wo));
  },
  updateMaintenance: async (id, data) => {
    await delay();
    const wo = findBy(maintenance, 'workOrderId', id);
    if (!wo) fail(`Work order ${id} not found`);
    const patch = { ...data };
    if (patch.status === 'Completed' && !patch.completedAt) patch.completedAt = iso(Date.now());
    Object.assign(wo, patch);
    return ok(clone(wo));
  },
  addMaintenanceNote: async (id, text) => {
    await delay();
    const wo = findBy(maintenance, 'workOrderId', id);
    if (!wo) fail(`Work order ${id} not found`);
    if (!text) fail('Note text is required');
    wo.notes.push({
      author: sessionUser()?.name || 'Operator',
      text,
      timestamp: iso(Date.now()),
    });
    return ok(clone(wo));
  },

  // Inspections --------------------------------------------------------
  getInspections: async (params = {}) => {
    await delay();
    const { status, type, turbine, search } = params;
    let list = inspections;
    if (status && status !== 'ALL') list = list.filter((i) => i.status === status);
    if (type && type !== 'ALL') list = list.filter((i) => i.type === type);
    if (turbine && turbine !== 'ALL') list = list.filter((i) => i.turbine === turbine);
    if (search) {
      list = list.filter(
        (i) =>
          matches(i.inspectionId, search) ||
          matches(i.turbine, search) ||
          matches(i.inspector, search) ||
          matches(i.findings, search)
      );
    }
    list = sortBy(list, 'scheduledDate', 'asc');
    return ok(clone(list), { count: list.length });
  },
  getInspectionSummary: async () => {
    await delay(60);
    const c = (s) => inspections.filter((i) => i.status === s).length;
    const byType = {};
    inspections.forEach((i) => {
      byType[i.type] = (byType[i.type] || 0) + 1;
    });
    return ok({
      total: inspections.length,
      scheduled: c('SCHEDULED'),
      inProgress: c('IN PROGRESS'),
      completed: c('COMPLETED'),
      overdue: c('OVERDUE'),
      byType,
    });
  },
  createInspection: async (data) => {
    await delay();
    const user = sessionUser();
    const ins = {
      _id: `ins-new-${inspections.length + 1}`,
      inspectionId: data.inspectionId || `INS-${2000 + inspections.length + 1}`,
      turbine: data.turbine,
      type: data.type,
      inspector: data.inspector || user?.name || 'Inspector',
      scheduledDate: data.scheduledDate ? new Date(data.scheduledDate).toISOString() : iso(Date.now()),
      status: data.status || 'SCHEDULED',
      method: data.method || 'Visual Walkthrough',
      findings: data.findings || 'Pending initial execution.',
      severityFound: data.severityFound || 'None',
      notes: data.notes ? [{ text: data.notes, author: user?.name || 'Inspector' }] : [],
    };
    inspections.push(ins);
    return ok(clone(ins));
  },
  updateInspection: async (id, data) => {
    await delay();
    const ins = findBy(inspections, 'inspectionId', id);
    if (!ins) fail(`Inspection ${id} not found`);
    const patch = { ...data };
    if (patch.status === 'COMPLETED' && !patch.completedAt) patch.completedAt = iso(Date.now());
    Object.assign(ins, patch);
    return ok(clone(ins));
  },

  // Weather ------------------------------------------------------------
  getCurrentWeather: async () => {
    await delay(60);
    return ok(clone(weather));
  },
  getWeatherForecast: async () => {
    await delay(60);
    return ok(clone(weather.forecast));
  },

  // Vessels ------------------------------------------------------------
  getVessels: async (params = {}) => {
    await delay();
    const { status, type } = params;
    let list = vessels;
    if (status && status !== 'ALL') list = list.filter((v) => v.status === status);
    if (type && type !== 'ALL') list = list.filter((v) => v.type === type);
    list = sortBy(list, 'name', 'asc');
    return ok(clone(list), { count: list.length });
  },
  updateVessel: async (id, data) => {
    await delay();
    const v = vessels.find((x) => x._id === id);
    if (!v) fail('Vessel not found');
    Object.assign(v, data);
    return ok(clone(v));
  },
  assignTurbineToVessel: async (id, { turbineId, eta, status } = {}) => {
    await delay();
    const v = vessels.find((x) => x._id === id);
    if (!v) fail('Vessel not found');
    v.assignedTurbine = turbineId || 'None';
    if (eta) v.eta = eta;
    if (status) v.status = status;
    return ok(clone(v));
  },

  // Performance --------------------------------------------------------
  getPerformance: async (timeframe = 'MONTH') => {
    await delay();
    const totalCapacity = 360;
    const live = turbines.filter((t) => t.status === 'ONLINE' || t.status === 'WARNING');
    const currentOutput = live.reduce((s, t) => s + t.powerOutput, 0);
    const onlineCount = turbines.filter((t) => t.status === 'ONLINE').length;

    const productionData = [];
    const downtimeData = [];

    if (timeframe === 'DAY') {
      for (let h = 0; h < 24; h++) {
        const label = `${String(h).padStart(2, '0')}:00`;
        const f = 0.8 + Math.sin(h / 3) * 0.15;
        productionData.push({
          label,
          actual: +(300 * f + noise(h) * 15).toFixed(1),
          forecast: +(305 * f).toFixed(1),
          curtailment: 4.2,
          losses: +(18 + (1 - f) * 15).toFixed(1),
        });
        downtimeData.push({
          label,
          scheduledMaintenance: h >= 6 && h <= 10 ? 12 : 2,
          unscheduledFault: h === 14 ? 8 : 1.5,
          gridCurtailment: 3.0,
        });
      }
    } else if (timeframe === 'WEEK') {
      ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].forEach((label, idx) => {
        const f = 0.85 + Math.sin(idx) * 0.1;
        productionData.push({
          label,
          actual: +(7200 * f).toFixed(0),
          forecast: +(7400 * f).toFixed(0),
          losses: +(380 + noise(idx + 50) * 40).toFixed(0),
        });
        downtimeData.push({
          label,
          scheduledMaintenance: 4.5 + idx * 0.5,
          unscheduledFault: 2.1,
          gridCurtailment: 1.8,
        });
      });
    } else if (timeframe === 'YEAR') {
      ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].forEach(
        (label, idx) => {
          const s = idx < 3 || idx > 9 ? 1.15 : 0.82;
          productionData.push({
            label,
            actual: +(225000 * s).toFixed(0),
            forecast: +(220000 * s).toFixed(0),
            losses: +(12400 * s).toFixed(0),
          });
          downtimeData.push({
            label,
            scheduledMaintenance: 3.2,
            unscheduledFault: 2.8,
            gridCurtailment: 1.4,
          });
        }
      );
    } else {
      for (let d = 1; d <= 30; d++) {
        const label = `Day ${d}`;
        const cycle = 0.82 + Math.sin(d / 4) * 0.16;
        productionData.push({
          label,
          actual: +(7100 * cycle + noise(d + 200) * 200).toFixed(0),
          forecast: +(7050 * cycle).toFixed(0),
          losses: 340,
        });
        if (d % 3 === 0) {
          downtimeData.push({
            label,
            scheduledMaintenance: +(3.0 + (noise(d + 300) + 0.5) * 2).toFixed(1),
            unscheduledFault: +(1.2 + (noise(d + 400) + 0.5) * 1.5).toFixed(1),
            gridCurtailment: 0.8,
          });
        }
      }
    }

    const turbineComparison = turbines.map((t) => ({
      turbineId: t.turbineId,
      name: t.name,
      zone: t.location.zone,
      status: t.status,
      powerOutput: t.powerOutput,
      capacity: t.capacity,
      windSpeed: t.windSpeed,
      availability: t.availability,
      healthScore: t.healthScore,
      operatingHours: t.operatingHours,
    }));

    return ok(
      clone({
        summary: {
          installedCapacity: totalCapacity,
          currentOutput: +currentOutput.toFixed(1),
          capacityFactor: +((currentOutput / totalCapacity) * 100).toFixed(1),
          availability: +((onlineCount / turbines.length) * 100).toFixed(1),
          totalTurbines: turbines.length,
          onlineTurbines: onlineCount,
          energyLossesYTD: '14.2 GWh',
          carbonOffsetYTD: '412,000 tCO2e',
        },
        timeframe,
        productionData,
        downtimeData,
        turbineComparison,
      })
    );
  },

  // Alerts -------------------------------------------------------------
  getAlerts: async (params = {}) => {
    await delay();
    const { severity, status, turbine, search } = params;
    let list = alerts;
    if (severity && severity !== 'ALL') list = list.filter((a) => a.severity === severity);
    if (status && status !== 'ALL') list = list.filter((a) => a.status === status);
    if (turbine && turbine !== 'ALL') list = list.filter((a) => a.turbine === turbine);
    if (search) {
      list = list.filter(
        (a) => matches(a.title, search) || matches(a.description, search) || matches(a.turbine, search)
      );
    }
    list = sortBy(list, 'createdAt', 'desc');
    return ok(clone(list), { count: list.length });
  },
  getAlertSummary: async () => {
    await delay(60);
    const active = alerts.filter((a) => a.status === 'Active');
    return ok({
      total: alerts.length,
      active: active.length,
      critical: active.filter((a) => a.severity === 'Critical').length,
      warning: active.filter((a) => a.severity === 'Warning').length,
      acknowledged: alerts.filter((a) => a.status === 'Acknowledged').length,
      resolved: alerts.filter((a) => a.status === 'Resolved').length,
    });
  },
  acknowledgeAlert: async (id) => {
    await delay();
    const a = alerts.find((x) => x._id === id);
    if (!a) fail('Alert not found');
    a.status = 'Acknowledged';
    a.acknowledgedBy = sessionUser()?.name || 'Duty Operator';
    a.acknowledgedAt = iso(Date.now());
    return ok(clone(a));
  },
  resolveAlert: async (id) => {
    await delay();
    const a = alerts.find((x) => x._id === id);
    if (!a) fail('Alert not found');
    a.status = 'Resolved';
    a.resolvedBy = sessionUser()?.name || 'Duty Operator';
    a.resolvedAt = iso(Date.now());
    return ok(clone(a));
  },

  // Reports ------------------------------------------------------------
  getReports: async () => {
    await delay();
    const list = sortBy(reports, 'date', 'desc').map(({ csvContent, ...r }) => r);
    return ok(clone(list), { count: list.length });
  },
  generateReport: async (type) => {
    await delay(500);
    if (!type) fail('Report type is required');
    const ts = new Date();
    const reportId = `REP-${3000 + reports.length + 1}`;
    let csvContent = '';
    let summary = {};

    if (type === 'Turbine Performance Report') {
      const headers = ['TurbineID', 'Name', 'Zone', 'Status', 'CapacityMW', 'PowerOutputMW', 'WindSpeedMS', 'RotorRPM', 'HealthScore', 'AvailabilityPercent', 'OperatingHours'];
      csvContent = toCSV(
        headers,
        turbines.map((t) => ({
          TurbineID: t.turbineId,
          Name: t.name,
          Zone: t.location.zone,
          Status: t.status,
          CapacityMW: t.capacity,
          PowerOutputMW: t.powerOutput,
          WindSpeedMS: t.windSpeed,
          RotorRPM: t.rotorSpeed,
          HealthScore: t.healthScore,
          AvailabilityPercent: t.availability,
          OperatingHours: t.operatingHours,
        }))
      );
      summary = {
        totalRecords: turbines.length,
        keyMetric: `${turbines.filter((t) => t.status === 'ONLINE').length} / ${turbines.length} Online`,
        notes: 'Fleet-wide generation and sensor health metrics compiled from live SCADA telemetry.',
      };
    } else if (type === 'Maintenance Report') {
      const headers = ['WorkOrderID', 'Turbine', 'Issue', 'Priority', 'AssignedTo', 'ScheduledDate', 'Status', 'EstimatedHours'];
      csvContent = toCSV(
        headers,
        maintenance.map((m) => ({
          WorkOrderID: m.workOrderId,
          Turbine: m.turbine,
          Issue: m.issue,
          Priority: m.priority,
          AssignedTo: m.assignedTo,
          ScheduledDate: day(m.scheduledDate),
          Status: m.status,
          EstimatedHours: m.estimatedHours,
        }))
      );
      summary = {
        totalRecords: maintenance.length,
        keyMetric: `${maintenance.filter((m) => m.status === 'Completed').length} Completed`,
        notes: 'Work order resolution and outstanding offshore technician tasks.',
      };
    } else if (type === 'Inspection Report') {
      const headers = ['InspectionID', 'Turbine', 'Type', 'Inspector', 'ScheduledDate', 'Status', 'Method', 'Findings', 'SeverityFound'];
      csvContent = toCSV(
        headers,
        inspections.map((i) => ({
          InspectionID: i.inspectionId,
          Turbine: i.turbine,
          Type: i.type,
          Inspector: i.inspector,
          ScheduledDate: day(i.scheduledDate),
          Status: i.status,
          Method: i.method,
          Findings: i.findings,
          SeverityFound: i.severityFound,
        }))
      );
      summary = {
        totalRecords: inspections.length,
        keyMetric: `${inspections.filter((i) => i.status === 'COMPLETED').length} Executed`,
        notes: 'Statutory and preventative structural, blade, and subsea QA inspections.',
      };
    } else if (type === 'Weather Impact Report') {
      const headers = ['ForecastHour', 'WindSpeedMS', 'WaveHeightM', 'WavePeriodS', 'VisibilityKM', 'OperationalStatus'];
      csvContent = toCSV(
        headers,
        weather.forecast.map((f) => ({
          ForecastHour: f.time,
          WindSpeedMS: f.windSpeed,
          WaveHeightM: f.waveHeight,
          WavePeriodS: f.wavePeriod,
          VisibilityKM: f.visibility,
          OperationalStatus: f.operationalStatus,
        }))
      );
      summary = {
        totalRecords: weather.forecast.length,
        keyMetric: `Hs ${weather.waveHeight}m / Wind ${weather.windSpeed} m/s`,
        notes: 'Metocean hydrodynamic conditions and marine access operational window analysis.',
      };
    } else {
      const headers = ['Metric', 'Value', 'Unit', 'Target', 'ComplianceStatus'];
      csvContent = toCSV(headers, [
        { Metric: 'Total Wind Farm Capacity', Value: '360', Unit: 'MW', Target: '360', ComplianceStatus: '100%' },
        { Metric: 'Average Monthly Availability', Value: '96.8', Unit: '%', Target: '95.0', ComplianceStatus: 'Exceeded' },
        { Metric: 'Total Energy Delivered', Value: '218400', Unit: 'MWh', Target: '210000', ComplianceStatus: 'Exceeded' },
        { Metric: 'Turbine Trips / Faults', Value: '4', Unit: 'Occurrences', Target: '< 10', ComplianceStatus: 'Optimal' },
        { Metric: 'Lost Time Incident Rate (LTIR)', Value: '0.00', Unit: 'Incidents', Target: '0.00', ComplianceStatus: 'Compliant' },
      ]);
      summary = {
        totalRecords: 5,
        keyMetric: '96.8% Fleet Availability',
        notes: 'Executive high-level operational synthesis for asset owners and investors.',
      };
    }

    const report = {
      _id: `rep-new-${reports.length + 1}`,
      reportId,
      name: `${type} - ${ts.toISOString().split('T')[0]}`,
      type,
      generatedBy: sessionUser()?.name || 'Duty Operator',
      date: ts.toISOString(),
      status: 'READY',
      format: 'CSV',
      summary,
      csvContent,
    };
    reports.push(report);
    const { csvContent: _omit, ...publicReport } = report;
    return ok(clone(publicReport));
  },
  downloadReportCSV: async (id, filename) => {
    await delay(80);
    const r = findBy(reports, 'reportId', id);
    if (!r) throw new Error('Download failed');
    const blob = new Blob([r.csvContent || 'No CSV data available'], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename || `${r.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    a.remove();
  },

  // Simulation (client-side SCADA jitter, replaces the server ticker) ---
  triggerSimulationTick: async () => {
    await delay(60);
    // Drift marine weather a little
    weather.windSpeed = Math.max(3.0, Math.min(24.0, +(weather.windSpeed + (Math.random() - 0.5) * 0.4).toFixed(1)));
    weather.waveHeight = Math.max(0.6, Math.min(4.5, +(weather.waveHeight + (Math.random() - 0.5) * 0.08).toFixed(2)));
    weather.wavePeriod = +(6.5 + weather.waveHeight * 0.6).toFixed(1);
    const status = opStatus(weather.waveHeight, weather.windSpeed);
    weather.operationalStatus = status;
    weather.operationalWindow.status = status;
    weather.operationalWindow.currentWaveHeight = weather.waveHeight;
    weather.operationalWindow.currentWindSpeed = weather.windSpeed;

    // Jitter 8 random running turbines
    // (WT-024 / WT-009 / WT-042 are held steady so the demo storyline stays intact)
    const pinned = ['WT-024', 'WT-009', 'WT-042'];
    const running = turbines.filter(
      (t) => (t.status === 'ONLINE' || t.status === 'WARNING') && !pinned.includes(t.turbineId)
    );
    const sample = [...running].sort(() => 0.5 - Math.random()).slice(0, 8);
    sample.forEach((t) => {
      const wind = Math.max(3.5, Math.min(22.0, +(t.windSpeed + (Math.random() - 0.5) * 0.5).toFixed(1)));
      const power = calcPower(wind, t.capacity);
      t.windSpeed = wind;
      t.powerOutput = power;
      t.rotorSpeed = power > 0 ? +(7.5 + (power / t.capacity) * 4.2 + (Math.random() - 0.5) * 0.2).toFixed(1) : 0;
      t.temperature.generator = Math.min(85, Math.max(45, t.temperature.generator + Math.round((Math.random() - 0.5) * 1.5)));
      t.temperature.gearbox = Math.min(78, Math.max(40, t.temperature.gearbox + Math.round((Math.random() - 0.5) * 1.2)));
      t.vibration = +(1.2 + (power / t.capacity) * 0.7 + (Math.random() - 0.5) * 0.15).toFixed(2);
    });
    return ok({ message: 'Simulation tick complete' });
  },
};
