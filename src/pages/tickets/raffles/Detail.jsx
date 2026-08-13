import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import Swal from 'sweetalert2';
import ButtonNavigation from '../../../components/Button/ButtonNavigation';
import {
  assignRafflePrize,
  createRafflePrize,
  getTicketRaffle,
} from '../../../store/tickets/rafflesSlice';
import { PRIZE_TYPES } from '../../../utils/ticketsApi';

export default function TicketRaffleDetail() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { item } = useSelector((state) => state.ticketRaffles);
  const [prizeForm, setPrizeForm] = useState({ type: 'JERSEY', description: '' });

  useEffect(() => {
    dispatch(getTicketRaffle(id));
  }, [dispatch, id]);

  const reload = () => dispatch(getTicketRaffle(id));

  const handleAddPrize = async (e) => {
    e.preventDefault();
    try {
      await dispatch(createRafflePrize({ raffleId: id, data: prizeForm })).unwrap();
      setPrizeForm({ type: 'JERSEY', description: '' });
      reload();
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Error', text: String(err) });
    }
  };

  const handleAssign = async (prize) => {
    const { value: winnerId } = await Swal.fire({
      title: 'Asignar premio',
      input: 'text',
      inputLabel: 'ID usuario ganador',
      showCancelButton: true,
    });
    if (!winnerId) return;
    try {
      await dispatch(assignRafflePrize({ prizeId: prize.id, winnerId })).unwrap();
      reload();
      Swal.fire({ icon: 'success', title: 'Premio asignado' });
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Error', text: String(err) });
    }
  };

  return (
    <div className="container mt-4">
      <div className="card shadow">
        <div className="card-header d-flex justify-content-between">
          <h4>Sorteo — {item?.name ?? '…'}</h4>
          <ButtonNavigation url="/tickets/raffles" icon="bi bi-arrow-left" text="Volver" />
        </div>
        <div className="card-body">
          <form className="row g-2 mb-4" onSubmit={handleAddPrize}>
            <div className="col-md-3">
              <select className="form-select" value={prizeForm.type} onChange={(e) => setPrizeForm({ ...prizeForm, type: e.target.value })}>
                {PRIZE_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
            <div className="col-md-6">
              <input className="form-control" placeholder="Descripción del premio" value={prizeForm.description} onChange={(e) => setPrizeForm({ ...prizeForm, description: e.target.value })} required />
            </div>
            <div className="col-md-3">
              <button type="submit" className="btn btn-primary w-100">Agregar premio</button>
            </div>
          </form>
          <div className="table-responsive">
            <table className="table table-bordered">
              <thead className="table-light">
                <tr>
                  <th>Tipo</th>
                  <th>Descripción</th>
                  <th>Ganador</th>
                  <th>Acción</th>
                </tr>
              </thead>
              <tbody>
                {(item?.prizes ?? []).map((p) => (
                  <tr key={p.id}>
                    <td>{p.type}</td>
                    <td>{p.description}</td>
                    <td><code>{p.winnerId ?? '—'}</code></td>
                    <td>
                      {!p.winnerId && (
                        <button type="button" className="btn btn-sm btn-outline-primary" onClick={() => handleAssign(p)}>
                          Asignar
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
