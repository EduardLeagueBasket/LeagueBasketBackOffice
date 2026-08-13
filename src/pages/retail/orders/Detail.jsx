import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { ClipLoader } from 'react-spinners';
import Swal from 'sweetalert2';
import ButtonNavigation from '../../../components/Button/ButtonNavigation';
import {
  clearRetailOrderDetail,
  getRetailOrder,
  updateRetailOrderStatus,
} from '../../../store/retail/ordersSlice';
import {
  formatEstadoPedido,
  formatTeamType,
} from '../../../utils/retailApi';
import { formatErrorForDisplay } from '../../../utils/apiErrorMessage';
import '../../../styles/retail.css';

export default function RetailOrderDetail() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { order, detailLoading, saving } = useSelector(
    (state) => state.retailOrders,
  );
  const [estado, setEstado] = useState('');

  useEffect(() => {
    dispatch(getRetailOrder(id));
    return () => dispatch(clearRetailOrderDetail());
  }, [dispatch, id]);

  useEffect(() => {
    if (order?.estado) setEstado(order.estado);
  }, [order]);

  const handleStatusUpdate = async () => {
    if (!estado || estado === order?.estado) return;
    try {
      await dispatch(
        updateRetailOrderStatus({ id, estado }),
      ).unwrap();
      Swal.fire({ icon: 'success', title: 'Estado actualizado' });
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: formatErrorForDisplay(err),
      });
    }
  };

  if (detailLoading || !order) {
    return (
      <div className="text-center py-5">
        <ClipLoader color="#0d6efd" />
      </div>
    );
  }

  const items = order.items || [];

  return (
    <div className="container">
      <div className="card shadow mb-3">
        <div className="card-header d-flex justify-content-between align-items-center">
          <h4 className="mb-0">Pedido {order.numero}</h4>
          <ButtonNavigation
            url="/retail/orders"
            icon="bi bi-arrow-left"
            text="Volver"
          />
        </div>
        <div className="card-body">
          <div className="row mb-3">
            <div className="col-md-6">
              <p className="mb-1">
                <strong>Cliente:</strong>{' '}
                <code>{order.usuarioId}</code>
              </p>
              <p className="mb-1">
                <strong>Equipo:</strong> {formatTeamType(order.teamType)} —{' '}
                <code>{order.teamId}</code>
              </p>
              <p className="mb-1">
                <strong>Fecha:</strong>{' '}
                {order.creadoEn
                  ? new Date(order.creadoEn).toLocaleString('es')
                  : '—'}
              </p>
            </div>
            <div className="col-md-6 text-md-end">
              <p className="mb-1">
                <strong>Subtotal:</strong> $
                {Number(order.subtotal || 0).toFixed(2)}
              </p>
              <p className="mb-1">
                <strong>Descuento:</strong> $
                {Number(order.descuento || 0).toFixed(2)}
              </p>
              <p className="h5 mb-0">
                <strong>Total:</strong> $
                {Number(order.total || 0).toFixed(2)}
              </p>
            </div>
          </div>

          <div className="row align-items-end g-2 mb-4">
            <div className="col-md-4">
              <label className="form-label">Estado del pedido</label>
              <select
                className="form-select"
                value={estado}
                onChange={(e) => setEstado(e.target.value)}
                disabled={saving}
              >
                <option value="PENDIENTE">Pendiente</option>
                <option value="PAGADO">Pagado</option>
                <option value="ENVIADO">Enviado</option>
                <option value="ENTREGADO">Entregado</option>
                <option value="CANCELADO">Cancelado</option>
              </select>
            </div>
            <div className="col-md-4">
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleStatusUpdate}
                disabled={saving || estado === order.estado}
              >
                {saving ? 'Guardando…' : 'Actualizar estado'}
              </button>
            </div>
            <div className="col-md-4">
              <span className="badge bg-secondary fs-6">
                Actual: {formatEstadoPedido(order.estado)}
              </span>
            </div>
          </div>

          <h5>Productos comprados</h5>
          <div className="table-responsive">
            <table className="table table-bordered retail-order-items">
              <thead className="table-light">
                <tr>
                  <th>Imagen</th>
                  <th>Producto</th>
                  <th>SKU</th>
                  <th>Cant.</th>
                  <th>Precio unit.</th>
                  <th>Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id}>
                    <td>
                      {item.imagen ? (
                        <img
                          src={item.imagen}
                          alt=""
                          className="rounded"
                        />
                      ) : (
                        '—'
                      )}
                    </td>
                    <td>{item.nombre}</td>
                    <td>
                      <code>{item.varianteSku}</code>
                    </td>
                    <td>{item.cantidad}</td>
                    <td>${Number(item.precio).toFixed(2)}</td>
                    <td>
                      $
                      {(Number(item.precio) * item.cantidad).toFixed(2)}
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
