import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { ClipLoader } from 'react-spinners';
import GenericTable from '../../../components/Table.jsx/GenericTable';
import { getRetailOrders } from '../../../store/retail/ordersSlice';
import {
  formatEstadoPedido,
  formatTeamType,
} from '../../../utils/retailApi';
import { formatErrorForDisplay } from '../../../utils/apiErrorMessage';
import '../../../styles/retail.css';

export default function RetailOrdersIndex() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { orders = [], loading, error } = useSelector(
    (state) => state.retailOrders,
  );

  const [filters, setFilters] = useState({
    teamType: '',
    estado: '',
    usuarioId: '',
  });

  const load = () => {
    const params = {};
    if (filters.teamType) params.teamType = filters.teamType;
    if (filters.estado) params.estado = filters.estado;
    if (filters.usuarioId.trim()) params.usuarioId = filters.usuarioId.trim();
    dispatch(getRetailOrders(params));
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.teamType, filters.estado]);

  const columns = [
    { key: 'numero', header: 'Nº pedido', accessor: 'numero' },
    {
      key: 'usuario',
      header: 'Cliente (usuarioId)',
      cell: (item) => (
        <span className="font-monospace small">
          {item.usuarioId?.slice(0, 12)}…
        </span>
      ),
    },
    {
      key: 'teamType',
      header: 'Tipo',
      cell: (item) => formatTeamType(item.teamType),
    },
    {
      key: 'total',
      header: 'Total',
      cell: (item) => `$${Number(item.total || 0).toFixed(2)}`,
    },
    {
      key: 'estado',
      header: 'Estado',
      cell: (item) => (
        <span className="badge bg-info text-dark">
          {formatEstadoPedido(item.estado)}
        </span>
      ),
    },
    {
      key: 'fecha',
      header: 'Fecha',
      cell: (item) =>
        item.creadoEn
          ? new Date(item.creadoEn).toLocaleString('es')
          : '—',
    },
  ];

  return (
    <div className="container-fluid">
      <div className="card shadow">
        <div className="card-header">
          <h4 className="mb-0">Tienda — Compras de clientes</h4>
        </div>
        <div className="card-body">
          <div className="row g-2 mb-3 retail-filters">
            <div className="col-md-2">
              <select
                className="form-select"
                value={filters.teamType}
                onChange={(e) =>
                  setFilters((f) => ({ ...f, teamType: e.target.value }))
                }
              >
                <option value="">Tipo equipo</option>
                <option value="NACIONAL">Nacional</option>
                <option value="LIGA">Liga</option>
              </select>
            </div>
            <div className="col-md-2">
              <select
                className="form-select"
                value={filters.estado}
                onChange={(e) =>
                  setFilters((f) => ({ ...f, estado: e.target.value }))
                }
              >
                <option value="">Estado</option>
                <option value="PENDIENTE">Pendiente</option>
                <option value="PAGADO">Pagado</option>
                <option value="ENVIADO">Enviado</option>
                <option value="ENTREGADO">Entregado</option>
                <option value="CANCELADO">Cancelado</option>
              </select>
            </div>
            <div className="col-md-4">
              <input
                type="text"
                className="form-control"
                placeholder="Filtrar por usuarioId"
                value={filters.usuarioId}
                onChange={(e) =>
                  setFilters((f) => ({ ...f, usuarioId: e.target.value }))
                }
                onKeyDown={(e) => e.key === 'Enter' && load()}
              />
            </div>
            <div className="col-md-2">
              <button
                type="button"
                className="btn btn-outline-primary"
                onClick={load}
              >
                Buscar
              </button>
            </div>
          </div>

          {error && (
            <div className="alert alert-danger">
              {formatErrorForDisplay(error)}
            </div>
          )}

          {loading && orders.length === 0 ? (
            <div className="text-center py-5">
              <ClipLoader color="#0d6efd" />
            </div>
          ) : (
            <GenericTable
              columns={columns}
              data={orders}
              loading={loading}
              onEdit={(item) => navigate(`/retail/orders/${item.id}`)}
              showActions
            />
          )}
        </div>
      </div>
    </div>
  );
}
