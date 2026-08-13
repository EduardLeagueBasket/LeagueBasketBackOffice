import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { ClipLoader } from 'react-spinners';
import ButtonNavigation from '../../../components/Button/ButtonNavigation';
import {
  clearTicketOrderDetail,
  getTicketOrder,
} from '../../../store/tickets/ordersSlice';
import { formatOrderStatus, formatTicketOrigin, formatTicketStatus } from '../../../utils/ticketsApi';

export default function TicketOrderDetail() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { item, detailLoading } = useSelector((state) => state.ticketOrders);

  useEffect(() => {
    dispatch(getTicketOrder(id));
    return () => dispatch(clearTicketOrderDetail());
  }, [dispatch, id]);

  if (detailLoading && !item) {
    return <div className="text-center py-5"><ClipLoader color="#0d6efd" /></div>;
  }

  return (
    <div className="container mt-4">
      <div className="card shadow">
        <div className="card-header d-flex justify-content-between">
          <h4>Orden de boletos</h4>
          <ButtonNavigation url="/tickets/orders" icon="bi bi-arrow-left" text="Volver" />
        </div>
        <div className="card-body">
          <div className="row mb-4">
            <div className="col-md-3"><strong>Estado:</strong> {formatOrderStatus(item?.status)}</div>
            <div className="col-md-3"><strong>Total:</strong> ${Number(item?.total ?? 0).toFixed(2)}</div>
            <div className="col-md-6"><strong>Usuario:</strong> <code>{item?.userId}</code></div>
          </div>
          <h5>Boletos</h5>
          <div className="table-responsive">
            <table className="table table-bordered">
              <thead className="table-light">
                <tr>
                  <th>Código</th>
                  <th>Origen</th>
                  <th>Estado</th>
                  <th>Sección</th>
                  <th>Precio</th>
                </tr>
              </thead>
              <tbody>
                {(item?.tickets ?? []).map((t) => (
                  <tr key={t.id}>
                    <td>{t.code}</td>
                    <td>{formatTicketOrigin(t.origin)}</td>
                    <td>{formatTicketStatus(t.status)}</td>
                    <td>{t.section?.name ?? '—'}</td>
                    <td>${Number(t.finalPrice ?? 0).toFixed(2)}</td>
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
