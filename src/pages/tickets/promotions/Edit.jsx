import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import Swal from 'sweetalert2';
import ButtonNavigation from '../../../components/Button/ButtonNavigation';
import {
  clearTicketPromotionDetail,
  getTicketPromotion,
  updateTicketPromotion,
} from '../../../store/tickets/promotionsSlice';
import { PROMOTION_TYPES, toDatetimeLocal } from '../../../utils/ticketsApi';

export default function TicketPromotionEdit() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { item, saving } = useSelector((state) => state.ticketPromotions);
  const [form, setForm] = useState(null);

  useEffect(() => {
    dispatch(getTicketPromotion(id));
    return () => dispatch(clearTicketPromotionDetail());
  }, [dispatch, id]);

  useEffect(() => {
    if (item) {
      setForm({
        name: item.name ?? '',
        type: item.type ?? 'PERCENTAGE',
        value: item.value ?? '',
        startDate: toDatetimeLocal(item.startDate),
        endDate: toDatetimeLocal(item.endDate),
        active: item.active !== false,
      });
    }
  }, [item]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await dispatch(
        updateTicketPromotion({
          id,
          data: {
            name: form.name.trim(),
            type: form.type,
            value: Number(form.value),
            startDate: new Date(form.startDate).toISOString(),
            endDate: new Date(form.endDate).toISOString(),
            active: form.active,
          },
        }),
      ).unwrap();
      Swal.fire({ icon: 'success', title: 'Promoción actualizada' });
      navigate('/tickets/promotions');
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Error', text: String(err) });
    }
  };

  if (!form) return null;

  return (
    <div className="container mt-4">
      <div className="card shadow">
        <div className="card-header d-flex justify-content-between">
          <h4>Editar promoción</h4>
          <ButtonNavigation url="/tickets/promotions" icon="bi bi-arrow-left" text="Volver" />
        </div>
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <input className="form-control" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div className="row">
              <div className="col-md-4 mb-3">
                <select className="form-select" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                  {PROMOTION_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
              <div className="col-md-4 mb-3">
                <input type="number" className="form-control" value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} required />
              </div>
            </div>
            <div className="row">
              <div className="col-md-6 mb-3">
                <input type="datetime-local" className="form-control" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} />
              </div>
              <div className="col-md-6 mb-3">
                <input type="datetime-local" className="form-control" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} />
              </div>
            </div>
            <div className="form-check mb-3">
              <input className="form-check-input" type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} id="promoActive" />
              <label className="form-check-label" htmlFor="promoActive">Activo</label>
            </div>
            <button type="submit" className="btn btn-primary" disabled={saving}>Actualizar</button>
          </form>
        </div>
      </div>
    </div>
  );
}
