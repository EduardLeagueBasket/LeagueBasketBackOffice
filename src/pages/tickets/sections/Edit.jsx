import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import Swal from 'sweetalert2';
import { ClipLoader } from 'react-spinners';
import ButtonNavigation from '../../../components/Button/ButtonNavigation';
import { getTicketSections, updateTicketSection } from '../../../store/tickets/sectionsSlice';
import { SECTION_TYPES } from '../../../utils/ticketsApi';

export default function TicketSectionEdit() {
  const { id } = useParams();
  const location = useLocation();
  const venueId = location.state?.venueId;
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { list = [], saving } = useSelector((state) => state.ticketSections);
  const [form, setForm] = useState(null);

  useEffect(() => {
    if (venueId) {
      dispatch(getTicketSections({ venueId }));
    }
  }, [dispatch, venueId]);

  useEffect(() => {
    const section = list.find((s) => s.id === id);
    if (section) {
      setForm({
        name: section.name ?? '',
        type: section.type ?? 'BLEACHERS',
        capacity: section.capacity ?? '',
        isNumbered: section.isNumbered ?? false,
        active: section.active !== false,
      });
    }
  }, [list, id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await dispatch(updateTicketSection({ id, data: { ...form, capacity: Number(form.capacity) } })).unwrap();
      Swal.fire({ icon: 'success', title: 'Sección actualizada' });
      navigate('/tickets/sections');
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Error', text: String(err) });
    }
  };

  if (!form) return <div className="text-center py-5"><ClipLoader color="#0d6efd" /></div>;

  return (
    <div className="container mt-4">
      <div className="card shadow">
        <div className="card-header d-flex justify-content-between">
          <h4>Editar sección</h4>
          <ButtonNavigation url="/tickets/sections" icon="bi bi-arrow-left" text="Volver" />
        </div>
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label">Nombre</label>
              <input className="form-control" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
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
                <input type="number" className="form-control" value={form.capacity} onChange={(e) => setForm({ ...form, capacity: e.target.value })} required />
              </div>
            </div>
            <div className="form-check mb-2">
              <input className="form-check-input" type="checkbox" checked={form.isNumbered} onChange={(e) => setForm({ ...form, isNumbered: e.target.checked })} id="num" />
              <label className="form-check-label" htmlFor="num">Numeradas</label>
            </div>
            <div className="form-check mb-3">
              <input className="form-check-input" type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} id="act" />
              <label className="form-check-label" htmlFor="act">Activo</label>
            </div>
            <button type="submit" className="btn btn-primary" disabled={saving}>Actualizar</button>
          </form>
        </div>
      </div>
    </div>
  );
}
