import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import Swal from 'sweetalert2';
import ButtonNavigation from '../../../components/Button/ButtonNavigation';
import GenericTable from '../../../components/Table.jsx/GenericTable';
import {
  createEventSection,
  getEventSections,
  getTicketEvent,
  updateEventSection,
} from '../../../store/tickets/eventsSlice';
import { getTicketSections } from '../../../store/tickets/sectionsSlice';
import { formatSectionType } from '../../../utils/ticketsApi';
import { formatErrorForDisplay } from '../../../utils/apiErrorMessage';

export default function TicketEventSections() {
  const { id: eventId } = useParams();
  const dispatch = useDispatch();
  const { item, eventSections = [], sectionsLoading, error } = useSelector(
    (state) => state.ticketEvents,
  );
  const { list: venueSections = [] } = useSelector((state) => state.ticketSections);
  const [form, setForm] = useState({ sectionId: '', basePrice: '', available: '' });

  useEffect(() => {
    dispatch(getTicketEvent(eventId));
    dispatch(getEventSections(eventId));
  }, [dispatch, eventId]);

  useEffect(() => {
    if (item?.venueId) {
      dispatch(getTicketSections({ venueId: item.venueId }));
    }
  }, [dispatch, item?.venueId]);

  const reload = () => dispatch(getEventSections(eventId));

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await dispatch(
        createEventSection({
          eventId,
          data: {
            sectionId: form.sectionId,
            basePrice: Number(form.basePrice),
            available: Number(form.available),
          },
        }),
      ).unwrap();
      setForm({ sectionId: '', basePrice: '', available: '' });
      reload();
      Swal.fire({ icon: 'success', title: 'Precio configurado', timer: 1500, showConfirmButton: false });
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Error', text: String(err) });
    }
  };

  const handleUpdatePrice = async (row) => {
    const { value: basePrice } = await Swal.fire({
      title: 'Nuevo precio',
      input: 'number',
      inputValue: row.basePrice,
      showCancelButton: true,
    });
    if (basePrice === undefined) return;
    try {
      await dispatch(
        updateEventSection({ id: row.id, data: { basePrice: Number(basePrice) } }),
      ).unwrap();
      reload();
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Error', text: String(err) });
    }
  };

  return (
    <div className="container-fluid">
      <div className="card shadow mb-4">
        <div className="card-header d-flex justify-content-between">
          <h4 className="mb-0">Precios — {item?.name ?? 'Evento'}</h4>
          <ButtonNavigation url={`/tickets/events/edit/${eventId}`} icon="bi bi-arrow-left" text="Volver" />
        </div>
        <div className="card-body">
          {error && <div className="alert alert-danger">{formatErrorForDisplay(error)}</div>}
          <form className="row g-2 mb-4" onSubmit={handleCreate}>
            <div className="col-md-4">
              <select className="form-select" value={form.sectionId} onChange={(e) => setForm({ ...form, sectionId: e.target.value })} required>
                <option value="">Sección</option>
                {venueSections.map((s) => (
                  <option key={s.id} value={s.id}>{s.name} ({formatSectionType(s.type)})</option>
                ))}
              </select>
            </div>
            <div className="col-md-2">
              <input type="number" step="0.01" className="form-control" placeholder="Precio" value={form.basePrice} onChange={(e) => setForm({ ...form, basePrice: e.target.value })} required />
            </div>
            <div className="col-md-2">
              <input type="number" className="form-control" placeholder="Disponibles" value={form.available} onChange={(e) => setForm({ ...form, available: e.target.value })} required />
            </div>
            <div className="col-md-2">
              <button type="submit" className="btn btn-primary w-100">Agregar</button>
            </div>
          </form>
          <GenericTable
            columns={[
              { header: 'Sección', cell: (row) => row.section?.name ?? '—' },
              { header: 'Tipo', cell: (row) => formatSectionType(row.section?.type) },
              { header: 'Precio', cell: (row) => `$${Number(row.basePrice).toFixed(2)}` },
              { header: 'Disponibles', accessor: 'available' },
              { header: 'Vendidos', accessor: 'sold' },
              { header: 'Activo', cell: (row) => (row.active ? 'Sí' : 'No') },
            ]}
            data={eventSections}
            loading={sectionsLoading}
            onEdit={handleUpdatePrice}
          />
        </div>
      </div>
    </div>
  );
}
