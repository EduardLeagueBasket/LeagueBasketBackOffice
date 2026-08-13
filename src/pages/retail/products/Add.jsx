import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import ButtonNavigation from '../../../components/Button/ButtonNavigation';
import ProductVariantEditor, {
  emptyVariant,
  mapVariantToApi,
} from '../../../components/retail/ProductVariantEditor';
import ProductImagesEditor from '../../../components/retail/ProductImagesEditor';
import { createRetailProduct } from '../../../store/retail/productsSlice';
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

export default function RetailProductAdd() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { saving } = useSelector((state) => state.retailProducts);
  const { categories = [] } = useSelector((state) => state.retailCategories);
  const { nationalTeams = [] } = useSelector((state) => state.nationalTeams);
  const { teams = [] } = useSelector((state) => state.teamsList);

  const [form, setForm] = useState({
    teamType: 'NACIONAL',
    teamId: '',
    nombre: '',
    categoria: '',
    descripcion: '',
    marca: '',
    tags: '',
  });
  const [variantes, setVariantes] = useState([emptyVariant()]);
  const [imagenes, setImagenes] = useState([]);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    dispatch(getRetailCategories());
    dispatch(getNationalTeams());
    dispatch(getTeams());
  }, [dispatch]);

  const teamOptions = useMemo(() => {
    return form.teamType === 'LIGA' ? teams : nationalTeams;
  }, [form.teamType, teams, nationalTeams]);

  const validate = () => {
    const next = {};
    if (!form.teamId) next.teamId = 'Selecciona un equipo';
    if (!form.nombre.trim()) next.nombre = 'Nombre requerido';
    if (!form.categoria) next.categoria = 'Categoría requerida';
    variantes.forEach((v, i) => {
      if (!v.sku.trim()) next[`variante_${i}`] = 'SKU requerido';
      if (v.precio === '' || Number(v.precio) < 0)
        next[`variante_${i}`] = 'Precio inválido';
      if (v.stock === '' || Number(v.stock) < 0)
        next[`variante_${i}`] = 'Stock inválido';
    });
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) {
      Swal.fire({
        icon: 'error',
        title: 'Revisa el formulario',
      });
      return;
    }

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
      await dispatch(createRetailProduct(payload)).unwrap();
      Swal.fire({
        icon: 'success',
        title: 'Producto creado',
        text: 'El registro quedó asociado a tu usuario administrador.',
      }).then(() => navigate('/retail/products'));
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: formatErrorForDisplay(err),
      });
    }
  };

  return (
    <div className="container">
      <div className="card shadow">
        <div className="card-header d-flex justify-content-between align-items-center">
          <h4 className="mb-0">Nuevo producto</h4>
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
                <label className="form-label">Tipo de equipo *</label>
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
                <label className="form-label">Equipo *</label>
                <select
                  className={`form-select ${errors.teamId ? 'is-invalid' : ''}`}
                  value={form.teamId}
                  onChange={(e) =>
                    setForm({ ...form, teamId: e.target.value })
                  }
                  disabled={saving}
                >
                  <option value="">Seleccionar…</option>
                  {teamOptions.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
                {errors.teamId && (
                  <div className="invalid-feedback">{errors.teamId}</div>
                )}
              </div>
              <div className="col-md-8">
                <label className="form-label">Nombre *</label>
                <input
                  type="text"
                  className={`form-control ${errors.nombre ? 'is-invalid' : ''}`}
                  value={form.nombre}
                  onChange={(e) =>
                    setForm({ ...form, nombre: e.target.value })
                  }
                  disabled={saving}
                />
              </div>
              <div className="col-md-4">
                <label className="form-label">Categoría *</label>
                <select
                  className={`form-select ${errors.categoria ? 'is-invalid' : ''}`}
                  value={form.categoria}
                  onChange={(e) =>
                    setForm({ ...form, categoria: e.target.value })
                  }
                  disabled={saving}
                >
                  <option value="">Seleccionar…</option>
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
                <label className="form-label">Tags (separados por coma)</label>
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
            <div className="mt-4 d-flex gap-2">
              <button
                type="submit"
                className="btn btn-primary"
                disabled={saving}
              >
                {saving ? 'Guardando…' : 'Crear producto'}
              </button>
              <ButtonNavigation
                url="/retail/products"
                icon="bi bi-x"
                text="Cancelar"
              />
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
