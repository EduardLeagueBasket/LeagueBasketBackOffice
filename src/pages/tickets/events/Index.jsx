import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import ButtonNavigation from '../../../components/Button/ButtonNavigation';
import GenericTable from '../../../components/Table.jsx/GenericTable';
import { getTicketEvents } from '../../../store/tickets/eventsSlice';
import { formatDateTime } from '../../../utils/ticketsApi';
import { formatErrorForDisplay } from '../../../utils/apiErrorMessage';

export default function TicketEventsIndex() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { list = [], loading, error } = useSelector((state) => state.ticketEvents);

  useEffect(() => {
    dispatch(getTicketEvents());
  }, [dispatch]);

  return (
    <div className="container-fluid">
      <div className="card shadow">
        <div className="card-header d-flex justify-content-between align-items-center">
          <h4 className="mb-0">Boletos — Eventos (partidos)</h4>
          <ButtonNavigation url="/tickets/events/add" icon="bi bi-plus-lg" text="Nuevo evento" />
        </div>
        <div className="card-body">
          {error && <div className="alert alert-danger">{formatErrorForDisplay(error)}</div>}
          <GenericTable
            columns={[
              { header: 'Nombre', accessor: 'name' },
              { header: 'Fecha', cell: (item) => formatDateTime(item.date) },
              { header: 'Equipo (teamId)', cell: (item) => <span className="font-monospace small">{item.teamId?.slice(0, 12)}…</span> },
              { header: 'Cancha', cell: (item) => item.venue?.name ?? '—' },
              { header: 'Activo', cell: (item) => (item.active ? 'Sí' : 'No') },
            ]}
            data={list}
            loading={loading}
            onEdit={(item) => navigate(`/tickets/events/edit/${item.id}`)}
          />
          <div className="mt-2">
            <small className="text-muted">
              Tip: usa el mismo ID del partido de liga como ID del evento para que la app móvil lo encuentre automáticamente.
            </small>
          </div>
        </div>
      </div>
    </div>
  );
}
