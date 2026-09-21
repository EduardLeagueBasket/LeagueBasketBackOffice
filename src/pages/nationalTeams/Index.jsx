import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { ClipLoader } from "react-spinners";
import ButtonNavigation from "../../components/Button/ButtonNavigation";
import { getNationalTeams } from '../../store/nationalTeams/getNationalTeamsSlice';
import GenericTable from '../../components/Table.jsx/GenericTable';
import Swal from 'sweetalert2';
import { deactivateNationalTeam } from '../../store/nationalTeams/updateNationalTeamSlice';

export default function NationalTeams() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { nationalTeams = [], loading = false, error = null } = useSelector(state => state.nationalTeams);

  const [typeFilter, setTypeFilter] = useState('');

  useEffect(() => {
    dispatch(getNationalTeams(typeFilter ? { type: typeFilter } : {}));
  }, [dispatch, typeFilter]);

  const handleEdit = (item) => {
    navigate(`/nationals-teams/edit/${item.id}`);
  };

  const handleDelete = (item) => {
    Swal.fire({
      icon: 'warning',
      title: 'Desactivar selección',
      text: `¿Seguro que deseas desactivar "${item.name}"?`,
      showCancelButton: true,
      confirmButtonText: 'Sí, desactivar',
      cancelButtonText: 'Cancelar',
    }).then(async (result) => {
      if (!result.isConfirmed) return;
      try {
        await dispatch(deactivateNationalTeam(item.id)).unwrap();
        dispatch(getNationalTeams(typeFilter ? { type: typeFilter } : {}));
      } catch (err) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: typeof err === 'string' ? err : 'No se pudo desactivar.',
        });
      }
    });
  };

  const columns = [
    {
      key: 'logo',
      header: 'Logo',
      cell: (item) => (
        <div className="text-center">
          {item.logo ? (
            <img
              src={item.logo}
              alt={`Logo ${item.name}`}
              className="rounded-circle"
              style={{ width: '40px', height: '40px', objectFit: 'cover' }}
            />
          ) : (
            <div
              className="rounded-circle bg-secondary d-flex align-items-center justify-content-center"
              style={{ width: '40px', height: '40px' }}
            >
              <i className="bi bi-flag text-white"></i>
            </div>
          )}
        </div>
      )
    },
    {
      key: 'name',
      header: 'Nombre',
      accessor: 'name'
    },
    {
      key: 'type',
      header: 'Tipo',
      cell: (item) => (item.type === 'regional' ? 'Regional' : 'Nacional')
    },
    {
      key: 'region',
      header: 'Región',
      cell: (item) => item.region || '--'
    },
    {
      key: 'countryCode',
      header: 'Código',
      accessor: 'countryCode'
    },
    {
      key: 'gender',
      header: 'Género',
      accessor: 'gender'
    },
    {
      key: 'category',
      header: 'Categoría',
      accessor: 'category'
    },
    {
      key: 'competition',
      header: 'Competencia',
      accessor: 'competition.name',
      cell: (item) => item?.competition?.name ?? '--'
    },
    {
      key: 'isActive',
      header: 'Activo',
      accessor: 'isActive',
      cell: (item) => (item.isActive ? 'Sí' : 'No')
    },
    {
      key: 'createdAt',
      header: 'Fecha de Creación',
      cell: (item) => new Date(item.createdAt).toLocaleDateString('es-ES')
    }
  ];

  if (loading) {
    return (
      <div className="container">
        <div className="card">
          <div className="card-body text-center">
            <ClipLoader color="#007bff" size={50} />
            <p className="mt-3">Cargando equipos nacionales...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container">
        <div className="card">
          <div className="card-body text-center">
            <div className="alert alert-danger">
              <i className="bi bi-exclamation-triangle me-2"></i>
              Error al cargar los equipos nacionales: {error}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="card">
        <div className="card-header d-flex justify-content-between align-items-center">
          <h4 className="mb-0">Selecciones y equipos regionales</h4>
          <div className="d-flex gap-2 align-items-center">
            <select
              className="form-select"
              style={{ width: 180 }}
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <option value="">Todos</option>
              <option value="national_team">Nacionales</option>
              <option value="regional">Regionales</option>
            </select>
            <ButtonNavigation url="/nationals-teams/add" icon="bi bi-plus-lg" text="Agregar" />
          </div>
        </div>

        <div className="card-body">
          {nationalTeams.length === 0 ? (
            <div className="text-center py-5">
              <i className="bi bi-flag display-1 text-muted"></i>
              <h5 className="mt-3 text-muted">No hay equipos registrados</h5>
              <p className="text-muted">Comienza agregando el primero</p>
            </div>
          ) : (
            <GenericTable
              data={nationalTeams}
              columns={columns}
              onEdit={handleEdit}
              onDelete={handleDelete}
              loading={loading}
            />
          )}
        </div>
      </div>
    </div>
  );
}