
import React from 'react';
import { Table, TableStatus, WaiterAssignments } from '../types';

interface TableSelectionScreenProps {
  waiter: string;
  tables: Table[];
  waiterAssignments: WaiterAssignments;
  onSelectTable: (tableNumber: number) => void;
  onCreateToGoOrder: () => void;
  onOpenAddTableModal: () => void;
  getTable: (tableNumber: number) => Table;
  businessLogo?: string;
}

const statusStyles: { [key in TableStatus]: { text: string; bgColor: string; textColor: string; } } = {
  disponible: { text: 'LIBRE', bgColor: 'bg-green-500', textColor: 'text-green-600' },
  borrador: { text: 'PREPARANDO', bgColor: 'bg-amber-500', textColor: 'text-amber-600' },
  'no pagada': { text: 'OCUPADO', bgColor: 'bg-red-500', textColor: 'text-red-600' },
  pagada: { text: 'PAGADO', bgColor: 'bg-blue-500', textColor: 'text-blue-600' },
};

const TableCard: React.FC<{ table: Table, onSelect: () => void }> = ({ table, onSelect }) => {
  const { number, status } = table;
  const statusInfo = statusStyles[status] || statusStyles.disponible;

  return (
    <button
      onClick={onSelect}
      className="relative w-full aspect-[10/11] bg-card rounded-2xl shadow-lg border border-white/5 p-2 flex flex-col justify-center items-center text-center transition-all transform hover:-translate-y-2 hover:shadow-[0_20px_40px_var(--brand-shadow-color)] overflow-hidden bro-shadow group"
    >
      <div className="flex flex-col items-center justify-center gap-2 flex-grow group-hover:scale-110 transition-transform">
        <div>
          <p className="font-black text-[9px] text-gray-500 leading-none uppercase tracking-widest mb-1">Mesa</p>
          <p className="text-4xl font-black text-brand leading-none bro-gradient-text italic tracking-tighter">{number}</p>
        </div>
        <div>
          <div className={`w-3 h-3 rounded-full ${statusInfo.bgColor} shadow-[0_0_10px_var(--brand-shadow-color)] mx-auto mb-1.5`}></div>
          <p className="font-black text-[8px] text-gray-500 uppercase tracking-tighter">{statusInfo.text}</p>
        </div>
      </div>
    </button>
  );
};

const TogoOrderCard: React.FC<{ table: Table; onSelect: () => void }> = ({ table, onSelect }) => {
  const total = table.order.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const statusInfo = statusStyles[table.status];

  return (
    <button onClick={onSelect} className="relative w-full bg-card rounded-2xl shadow-lg border border-white/5 p-5 flex justify-between items-center transition-all transform hover:-translate-y-1 hover:shadow-brand/5 overflow-hidden group">
      <div className={`absolute top-0 left-0 bottom-0 w-1.5 ${statusInfo.bgColor}`}></div>
      <div className="flex items-center gap-4 pl-4">
        <div className="w-14 h-14 bg-white/5 border border-white/5 rounded-2xl flex items-center justify-center group-hover:bg-brand/10 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
        </div>
        <div>
          <h4 className="font-black text-lg text-left text-white uppercase italic tracking-tight">{table.customerName || `Pedido #${table.number}`}</h4>
          <p className="text-xs font-black text-gray-500 uppercase tracking-widest">{table.order.length} {table.order.length === 1 ? 'producto' : 'productos'}</p>
        </div>
      </div>
      <div className="text-right">
        <p className="font-black text-2xl text-white tracking-tighter">${total.toFixed(2)}</p>
        <p className={`text-[10px] font-black uppercase tracking-widest ${statusInfo.textColor}`}>{statusInfo.text}</p>
      </div>
    </button>
  );
};


const TableSelectionScreen: React.FC<TableSelectionScreenProps> = (props) => {
  const { waiter, onSelectTable, onCreateToGoOrder, waiterAssignments, getTable, tables, onOpenAddTableModal } = props;

  const assignedTableNumbers = waiterAssignments[waiter] || [];

  const physicalTablesForWaiter = assignedTableNumbers
    .map(num => getTable(num))
    .filter(table => table.orderType !== 'para llevar');

  const activeToGoOrders = tables.filter(t => t.orderType === 'para llevar');

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto w-full theme-bro bg-black min-h-full">
      <section className="mb-16">
        <h2 className="text-[11px] font-black text-brand uppercase tracking-[0.3em] mb-8 border-l-4 border-brand pl-4">Mesas Asignadas</h2>
        {physicalTablesForWaiter.length > 0 ? (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-4 sm:gap-6">
            {physicalTablesForWaiter.sort((a, b) => a.number - b.number).map((table) => {
              return <TableCard key={table.number} table={table} onSelect={() => onSelectTable(table.number)} />
            })}
            <button
              onClick={onOpenAddTableModal}
              className="flex items-center justify-center w-full aspect-[10/11] rounded-2xl bg-white/5 border-2 border-dashed border-white/10 text-white/20 transition-all transform hover:-translate-y-2 hover:bg-white/10 hover:border-brand/30 hover:text-brand"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </div>
        ) : (
          <div className="text-center py-10 bg-white border border-dashed border-gray-200 rounded-2xl shadow-sm max-w-2xl mx-auto">
            <h3 className="text-lg font-bold text-gray-800">No tienes mesas asignadas</h3>
            <p className="mt-2 text-sm text-gray-400">Ve a <span className="font-bold">Ajustes</span> para asignar tus mesas.</p>
          </div>
        )}
      </section>

      <section className="max-w-4xl pb-10">
        <div className="flex justify-between items-center mb-8 border-l-4 border-white/10 pl-4">
          <h2 className="text-[11px] font-black text-white/50 uppercase tracking-[0.3em]">Pedidos Para Llevar</h2>
          <button
            onClick={onCreateToGoOrder}
            className="flex items-center justify-center w-12 h-12 rounded-full bg-[var(--brand-color)] text-white transition-all transform hover:scale-105 shadow-lg shadow-[var(--brand-shadow-color)]"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {activeToGoOrders.length > 0 ? activeToGoOrders.map((table) => (
            <TogoOrderCard key={table.number} table={table} onSelect={() => onSelectTable(table.number)} />
          )) : (
            <div className="text-center py-10 bg-transparent col-span-full">
              <p className="mt-2 text-sm text-gray-400 font-medium italic">No hay pedidos para llevar activos.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default TableSelectionScreen;
