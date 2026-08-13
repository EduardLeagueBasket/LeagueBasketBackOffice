import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { ClipLoader } from 'react-spinners';
import ButtonNavigation from '../../../components/Button/ButtonNavigation';
import { createTicketSection } from '../../../store/tickets/sectionsSlice';
import { getTicketVenues } from '../../../store/tickets/venuesSlice';
import { SECTION_TYPES } from '../../../utils/ticketsApi';

export default function TicketSectionAdd() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { saving } = useSelector((state) => state.ticketSections);
  const { list: venues = [] } = useSelector((state) => state.ticketVenues);
  const [form, setForm] = useState({
    venueId: '',
    name: '',
    type: 'BLEACHERS',
    capacity: '',
    isNumbered: false,
  });

  useEffect(() => {
    dispatch(getTicketVenues());
  }, [dispatch]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await dispatch(
        createTicketSection({
          venueId: form.venueId,
          name: form.name.trim(),
          type: form.type,
          capacity: Number(form.capacity),
          isNumbered: form.isNumbered,
        }),
      ).unwrap();
      Swal.fire({ icon: 'success', title: 'Sección creada' });
      navigate('/tickets/sections');
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Error', text: String(err) });
    }
  };

  return (
    <div className="container mt-4">
      <div className="card shadow">
        <div className="card-header d-flex justify-content-between">
          <h4>Nueva sección</h4>
          <ButtonNavigation url="/tickets/sections" icon="bi bi-arrow-left" text="Volver" />
        </div>
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label">Cancha *</label>
              <select className="form-select" value={form.venueId} onChange={(e) => setForm({ ...form, venueId: e.target.value })} required>
                <option value="">Selecciona</option>
                {venues.map((v) => <option key={v.id} value={v.id}>{v.name}</option>)}
              </select>
            </div>
            <div className="mb-3">
              <label className="form-label">Nombre *</label>
              <input className="form-control" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Gradas Norte" required />
            </div>
            <div className="row">
              <div className="col-md-4 mb-3">
                <label className="form-label">Tipo</label>
                <select className="form-select" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                  {SECTION_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
              <div className="col-md-4 mb-3">
                <label className="form-label">Capacidad</label>
                <input type="number" min="1" className="form-control" value={form.capacity} onChange={(e) => setForm({ ...form, capacity: e.target.value })} required />
              </div>
              <div className="col-md-4 mb-3 d-flex align-items-end">
                <div className="form-check">
                  <input className="form-check-input" type="checkbox" checked={form.isNumbered} onChange={(e) => setForm({ ...form, isNumbered: e.target.checked })} id="numbered" />
                  <label className="form-check-label" htmlFor="numbered">Sillas numeradas</label>
                </div>
              </div>
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
