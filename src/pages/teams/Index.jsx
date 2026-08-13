import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ClipLoader } from 'react-spinners';
import ButtonNavigation from '../../components/Button/ButtonNavigation';
import GenericTable from '../../components/Table.jsx/GenericTable';
import { getTeams } from '../../store/teams/listTeamsSlice';

const Teams = () => {
  const dispatch = useDispatch();
  const { teams = [], loading = false, error = null } = useSelector(
    (state) => state.teamsList || {},
  );

  useEffect(() => {
    dispatch(getTeams());
  }, [dispatch]);

  const columns = [
    {
      key: 'logo',
      header: 'Logo',
      cell: (item) => (
        <div className="text-center">
          {item.logo ? (
            <img
              src={item.logo}
              alt=""
              className="rounded"
              style={{ width: '40px', height: '40px', objectFit: 'cover' }}
            />
          ) : (
            <span className="text-muted">—</span>
          )}
        </div>
      ),
    },
    {
      key: 'name',
      header: 'Nombre',
      accessor: 'name',
    },
    {
      key: 'competition',
      header: 'Competencia',
      cell: (item) => {
        const c = item.competition;
        if (c?.name) {
          return (
            <span>
              {c.name}
              {c.season ? (
                <span className="text-muted small"> — {c.season}</span>
              ) : null}
            </span>
          );
        }
        return item.competitionId ?? '—';
      },
    },
    {
      key: 'groupId',
      header: 'Grupo',
      cell: (item) => item.groupId ?? '—',
    },
  ];

  if (loading && teams.length === 0) {
    return (
      <div className="container">
        <div className="card">
          <div className="card-body text-center py-5">
            <ClipLoader color="#007bff" size={50} />
            <p className="mt-3 mb-0">Cargando equipos…</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container">
        <div className="alert alert-danger">
          <i className="bi bi-exclamation-triangle me-2"></i>
          Error al cargar equipos.
          {typeof error === 'string' ? ` ${error}` : ''}
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="card">
        <div className="card-header d-flex justify-content-between align-items-center">
          <h4 className="mb-0">Gestión de Equipos</h4>
          <ButtonNavigation url="/teams/add" icon="bi bi-plus-lg" text="Crear nuevo equipo" />
        </div>

        <div className="card-body">
          {teams.length === 0 ? (
            <div className="text-center py-5">
              <i className="bi bi-people display-4 text-muted"></i>
              <h5 className="mt-3 text-muted">No hay equipos registrados</h5>
              <p className="text-muted small mb-0">Crea el primero con el botón superior.</p>
            </div>
          ) : (
            <GenericTable
              data={teams}
              columns={columns}
              showActions={false}
              loading={loading}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Teams;
