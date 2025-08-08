import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { ClipLoader } from "react-spinners";
import Swal from 'sweetalert2';
import ButtonNavigation from "../../components/Button/ButtonNavigation";
import { getNationalGames } from '../../store/nationalGames/getNationalGamesSlice';
import { deleteNationalGame } from '../../store/nationalGames/deleteNationalGameSlice';
import GenericTable from '../../components/Table.jsx/GenericTable';
import { getGameTypeLabel, getGameTypeBadgeClass } from '../../utils/gameTypes';

export default function NationalGames() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { nationalGames = [], loading = false, error = null } = useSelector(state => state.nationalGames);
  const { success: deleteSuccess } = useSelector(state => state.deleteNationalGame);

  useEffect(() => {
    dispatch(getNationalGames());
  }, [dispatch]);

  useEffect(() => {
    if (deleteSuccess) {
      dispatch(getNationalGames());
    }
  }, [deleteSuccess, dispatch]);

  const handleEdit = (item) => {
    navigate(`/national-games/edit/${item.id}`);
  };

  const handleDelete = (item) => {
    Swal.fire({
      title: '¿Estás seguro?',
      text: `¿Deseas eliminar el juego contra ${item.opponentName}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        dispatch(deleteNationalGame(item.id));
      }
    });
  };

  const columns = [
    {
      key: 'nationalTeam',
      header: 'Equipo Nacional',
      cell: (item) => (
        <div className="d-flex align-items-center">
          {item.nationalTeam?.logoUrl && (
            <img
              src={item.nationalTeam.logoUrl}
              alt={`Logo ${item.nationalTeam.name}`}
              className="rounded-circle me-2"
              style={{ width: '30px', height: '30px', objectFit: 'cover' }}
            />
          )}
          <span>{item.nationalTeam?.name || 'N/A'}</span>
        </div>
      )
    },
    {
      key: 'opponentName',
      header: 'Rival',
      accessor: 'opponentName'
    },
    {
      key: 'gameDate',
      header: 'Fecha del Juego',
      cell: (item) => new Date(item.gameDate).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    },
    {
      key: 'location',
      header: 'Ubicación',
      accessor: 'location'
    },
    {
      key: 'gameType',
      header: 'Tipo de Juego',
      cell: (item) => (
        <span className={`badge ${getGameTypeBadgeClass(item.gameType)}`}>
          {getGameTypeLabel(item.gameType)}
        </span>
      )
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
            <p className="mt-3">Cargando juegos nacionales...</p>
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
              Error al cargar los juegos nacionales: {error}
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
          <h4 className="mb-0">Juegos de Equipos Nacionales</h4>
          <ButtonNavigation url="/national-games/add" icon="bi bi-plus-lg" text="Agregar Juego" />
        </div>

        <div className="card-body">
          {nationalGames.length === 0 ? (
            <div className="text-center py-5">
              <i className="bi bi-calendar-event display-1 text-muted"></i>
              <h5 className="mt-3 text-muted">No hay juegos nacionales registrados</h5>
              <p className="text-muted">Comienza agregando el primer juego</p>
            </div>
          ) : (
            <GenericTable
              data={nationalGames}
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