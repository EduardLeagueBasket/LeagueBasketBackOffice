import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import ButtonNavigation from '../../../components/Button/ButtonNavigation';
import { createTicketPromotion } from '../../../store/tickets/promotionsSlice';
import { PROMOTION_TYPES, toDatetimeLocal } from '../../../utils/ticketsApi';

export default function TicketPromotionAdd() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { saving } = useSelector((state) => state.ticketPromotions);
  const now = toDatetimeLocal(new Date().toISOString());
  const [form, setForm] = useState({
    name: '',
    type: 'PERCENTAGE',
    value: '',
    startDate: now,
    endDate: now,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await dispatch(
        createTicketPromotion({
          name: form.name.trim(),
          type: form.type,
          value: Number(form.value),
          startDate: new Date(form.startDate).toISOString(),
          endDate: new Date(form.endDate).toISOString(),
        }),
      ).unwrap();
      Swal.fire({ icon: 'success', title: 'Promoción creada' });
      navigate('/tickets/promotions');
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Error', text: String(err) });
    }
  };

  return (
    <div className="container mt-4">
      <div className="card shadow">
        <div className="card-header d-flex justify-content-between">
          <h4>Nueva promoción</h4>
          <ButtonNavigation url="/tickets/promotions" icon="bi bi-arrow-left" text="Volver" />
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
                  {PROMOTION_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
              <div className="col-md-4 mb-3">
                <label className="form-label">Valor</label>
                <input type="number" step="0.01" className="form-control" value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} required />
              </div>
            </div>
            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="form-label">Inicio</label>
                <input type="datetime-local" className="form-control" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} required />
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label">Fin</label>
                <input type="datetime-local" className="form-control" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} required />
              </div>
            </div>
            <button type="submit" className="btn btn-primary" disabled={saving}>Guardar</button>
          </form>
        </div>
      </div>
    </div>
  );
}
