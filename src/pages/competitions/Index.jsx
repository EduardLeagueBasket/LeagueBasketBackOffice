import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import ButtonNavigation from '../../components/Button/ButtonNavigation';
import GenericTable from '../../components/Table.jsx/GenericTable';
import { deactivateCompetition, getCompetitions } from '../../store/competitionsSlice';

const CompetitionsIndex = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { competitions = [], loading = false, error = null } = useSelector((state) => state.competitions || {});

  useEffect(() => {
    dispatch(getCompetitions());
  }, [dispatch]);

  const handleEdit = (item) => {
    navigate(`/competitions/edit/${item.id}`);
  };

  const handleDelete = (item) => {
    Swal.fire({
      icon: 'warning',
      title: 'Desactivar competencia',
      text: `¿Seguro que deseas desactivar "${item.name}"?`,
      showCancelButton: true,
      confirmButtonText: 'Sí, desactivar',
      cancelButtonText: 'Cancelar',
    }).then(async (result) => {
      if (!result.isConfirmed) return;
      try {
        await dispatch(deactivateCompetition(item.id)).unwrap();
        dispatch(getCompetitions());
      } catch (err) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: typeof err === 'string' ? err : 'No se pudo desactivar.',
        });
      }
    });
  };

  return (
    <div className="container">
      <div className="card">
        <div className="card-header d-flex justify-content-between align-items-center">
          <h4 className="mb-0">Competencias</h4>
          <ButtonNavigation url="/competitions/add" icon="bi bi-plus-lg" text="Agregar Competencia" />
        </div>

        <div className="card-body">
          {error && (
            <div className="alert alert-danger">
              {typeof error === 'string' ? error : 'Error cargando competencias'}
            </div>
          )}

          <GenericTable
            columns={[
              { header: 'Nombre', accessor: 'name' },
              { header: 'Tipo', accessor: 'type' },
              { header: 'Género', accessor: 'gender' },
              { header: 'Temporada', accessor: 'season' },
              {
                header: 'País',
                accessor: 'country.name',
                cell: (item) => item?.country?.name ?? '--',
              },
              {
                header: 'Activo',
                accessor: 'isActive',
                cell: (item) => (item.isActive ? 'Sí' : 'No'),
              },
              {
                header: 'Logo',
                accessor: 'logo',
                cell: (item) =>
                  item.logo ? <i className="bi bi-check-circle text-success"></i> : <i className="bi bi-x-circle text-muted"></i>,
              },
            ]}
            data={competitions}
            loading={loading}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </div>
      </div>
    </div>
  );
};

export default CompetitionsIndex;

