import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { ClipLoader } from 'react-spinners';
import Swal from 'sweetalert2';
import ButtonNavigation from '../../../components/Button/ButtonNavigation';
import GenericTable from '../../../components/Table.jsx/GenericTable';
import {
  deactivateRetailProduct,
  getRetailProducts,
} from '../../../store/retail/productsSlice';
import { getRetailCategories } from '../../../store/retail/categoriesSlice';
import { getNationalTeams } from '../../../store/nationalTeams/getNationalTeamsSlice';
import { getTeams } from '../../../store/teams/listTeamsSlice';
import { getUsers } from '../../../store/usersSlice';
import {
  formatCategoria,
  formatTeamType,
  productMainImage,
  productMinPrice,
  productTotalStock,
} from '../../../utils/retailApi';
import { formatErrorForDisplay } from '../../../utils/apiErrorMessage';
import '../../../styles/retail.css';

export default function RetailProductsIndex() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { products = [], loading, error } = useSelector(
    (state) => state.retailProducts,
  );
  const { categories = [] } = useSelector((state) => state.retailCategories);
  const { nationalTeams = [] } = useSelector((state) => state.nationalTeams);
  const { teams = [] } = useSelector((state) => state.teamsList);
  const { users = [] } = useSelector((state) => state.users);

  const [filters, setFilters] = useState({
    teamType: '',
    teamId: '',
    categoria: '',
    activo: '',
  });

  const creatorMap = useMemo(() => {
    const map = {};
    users.forEach((u) => {
      map[u.id] = u.email || u.name || u.id;
    });
    return map;
  }, [users]);

  const teamNameMap = useMemo(() => {
    const map = {};
    nationalTeams.forEach((t) => {
      map[`NACIONAL:${t.id}`] = t.name;
    });
    teams.forEach((t) => {
      map[`LIGA:${t.id}`] = t.name;
    });
    return map;
  }, [nationalTeams, teams]);

  const loadProducts = () => {
    const params = {};
    if (filters.teamType) params.teamType = filters.teamType;
    if (filters.teamId) params.teamId = filters.teamId;
    if (filters.categoria) params.categoria = filters.categoria;
    if (filters.activo !== '') params.activo = filters.activo === 'true';
    dispatch(getRetailProducts(params));
  };

  useEffect(() => {
    dispatch(getRetailCategories());
    dispatch(getNationalTeams());
    dispatch(getTeams());
    dispatch(getUsers({ page: 1, limit: 200 }));
  }, [dispatch]);

  useEffect(() => {
    if( filters.teamId  ) {
      loadProducts();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.teamType, filters.teamId, filters.categoria, filters.activo]);

  const teamOptions =
    filters.teamType === 'NACIONAL'
      ? nationalTeams
      : filters.teamType === 'LIGA'
        ? teams
        : [];

  const handleDeactivate = (item) => {
    Swal.fire({
      icon: 'warning',
      title: 'Desactivar producto',
      text: `¿Desactivar "${item.nombre}"?`,
      showCancelButton: true,
      confirmButtonText: 'Sí, desactivar',
      cancelButtonText: 'Cancelar',
    }).then(async (result) => {
      if (!result.isConfirmed) return;
      try {
        await dispatch(deactivateRetailProduct(item.id)).unwrap();
        loadProducts();
      } catch (err) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: formatErrorForDisplay(err),
        });
      }
    });
  };

  const columns = [
    {
      key: 'imagen',
      header: 'Imagen',
      cell: (item) => {
        const src = productMainImage(item);
        return src ? (
          <img
            src={src}
            alt=""
            className="rounded"
            style={{ width: 48, height: 48, objectFit: 'cover' }}
          />
        ) : (
          <span className="text-muted">—</span>
        );
      },
    },
    { key: 'nombre', header: 'Nombre', accessor: 'nombre' },
    {
      key: 'categoria',
      header: 'Categoría',
      cell: (item) => formatCategoria(item.categoria),
    },
    {
      key: 'equipo',
      header: 'Equipo',
      cell: (item) =>
        teamNameMap[`${item.teamType}:${item.teamId}`] ??
        formatTeamType(item.teamType),
    },
    {
      key: 'precio',
      header: 'Desde',
      cell: (item) => {
        const p = productMinPrice(item);
        return p != null ? `$${p.toFixed(2)}` : '—';
      },
    },
    {
      key: 'stock',
      header: 'Stock',
      cell: (item) => productTotalStock(item),
    },
    {
      key: 'creadoPor',
      header: 'Creado por',
      cell: (item) =>
        item.creadoPorId
          ? creatorMap[item.creadoPorId] ?? `${item.creadoPorId.slice(0, 8)}…`
          : '—',
    },
    {
      key: 'activo',
      header: 'Activo',
      cell: (item) => (
        <span
          className={`badge ${item.activo ? 'bg-success' : 'bg-secondary'}`}
        >
          {item.activo ? 'Sí' : 'No'}
        </span>
      ),
    },
  ];

  return (
    <div className="container-fluid">
      <div className="card shadow">
        <div className="card-header d-flex flex-wrap justify-content-between align-items-center gap-2">
          <h4 className="mb-0">Tienda — Productos</h4>
          <ButtonNavigation
            url="/retail/products/add"
            icon="bi bi-plus-lg"
            text="Nuevo producto"
          />
        </div>
        <div className="card-body">
          <div className="row g-2 mb-3 retail-filters">
            <div className="col-md-2">
              <select
                className="form-select"
                value={filters.teamType}
                onChange={(e) =>
                  setFilters({
                    teamType: e.target.value,
                    teamId: '',
                    categoria: filters.categoria,
                    activo: filters.activo,
                  })
                }
              >
                <option value="">Tipo equipo</option>
                <option value="NACIONAL">Selección nacional</option>
                <option value="LIGA">Equipo de liga</option>
              </select>
            </div>
            <div className="col-md-3">
              <select
                className="form-select"
                value={filters.teamId}
                disabled={!filters.teamType}
                onChange={(e) =>
                  setFilters((f) => ({ ...f, teamId: e.target.value }))
                }
              >
                <option value="">Todos los equipos</option>
                {teamOptions.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-md-2">
              <select
                className="form-select"
                value={filters.categoria}
                onChange={(e) =>
                  setFilters((f) => ({ ...f, categoria: e.target.value }))
                }
              >
                <option value="">Categoría</option>
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {formatCategoria(c)}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-md-2">
              <select
                className="form-select"
                value={filters.activo}
                onChange={(e) =>
                  setFilters((f) => ({ ...f, activo: e.target.value }))
                }
              >
                <option value="">Estado</option>
                <option value="true">Activos</option>
                <option value="false">Inactivos</option>
              </select>
            </div>
          </div>

          {error && (
            <div className="alert alert-danger">
              {formatErrorForDisplay(error)}
            </div>
          )}

          {loading && products.length === 0 ? (
            <div className="text-center py-5">
              <ClipLoader color="#0d6efd" />
            </div>
          ) : (
            <GenericTable
              columns={columns}
              data={products}
              loading={loading}
              onEdit={(item) => navigate(`/retail/products/edit/${item.id}`)}
              onDelete={handleDeactivate}
            />
          )}
        </div>
      </div>
    </div>
  );
}
