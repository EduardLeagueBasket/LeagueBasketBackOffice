import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { ClipLoader } from "react-spinners";
import ButtonNavigation from "../../components/Button/ButtonNavigation";
import { getNationalTeams } from '../../store/nationalTeams/getNationalTeamsSlice';
import GenericTable from '../../components/Table/GenericTable';

export default function NationalTeams() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { nationalTeams = [], loading = false, error = null } = useSelector(state => state.nationalTeams);

  useEffect(() => {
    dispatch(getNationalTeams());
  }, [dispatch]);

  const handleEdit = (item) => {
    navigate(`/nationals-teams/edit/${item.id}`);
  };

  const handleDelete = (item) => {
    // TODO: Implementar eliminación
    console.log('Eliminar equipo nacional:', item);
  };

  const columns = [
    {
      key: 'logo',
      header: 'Logo',
      cell: (item) => (
        <div className="text-center">
          {item.logoUrl ? (
            <img
              src={item.logoUrl}
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
      key: 'country',
      header: 'País',
      accessor: 'country'
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
          <h4 className="mb-0">Equipos Nacionales</h4>
          <ButtonNavigation url="/nationals-teams/add" icon="bi bi-plus-lg" text="Agregar Equipo Nacional" />
        </div>

        <div className="card-body">
          {nationalTeams.length === 0 ? (
            <div className="text-center py-5">
              <i className="bi bi-flag display-1 text-muted"></i>
              <h5 className="mt-3 text-muted">No hay equipos nacionales registrados</h5>
              <p className="text-muted">Comienza agregando el primer equipo nacional</p>
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