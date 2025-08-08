import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
//import { getPlayers } from '../../store/player/getPlayersSlice';
import { ClipLoader } from "react-spinners";
import Swal from 'sweetalert2';
import ButtonNavigation from '../../components/Button/ButtonNavigation';
//import UploadLeagueLogoModal from '../../../components/Modals/UploadLeagueLogo';
import { getPlayers } from '../../store/player/getPlayersSlice';
import GenericTable from '../../components/Table.jsx/GenericTable';


const Players = () => {
  const dispatch = useDispatch();
  const { players = [], pagination = { currentPage: 1, totalPages: 0, totalUsers: 0, pageSize: 10 }, loading = false } = useSelector((state) => state.getPlayers);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('');
  const [sortDirection, setSortDirection] = useState('asc');

  useEffect(() => {
    console.log('Dispatching getPlayers with params:', { page: currentPage, pageSize: pageSize, sortField: sortField, sortDirection: sortDirection });
    dispatch(getPlayers({ page: currentPage, pageSize: pageSize, sortField: sortField, sortDirection: sortDirection }));
  }, [dispatch, currentPage, pageSize, sortField, sortDirection]);

  // Debug: mostrar el estado actual
  useEffect(() => {
    console.log('Current players state:', players);
    console.log('Current pagination state:', pagination);
    console.log('Current loading state:', loading);
  }, [players, pagination, loading]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
    setCurrentPage(1);
  };

  return (
    <div className="container">
      <div className="card">
        <div className="card-header d-flex justify-content-between align-items-center">
          <h4 className="mb-0">Gestión de Jugadores</h4>
          <ButtonNavigation url="/players/add" icon="bi bi-plus-lg" text="Agregar Jugador" />
        </div>

        <div className="card-body">
          <div className="mb-3 d-flex gap-2">
            <ButtonNavigation url="/players/type/league" icon="bi bi-people" text="Jugadores de Liga" />
            <ButtonNavigation url="/players/type/national" icon="bi bi-flag" text="Jugadores Nacionales" />
          </div>

          <div className="table-responsive">
            <GenericTable
              columns={[
                { header: 'Nombre', accessor: 'firstName', sortable: true },
                { header: 'Apellido', accessor: 'lastName', sortable: true },
                { header: 'Fecha de Nacimiento', accessor: 'birthDate', sortable: true },
                { header: 'País', accessor: 'nationality', sortable: true },
                { header: 'Número de Camiseta', accessor: 'jerseyNumber', sortable: true },
                { header: 'Posición', accessor: 'position', sortable: true },
                {
                  header: 'Tipo de Equipo',
                  accessor: 'teamType',
                  sortable: true,
                  cell: (item) => (
                    <span className={`badge ${item.teamType === 'national' ? 'bg-primary' : 'bg-success'}`}>
                      {item.teamType === 'national' ? 'Selección' : 'Liga'}
                    </span>
                  )
                },
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
              ]}
              data={players}
              onEdit={() => { }}
              onDelete={() => { }}
              pageSize={pageSize}
              loading={loading}
              currentPage={currentPage}
              totalPages={pagination.totalPages}
              onPageChange={setCurrentPage}
              onSort={handleSort}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Players;