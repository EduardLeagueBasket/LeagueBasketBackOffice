import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Swal from 'sweetalert2';
import ButtonNavigation from '../../components/Button/ButtonNavigation';
import GenericTable from '../../components/Table.jsx/GenericTable';
import { getPublishers } from '../../store/publishers/publishersSlice';
import { deleteStory, getMyStories } from '../../store/stories/storiesSlice';

function formatDate(value) {
  if (!value) return '--';
  try {
    return new Date(value).toLocaleString();
  } catch {
    return value;
  }
}

const publisherKey = (p) => `${p.entity_type}::${p.entity_id}`;

export default function StoriesIndex() {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const profileName = user?.profile?.name;
  const isAdmin =
    profileName === 'SUPER_ADMIN' || profileName === 'ADMIN';

  const {
    stories = [],
    publisher = null,
    loading = false,
    error = null,
  } = useSelector((state) => state.stories);
  const { items: publishers = [], loading: loadingPublishers = false } =
    useSelector((state) => state.publishers);

  const [selectedKey, setSelectedKey] = useState('');

  const selectedPublisher = useMemo(
    () => publishers.find((p) => publisherKey(p) === selectedKey) || null,
    [publishers, selectedKey],
  );

  useEffect(() => {
    if (isAdmin) {
      dispatch(getPublishers());
    } else {
      dispatch(getMyStories());
    }
  }, [dispatch, isAdmin]);

  useEffect(() => {
    if (!isAdmin || !selectedPublisher) return;
    dispatch(
      getMyStories({
        entityType: selectedPublisher.entity_type,
        entityId: selectedPublisher.entity_id,
      }),
    );
  }, [dispatch, isAdmin, selectedPublisher]);

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
            entityType: selectedPublisher?.entity_type || publisher?.entity_type,
            entityId: selectedPublisher?.entity_id || publisher?.entity_id,
          }),
        ).unwrap();
        Swal.fire({
          icon: 'success',
          title: 'Eliminada',
          timer: 1400,
          showConfirmButton: false,
        });
        if (isAdmin && selectedPublisher) {
          dispatch(
            getMyStories({
              entityType: selectedPublisher.entity_type,
              entityId: selectedPublisher.entity_id,
            }),
          );
        } else {
          dispatch(getMyStories());
        }
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

  const addUrl = selectedPublisher
    ? `/stories/add?entityType=${encodeURIComponent(selectedPublisher.entity_type)}&entityId=${encodeURIComponent(selectedPublisher.entity_id)}`
    : '/stories/add';

  return (
    <div className="container-fluid">
      <div className="card shadow-sm">
        <div className="card-header d-flex justify-content-between align-items-center flex-wrap gap-2">
          <div>
            <h5 className="mb-0">Stories</h5>
            {publisher?.display_name && (
              <small className="text-muted">
                Publisher: {publisher.display_name}
              </small>
            )}
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
              url={addUrl}
              icon="bi bi-plus-lg"
              text="Nueva story"
              disabled={isAdmin && !selectedPublisher}
            />
          </div>
        </div>
        <div className="card-body">
          {isAdmin && (
            <div className="mb-3">
              <label className="form-label">Publicar / ver como</label>
              <select
                className="form-select"
                value={selectedKey}
                onChange={(e) => setSelectedKey(e.target.value)}
                disabled={loadingPublishers}
              >
                <option value="">Selecciona un publisher…</option>
                {publishers.map((p) => (
                  <option key={publisherKey(p)} value={publisherKey(p)}>
                    [{p.entity_type}] {p.display_name}
                  </option>
                ))}
              </select>
              {!selectedPublisher && (
                <small className="text-muted d-block mt-1">
                  Elige un publisher de plataforma, equipo o selección. Puedes crear
                  más en Publishers.
                </small>
              )}
            </div>
          )}

          {error && (
            <div className="alert alert-danger" role="alert">
              {typeof error === 'string' ? error : 'Error al cargar stories'}
            </div>
          )}

          {(!isAdmin || selectedPublisher) && (
            <GenericTable
              columns={columns}
              data={stories}
              loading={loading}
              showEdit={false}
              onDelete={handleDelete}
            />
          )}
        </div>
      </div>
    </div>
  );
}
