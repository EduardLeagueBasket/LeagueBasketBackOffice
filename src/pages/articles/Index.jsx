import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Swal from 'sweetalert2';
import ButtonNavigation from '../../components/Button/ButtonNavigation';
import GenericTable from '../../components/Table.jsx/GenericTable';
import { getCatalogCountries } from '../../store/catalogCountriesSlice';
import { deleteArticle, getArticlesFeed, getMyArticles } from '../../store/articles/articlesSlice';

function formatDate(value) {
  if (!value) return '--';
  try {
    return new Date(value).toLocaleString();
  } catch {
    return value;
  }
}

export default function ArticlesIndex() {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const profileName = user?.profile?.name;
  const isAdmin = profileName === 'SUPER_ADMIN' || profileName === 'ADMIN';

  const {
    articles = [],
    publisher = null,
    feedCountry = null,
    loading = false,
    error = null,
  } = useSelector((state) => state.articles);
  const { countries = [] } = useSelector((state) => state.catalogCountries || {});

  const [countryCode, setCountryCode] = useState('');

  useEffect(() => {
    dispatch(getMyArticles());
    if (isAdmin) {
      dispatch(getCatalogCountries());
    }
  }, [dispatch, isAdmin]);

  const handleCountryChange = (value) => {
    setCountryCode(value);
    if (value) {
      dispatch(getArticlesFeed(value));
    } else {
      dispatch(getMyArticles());
    }
  };

  const handleDelete = (item) => {
    Swal.fire({
      icon: 'warning',
      title: 'Eliminar artículo',
      text: '¿Seguro que deseas eliminar esta publicación?',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    }).then(async (result) => {
      if (!result.isConfirmed) return;
      try {
        await dispatch(
          deleteArticle({
            id: item.id,
            entityType: publisher?.entity_type || item.entity_type,
            entityId: publisher?.entity_id || item.entity_id,
          }),
        ).unwrap();
        Swal.fire({
          icon: 'success',
          title: 'Eliminado',
          timer: 1400,
          showConfirmButton: false,
        });
        dispatch(getMyArticles());
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
      key: 'cover',
      header: 'Portada',
      cell: (item) =>
        item.cover_image_url ? (
          <img
            src={item.cover_image_url}
            alt={item.title}
            className="rounded"
            style={{ width: 56, height: 56, objectFit: 'cover' }}
          />
        ) : (
          <span className="text-muted">--</span>
        ),
    },
    {
      key: 'title',
      header: 'Título',
      accessor: 'title',
    },
    {
      key: 'category_name',
      header: 'Categoría',
      accessor: 'category_name',
    },
    {
      key: 'target_country_code',
      header: 'País',
      accessor: 'target_country_code',
    },
    {
      key: 'name_created_by',
      header: 'Publicado por',
      accessor: 'name_created_by',
    },
    {
      key: 'created_at',
      header: 'Creado',
      cell: (item) => formatDate(item.created_at),
    },
  ];

  return (
    <div className="container-fluid">
      <div className="card shadow-sm">
        <div className="card-header d-flex justify-content-between align-items-center flex-wrap gap-2">
          <div>
            <h5 className="mb-0">Artículos</h5>
            <small className="text-muted d-block">
              {isAdmin
                ? `Publicas como ${publisher?.display_name || 'League Basket'}`
                : publisher?.display_name
                  ? `Publisher: ${publisher.display_name}`
                  : ''}
            </small>
            {feedCountry && (
              <small className="text-muted d-block">
                Vista del feed de país: {feedCountry}
              </small>
            )}
          </div>
          <ButtonNavigation
            url="/articles/add"
            icon="bi bi-plus-lg"
            text="Nuevo artículo"
          />
        </div>
        <div className="card-body">
          {isAdmin && (
            <div className="mb-3">
              <label className="form-label">Ver feed de un país</label>
              <select
                className="form-select"
                value={countryCode}
                onChange={(e) => handleCountryChange(e.target.value)}
              >
                <option value="">Mis artículos de League Basket</option>
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
                El filtro solo mira el feed. Las publicaciones nuevas siempre salen como League Basket.
              </small>
            </div>
          )}

          {error && (
            <div className="alert alert-danger" role="alert">
              {typeof error === 'string' ? error : 'Error al cargar artículos'}
            </div>
          )}

          <GenericTable
            columns={columns}
            data={articles}
            loading={loading}
            showEdit={false}
            onDelete={countryCode ? null : handleDelete}
            showActions={!countryCode}
          />
        </div>
      </div>
    </div>
  );
}
