import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ClipLoader } from 'react-spinners';
import Swal from 'sweetalert2';
import ButtonNavigation from '../../components/Button/ButtonNavigation';
import GenericTable from '../../components/Table.jsx/GenericTable';
import {
  createArticleCategory,
  getArticleCategories,
} from '../../store/articleCategories/articleCategoriesSlice';

const slugify = (value) =>
  value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const formatDate = (value) => {
  if (!value) return '--';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '--';
  return date.toLocaleDateString('es-CO', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export default function ArticleCategoriesIndex() {
  const dispatch = useDispatch();
  const {
    items = [],
    loading = false,
    creating = false,
    error = null,
  } = useSelector((state) => state.articleCategories);

  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [slugTouched, setSlugTouched] = useState(false);

  useEffect(() => {
    dispatch(getArticleCategories());
  }, [dispatch]);

  const handleNameChange = (e) => {
    const nextName = e.target.value;
    setName(nextName);
    if (!slugTouched) {
      setSlug(slugify(nextName));
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Nombre requerido',
        text: 'Indica el nombre de la categoría (ej. Noticias, Resultados).',
      });
      return;
    }

    try {
      await dispatch(
        createArticleCategory({
          name: name.trim(),
          slug: slug.trim(),
        }),
      ).unwrap();

      setName('');
      setSlug('');
      setSlugTouched(false);

      await Swal.fire({
        icon: 'success',
        title: 'Categoría creada',
        timer: 1400,
        showConfirmButton: false,
      });
      dispatch(getArticleCategories());
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: typeof err === 'string' ? err : 'No se pudo crear la categoría',
      });
    }
  };

  const columns = [
    {
      key: 'name',
      header: 'Nombre',
      accessor: 'name',
    },
    {
      key: 'slug',
      header: 'Slug',
      accessor: 'slug',
    },
    {
      key: 'created_at',
      header: 'Creada',
      cell: (item) => formatDate(item.created_at),
    },
  ];

  return (
    <div className="container-fluid">
      <div className="row g-3">
        <div className="col-lg-4">
          <div className="card shadow-sm">
            <div className="card-header">
              <h5 className="mb-0">Nueva categoría</h5>
              <small className="text-muted">
                Organiza los artículos por tipo de contenido
              </small>
            </div>
            <div className="card-body">
              <form onSubmit={handleCreate}>
                <div className="mb-3">
                  <label className="form-label">Nombre</label>
                  <input
                    className="form-control"
                    value={name}
                    onChange={handleNameChange}
                    placeholder="Noticias"
                    disabled={creating}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Slug</label>
                  <input
                    className="form-control"
                    value={slug}
                    onChange={(e) => {
                      setSlugTouched(true);
                      setSlug(e.target.value);
                    }}
                    placeholder="noticias"
                    disabled={creating}
                  />
                  <small className="text-muted">
                    Se genera solo si lo dejas vacío
                  </small>
                </div>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={creating}
                >
                  {creating ? <ClipLoader size={18} color="#fff" /> : 'Crear categoría'}
                </button>
              </form>
            </div>
          </div>
        </div>

        <div className="col-lg-8">
          <div className="card shadow-sm">
            <div className="card-header d-flex justify-content-between align-items-center">
              <div>
                <h5 className="mb-0">Categorías de artículos</h5>
                <small className="text-muted">Total: {items.length}</small>
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
                  {typeof error === 'string' ? error : 'Error al cargar categorías'}
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
