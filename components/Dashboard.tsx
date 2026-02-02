import React from 'react';

interface DashboardProps {
  draftCount: number;
  servingCount: number;
}

const MetricCard: React.FC<{ title: string; count: number; isHighlighted?: boolean }> = ({ title, count, isHighlighted }) => (
  <div className={`flex-1 p-3 sm:p-4 bg-white rounded-xl border-2 text-center sm:text-left ${isHighlighted && count > 0 ? 'border-red-500 shadow-lg shadow-red-500/20 animate-pulse' : 'border-green-500'}`}>
    <p className="text-xs sm:text-sm text-gray-500">{title}</p>
    <p className="text-3xl sm:text-4xl font-black text-gray-900">{count}</p>
  </div>
);

const Dashboard: React.FC<DashboardProps> = ({ draftCount, servingCount }) => {
  const totalActive = draftCount + servingCount;
  // Do not render the dashboard if there are no active orders to show
  if (totalActive === 0) return null;

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex gap-3 sm:gap-4">
            <MetricCard title="En Preparación" count={draftCount} />
            <MetricCard title="En Cocina" count={servingCount} isHighlighted={true} />
        </div>
        {servingCount > 0 && (
            <p className="text-center text-xs sm:text-sm text-red-600 mt-2">
                {servingCount} pedido{servingCount > 1 ? 's' : ''} en cocina pendiente{servingCount > 1 ? 's' : ''} de pago.
            </p>
        )}
    </div>
  );
};

export default Dashboard;