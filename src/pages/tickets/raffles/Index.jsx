import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import GenericTable from '../../../components/Table.jsx/GenericTable';
import {
  createTicketRaffle,
  drawRaffle,
  getTicketRaffles,
} from '../../../store/tickets/rafflesSlice';
import { getTicketEvents } from '../../../store/tickets/eventsSlice';
import { formatRaffleStatus } from '../../../utils/ticketsApi';

export default function TicketRafflesIndex() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { list = [], loading } = useSelector((state) => state.ticketRaffles);
  const { list: events = [] } = useSelector((state) => state.ticketEvents);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ eventId: '', name: '', description: '' });

  useEffect(() => {
    dispatch(getTicketRaffles());
    dispatch(getTicketEvents());
  }, [dispatch]);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await dispatch(createTicketRaffle(form)).unwrap();
      setShowForm(false);
      dispatch(getTicketRaffles());
      Swal.fire({ icon: 'success', title: 'Sorteo creado', timer: 1500, showConfirmButton: false });
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Error', text: String(err) });
    }
  };

  const handleDraw = (item) => {
    Swal.fire({
      icon: 'warning',
      title: 'Realizar sorteo',
      text: `¿Sortear "${item.name}"? Solo participan compradores por APP.`,
      showCancelButton: true,
    }).then(async (result) => {
      if (!result.isConfirmed) return;
      try {
        await dispatch(drawRaffle(item.id)).unwrap();
        dispatch(getTicketRaffles());
        Swal.fire({ icon: 'success', title: 'Sorteo realizado' });
      } catch (err) {
        Swal.fire({ icon: 'error', title: 'Error', text: String(err) });
      }
    });
  };

  return (
    <div className="container-fluid">
      <div className="card shadow">
        <div className="card-header d-flex justify-content-between">
          <h4 className="mb-0">Boletos — Sorteos</h4>
          <button type="button" className="btn btn-primary btn-sm" onClick={() => setShowForm(!showForm)}>
            {showForm ? 'Cancelar' : 'Nuevo sorteo'}
          </button>
        </div>
        <div className="card-body">
          {showForm && (
            <form className="row g-2 mb-4 border rounded p-3" onSubmit={handleCreate}>
              <div className="col-md-4">
                <select className="form-select" value={form.eventId} onChange={(e) => setForm({ ...form, eventId: e.target.value })} required>
                  <option value="">Evento</option>
                  {events.map((ev) => <option key={ev.id} value={ev.id}>{ev.name}</option>)}
                </select>
              </div>
              <div className="col-md-3">
                <input className="form-control" placeholder="Nombre" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div className="col-md-3">
                <input className="form-control" placeholder="Descripción" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </div>
              <div className="col-md-2">
                <button type="submit" className="btn btn-success w-100">Crear</button>
              </div>
            </form>
          )}
          <GenericTable
            columns={[
              { header: 'Nombre', accessor: 'name' },
              { header: 'Evento', cell: (item) => item.event?.name ?? '—' },
              { header: 'Estado', cell: (item) => formatRaffleStatus(item.status) },
              { header: 'Premios', cell: (item) => item.prizes?.length ?? 0 },
            ]}
            data={list}
            loading={loading}
            onEdit={(item) => navigate(`/tickets/raffles/${item.id}`)}
          />
          <div className="mt-3">
            {list.filter((r) => r.status !== 'DRAWN').map((r) => (
              <button key={r.id} type="button" className="btn btn-outline-warning btn-sm me-2 mb-2" onClick={() => handleDraw(r)}>
                Sortear: {r.name}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
