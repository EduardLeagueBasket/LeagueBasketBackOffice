import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { ClipLoader } from 'react-spinners';
import Swal from 'sweetalert2';
import ButtonNavigation from '../../components/Button/ButtonNavigation';
import { getArticleCategories } from '../../store/articleCategories/articleCategoriesSlice';
import { createArticle } from '../../store/articles/articlesSlice';
import { getCatalogCountries } from '../../store/catalogCountriesSlice';

export default function ArticlesAdd() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);
  const profileName = user?.profile?.name;
  const isAdmin = profileName === 'SUPER_ADMIN' || profileName === 'ADMIN';

  const { creating = false } = useSelector((state) => state.articles);
  const { items: categories = [], loading: loadingCategories = false } =
    useSelector((state) => state.articleCategories);
  const { countries = [] } = useSelector((state) => state.catalogCountries || {});

  const [targetCountryCode, setTargetCountryCode] = useState('GLOBAL');
  const [categoryId, setCategoryId] = useState('');
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [content, setContent] = useState('');
  const [isFeatured, setIsFeatured] = useState(false);
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [errors, setErrors] = useState({});

  useEffect(() => {
    dispatch(getArticleCategories());
    if (isAdmin) {
      dispatch(getCatalogCountries());
    }
  }, [dispatch, isAdmin]);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const handleFileChange = (e) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setFile(selected);
    setPreviewUrl(URL.createObjectURL(selected));
  };

  const validate = () => {
    const next = {};
    if (!title.trim()) next.title = 'El título es obligatorio';
    if (!content.trim()) next.content = 'El contenido es obligatorio';
    if (!categoryId) next.categoryId = 'Debes elegir una categoría';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      await dispatch(
        createArticle({
          title: title.trim(),
          summary: summary.trim(),
          content: content.trim(),
          categoryId,
          file,
          isFeatured,
          targetCountryCode: isAdmin ? targetCountryCode : undefined,
        }),
      ).unwrap();

      await Swal.fire({
        icon: 'success',
        title: 'Artículo publicado',
        timer: 1500,
        showConfirmButton: false,
      });
      navigate('/articles');
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: typeof err === 'string' ? err : 'No se pudo crear el artículo',
      });
    }
  };

  return (
    <div className="container-fluid">
      <div className="card shadow-sm">
        <div className="card-header d-flex justify-content-between align-items-center">
          <div>
            <h5 className="mb-0">Nuevo artículo</h5>
            {isAdmin && (
              <small className="text-muted">Se publica como League Basket</small>
            )}
          </div>
          <ButtonNavigation
            url="/articles"
            icon="bi bi-arrow-left"
            text="Volver"
          />
        </div>
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            {isAdmin && (
              <div className="mb-3">
                <label className="form-label">País destino</label>
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
                  Si eliges CO, el artículo aparece en el feed de Colombia. GLOBAL aparece en todos.
                </small>
              </div>
            )}

            <div className="mb-3">
              <label className="form-label">Categoría</label>
              <select
                className={`form-select ${errors.categoryId ? 'is-invalid' : ''}`}
                value={categoryId}
                onChange={(e) => {
                  setCategoryId(e.target.value);
                  setErrors((prev) => ({ ...prev, categoryId: '' }));
                }}
                disabled={creating || loadingCategories}
              >
                <option value="">Selecciona una categoría…</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              {errors.categoryId && (
                <div className="invalid-feedback">{errors.categoryId}</div>
              )}
            </div>

            <div className="mb-3">
              <label className="form-label">Título</label>
              <input
                className={`form-control ${errors.title ? 'is-invalid' : ''}`}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={creating}
              />
              {errors.title && <div className="invalid-feedback">{errors.title}</div>}
            </div>

            <div className="mb-3">
              <label className="form-label">Resumen (opcional)</label>
              <textarea
                className="form-control"
                rows={2}
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                disabled={creating}
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Contenido</label>
              <textarea
                className={`form-control ${errors.content ? 'is-invalid' : ''}`}
                rows={8}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                disabled={creating}
              />
              {errors.content && (
                <div className="invalid-feedback">{errors.content}</div>
              )}
            </div>

            <div className="mb-3">
              <label className="form-label">Imagen de portada (opcional)</label>
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
                  style={{ maxWidth: 240, maxHeight: 160, objectFit: 'cover' }}
                />
              )}
            </div>

            <div className="form-check mb-3">
              <input
                id="isFeatured"
                type="checkbox"
                className="form-check-input"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
                disabled={creating}
              />
              <label className="form-check-label" htmlFor="isFeatured">
                Destacar en portada
              </label>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={creating}
            >
              {creating ? <ClipLoader size={18} color="#fff" /> : 'Publicar artículo'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
