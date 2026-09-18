import React from 'react';
import { Link } from 'react-router-dom';
import { userDisplayName, userRoleLabel } from './helpers';

export function DashboardHeader({ user, contextLabel, loading }) {
  return (
    <div className="dashboard-header mb-4">
      <h4 className="mb-1">
        Hola, {userDisplayName(user)}
        {loading ? (
          <span className="spinner-border spinner-border-sm ms-2 text-muted" />
        ) : null}
      </h4>
      <p className="text-muted mb-0">
        {userRoleLabel(user)}
        {contextLabel ? ` · ${contextLabel}` : ''}
      </p>
    </div>
  );
}

export function StatCards({ items = [] }) {
  if (!items.length) return null;
  return (
    <div className="row g-3 mb-4">
      {items.map((item) => (
        <div key={item.label} className="col-lg-3 col-md-6">
          <div className="card stat-card h-100">
            <div className="card-body">
              <div className="d-flex align-items-start">
                <div className={`stat-icon bg-${item.color || 'primary'} bg-opacity-10 text-${item.color || 'primary'}`}>
                  <i className={`bi ${item.icon || 'bi-bar-chart'}`} />
                </div>
                <div className="ms-3">
                  <h6 className="text-muted mb-1">{item.label}</h6>
                  <h4 className="fw-bold mb-0">{item.value ?? '—'}</h4>
                  {item.hint ? (
                    <small className="text-muted">{item.hint}</small>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function QuickLinks({ links = [] }) {
  if (!links.length) return null;
  return (
    <div className="card chart-card mb-4">
      <div className="card-header bg-transparent border-0 pb-0">
        <h6 className="card-title mb-0">Accesos rápidos</h6>
      </div>
      <div className="card-body">
        <div className="d-flex flex-wrap gap-2">
          {links.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="btn btn-outline-primary btn-sm dashboard-quick-link"
            >
              {link.icon ? <i className={`bi ${link.icon} me-1`} /> : null}
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

export function AlertsList({ alerts = [] }) {
  if (!alerts.length) return null;
  return (
    <div className="card chart-card mb-4">
      <div className="card-header bg-transparent border-0 pb-0">
        <h6 className="card-title mb-0">Alertas</h6>
      </div>
      <div className="card-body">
        <ul className="list-unstyled mb-0 dashboard-alerts">
          {alerts.map((alert) => (
            <li key={alert} className="d-flex align-items-start mb-2">
              <i className="bi bi-exclamation-triangle-fill text-warning me-2 mt-1" />
              <span>{alert}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export function SimpleTable({ title, columns, rows, emptyText = 'Sin datos' }) {
  return (
    <div className="card chart-card h-100">
      <div className="card-header bg-transparent border-0 pb-0">
        <h6 className="card-title mb-0">{title}</h6>
      </div>
      <div className="card-body p-0">
        <div className="table-responsive">
          <table className="table table-hover mb-0">
            <thead className="table-light">
              <tr>
                {columns.map((col) => (
                  <th key={col.key} className={`border-0 ${col.className || ''}`}>
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="text-muted ps-4 py-3">
                    {emptyText}
                  </td>
                </tr>
              ) : (
                rows.map((row) => (
                  <tr key={row.id}>
                    {columns.map((col) => (
                      <td key={col.key} className={col.className || ''}>
                        {row[col.key]}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
