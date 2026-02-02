

import React, { useState, useEffect, useRef } from 'react';
import { Table, AppSettings, WaiterAssignments, MenuCategory, MenuItem, ModifierOption, ModifierGroup, SelectedModifier } from '../types';
import TableSelectionScreen from './TableSelectionScreen';
import MenuScreen from './MenuScreen';
import CartScreen from './CartScreen';
import Dashboard from './Dashboard';

interface MainViewProps {
  waiter: string;
  tables: Table[];
  settings: AppSettings;
  menu: MenuCategory[];
  allModifierGroups: ModifierGroup[];
  selectedTable: number | null;
  waiterAssignments: WaiterAssignments;
  onSelectTable: (tableNumber: number) => void;
  onDeselectTable: () => void;
  onAddItem: (item: MenuItem, selectedModifiers: SelectedModifier[]) => void;
  onUpdateQuantity: (orderItemId: string, newQuantity: number) => void;
  onRemoveItem: (orderItemId: string) => void;
  onOpenConfirmPayModal: (table: Table) => void;
  onFreeTable: (table: Table) => void;
  onOpenConfirmSendModal: (table: Table) => void;
  onLogout: () => void;
  onGoToReports: () => void;
  onGoToSettings: () => void;
  onGoToKanban: () => void;
  onCreateToGoOrder: () => void;
  onOpenAddTableModal: () => void;
  getTable: (tableNumber: number) => Table;
  onUpdateObservations: (observations: string) => void;
  onUpdateCustomerName: (customerName: string) => void;
  onShowQrModal: (data: { title: string; data: string; isImage?: boolean } | null) => void;
  onShowMessageModal: () => void;
  businessName: string;
  businessLogo: string;
  onOpenModifierModal: (item: MenuItem) => void;
  onOpenMoveTableModal: (table: Table) => void;
  onOpenPendingPaymentsModal: () => void;
  onPrintComanda: (table: Table) => void;
  isPrinterConnected: boolean;
  whatsappNumber: string;
  onRequestAdminCancel: (table: Table, itemId: string) => void;
  onOpenBarcodeScanner: () => void;
}


