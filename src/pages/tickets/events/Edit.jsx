import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import Swal from 'sweetalert2';
import { ClipLoader } from 'react-spinners';
import ButtonNavigation from '../../../components/Button/ButtonNavigation';
import {
  clearTicketEventDetail,
  getTicketEvent,
  updateTicketEvent,
} from '../../../store/tickets/eventsSlice';
import { toDatetimeLocal } from '../../../utils/ticketsApi';

export default function TicketEventEdit() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { item, detailLoading, saving } = useSelector((state) => state.ticketEvents);
  const [form, setForm] = useState({ name: '', date: '', active: true });

  useEffect(() => {
    dispatch(getTicketEvent(id));
    return () => dispatch(clearTicketEventDetail());
  }, [dispatch, id]);

  useEffect(() => {
    if (item) {
      setForm({
        name: item.name ?? '',
        date: toDatetimeLocal(item.date),
        active: item.active !== false,
      });
    }
  }, [item]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await dispatch(
        updateTicketEvent({
          id,
          data: {
            name: form.name.trim(),
            date: new Date(form.date).toISOString(),
            active: form.active,
          },
        }),
      ).unwrap();
      Swal.fire({ icon: 'success', title: 'Evento actualizado' });
      navigate('/tickets/events');
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Error', text: String(err) });
    }
  };

  if (detailLoading && !item) {
    return <div className="text-center py-5"><ClipLoader color="#0d6efd" /></div>;
  }

  return (
    <div className="container mt-4">
      <div className="card shadow">
        <div className="card-header d-flex justify-content-between align-items-center">
          <h4>Editar evento</h4>
          <div className="d-flex gap-2">
            <ButtonNavigation url={`/tickets/events/${id}/sections`} icon="bi bi-tags" text="Precios" />
            <ButtonNavigation url="/tickets/events" icon="bi bi-arrow-left" text="Volver" />
          </div>
        </div>
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label">Nombre</label>
              <input className="form-control" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div className="mb-3">
              <label className="form-label">Fecha y hora</label>
              <input type="datetime-local" className="form-control" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} required />
            </div>
            <div className="form-check mb-3">
              <input className="form-check-input" type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} id="evActive" />
              <label className="form-check-label" htmlFor="evActive">Activo</label>
            </div>
            <button type="submit" className="btn btn-primary" disabled={saving}>Actualizar</button>
          </form>
        </div>
      </div>
    </div>
  );
}
