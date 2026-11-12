import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Fan,
  Wrench,
  ClipboardCheck,
  CloudSun,
  Ship,
  LineChart,
  AlertTriangle,
  FileSpreadsheet,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Radio,
  UserCheck,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useOperations } from '../context/OperationsContext';

const NAV_ITEMS = [
  { name: 'Overview', path: '/dashboard', icon: LayoutDashboard },
  { name: 'Turbines', path: '/turbines', icon: Fan },
  { name: 'Maintenance', path: '/maintenance', icon: Wrench },
  { name: 'Inspections', path: '/inspections', icon: ClipboardCheck },
  { name: 'Marine Weather', path: '/weather', icon: CloudSun },
  { name: 'Vessel Operations', path: '/vessels', icon: Ship },
  { name: 'Performance', path: '/performance', icon: LineChart },
  { name: 'Alerts', path: '/alerts', icon: AlertTriangle, badge: 'alerts' },
  { name: 'Reports', path: '/reports', icon: FileSpreadsheet },
  { name: 'Settings', path: '/settings', icon: Settings },
];

export const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const { user, logout } = useAuth();
  const { activeAlertsCount } = useOperations();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside
      className={`h-screen bg-wind-panel border-r border-wind-border flex flex-col justify-between transition-all duration-200 select-none z-30 ${
        collapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Top Brand Header */}
      <div>
        <div className="h-16 border-b border-wind-border flex items-center justify-between px-4 bg-wind-surface">
          {!collapsed && (
            <div className="flex items-center gap-2.5">
              <div className="w-6 h-6 bg-white flex items-center justify-center text-black font-mono font-black text-sm">
                W
              </div>
              <div className="flex flex-col">
                <span className="font-mono font-black tracking-widest text-base text-white">
                  WINDOPS
                </span>
                <span className="text-[9px] font-mono uppercase text-neutral-400 tracking-wider">
                  Offshore Control
                </span>
              </div>
            </div>
          )}

          {collapsed && (
            <div className="w-8 h-8 bg-white flex items-center justify-center text-black font-mono font-black mx-auto">
              W
            </div>
          )}

          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1 border border-wind-border hover:bg-wind-subtle text-neutral-400 hover:text-white transition-colors"
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Navigation Menu */}
        <nav className="p-2 space-y-1 overflow-y-auto max-h-[calc(100vh-190px)] font-mono text-xs">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const hasAlertBadge = item.badge === 'alerts' && activeAlertsCount > 0;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 border transition-all group ${
                    isActive
                      ? 'bg-white text-black font-bold border-white shadow-sm'
                      : 'border-transparent text-neutral-400 hover:text-white hover:bg-wind-surface hover:border-wind-border'
                  } ${collapsed ? 'justify-center px-0' : ''}`
                }
                title={collapsed ? item.name : undefined}
              >
                <Icon className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110`} />

                {!collapsed && (
                  <div className="flex items-center justify-between w-full">
                    <span>{item.name}</span>
                    {hasAlertBadge && (
                      <span className="px-1.5 py-0.2 text-[10px] font-bold font-mono bg-red-600 text-white rounded-none">
                        {activeAlertsCount}
                      </span>
                    )}
                  </div>
                )}

                {collapsed && hasAlertBadge && (
                  <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500" />
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Bottom User Profile & Status */}
      <div className="p-3 border-t border-wind-border bg-wind-surface font-mono">
        {!collapsed ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-none bg-wind-bg border border-wind-border flex items-center justify-center text-white font-bold text-xs">
                {user?.name ? user.name.charAt(0) : 'O'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold text-white truncate">
                  {user?.name || 'Operator'}
                </div>
                <div className="text-[10px] text-wind-secondary truncate">
                  {user?.role ? user.role.replace('_', ' ').toUpperCase() : 'OPERATOR'}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-wind-border/50 text-[10px] text-wind-secondary">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                <span>SCADA LINK ON</span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1 text-neutral-400 hover:text-white transition-colors"
                title="Disconnect session"
              >
                <LogOut className="w-3 h-3" />
                <span>LOGOUT</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-white animate-pulse" title="SCADA Online" />
            <button
              onClick={handleLogout}
              className="p-1.5 text-neutral-400 hover:text-white transition-colors"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </aside>
  );
};
