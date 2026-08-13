import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import ButtonNavigation from '../../../components/Button/ButtonNavigation';
import GenericTable from '../../../components/Table.jsx/GenericTable';
import { getTickets } from '../../../store/tickets/ticketsSlice';
import {
  formatTicketOrigin,
  formatTicketStatus,
} from '../../../utils/ticketsApi';
import { formatErrorForDisplay } from '../../../utils/apiErrorMessage';

export default function TicketsListIndex() {
  const dispatch = useDispatch();
  const { list = [], loading, error } = useSelector((state) => state.ticketsAdmin);
  const [filters, setFilters] = useState({ code: '', status: '', origin: '', eventId: '' });

  const load = () => {
    const params = {};
    if (filters.code.trim()) params.code = filters.code.trim();
    if (filters.status) params.status = filters.status;
    if (filters.origin) params.origin = filters.origin;
    if (filters.eventId.trim()) params.eventId = filters.eventId.trim();
    dispatch(getTickets(params));
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="container-fluid">
      <div className="card shadow">
        <div className="card-header d-flex justify-content-between align-items-center">
          <h4 className="mb-0">Boletos — Inventario</h4>
          <div className="d-flex gap-2">
            <ButtonNavigation url="/tickets/assign" icon="bi bi-gift" text="Regalar boleto" />
            <ButtonNavigation url="/tickets/taquilla" icon="bi bi-shop" text="Taquilla" />
          </div>
        </div>
        <div className="card-body">
          <div className="row g-2 mb-3">
            <div className="col-md-3">
              <input className="form-control" placeholder="Código APP/TAQ" value={filters.code} onChange={(e) => setFilters({ ...filters, code: e.target.value })} />
            </div>
            <div className="col-md-2">
              <select className="form-select" value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })}>
                <option value="">Estado</option>
                <option value="SOLD">Vendido</option>
                <option value="GIFTED">Regalado</option>
                <option value="REDEEMED">Canjeado</option>
                <option value="TRANSFERRED">Transferido</option>
                <option value="USED">Usado</option>
              </select>
            </div>
            <div className="col-md-2">
              <select className="form-select" value={filters.origin} onChange={(e) => setFilters({ ...filters, origin: e.target.value })}>
                <option value="">Origen</option>
                <option value="APP">App</option>
                <option value="TAQUILLA">Taquilla</option>
              </select>
            </div>
            <div className="col-md-3">
              <input className="form-control" placeholder="Event ID" value={filters.eventId} onChange={(e) => setFilters({ ...filters, eventId: e.target.value })} />
            </div>
            <div className="col-md-2">
              <button type="button" className="btn btn-outline-primary" onClick={load}>Buscar</button>
            </div>
          </div>
          {error && <div className="alert alert-danger">{formatErrorForDisplay(error)}</div>}
          <GenericTable
            columns={[
              { header: 'Código', accessor: 'code' },
              { header: 'Origen', cell: (item) => formatTicketOrigin(item.origin) },
              { header: 'Estado', cell: (item) => formatTicketStatus(item.status) },
              { header: 'Evento', cell: (item) => item.event?.name ?? '—' },
              { header: 'Sección', cell: (item) => item.section?.name ?? '—' },
              { header: 'Precio', cell: (item) => `$${Number(item.finalPrice ?? 0).toFixed(2)}` },
              { header: 'Dueño', cell: (item) => <span className="font-monospace small">{item.ownerId?.slice(0, 10)}…</span> },
            ]}
            data={list}
            loading={loading}
            showActions={false}
          />
        </div>
      </div>
    </div>
  );
}
