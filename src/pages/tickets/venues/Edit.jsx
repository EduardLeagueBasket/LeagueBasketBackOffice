import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import Swal from 'sweetalert2';
import { ClipLoader } from 'react-spinners';
import ButtonNavigation from '../../../components/Button/ButtonNavigation';
import {
  clearTicketVenueDetail,
  getTicketVenue,
  updateTicketVenue,
} from '../../../store/tickets/venuesSlice';

export default function TicketVenueEdit() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { item, detailLoading, saving } = useSelector((state) => state.ticketVenues);
  const [form, setForm] = useState({
    name: '',
    city: '',
    country: '',
    capacity: '',
    active: true,
  });

  useEffect(() => {
    dispatch(getTicketVenue(id));
    return () => dispatch(clearTicketVenueDetail());
  }, [dispatch, id]);

  useEffect(() => {
    if (item) {
      setForm({
        name: item.name ?? '',
        city: item.city ?? '',
        country: item.country ?? '',
        capacity: item.capacity ?? '',
        active: item.active !== false,
      });
    }
  }, [item]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await dispatch(
        updateTicketVenue({
          id,
          data: {
            name: form.name.trim(),
            city: form.city.trim(),
            country: form.country.trim(),
            capacity: Number(form.capacity),
            active: form.active,
          },
        }),
      ).unwrap();
      Swal.fire({ icon: 'success', title: 'Cancha actualizada' });
      navigate('/tickets/venues');
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
        <div className="card-header d-flex justify-content-between">
          <h4>Editar cancha</h4>
          <ButtonNavigation url="/tickets/venues" icon="bi bi-arrow-left" text="Volver" />
        </div>
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label">Nombre</label>
              <input className="form-control" name="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div className="row">
              <div className="col-md-4 mb-3">
                <label className="form-label">Ciudad</label>
                <input className="form-control" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} required />
              </div>
              <div className="col-md-4 mb-3">
                <label className="form-label">País</label>
                <input className="form-control" value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} required />
              </div>
              <div className="col-md-4 mb-3">
                <label className="form-label">Capacidad</label>
                <input type="number" className="form-control" value={form.capacity} onChange={(e) => setForm({ ...form, capacity: e.target.value })} required />
              </div>
            </div>
            <div className="form-check mb-3">
              <input className="form-check-input" type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} id="active" />
              <label className="form-check-label" htmlFor="active">Activo</label>
            </div>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? <ClipLoader color="#fff" size={18} /> : 'Actualizar'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
