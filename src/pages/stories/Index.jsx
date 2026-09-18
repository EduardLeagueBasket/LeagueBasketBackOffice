import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Swal from 'sweetalert2';
import ButtonNavigation from '../../components/Button/ButtonNavigation';
import GenericTable from '../../components/Table.jsx/GenericTable';
import { deleteStory, getMyStories } from '../../store/stories/storiesSlice';

function formatDate(value) {
  if (!value) return '--';
  try {
    return new Date(value).toLocaleString();
  } catch {
    return value;
  }
}

export default function StoriesIndex() {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const profileName = user?.profile?.name;
  const isAdmin = profileName === 'SUPER_ADMIN' || profileName === 'ADMIN';

  const {
    stories = [],
    publisher = null,
    loading = false,
    error = null,
  } = useSelector((state) => state.stories);

  useEffect(() => {
    dispatch(getMyStories());
  }, [dispatch]);

  const handleDelete = (item) => {
    Swal.fire({
      icon: 'warning',
      title: 'Eliminar story',
      text: '¿Seguro que deseas eliminar esta publicación?',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    }).then(async (result) => {
      if (!result.isConfirmed) return;
      try {
        await dispatch(
          deleteStory({
            id: item.id,
            entityType: publisher?.entity_type,
            entityId: publisher?.entity_id,
          }),
        ).unwrap();
        Swal.fire({
          icon: 'success',
          title: 'Eliminada',
          timer: 1400,
          showConfirmButton: false,
        });
        dispatch(getMyStories());
      } catch (err) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: typeof err === 'string' ? err : 'No se pudo eliminar.',
        });
      }
    });
  };

  const columns = [
    {
      key: 'media',
      header: 'Media',
      cell: (item) =>
        item.media_type === 'video' ? (
          <video
            src={item.media_url}
            style={{ width: 56, height: 56, objectFit: 'cover' }}
            className="rounded"
            muted
          />
        ) : (
          <img
            src={item.media_url}
            alt="story"
            className="rounded"
            style={{ width: 56, height: 56, objectFit: 'cover' }}
          />
        ),
    },
    {
      key: 'media_type',
      header: 'Tipo',
      accessor: 'media_type',
    },
    {
      key: 'name_created_by',
      header: 'Publicado por',
      accessor: 'name_created_by',
    },
    {
      key: 'created_at',
      header: 'Creada',
      cell: (item) => formatDate(item.created_at),
    },
    {
      key: 'expires_at',
      header: 'Expira',
      cell: (item) => formatDate(item.expires_at),
    },
  ];

  return (
    <div className="container-fluid">
      <div className="card shadow-sm">
        <div className="card-header d-flex justify-content-between align-items-center flex-wrap gap-2">
          <div>
            <h5 className="mb-0">Stories</h5>
            <small className="text-muted">
              {isAdmin
                ? `Publicas como ${publisher?.display_name || 'League Basket'}`
                : publisher?.display_name
                  ? `Publisher: ${publisher.display_name}`
                  : ''}
            </small>
          </div>
          <div className="d-flex gap-2">
            {isAdmin && (
              <ButtonNavigation
                url="/publishers"
                icon="bi bi-broadcast"
                text="Publishers"
              />
            )}
            <ButtonNavigation
              url="/stories/add"
              icon="bi bi-plus-lg"
              text="Nueva story"
            />
          </div>
        </div>
        <div className="card-body">
          {error && (
            <div className="alert alert-danger" role="alert">
              {typeof error === 'string' ? error : 'Error al cargar stories'}
            </div>
          )}

          <GenericTable
            columns={columns}
            data={stories}
            loading={loading}
            showEdit={false}
            onDelete={handleDelete}
          />
        </div>
      </div>
    </div>
  );
}
