import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import GenericTable from '../../../components/Table.jsx/GenericTable';
import { getTicketOrders } from '../../../store/tickets/ordersSlice';
import { formatDateTime, formatOrderStatus } from '../../../utils/ticketsApi';
import { formatErrorForDisplay } from '../../../utils/apiErrorMessage';

export default function TicketOrdersIndex() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { list = [], loading, error } = useSelector((state) => state.ticketOrders);
  const [userId, setUserId] = useState('');

  const load = () => {
    const params = {};
    if (userId.trim()) params.userId = userId.trim();
    dispatch(getTicketOrders(params));
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="container-fluid">
      <div className="card shadow">
        <div className="card-header"><h4 className="mb-0">Boletos — Órdenes</h4></div>
        <div className="card-body">
          <div className="row g-2 mb-3">
            <div className="col-md-4">
              <input className="form-control" placeholder="Filtrar por userId" value={userId} onChange={(e) => setUserId(e.target.value)} />
            </div>
            <div className="col-md-2">
              <button type="button" className="btn btn-outline-primary" onClick={load}>Buscar</button>
            </div>
          </div>
          {error && <div className="alert alert-danger">{formatErrorForDisplay(error)}</div>}
          <GenericTable
            columns={[
              { header: 'ID', cell: (item) => <span className="font-monospace small">{item.id?.slice(0, 12)}…</span> },
              { header: 'Usuario', cell: (item) => <span className="font-monospace small">{item.userId?.slice(0, 12)}…</span> },
              { header: 'Total', cell: (item) => `$${Number(item.total ?? 0).toFixed(2)}` },
              { header: 'Estado', cell: (item) => <span className="badge bg-info">{formatOrderStatus(item.status)}</span> },
              { header: 'Boletos', cell: (item) => item.tickets?.length ?? 0 },
              { header: 'Fecha', cell: (item) => formatDateTime(item.createdAt) },
            ]}
            data={list}
            loading={loading}
            onEdit={(item) => navigate(`/tickets/orders/${item.id}`)}
          />
        </div>
      </div>
    </div>
  );
}
