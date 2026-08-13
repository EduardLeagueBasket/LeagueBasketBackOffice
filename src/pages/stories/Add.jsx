import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ClipLoader } from 'react-spinners';
import Swal from 'sweetalert2';
import ButtonNavigation from '../../components/Button/ButtonNavigation';
import { getPublishers } from '../../store/publishers/publishersSlice';
import { createStory } from '../../store/stories/storiesSlice';
import { getCatalogCountries } from '../../store/catalogCountriesSlice';

const publisherKey = (p) => `${p.entity_type}::${p.entity_id}`;

export default function StoriesAdd() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const user = useSelector((state) => state.auth.user);
  const profileName = user?.profile?.name;
  const isAdmin =
    profileName === 'SUPER_ADMIN' || profileName === 'ADMIN';

  const { creating = false } = useSelector((state) => state.stories);
  const { items: publishers = [], loading: loadingPublishers = false } =
    useSelector((state) => state.publishers);
  const { countries = [] } = useSelector(
    (state) => state.catalogCountries || {},
  );

  const initialKey = useMemo(() => {
    const entityType = searchParams.get('entityType');
    const entityId = searchParams.get('entityId');
    if (entityType && entityId) return `${entityType}::${entityId}`;
    return '';
  }, [searchParams]);

  const [selectedKey, setSelectedKey] = useState(initialKey);
  const [targetCountryCode, setTargetCountryCode] = useState('GLOBAL');
  const [mediaType, setMediaType] = useState('photo');
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [errors, setErrors] = useState({});

  const selectedPublisher = useMemo(
    () => publishers.find((p) => publisherKey(p) === selectedKey) || null,
    [publishers, selectedKey],
  );
  const isPlatformPublisher = selectedPublisher?.entity_type === 'platform';

  useEffect(() => {
    if (isAdmin) {
      dispatch(getPublishers());
      dispatch(getCatalogCountries());
    }
  }, [dispatch, isAdmin]);

  useEffect(() => {
    if (initialKey) setSelectedKey(initialKey);
  }, [initialKey]);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const handleFileChange = (e) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    if (previewUrl) URL.revokeObjectURL(previewUrl);

    const inferredType = selected.type.startsWith('video/') ? 'video' : 'photo';
    setFile(selected);
    setMediaType(inferredType);
    setPreviewUrl(URL.createObjectURL(selected));
    setErrors((prev) => ({ ...prev, file: '' }));
  };

  const validate = () => {
    const next = {};
    if (!file) next.file = 'Debes seleccionar una imagen o video';
    if (!['photo', 'video'].includes(mediaType)) {
      next.mediaType = 'Tipo inválido';
    }
    if (isAdmin && !selectedPublisher) {
      next.publisher = 'Debes seleccionar un publisher';
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      await dispatch(
        createStory({
          file,
          mediaType,
          entityType: selectedPublisher?.entity_type,
          entityId: selectedPublisher?.entity_id,
          targetCountryCode: isPlatformPublisher
            ? targetCountryCode
            : undefined,
        }),
      ).unwrap();

      await Swal.fire({
        icon: 'success',
        title: 'Story publicada',
        timer: 1500,
        showConfirmButton: false,
      });
      navigate('/stories');
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: typeof err === 'string' ? err : 'No se pudo crear la story',
      });
    }
  };

  return (
    <div className="container-fluid">
      <div className="card shadow-sm">
        <div className="card-header d-flex justify-content-between align-items-center">
          <h5 className="mb-0">Nueva story</h5>
          <ButtonNavigation
            url="/stories"
            icon="bi bi-arrow-left"
            text="Volver"
          />
        </div>
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            {isAdmin && (
              <div className="mb-3">
                <label className="form-label">Publisher</label>
                <select
                  className={`form-select ${errors.publisher ? 'is-invalid' : ''}`}
                  value={selectedKey}
                  onChange={(e) => {
                    setSelectedKey(e.target.value);
                    setErrors((prev) => ({ ...prev, publisher: '' }));
                  }}
                  disabled={creating || loadingPublishers}
                >
                  <option value="">Selecciona un publisher…</option>
                  {publishers.map((p) => (
                    <option key={publisherKey(p)} value={publisherKey(p)}>
                      [{p.entity_type}] {p.display_name}
                    </option>
                  ))}
                </select>
                {errors.publisher && (
                  <div className="invalid-feedback">{errors.publisher}</div>
                )}
              </div>
            )}

            {isAdmin && isPlatformPublisher && (
              <div className="mb-3">
                <label className="form-label">País destino de la publicación</label>
                <select
                  className="form-select"
                  value={targetCountryCode}
                  onChange={(e) => setTargetCountryCode(e.target.value)}
                  disabled={creating}
                >
                  <option value="GLOBAL">Todos los países (GLOBAL)</option>
                  {countries.map((c) => (
                    <option
                      key={c.id || c.countryCode}
                      value={(c.countryCode || '').toUpperCase()}
                    >
                      {c.countryName || c.name} ({c.countryCode})
                    </option>
                  ))}
                </select>
                <small className="text-muted">
                  Ej. felicitar a Panamá → elige PA (no aparece en Colombia).
                </small>
              </div>
            )}

            <div className="mb-3">
              <label className="form-label">Archivo (imagen o video)</label>
              <input
                type="file"
                className={`form-control ${errors.file ? 'is-invalid' : ''}`}
                accept="image/*,video/*"
                onChange={handleFileChange}
                disabled={creating}
              />
              {errors.file && (
                <div className="invalid-feedback">{errors.file}</div>
              )}
              {file && (
                <small className="text-muted d-block mt-1">{file.name}</small>
              )}
            </div>

            <div className="mb-3">
              <label className="form-label">Tipo</label>
              <select
                className={`form-select ${errors.mediaType ? 'is-invalid' : ''}`}
                value={mediaType}
                onChange={(e) => setMediaType(e.target.value)}
                disabled={creating}
              >
                <option value="photo">Foto</option>
                <option value="video">Video</option>
              </select>
              {errors.mediaType && (
                <div className="invalid-feedback">{errors.mediaType}</div>
              )}
            </div>

            {previewUrl && (
              <div className="mb-3">
                <label className="form-label">Vista previa</label>
                <div>
                  {mediaType === 'video' ? (
                    <video
                      src={previewUrl}
                      controls
                      style={{ maxWidth: 320, maxHeight: 240 }}
                      className="rounded border"
                    />
                  ) : (
                    <img
                      src={previewUrl}
                      alt="preview"
                      style={{ maxWidth: 320, maxHeight: 240, objectFit: 'cover' }}
                      className="rounded border"
                    />
                  )}
                </div>
              </div>
            )}

            <button
              type="submit"
              className="btn btn-primary"
              disabled={creating || !file || (isAdmin && !selectedPublisher)}
            >
              {creating ? <ClipLoader size={18} color="#fff" /> : 'Publicar'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
