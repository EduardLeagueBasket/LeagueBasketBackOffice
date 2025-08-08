import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { ClipLoader } from "react-spinners";
import ButtonNavigation from '../../components/Button/ButtonNavigation';
import { getPlayers } from '../../store/player/getPlayersSlice';
import { getNationalTeamPlayers } from '../../store/player/getNationalTeamPlayersSlice';
import GenericTable from '../../components/Table.jsx/GenericTable';

const PlayersByType = () => {
  const dispatch = useDispatch();
  const { type } = useParams(); // 'league' o 'national'

  const { players = [], pagination = { currentPage: 1, totalPages: 0, totalUsers: 0, pageSize: 10 }, loading = false } = useSelector((state) => state.getPlayers);
  const { players: nationalPlayers = [], loading: nationalLoading = false } = useSelector((state) => state.nationalTeamPlayers);

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortField, setSortField] = useState('');
  const [sortDirection, setSortDirection] = useState('asc');

  const isNationalTeam = type === 'national';
  const currentPlayers = isNationalTeam ? nationalPlayers : players;
  const currentLoading = isNationalTeam ? nationalLoading : loading;

  useEffect(() => {
    if (isNationalTeam) {
      dispatch(getNationalTeamPlayers({ page: currentPage, pageSize: pageSize, sortField: sortField, sortDirection: sortDirection }));
    } else {
      dispatch(getPlayers({ page: currentPage, pageSize: pageSize, sortField: sortField, sortDirection: sortDirection }));
    }
  }, [dispatch, currentPage, pageSize, sortField, sortDirection, isNationalTeam]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
    setCurrentPage(1);
  };

  const getTitle = () => {
    return isNationalTeam ? 'Jugadores de Selecciones Nacionales' : 'Jugadores de Equipos de Liga';
  };

  const getColumns = () => [
    { header: 'Nombre', accessor: 'firstName', sortable: true },
    { header: 'Apellido', accessor: 'lastName', sortable: true },
    { header: 'Fecha de Nacimiento', accessor: 'birthDate', sortable: true },
    { header: 'País', accessor: 'nationality', sortable: true },
    { header: 'Número de Camiseta', accessor: 'jerseyNumber', sortable: true },
    { header: 'Posición', accessor: 'position', sortable: true },
    {
      header: 'Equipo',
      accessor: 'teamName',
      sortable: true,
      cell: (item) => item.teamName || 'N/A'
    },
    {
      header: 'Imagen',
      accessor: 'logo',
      sortable: true,
      cell: (item) =>
        item.imageUrl ? <img src={`${item.imageUrl}`} className="rounded" alt="..." width="50" height="50" /> : <i className="bi bi-x-circle text-danger"></i>
    }
  ];

  if (currentLoading) {
    return (
      <div className="container">
        <div className="card">
          <div className="card-body text-center">
            <ClipLoader color="#007bff" size={50} />
            <p className="mt-3">Cargando jugadores...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="card">
        <div className="card-header d-flex justify-content-between align-items-center">
          <h4 className="mb-0">{getTitle()}</h4>
          <div className="d-flex gap-2">
            <ButtonNavigation url="/players/add" icon="bi bi-plus-lg" text="Agregar Jugador" />
            <ButtonNavigation url="/players" icon="bi bi-arrow-left" text="Volver" />
          </div>
        </div>

        <div className="card-body">
          {currentPlayers.length === 0 ? (
            <div className="text-center py-5">
              <i className={`bi ${isNationalTeam ? 'bi-flag' : 'bi-people'} display-1 text-muted`}></i>
              <h5 className="mt-3 text-muted">
                No hay jugadores de {isNationalTeam ? 'selecciones nacionales' : 'equipos de liga'} registrados
              </h5>
              <p className="text-muted">
                Comienza agregando el primer jugador
              </p>
            </div>
          ) : (
            <div className="table-responsive">
              <GenericTable
                columns={getColumns()}
                data={currentPlayers}
                onEdit={() => { }}
                onDelete={() => { }}
                pageSize={pageSize}
                loading={currentLoading}
                currentPage={currentPage}
                totalPages={isNationalTeam ? 1 : pagination.totalPages}
                onPageChange={setCurrentPage}
                onSort={handleSort}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PlayersByType; 