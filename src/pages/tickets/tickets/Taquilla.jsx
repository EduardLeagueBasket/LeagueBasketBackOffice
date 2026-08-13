import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import ButtonNavigation from '../../../components/Button/ButtonNavigation';
import { registerTaquillaTicket } from '../../../store/tickets/ticketsSlice';
import { getTicketEvents, getEventSections } from '../../../store/tickets/eventsSlice';

export default function TicketTaquilla() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { saving } = useSelector((state) => state.ticketsAdmin);
  const { list: events = [] } = useSelector((state) => state.ticketEvents);
  const { eventSections = [] } = useSelector((state) => state.ticketEvents);
  const [form, setForm] = useState({
    code: '',
    ownerId: '',
    eventId: '',
    sectionId: '',
    basePrice: '',
  });

  useEffect(() => {
    dispatch(getTicketEvents());
  }, [dispatch]);

  useEffect(() => {
    if (form.eventId) dispatch(getEventSections(form.eventId));
  }, [dispatch, form.eventId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await dispatch(
        registerTaquillaTicket({
          code: form.code.trim(),
          ownerId: form.ownerId.trim(),
          eventId: form.eventId,
          sectionId: form.sectionId,
          basePrice: form.basePrice ? Number(form.basePrice) : undefined,
        }),
      ).unwrap();
      Swal.fire({ icon: 'success', title: 'Boleto de taquilla registrado' });
      navigate('/tickets/list');
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Error', text: String(err) });
    }
  };

  return (
    <div className="container mt-4">
      <div className="card shadow">
        <div className="card-header d-flex justify-content-between">
          <h4>Registrar boleto taquilla</h4>
          <ButtonNavigation url="/tickets/list" icon="bi bi-arrow-left" text="Volver" />
        </div>
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label">Código TAQ *</label>
              <input className="form-control font-monospace" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} placeholder="TAQ90283723" required />
            </div>
            <div className="mb-3">
              <label className="form-label">ID usuario *</label>
              <input className="form-control font-monospace" value={form.ownerId} onChange={(e) => setForm({ ...form, ownerId: e.target.value })} required />
            </div>
            <div className="mb-3">
              <label className="form-label">Evento *</label>
              <select className="form-select" value={form.eventId} onChange={(e) => setForm({ ...form, eventId: e.target.value, sectionId: '' })} required>
                <option value="">Selecciona</option>
                {events.map((ev) => <option key={ev.id} value={ev.id}>{ev.name}</option>)}
              </select>
            </div>
            <div className="mb-3">
              <label className="form-label">Sección *</label>
              <select className="form-select" value={form.sectionId} onChange={(e) => setForm({ ...form, sectionId: e.target.value })} required disabled={!form.eventId}>
                <option value="">Selecciona</option>
                {eventSections.map((es) => (
                  <option key={es.sectionId} value={es.sectionId}>{es.section?.name}</option>
                ))}
              </select>
            </div>
            <div className="mb-3">
              <label className="form-label">Precio (opcional)</label>
              <input type="number" step="0.01" className="form-control" value={form.basePrice} onChange={(e) => setForm({ ...form, basePrice: e.target.value })} />
            </div>
            <button type="submit" className="btn btn-primary" disabled={saving}>Registrar</button>
          </form>
        </div>
      </div>
    </div>
  );
}
