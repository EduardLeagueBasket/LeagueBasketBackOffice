import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ClipLoader } from 'react-spinners';
import Swal from 'sweetalert2';
import ButtonNavigation from '../../components/Button/ButtonNavigation';
import GenericTable from '../../components/Table.jsx/GenericTable';
import {
  createPublisher,
  getPublishers,
} from '../../store/publishers/publishersSlice';

const entityTypeLabel = (type) => {
  switch (type) {
    case 'platform':
      return 'Plataforma';
    case 'team':
      return 'Equipo';
    case 'national team':
      return 'Selección';
    case 'league':
      return 'Liga';
    default:
      return type || '--';
  }
};

export default function PublishersIndex() {
  const dispatch = useDispatch();
  const {
    items = [],
    loading = false,
    creating = false,
    error = null,
  } = useSelector((state) => state.publishers);

  const [displayName, setDisplayName] = useState('');
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');

  useEffect(() => {
    dispatch(getPublishers());
  }, [dispatch]);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const platformPublishers = useMemo(
    () => items.filter((p) => p.entity_type === 'platform'),
    [items],
  );

  const handleFileChange = (e) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setFile(selected);
    setPreviewUrl(URL.createObjectURL(selected));
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!displayName.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Nombre requerido',
        text: 'Indica el nombre del publisher (ej. League Basket).',
      });
      return;
    }

    try {
      await dispatch(
        createPublisher({
          displayName: displayName.trim(),
          file,
          isVerified: true,
        }),
      ).unwrap();

      setDisplayName('');
      setFile(null);
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewUrl('');

      await Swal.fire({
        icon: 'success',
        title: 'Publisher creado',
        timer: 1400,
        showConfirmButton: false,
      });
      dispatch(getPublishers());
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: typeof err === 'string' ? err : 'No se pudo crear el publisher',
      });
    }
  };

  const columns = [
    {
      key: 'avatar',
      header: 'Avatar',
      cell: (item) =>
        item.avatar_url ? (
          <img
            src={item.avatar_url}
            alt={item.display_name}
            className="rounded"
            style={{ width: 40, height: 40, objectFit: 'cover' }}
          />
        ) : (
          <span className="text-muted">--</span>
        ),
    },
    {
      key: 'display_name',
      header: 'Nombre',
      accessor: 'display_name',
    },
    {
      key: 'entity_type',
      header: 'Tipo',
      cell: (item) => entityTypeLabel(item.entity_type),
    },
    {
      key: 'is_verified',
      header: 'Verificado',
      cell: (item) => (item.is_verified ? 'Sí' : 'No'),
    },
  ];

  return (
    <div className="container-fluid">
      <div className="row g-3">
        <div className="col-lg-4">
          <div className="card shadow-sm">
            <div className="card-header">
              <h5 className="mb-0">Nuevo publisher</h5>
              <small className="text-muted">
                Crea cuentas de marca (League Basket, campañas, etc.)
              </small>
            </div>
            <div className="card-body">
              <form onSubmit={handleCreate}>
                <div className="mb-3">
                  <label className="form-label">Nombre</label>
                  <input
                    className="form-control"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="League Basket"
                    disabled={creating}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Avatar (opcional)</label>
                  <input
                    type="file"
                    accept="image/*"
                    className="form-control"
                    onChange={handleFileChange}
                    disabled={creating}
                  />
                  {previewUrl && (
                    <img
                      src={previewUrl}
                      alt="preview"
                      className="rounded border mt-2"
                      style={{ maxWidth: 120, maxHeight: 120, objectFit: 'cover' }}
                    />
                  )}
                </div>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={creating}
                >
                  {creating ? <ClipLoader size={18} color="#fff" /> : 'Crear publisher'}
                </button>
              </form>
            </div>
          </div>
        </div>

        <div className="col-lg-8">
          <div className="card shadow-sm">
            <div className="card-header d-flex justify-content-between align-items-center">
              <div>
                <h5 className="mb-0">Publishers</h5>
                <small className="text-muted">
                  Plataforma: {platformPublishers.length} · Total: {items.length}
                </small>
              </div>
              <ButtonNavigation
                url="/stories"
                icon="bi bi-camera-reels"
                text="Ir a Stories"
              />
            </div>
            <div className="card-body">
              {error && (
                <div className="alert alert-danger" role="alert">
                  {typeof error === 'string' ? error : 'Error al cargar publishers'}
                </div>
              )}
              <GenericTable
                columns={columns}
                data={items}
                loading={loading}
                showEdit={false}
                showActions={false}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
