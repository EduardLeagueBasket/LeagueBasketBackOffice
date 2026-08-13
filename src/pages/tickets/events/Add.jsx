import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { ClipLoader } from 'react-spinners';
import ButtonNavigation from '../../../components/Button/ButtonNavigation';
import { createTicketEvent } from '../../../store/tickets/eventsSlice';
import { getTicketVenues } from '../../../store/tickets/venuesSlice';
import { getTeams } from '../../../store/teams/listTeamsSlice';

export default function TicketEventAdd() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { saving } = useSelector((state) => state.ticketEvents);
  const { list: venues = [] } = useSelector((state) => state.ticketVenues);
  const { teams = [] } = useSelector((state) => state.teamsList);
  const [form, setForm] = useState({ teamId: '', venueId: '', name: '', date: '' });

  useEffect(() => {
    dispatch(getTicketVenues());
    dispatch(getTeams());
  }, [dispatch]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await dispatch(
        createTicketEvent({
          teamId: form.teamId,
          venueId: form.venueId,
          name: form.name.trim(),
          date: new Date(form.date).toISOString(),
        }),
      ).unwrap();
      Swal.fire({ icon: 'success', title: 'Evento creado' });
      navigate('/tickets/events');
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Error', text: String(err) });
    }
  };

  return (
    <div className="container mt-4">
      <div className="card shadow">
        <div className="card-header d-flex justify-content-between">
          <h4>Nuevo evento</h4>
          <ButtonNavigation url="/tickets/events" icon="bi bi-arrow-left" text="Volver" />
        </div>
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label">Equipo *</label>
              <select className="form-select" value={form.teamId} onChange={(e) => setForm({ ...form, teamId: e.target.value })} required>
                <option value="">Selecciona equipo</option>
                {teams.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
            <div className="mb-3">
              <label className="form-label">Cancha *</label>
              <select className="form-select" value={form.venueId} onChange={(e) => setForm({ ...form, venueId: e.target.value })} required>
                <option value="">Selecciona cancha</option>
                {venues.map((v) => <option key={v.id} value={v.id}>{v.name}</option>)}
              </select>
            </div>
            <div className="mb-3">
              <label className="form-label">Nombre del partido *</label>
              <input className="form-control" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Gaiteros vs Guaros" required />
            </div>
            <div className="mb-3">
              <label className="form-label">Fecha y hora *</label>
              <input type="datetime-local" className="form-control" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} required />
            </div>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? <ClipLoader color="#fff" size={18} /> : 'Guardar'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