const MainView: React.FC<MainViewProps> = (props) => {
  const [activePanel, setActivePanel] = useState<'cart' | 'tables' | 'menu'>('tables');
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchCurrentX, setTouchCurrentX] = useState<number | null>(null);
  const isSwiping = useRef(false);

  useEffect(() => {
    if (props.selectedTable !== null) {
      setActivePanel('menu');
    } else {
      setActivePanel('tables');
    }
  }, [props.selectedTable]);
  
  const handleGoToCart = () => setActivePanel('cart');
  const handleBackToMenu = () => setActivePanel('menu');
  
  const handleTouchStart = (e: React.TouchEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest('button, input, textarea, a, select')) {
        return;
    }
    setTouchStartX(e.touches[0].clientX);
    isSwiping.current = true;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isSwiping.current || touchStartX === null) return;
    setTouchCurrentX(e.touches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!isSwiping.current || touchStartX === null || touchCurrentX === null) return;

    const diff = touchStartX - touchCurrentX;
    const threshold = 50;

    if (Math.abs(diff) > threshold) {
      if (diff > 0) { // Swiped left
        if (activePanel === 'cart') setActivePanel('tables');
        else if (activePanel === 'tables') setActivePanel('menu');
      } else { // Swiped right
        if (activePanel === 'menu') setActivePanel('tables');
        else if (activePanel === 'tables') setActivePanel('cart');
      }
    }
    
    setTouchStartX(null);
    setTouchCurrentX(null);
    isSwiping.current = false;
  };

  const selectedTableObject = props.selectedTable !== null ? props.getTable(props.selectedTable) : null;
  const isMenuVisible = props.selectedTable !== null && activePanel === 'menu';
  const isCartVisible = props.selectedTable !== null && activePanel === 'cart';
  const isTableSelectionVisible = props.selectedTable === null;

  // Fix: Calculate activeRate from settings to pass to child components.
  const activeRate = props.settings.activeExchangeRate === 'bcv'
    ? props.settings.exchangeRateBCV
    : props.settings.exchangeRateParallel;

  return (
    <div className="h-[100dvh] w-full flex flex-col bg-[var(--page-bg-color)] overflow-hidden">
      <header className="flex-shrink-0 bg-[var(--brand-color)] text-white shadow-lg p-3 sm:p-4 flex justify-between items-center z-30">
        <div className="flex items-center gap-3">
          <img src={props.businessLogo} alt="Logo" className="h-9 w-9 bg-white rounded-full p-1 shadow-inner" />
          <div className="flex flex-col">
            <h1 className="text-xs font-black uppercase tracking-tighter leading-none">{props.businessName}</h1>
            <p className="text-[10px] font-bold opacity-70 leading-none mt-0.5">{props.waiter}</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
           <button onClick={props.onOpenPendingPaymentsModal} className="p-2 rounded-full active:bg-white/20 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8v1m0 6v1m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </button>
           <button onClick={props.onGoToKanban} className="p-2 rounded-full active:bg-white/20 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
          </button>
          <button onClick={props.onGoToReports} className="p-2 rounded-full active:bg-white/20 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
          </button>
          <button onClick={props.onLogout} className="p-2 rounded-full active:bg-white/20 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
          </button>
        </div>
      </header>

      <main 
        className="flex-grow overflow-hidden relative"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div 
            className="h-full w-full flex transition-transform duration-300 ease-in-out" 
            style={{ transform: `translateX(-${isTableSelectionVisible ? 0 : (isMenuVisible ? 100 : 200)}%)` }}
        >
          {/* Panel Mesas */}
          <div className="h-full w-full flex-shrink-0 overflow-y-auto scrollbar-hide">
            <TableSelectionScreen
              waiter={props.waiter}
              tables={props.tables}
              waiterAssignments={props.waiterAssignments}
              onSelectTable={props.onSelectTable}
              onCreateToGoOrder={props.onCreateToGoOrder}
              onOpenAddTableModal={props.onOpenAddTableModal}
              getTable={props.getTable}
              businessLogo={props.businessLogo}
            />
          </div>
          {/* Panel Menú */}
          <div className="h-full w-full flex-shrink-0">
            <MenuScreen 
              table={selectedTableObject} 
              waiter={props.waiter}
              menu={props.menu}
              onAddItem={props.onAddItem}
              onOpenModifierModal={props.onOpenModifierModal}
              onGoToCart={handleGoToCart}
              onDeselectTable={props.onDeselectTable}
              onOpenBarcodeScanner={props.onOpenBarcodeScanner}
              businessName={props.businessName}
              businessLogo={props.businessLogo}
              // FIX: Pass missing required props to MenuScreen.
              // In POS mode, the table's order acts as the cart.
              // A type cast is used to resolve type mismatches between OrderItem and CartItem.
              cart={selectedTableObject?.order as any[] || []}
              onUpdateQuantity={props.onUpdateQuantity}
              onRemoveItem={props.onRemoveItem}
              // Fix: Pass missing activeRate prop.
              activeRate={activeRate}
            />
          </div>
          {/* Panel Carrito */}
          <div className="h-full w-full flex-shrink-0 overflow-hidden">
            <CartScreen
              table={selectedTableObject}
              waiter={props.waiter}
              settings={props.settings}
              onUpdateQuantity={props.onUpdateQuantity}
              onRemoveItem={props.onRemoveItem}
              onBackToMenu={handleBackToMenu}
              onOpenConfirmPayModal={props.onOpenConfirmPayModal}
              onFreeTable={props.onFreeTable}
              onOpenConfirmSendModal={props.onOpenConfirmSendModal}
              onUpdateObservations={props.onUpdateObservations}
              onUpdateCustomerName={props.onUpdateCustomerName}
              onShowQrModal={props.onShowQrModal}
              onShowMessageModal={props.onShowMessageModal}
              onEditItem={() => {}}
              onOpenMoveTableModal={props.onOpenMoveTableModal}
              onPrintComanda={props.onPrintComanda}
              isPrinterConnected={props.isPrinterConnected}
              whatsappNumber={props.whatsappNumber}
              onRequestAdminCancel={props.onRequestAdminCancel}
              menu={props.menu}
              allModifierGroups={props.allModifierGroups}
              // Fix: Pass missing activeRate prop.
              activeRate={activeRate}
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default MainView;
