import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import ButtonNavigation from '../../../components/Button/ButtonNavigation';
import GenericTable from '../../../components/Table.jsx/GenericTable';
import { getTicketPromotions } from '../../../store/tickets/promotionsSlice';
import { formatDateTime, formatPromotionType } from '../../../utils/ticketsApi';
import { formatErrorForDisplay } from '../../../utils/apiErrorMessage';

export default function TicketPromotionsIndex() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { list = [], loading, error } = useSelector((state) => state.ticketPromotions);

  useEffect(() => {
    dispatch(getTicketPromotions());
  }, [dispatch]);

  return (
    <div className="container-fluid">
      <div className="card shadow">
        <div className="card-header d-flex justify-content-between">
          <h4 className="mb-0">Boletos — Promociones</h4>
          <ButtonNavigation url="/tickets/promotions/add" icon="bi bi-plus-lg" text="Nueva promoción" />
        </div>
        <div className="card-body">
          {error && <div className="alert alert-danger">{formatErrorForDisplay(error)}</div>}
          <GenericTable
            columns={[
              { header: 'Nombre', accessor: 'name' },
              { header: 'Tipo', cell: (item) => formatPromotionType(item.type) },
              { header: 'Valor', accessor: 'value' },
              { header: 'Inicio', cell: (item) => formatDateTime(item.startDate) },
              { header: 'Fin', cell: (item) => formatDateTime(item.endDate) },
              { header: 'Activo', cell: (item) => (item.active ? 'Sí' : 'No') },
            ]}
            data={list}
            loading={loading}
            onEdit={(item) => navigate(`/tickets/promotions/edit/${item.id}`)}
          />
        </div>
      </div>
    </div>
  );
}
