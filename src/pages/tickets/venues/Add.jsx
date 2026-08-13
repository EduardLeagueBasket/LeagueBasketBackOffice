import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { ClipLoader } from 'react-spinners';
import ButtonNavigation from '../../../components/Button/ButtonNavigation';
import { createTicketVenue } from '../../../store/tickets/venuesSlice';

export default function TicketVenueAdd() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { saving } = useSelector((state) => state.ticketVenues);
  const [form, setForm] = useState({
    name: '',
    city: '',
    country: '',
    capacity: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await dispatch(
        createTicketVenue({
          name: form.name.trim(),
          city: form.city.trim(),
          country: form.country.trim(),
          capacity: Number(form.capacity),
        }),
      ).unwrap();
      Swal.fire({ icon: 'success', title: 'Cancha creada' });
      navigate('/tickets/venues');
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Error', text: String(err) });
    }
  };

  return (
    <div className="container mt-4">
      <div className="card shadow">
        <div className="card-header d-flex justify-content-between">
          <h4>Nueva cancha</h4>
          <ButtonNavigation url="/tickets/venues" icon="bi bi-arrow-left" text="Volver" />
        </div>
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label">Nombre *</label>
              <input className="form-control" name="name" value={form.name} onChange={handleChange} required />
            </div>
            <div className="row">
              <div className="col-md-4 mb-3">
                <label className="form-label">Ciudad *</label>
                <input className="form-control" name="city" value={form.city} onChange={handleChange} required />
              </div>
              <div className="col-md-4 mb-3">
                <label className="form-label">País *</label>
                <input className="form-control" name="country" value={form.country} onChange={handleChange} required />
              </div>
              <div className="col-md-4 mb-3">
                <label className="form-label">Capacidad *</label>
                <input type="number" min="1" className="form-control" name="capacity" value={form.capacity} onChange={handleChange} required />
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
