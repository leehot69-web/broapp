
import React from 'react';
import { Table } from '../types';

interface KanbanScreenProps {
  orders: Table[];
  onGoToTables: () => void;
  onSelectOrder: (tableNumber: number) => void;
  getWaiterForTable: (tableNumber: number) => string;
}

const OrderCard: React.FC<{ order: Table; onSelect: () => void; waiterName: string }> = ({ order, onSelect, waiterName }) => {
  const total = order.order.reduce((acc, item) => {
    const modifiersTotal = item.selectedModifiers.reduce((modAcc, mod) => modAcc + mod.price, 0);
    return acc + (item.price + modifiersTotal) * item.quantity;
  }, 0);

  const displayName = order.orderType === 'para llevar'
    ? (order.customerName || `Para Llevar #${order.number}`)
    : `Mesa ${order.number}`;

  const sentAtTime = order.sentToKitchenAt 
    ? new Date(order.sentToKitchenAt).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }) 
    : null;

  return (
    <button
      onClick={onSelect}
      className="w-full bg-[var(--card-bg-color)] rounded-xl shadow-md border border-[var(--border-color)] p-4 text-left transition-all transform hover:-translate-y-1 hover:shadow-lg hover:shadow-[var(--brand-shadow-color)]"
    >
      <div className="flex justify-between items-start">
        <h3 className="font-bold text-lg text-gray-800 truncate">
          {displayName}
        </h3>
        {order.orderCode && <span className="text-xs font-mono bg-gray-100 text-gray-600 px-2 py-1 rounded">{order.orderCode}</span>}
      </div>
      
      <div className="flex justify-between items-end mt-4">
        <div>
          <p className="text-gray-500 text-sm">Mesonero: {waiterName}</p>
          {sentAtTime && (
            <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Enviado: {sentAtTime}</span>
            </div>
          )}
        </div>
        <p className="text-right font-black text-2xl text-gray-900">${total.toFixed(2)}</p>
      </div>
    </button>
  );
};


const KanbanColumn: React.FC<{ title: string; color: string; orders: Table[]; onSelectOrder: (tableNumber: number) => void; getWaiterForTable: (tableNumber: number) => string; }> = ({ title, color, orders, onSelectOrder, getWaiterForTable }) => (
    <div className="flex-shrink-0 w-80 bg-gray-100/80 rounded-2xl p-3 border-2 border-[var(--brand-color)]">
        <div className="flex items-center gap-2 mb-4 px-2">
            <div className={`w-3 h-3 rounded-full ${color}`}></div>
            <h2 className="font-bold text-lg text-gray-700">{title}</h2>
            <span className="ml-auto font-semibold text-gray-500 bg-gray-200 rounded-full px-2.5 py-0.5 text-sm">{orders.length}</span>
        </div>
        <div className="space-y-4 overflow-y-auto h-[calc(100%-2.5rem)] pr-1">
            {orders.length > 0 ? (
                 orders.sort((a,b) => (a.sentToKitchenAt ? new Date(a.sentToKitchenAt).getTime() : 0) - (b.sentToKitchenAt ? new Date(b.sentToKitchenAt).getTime() : 0)).map(order => (
                    <OrderCard 
                        key={order.number} 
                        order={order} 
                        onSelect={() => onSelectOrder(order.number)}
                        waiterName={getWaiterForTable(order.number)}
                    />
                ))
            ) : (
                <div className="text-center py-10 text-gray-400">
                    <p>No hay pedidos en esta etapa.</p>
                </div>
            )}
        </div>
    </div>
);

const KanbanScreen: React.FC<KanbanScreenProps> = ({ orders, onGoToTables, onSelectOrder, getWaiterForTable }) => {
  const draftOrders = orders.filter(o => o.status === 'borrador');
  const servingOrders = orders.filter(o => o.status === 'no pagada');
  const paidOrders = orders.filter(o => o.status === 'pagada');

  return (
    <div className="h-screen flex flex-col">
        <header className="flex-shrink-0 flex items-center justify-between mb-4 p-4 sm:p-6 sticky top-0 bg-white/50 backdrop-blur-sm z-10">
            <button onClick={onGoToTables} className="flex items-center text-[var(--text-on-page-bg-color)]/80 hover:text-[var(--text-on-page-bg-color)] font-semibold">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Mesas
            </button>
            <h1 className="text-3xl font-bold text-[var(--text-on-page-bg-color)]">Panel de Pedidos</h1>
        </header>

        <main className="flex-grow flex gap-4 overflow-x-auto p-4 pt-0 scrollbar-hide">
            <KanbanColumn title="En Preparación" color="bg-amber-400" orders={draftOrders} onSelectOrder={onSelectOrder} getWaiterForTable={getWaiterForTable} />
            <KanbanColumn title="En Cocina / Servido" color="bg-red-500" orders={servingOrders} onSelectOrder={onSelectOrder} getWaiterForTable={getWaiterForTable} />
            <KanbanColumn title="Pagado / Listo" color="bg-green-500" orders={paidOrders} onSelectOrder={onSelectOrder} getWaiterForTable={getWaiterForTable} />
        </main>
    </div>
  );
};

export default KanbanScreen;
