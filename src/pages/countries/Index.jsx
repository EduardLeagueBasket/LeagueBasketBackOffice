import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import ButtonNavigation from '../../components/Button/ButtonNavigation';
import GenericTable from '../../components/Table.jsx/GenericTable';
import { getCatalogCountries } from '../../store/catalogCountriesSlice';
import "/node_modules/flag-icons/css/flag-icons.min.css";

const CountriesIndex = () => {
  const dispatch = useDispatch();
  const { countries = [], loading = false, error = null } = useSelector((state) => state.catalogCountries || {});

  useEffect(() => {
    dispatch(getCatalogCountries());
  }, [dispatch]);

  return (
    <div className="container">
      <div className="card">
        <div className="card-header d-flex justify-content-between align-items-center">
          <h4 className="mb-0">Países</h4>
          <ButtonNavigation url="/countries/add" icon="bi bi-plus-lg" text="Agregar País" />
        </div>

        <div className="card-body">
          {error && (
            <div className="alert alert-danger">
              {typeof error === 'string' ? error : 'Error cargando países'}
            </div>
          )}

          <GenericTable
            columns={[
              { header: 'Nombre', accessor: 'name' },
              { header: 'Country name', accessor: 'countryName' },
              { header: 'Código', accessor: 'countryCode' },
              {
                header: 'Activo',
                accessor: 'isActive',
                cell: (item) => (item.isActive ? 'Sí' : 'No'),
              },
              {
                header: 'Logo',
                accessor: 'logo',
                cell: (item) =>
                  item.logo ?
                    <img src={item.logo} alt={item.countryCode} className="rounded-circle" style={{ width: '20px', height: '20px', objectFit: 'cover' }} /> 
                    : <span class={`fi fi-${item.countryCode} fs-3`}></span>
              },
              {
                header: 'Comp.',
                accessor: 'competitions',
                cell: (item) => {
                  const count = Array.isArray(item.competitions) ? item.competitions.length : 0;
                  return String(count);
                }
              }
            ]}
            data={countries}
            loading={loading}
            onEdit={() => {}}
            onDelete={() => {}}
          />
        </div>
      </div>
    </div>
  );
};

export default CountriesIndex;

