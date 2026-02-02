
import React, { useState, useMemo } from 'react';
import { SaleRecord, CartItem, OrderItem } from '../types';

interface SalesHistoryModalProps {
  reports: SaleRecord[];
  onClose: () => void;
}

type AggregatedSales = {
  [productName: string]: {
    totalQuantity: number;
    sales: {
      quantity: number;
      customer: string;
    }[];
  };
};

const SalesHistoryModal: React.FC<SalesHistoryModalProps> = ({ reports, onClose }) => {
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);

  const aggregatedData = useMemo(() => {
    const dailyReports = reports.filter(r => r.date === selectedDate);
    const aggregation: AggregatedSales = {};

    for (const report of dailyReports) {
      for (const item of report.order as (CartItem | OrderItem)[]) {
        if (!aggregation[item.name]) {
          aggregation[item.name] = { totalQuantity: 0, sales: [] };
        }
        aggregation[item.name].totalQuantity += item.quantity;
        aggregation[item.name].sales.push({
          quantity: item.quantity,
          customer: report.customerName || `Ref: ${report.tableNumber}`,
        });
      }
    }
    return aggregation;
  }, [reports, selectedDate]);

  const adjustDate = (days: number) => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + days);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  const isToday = selectedDate === new Date().toISOString().split('T')[0];

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[100] p-4 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
        <header className="flex-shrink-0 p-4 border-b flex justify-between items-center">
            <h2 className="text-xl font-black uppercase text-gray-800">Historial de Productos Vendidos</h2>
            <button onClick={onClose} className="p-2 bg-gray-100 rounded-full"><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
        </header>

        <div className="bg-gray-50 border-b p-4 flex items-center justify-between shadow-inner">
            <button onClick={() => adjustDate(-1)} className="p-3 bg-white rounded-full shadow border active:scale-90 transition-transform" title="Día Anterior">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" /></svg>
            </button>
            <div className="text-center">
                <span className={`text-[10px] font-black uppercase tracking-widest ${isToday ? 'text-red-500' : 'text-gray-400'}`}>
                    {isToday ? 'Hoy' : 'Día seleccionado'}
                </span>
                <span className="text-base font-black text-black tabular-nums">{selectedDate}</span>
            </div>
            <button onClick={() => adjustDate(1)} disabled={isToday} className="p-3 bg-white rounded-full shadow border active:scale-90 transition-transform disabled:opacity-30 disabled:cursor-not-allowed">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" /></svg>
            </button>
        </div>

        <div className="flex-grow overflow-y-auto p-4 space-y-4">
          {Object.keys(aggregatedData).length === 0 ? (
            <div className="py-24 text-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-200 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                <p className="text-gray-400 italic font-medium">No se vendieron productos en esta fecha.</p>
            </div>
          ) : (
            // Fix: Cast Object.entries result to explicitly define the structure of [key, value] pairs to avoid type errors on 'data' properties.
            (Object.entries(aggregatedData) as [string, AggregatedSales[string]][])
              .sort(([, a], [, b]) => b.totalQuantity - a.totalQuantity)
              .map(([productName, data]) => (
                <div key={productName} className="bg-gray-50 border border-gray-200 rounded-2xl p-4">
                  <div className="flex justify-between items-center mb-3 pb-2 border-b border-dashed">
                      <h3 className="font-black text-gray-800 text-lg">{productName}</h3>
                      <span className="font-black text-red-600 bg-red-100 text-sm px-3 py-1 rounded-full">
                          Total Vendidos: {data.totalQuantity}
                      </span>
                  </div>
                  <ul className="space-y-1 text-sm">
                    {data.sales.map((sale, index) => (
                      <li key={index} className="flex justify-between items-center bg-white p-2 rounded-md">
                        <span className="font-bold text-gray-700">{sale.quantity}x</span>
                        <span className="text-gray-500">{sale.customer}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))
          )}
        </div>
      </div>
    </div>
  );
};

export default SalesHistoryModal;
