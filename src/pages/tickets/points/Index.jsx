import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Swal from 'sweetalert2';
import {
  adjustPoints,
  clearPointsState,
  getPointsTransactions,
  getPointsWallet,
} from '../../../store/tickets/pointsSlice';
import { formatDateTime } from '../../../utils/ticketsApi';

export default function TicketPointsIndex() {
  const dispatch = useDispatch();
  const { wallet, transactions = [], loading, saving } = useSelector(
    (state) => state.ticketPoints,
  );
  const [userId, setUserId] = useState('');
  const [adjustForm, setAdjustForm] = useState({ amount: '', description: '' });

  const handleSearch = () => {
    if (!userId.trim()) return;
    dispatch(getPointsWallet(userId.trim()));
    dispatch(getPointsTransactions(userId.trim()));
  };

  const handleAdjust = async (e) => {
    e.preventDefault();
    try {
      await dispatch(
        adjustPoints({
          userId: userId.trim(),
          amount: Number(adjustForm.amount),
          description: adjustForm.description.trim(),
        }),
      ).unwrap();
      dispatch(getPointsTransactions(userId.trim()));
      Swal.fire({ icon: 'success', title: 'Puntos ajustados' });
      setAdjustForm({ amount: '', description: '' });
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Error', text: String(err) });
    }
  };

  const handleClear = () => {
    setUserId('');
    dispatch(clearPointsState());
  };

  return (
    <div className="container-fluid">
      <div className="card shadow">
        <div className="card-header"><h4 className="mb-0">Boletos — Puntos de usuarios</h4></div>
        <div className="card-body">
          <div className="row g-2 mb-4">
            <div className="col-md-4">
              <input className="form-control font-monospace" placeholder="ID usuario (customer-auth)" value={userId} onChange={(e) => setUserId(e.target.value)} />
            </div>
            <div className="col-md-2">
              <button type="button" className="btn btn-primary" onClick={handleSearch} disabled={loading}>Buscar</button>
            </div>
            <div className="col-md-2">
              <button type="button" className="btn btn-outline-secondary" onClick={handleClear}>Limpiar</button>
            </div>
          </div>

          {wallet && (
            <>
              <div className="alert alert-info">
                <strong>Balance actual:</strong> {wallet.balance} puntos
              </div>
              <form className="row g-2 mb-4 border rounded p-3" onSubmit={handleAdjust}>
                <div className="col-md-2">
                  <input type="number" className="form-control" placeholder="+/-" value={adjustForm.amount} onChange={(e) => setAdjustForm({ ...adjustForm, amount: e.target.value })} required />
                </div>
                <div className="col-md-6">
                  <input className="form-control" placeholder="Motivo del ajuste" value={adjustForm.description} onChange={(e) => setAdjustForm({ ...adjustForm, description: e.target.value })} required />
                </div>
                <div className="col-md-2">
                  <button type="submit" className="btn btn-warning w-100" disabled={saving}>Ajustar</button>
                </div>
              </form>
              <h5>Historial</h5>
              <div className="table-responsive">
                <table className="table table-sm table-bordered">
                  <thead className="table-light">
                    <tr>
                      <th>Fecha</th>
                      <th>Monto</th>
                      <th>Tipo</th>
                      <th>Descripción</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((tx) => (
                      <tr key={tx.id}>
                        <td>{formatDateTime(tx.createdAt)}</td>
                        <td>{tx.amount > 0 ? `+${tx.amount}` : tx.amount}</td>
                        <td>{tx.type}</td>
                        <td>{tx.description}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
