import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { ClipLoader } from 'react-spinners';
import ButtonNavigation from '../../../components/Button/ButtonNavigation';
import { assignTicket } from '../../../store/tickets/ticketsSlice';
import { getTicketEvents, getEventSections } from '../../../store/tickets/eventsSlice';

export default function TicketAssign() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { saving } = useSelector((state) => state.ticketsAdmin);
  const { list: events = [] } = useSelector((state) => state.ticketEvents);
  const { eventSections = [] } = useSelector((state) => state.ticketEvents);
  const [form, setForm] = useState({
    eventId: '',
    sectionId: '',
    ownerId: '',
    seatNumber: '',
  });

  useEffect(() => {
    dispatch(getTicketEvents());
  }, [dispatch]);

  useEffect(() => {
    if (form.eventId) dispatch(getEventSections(form.eventId));
  }, [dispatch, form.eventId]);

  const sectionOptions = eventSections.map((es) => ({
    id: es.sectionId,
    label: es.section?.name ?? es.sectionId,
  }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await dispatch(
        assignTicket({
          eventId: form.eventId,
          sectionId: form.sectionId,
          ownerId: form.ownerId.trim(),
          seatNumber: form.seatNumber.trim() || undefined,
        }),
      ).unwrap();
      Swal.fire({ icon: 'success', title: 'Boleto regalado al usuario' });
      navigate('/tickets/list');
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Error', text: String(err) });
    }
  };

  return (
    <div className="container mt-4">
      <div className="card shadow">
        <div className="card-header d-flex justify-content-between">
          <h4>Regalar boleto (BackOffice)</h4>
          <ButtonNavigation url="/tickets/list" icon="bi bi-arrow-left" text="Volver" />
        </div>
        <div className="card-body">
          <p className="text-muted small">
            Asigna un boleto gratis a un usuario registrado en la app. Queda registrado quién lo asignó.
          </p>
          <form onSubmit={handleSubmit}>
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
                {sectionOptions.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
              </select>
            </div>
            <div className="mb-3">
              <label className="form-label">ID usuario (customer-auth) *</label>
              <input className="form-control font-monospace" value={form.ownerId} onChange={(e) => setForm({ ...form, ownerId: e.target.value })} required />
            </div>
            <div className="mb-3">
              <label className="form-label">Asiento (opcional)</label>
              <input className="form-control" value={form.seatNumber} onChange={(e) => setForm({ ...form, seatNumber: e.target.value })} />
            </div>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? <ClipLoader color="#fff" size={18} /> : 'Asignar boleto'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
