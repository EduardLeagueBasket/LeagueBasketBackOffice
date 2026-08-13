import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import ButtonNavigation from '../../../components/Button/ButtonNavigation';
import GenericTable from '../../../components/Table.jsx/GenericTable';
import { getTicketVenues } from '../../../store/tickets/venuesSlice';
import { formatErrorForDisplay } from '../../../utils/apiErrorMessage';

export default function TicketVenuesIndex() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { list = [], loading, error } = useSelector((state) => state.ticketVenues);

  useEffect(() => {
    dispatch(getTicketVenues());
  }, [dispatch]);

  return (
    <div className="container-fluid">
      <div className="card shadow">
        <div className="card-header d-flex justify-content-between align-items-center">
          <h4 className="mb-0">Boletos — Canchas / Estadios</h4>
          <ButtonNavigation url="/tickets/venues/add" icon="bi bi-plus-lg" text="Nueva cancha" />
        </div>
        <div className="card-body">
          {error && <div className="alert alert-danger">{formatErrorForDisplay(error)}</div>}
          <GenericTable
            columns={[
              { header: 'Nombre', accessor: 'name' },
              { header: 'Ciudad', accessor: 'city' },
              { header: 'País', accessor: 'country' },
              { header: 'Capacidad', accessor: 'capacity' },
              {
                header: 'Activo',
                cell: (item) => (item.active ? 'Sí' : 'No'),
              },
            ]}
            data={list}
            loading={loading}
            onEdit={(item) => navigate(`/tickets/venues/edit/${item.id}`)}
          />
        </div>
      </div>
    </div>
  );
}
