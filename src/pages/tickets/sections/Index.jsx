import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import ButtonNavigation from '../../../components/Button/ButtonNavigation';
import GenericTable from '../../../components/Table.jsx/GenericTable';
import { getTicketSections } from '../../../store/tickets/sectionsSlice';
import { getTicketVenues } from '../../../store/tickets/venuesSlice';
import { formatSectionType } from '../../../utils/ticketsApi';
import { formatErrorForDisplay } from '../../../utils/apiErrorMessage';

export default function TicketSectionsIndex() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { list = [], loading, error } = useSelector((state) => state.ticketSections);
  const { list: venues = [] } = useSelector((state) => state.ticketVenues);
  const [venueId, setVenueId] = useState('');

  useEffect(() => {
    dispatch(getTicketVenues());
  }, [dispatch]);

  useEffect(() => {
    if (venueId) dispatch(getTicketSections({ venueId }));
  }, [dispatch, venueId]);

  return (
    <div className="container-fluid">
      <div className="card shadow">
        <div className="card-header d-flex justify-content-between align-items-center">
          <h4 className="mb-0">Boletos — Secciones</h4>
          <ButtonNavigation url="/tickets/sections/add" icon="bi bi-plus-lg" text="Nueva sección" />
        </div>
        <div className="card-body">
          <div className="row g-2 mb-3">
            <div className="col-md-4">
              <select className="form-select" value={venueId} onChange={(e) => setVenueId(e.target.value)}>
                <option value="">Selecciona cancha</option>
                {venues.map((v) => (
                  <option key={v.id} value={v.id}>{v.name}</option>
                ))}
              </select>
            </div>
          </div>
          {error && <div className="alert alert-danger">{formatErrorForDisplay(error)}</div>}
          {!venueId ? (
            <p className="text-muted">Selecciona una cancha para ver sus secciones.</p>
          ) : (
            <GenericTable
              columns={[
                { header: 'Nombre', accessor: 'name' },
                { header: 'Tipo', cell: (item) => formatSectionType(item.type) },
                { header: 'Capacidad', accessor: 'capacity' },
                { header: 'Numeradas', cell: (item) => (item.isNumbered ? 'Sí' : 'No') },
                { header: 'Activo', cell: (item) => (item.active ? 'Sí' : 'No') },
              ]}
              data={list}
              loading={loading}
              onEdit={(item) =>
              navigate(`/tickets/sections/edit/${item.id}`, { state: { venueId } })
            }
            />
          )}
        </div>
      </div>
    </div>
  );
}
