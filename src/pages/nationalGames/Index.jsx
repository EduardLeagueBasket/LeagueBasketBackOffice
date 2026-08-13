import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { ClipLoader } from "react-spinners";
import Swal from 'sweetalert2';
import ButtonNavigation from "../../components/Button/ButtonNavigation";
import { getNationalGames } from '../../store/nationalGames/getNationalGamesSlice';
import {
  cancelNationalGame,
  resetCancelNationalGameState,
} from '../../store/nationalGames/cancelNationalGameSlice';
import GenericTable from '../../components/Table.jsx/GenericTable';
import { getGameTypeLabel, getGameTypeBadgeClass } from '../../utils/gameTypes';
import {
  filterAndSortNationalMatches,
  canCancelNationalMatch,
} from '../../utils/nationalMatchApi';
import {
  nationalMatchListFilters,
  getNationalMatchStatusLabel,
  getNationalMatchStatusBadgeClass,
} from '../../utils/matchStatusLabels';
import { formatErrorForDisplay } from '../../utils/apiErrorMessage';

export default function NationalGames() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { nationalGames = [], loading = false, error = null } = useSelector(
    (state) => state.nationalGames,
  );
  const { success: cancelSuccess } = useSelector(
    (state) => state.cancelNationalGame,
  );

  const [listFilter, setListFilter] = useState('upcoming');

  useEffect(() => {
    dispatch(getNationalGames());
  }, [dispatch]);

  useEffect(() => {
    if (cancelSuccess) {
      dispatch(getNationalGames());
      dispatch(resetCancelNationalGameState());
    }
  }, [cancelSuccess, dispatch]);

  const filteredGames = useMemo(
    () => filterAndSortNationalMatches(nationalGames, listFilter),
    [nationalGames, listFilter],
  );

  const handleEdit = (item) => {
    navigate(`/national-games/edit/${item.id}`);
  };

  const handleCancelMatch = (item) => {
    Swal.fire({
      title: '¿Cancelar partido?',
      text: `El juego contra ${item.opponentName} quedará como cancelado (no se elimina del historial).`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, cancelar partido',
      cancelButtonText: 'No',
    }).then(async (result) => {
      if (!result.isConfirmed) return;
      try {
        await dispatch(cancelNationalGame(item.id)).unwrap();
        Swal.fire({
          icon: 'success',
          title: 'Partido cancelado',
          timer: 2000,
          showConfirmButton: false,
        });
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
      ),
    },
    {
      key: 'opponentName',
      header: 'Rival',
      accessor: 'opponentName',
    },
    {
      key: 'status',
      header: 'Estado',
      cell: (item) => (
        <span
          className={`badge ${getNationalMatchStatusBadgeClass(item.status)}`}
        >
          {getNationalMatchStatusLabel(item.status)}
        </span>
      ),
    },
    {
      key: 'gameDate',
      header: 'Fecha del partido',
      cell: (item) =>
        new Date(item.gameDate || item.matchDate).toLocaleString('es-ES', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }),
    },
    {
      key: 'score',
      header: 'Marcador',
      cell: (item) => {
        const { homeScore, awayScore, status } = item;
        if (
          status === 'finished' &&
          homeScore != null &&
          awayScore != null
        ) {
          return (
            <span className="text-nowrap">
              {homeScore} — {awayScore}
            </span>
          );
        }
        return '—';
      },
    },
    {
      key: 'location',
      header: 'Ubicación',
      accessor: 'location',
    },
    {
      key: 'gameType',
      header: 'Tipo',
      cell: (item) => (
        <span className={`badge ${getGameTypeBadgeClass(item.gameType)}`}>
          {getGameTypeLabel(item.gameType)}
        </span>
      ),
    },
    {
      key: 'createdAt',
      header: 'Registro',
      cell: (item) =>
        item.createdAt
          ? new Date(item.createdAt).toLocaleDateString('es-ES')
          : '—',
    },
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
              Error al cargar los juegos nacionales:{' '}
              {formatErrorForDisplay(error)}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const emptyCopy =
    nationalGames.length === 0
      ? {
          title: 'No hay juegos nacionales registrados',
          hint: 'Comienza agregando el primer partido',
        }
      : {
          title: 'Ningún partido en esta vista',
          hint: 'Prueba otro filtro o revisa los estados de los partidos',
        };

  return (
    <div className="container">
      <div className="card">
        <div className="card-header d-flex flex-wrap justify-content-between align-items-center gap-2">
          <h4 className="mb-0">Juegos de equipos nacionales</h4>
          <ButtonNavigation
            url="/national-games/add"
            icon="bi bi-plus-lg"
            text="Agregar juego"
          />
        </div>

        <div className="card-body">
          {nationalGames.length > 0 && (
            <div className="row mb-3">
              <div className="col-md-6 col-lg-4">
                <label className="form-label mb-1">Mostrar</label>
                <select
                  className="form-select"
                  value={listFilter}
                  onChange={(e) => setListFilter(e.target.value)}
                >
                  {nationalMatchListFilters.map((f) => (
                    <option key={f.value} value={f.value}>
                      {f.label}
                    </option>
                  ))}
                </select>
                <small className="text-muted">
                  Por defecto se muestran los próximos partidos (programados desde
                  hoy y los en vivo).
                </small>
              </div>
            </div>
          )}

          {nationalGames.length === 0 ? (
            <div className="text-center py-5">
              <i className="bi bi-calendar-event display-1 text-muted"></i>
              <h5 className="mt-3 text-muted">{emptyCopy.title}</h5>
              <p className="text-muted">{emptyCopy.hint}</p>
            </div>
          ) : filteredGames.length === 0 ? (
            <div className="text-center py-5">
              <i className="bi bi-funnel display-1 text-muted"></i>
              <h5 className="mt-3 text-muted">{emptyCopy.title}</h5>
              <p className="text-muted">{emptyCopy.hint}</p>
            </div>
          ) : (
            <GenericTable
              data={filteredGames}
              columns={columns}
              onEdit={handleEdit}
              onCancel={handleCancelMatch}
              canCancel={canCancelNationalMatch}
              loading={loading}
            />
          )}
        </div>
      </div>
    </div>
  );
}
