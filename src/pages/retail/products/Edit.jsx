import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { ClipLoader } from 'react-spinners';
import Swal from 'sweetalert2';
import ButtonNavigation from '../../../components/Button/ButtonNavigation';
import ProductVariantEditor, {
  mapVariantFromApi,
  mapVariantToApi,
} from '../../../components/retail/ProductVariantEditor';
import ProductImagesEditor from '../../../components/retail/ProductImagesEditor';
import {
  clearRetailProductDetail,
  getRetailProduct,
  updateRetailProduct,
} from '../../../store/retail/productsSlice';
import { getRetailCategories } from '../../../store/retail/categoriesSlice';
import { getNationalTeams } from '../../../store/nationalTeams/getNationalTeamsSlice';
import { getTeams } from '../../../store/teams/listTeamsSlice';
import { formatCategoria } from '../../../utils/retailApi';
import { formatErrorForDisplay } from '../../../utils/apiErrorMessage';
import {
  buildRetailProductFormData,
  retailProductPayloadHasNewImages,
} from '../../../utils/retailProductFormData';
import '../../../styles/retail.css';

export default function RetailProductEdit() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { product, detailLoading, saving } = useSelector(
    (state) => state.retailProducts,
  );
  const { categories = [] } = useSelector((state) => state.retailCategories);
  const { nationalTeams = [] } = useSelector((state) => state.nationalTeams);
  const { teams = [] } = useSelector((state) => state.teamsList);

  const [form, setForm] = useState(null);
  const [variantes, setVariantes] = useState([]);
  const [imagenes, setImagenes] = useState([]);

  useEffect(() => {
    dispatch(getRetailCategories());
    dispatch(getNationalTeams());
    dispatch(getTeams());
    dispatch(getRetailProduct(id));
    return () => {
      dispatch(clearRetailProductDetail());
    };
  }, [dispatch, id]);

  useEffect(() => {
    if (!product) return;
    setForm({
      teamType: product.teamType,
      teamId: product.teamId,
      nombre: product.nombre || '',
      categoria: product.categoria || '',
      descripcion: product.descripcion || '',
      marca: product.marca || '',
      tags: (product.tags || []).join(', '),
      activo: product.activo,
    });
    setVariantes(
      (product.variantes || []).map(mapVariantFromApi),
    );
    setImagenes(product.imagenes || []);
  }, [product]);

  const teamOptions = useMemo(() => {
    if (!form) return [];
    return form.teamType === 'LIGA' ? teams : nationalTeams;
  }, [form, teams, nationalTeams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form) return;

    const productFields = {
      teamId: form.teamId,
      teamType: form.teamType,
      nombre: form.nombre.trim(),
      categoria: form.categoria,
      descripcion: form.descripcion.trim() || undefined,
      marca: form.marca.trim() || undefined,
      variantes: variantes.map(mapVariantToApi),
      tags: form.tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
    };

    const payload = retailProductPayloadHasNewImages(imagenes)
      ? buildRetailProductFormData(productFields, imagenes)
      : {
          ...productFields,
          imagenes: imagenes.map(({ url, principal }) => ({ url, principal })),
        };

    try {
      await dispatch(updateRetailProduct({ id, data: payload })).unwrap();
      Swal.fire({
        icon: 'success',
        title: 'Producto actualizado',
        text: 'Precios y stock guardados correctamente.',
      }).then(() => navigate('/retail/products'));
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: formatErrorForDisplay(err),
      });
    }
  };

  if (detailLoading || !form) {
    return (
      <div className="text-center py-5">
        <ClipLoader color="#0d6efd" />
        <p className="mt-2">Cargando producto…</p>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="card shadow">
        <div className="card-header d-flex justify-content-between align-items-center">
          <div>
            <h4 className="mb-0">Editar producto</h4>
            {product?.creadoPorId && (
              <small className="text-muted">
                Creado por ID: {product.creadoPorId}
              </small>
            )}
          </div>
          <ButtonNavigation
            url="/retail/products"
            icon="bi bi-arrow-left"
            text="Volver"
          />
        </div>
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="row g-3">
              <div className="col-md-4">
                <label className="form-label">Tipo de equipo</label>
                <select
                  className="form-select"
                  value={form.teamType}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      teamType: e.target.value,
                      teamId: '',
                    })
                  }
                  disabled={saving}
                >
                  <option value="NACIONAL">Selección nacional</option>
                  <option value="LIGA">Equipo de liga</option>
                </select>
              </div>
              <div className="col-md-8">
                <label className="form-label">Equipo</label>
                <select
                  className="form-select"
                  value={form.teamId}
                  onChange={(e) =>
                    setForm({ ...form, teamId: e.target.value })
                  }
                  disabled={saving}
                >
                  {teamOptions.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-md-8">
                <label className="form-label">Nombre</label>
                <input
                  type="text"
                  className="form-control"
                  value={form.nombre}
                  onChange={(e) =>
                    setForm({ ...form, nombre: e.target.value })
                  }
                  disabled={saving}
                />
              </div>
              <div className="col-md-4">
                <label className="form-label">Categoría</label>
                <select
                  className="form-select"
                  value={form.categoria}
                  onChange={(e) =>
                    setForm({ ...form, categoria: e.target.value })
                  }
                  disabled={saving}
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {formatCategoria(c)}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-md-6">
                <label className="form-label">Marca</label>
                <input
                  type="text"
                  className="form-control"
                  value={form.marca}
                  onChange={(e) =>
                    setForm({ ...form, marca: e.target.value })
                  }
                  disabled={saving}
                />
              </div>
              <div className="col-md-6">
                <label className="form-label">Tags</label>
                <input
                  type="text"
                  className="form-control"
                  value={form.tags}
                  onChange={(e) =>
                    setForm({ ...form, tags: e.target.value })
                  }
                  disabled={saving}
                />
              </div>
              <div className="col-12">
                <label className="form-label">Descripción</label>
                <textarea
                  className="form-control"
                  rows={3}
                  value={form.descripcion}
                  onChange={(e) =>
                    setForm({ ...form, descripcion: e.target.value })
                  }
                  disabled={saving}
                />
              </div>
              <div className="col-12">
                <ProductImagesEditor
                  imagenes={imagenes}
                  onChange={setImagenes}
                  disabled={saving}
                />
              </div>
              <div className="col-12">
                <ProductVariantEditor
                  variantes={variantes}
                  onChange={setVariantes}
                  disabled={saving}
                />
              </div>
            </div>
            <div className="mt-4">
              <button
                type="submit"
                className="btn btn-primary"
                disabled={saving}
              >
                {saving ? 'Guardando…' : 'Guardar cambios'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
