
import React, { useState, useEffect, useCallback } from 'react';
import { View, MenuItem, StoreProfile, CartItem, CustomerDetails, SelectedModifier, MenuCategory, ModifierGroup, AppSettings, SaleRecord, ThemeName, PizzaConfiguration } from './types';
import { useLocalStorage } from './hooks/useLocalStorage';
import { BRO_MENU_DATA, BRO_MODIFIERS, PIZZA_BASE_PRICES, PIZZA_INGREDIENTS } from './constants';
import MenuScreen from './components/MenuScreen';
import CartScreen from './components/CartScreen';
import CheckoutScreen from './components/CheckoutScreen';
import ProductModifierModal from './components/ProductModifierModal';
import PizzaBuilderModal from './components/PizzaBuilderModal';
import SplashScreen from './components/SplashScreen';
import SettingsScreen from './components/SettingsScreen';
import ReportsScreen from './components/ReportsScreen';
import InstallPromptModal from './components/InstallPromptModal';
import { generateTestPrintCommands, generateReceiptCommands } from './utils/escpos';
import SalesHistoryModal from './components/SalesHistoryModal';
import ConfirmOrderModal from './components/ConfirmOrderModal';
import SuccessScreen from './components/SuccessScreen';
import AdminAuthModal from './components/AdminAuthModal';

function App() {
  // --- ESTADO PERSISTENTE ---
  const [menu, setMenu] = useLocalStorage<MenuCategory[]>('app_menu_bro_v1', BRO_MENU_DATA);
  const [modifierGroups, setModifierGroups] = useLocalStorage<ModifierGroup[]>('app_modifiers_bro_v1', BRO_MODIFIERS);
  const [theme, setTheme] = useLocalStorage<ThemeName>('app_theme_bro_v1', 'bro');
  const [businessName, setBusinessName] = useLocalStorage<string>('app_business_name_bro_v1', 'BRO');
  const businessLogo = "/menu_images/bro.png";

  const [session, setSession] = useLocalStorage<{ waiter: string, targetNumber: string }>('pos_session_bro_v1', {
    waiter: '',
    targetNumber: ''
  });

  const [settings, setSettings] = useLocalStorage<AppSettings>('app_settings_bro_v1', {
    totalTables: 20,
    printerPaperWidth: '58mm',
    exchangeRateBCV: 36.5,
    exchangeRateParallel: 40,
    activeExchangeRate: 'parallel',
    isTrialActive: false,
    operationCount: 0,
    adminPin: '0000',
    personnel: [
      { id: 'admin-1', name: 'Administrador', pin: '0000', role: 'admin' }
    ]
  });

  const [reports, setReports] = useLocalStorage<SaleRecord[]>('app_sales_reports_bro_v1', []);
  const [cart, setCart] = useLocalStorage<CartItem[]>('active_cart_bro_v1', []);
  const [editingReportId, setEditingReportId] = useLocalStorage<string | null>('active_editing_id_bro_v1', null);
  const [currentView, setCurrentView] = useState<View>('menu');
  const [isAppReady, setIsAppReady] = useState(false);
  const [triggerCartShake, setTriggerCartShake] = useState(false);
  const [modifierModalItem, setModifierModalItem] = useState<MenuItem | null>(null);
  const [editingCartItemId, setEditingCartItemId] = useState<string | null>(null);
  const [isSalesHistoryModalOpen, setIsSalesHistoryModalOpen] = useState(false);
  const [isConfirmOrderModalOpen, setConfirmOrderModalOpen] = useState(false);
  const [pendingVoidReportId, setPendingVoidReportId] = useState<string | null>(null);
  const [isAdminAuthForSettings, setIsAdminAuthForSettings] = useState(false);
  const [lastSoldRecord, setLastSoldRecord] = useState<{ cart: CartItem[], details: CustomerDetails } | null>(null);

  // --- Lógica PWA ---
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallBtn, setShowInstallBtn] = useState(false);
  const [showInstallModal, setShowInstallModal] = useState(false);
  const [platform, setPlatform] = useState<'ios' | 'android' | 'other'>('other');

  // --- Estado de la Impresora ---
  const [printerDevice, setPrinterDevice] = useState<any | null>(null);
  const [printerCharacteristic, setPrinterCharacteristic] = useState<any | null>(null);
  const [isPrinterConnected, setIsPrinterConnected] = useState(false);
  const textEncoder = new TextEncoder();

  useEffect(() => {
    if (!settings.personnel) {
      setSettings(prev => ({
        ...prev,
        personnel: [
          { id: 'admin-1', name: 'Administrador', pin: '0000', role: 'admin' }
        ]
      }));
    }
  }, [settings.personnel, setSettings]);

  useEffect(() => {
    const userAgent = window.navigator.userAgent.toLowerCase();
    if (/iphone|ipad|ipod/.test(userAgent)) {
      setPlatform('ios');
      if (!window.matchMedia('(display-mode: standalone)').matches) {
        setShowInstallBtn(true);
      }
    } else if (/android/.test(userAgent)) {
      setPlatform('android');
    }
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallBtn(true);
      setPlatform('android');
    });
  }, []);

  const handleInstallClick = () => {
    setShowInstallModal(true);
  };

  const triggerNativeInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
      setShowInstallBtn(false);
      setShowInstallModal(false);
    }
  };

  const [customerDetails, setCustomerDetails] = useLocalStorage<CustomerDetails>('current_order_details_bro_v1', {
    name: '',
    phone: '',
    paymentMethod: 'Efectivo',
    instructions: ''
  });

  const activeRate = settings.activeExchangeRate === 'bcv' ? settings.exchangeRateBCV : settings.exchangeRateParallel;

  useEffect(() => {
    document.body.className = `theme-${theme}`;
  }, [theme]);

  const sendDataToPrinter = async (characteristic: any, data: Uint8Array) => {
    const CHUNK_SIZE = 64;
    for (let i = 0; i < data.length; i += CHUNK_SIZE) {
      const chunk = data.slice(i, i + CHUNK_SIZE);
      await characteristic.writeValue(chunk);
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  };

  const handleConnectPrinter = async () => {
    try {
      const device = await (navigator as any).bluetooth.requestDevice({
        filters: [{ services: ['000018f0-0000-1000-8000-00805f9b34fb'] }],
      });
      if (!device.gatt) return;
      const server = await device.gatt.connect();
      const service = await server.getPrimaryService('000018f0-0000-1000-8000-00805f9b34fb');
      const characteristic = await service.getCharacteristic('00002af1-0000-1000-8000-00805f9b34fb');
      setPrinterDevice(device);
      setPrinterCharacteristic(characteristic);
      setIsPrinterConnected(true);
      device.addEventListener('gattserverdisconnected', () => {
        setIsPrinterConnected(false);
        setPrinterDevice(null);
        setPrinterCharacteristic(null);
      });
    } catch (error) {
      console.error("Error conectando a la impresora:", error);
    }
  };

  const handleDisconnectPrinter = () => {
    if (printerDevice && printerDevice.gatt) {
      printerDevice.gatt.disconnect();
    }
  };

  const handlePrintTest = async () => {
    if (!printerCharacteristic && !settings.useSystemPrint) return;
    try {
      const commands = generateTestPrintCommands({ ...settings, businessName: businessName });

      if (settings.useSystemPrint) {
        printViaSystem(commands);
      } else if (printerCharacteristic) {
        const data = textEncoder.encode(commands);
        await sendDataToPrinter(printerCharacteristic, data);
      }
    } catch (error) {
      console.error("Error al imprimir:", error);
    }
  };

  const printViaSystem = (commands: string) => {
    const cleanContent = commands
      .replace(/\x1B\x40/g, "")
      .replace(/\x1B\x74\x02/g, "")
      .replace(/\x1B\x61\x31/g, "<div style='text-align:center'>")
      .replace(/\x1B\x61\x30/g, "</div><div style='text-align:left'>")
      .replace(/\x1B\x61\x32/g, "</div><div style='text-align:right'>")
      .replace(/\x1B\x21\x30/g, "<span style='font-size:1.5em;font-weight:bold'>")
      .replace(/\x1B\x21\x08/g, "<strong>")
      .replace(/\x1B\x21\x00/g, "</span></strong>")
      .replace(/\x1D\x56\x41\x03/g, "")
      .replace(/\n/g, "<br>")
      .replace(/\s\s/g, "&nbsp;&nbsp;");

    const printWindow = window.open('', '_blank', 'width=300,height=600');
    if (!printWindow) return;

    const paperWidth = settings.printerPaperWidth === '80mm' ? '280px' : '190px';

    printWindow.document.write(`
      <html>
        <head>
          <title>Ticket - ${businessName}</title>
          <style>
            @page { margin: 0; }
            body { 
              font-family: 'Courier New', Courier, monospace; 
              font-size: 11px; 
              width: ${paperWidth}; 
              margin: 0; 
              padding: 5px;
              line-height: 1.1;
              background: white;
              color: black;
            }
            .content { white-space: normal; word-wrap: break-word; }
            strong { font-weight: bold; }
          </style>
        </head>
        <body onload="window.print();setTimeout(() => window.close(), 500)">
          <div class="content">${cleanContent}</div>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handlePrintOrder = async (overrideStatus?: string, isReprint: boolean = false) => {
    if (!printerCharacteristic && !settings.useSystemPrint) {
      console.warn("Impresora no conectada. No se pudo imprimir.");
      return;
    }
    try {
      const cartToPrint = cart.length > 0 ? cart : (lastSoldRecord?.cart || []);
      const detailsToPrint = cart.length > 0 ? customerDetails : (lastSoldRecord?.details || customerDetails);

      const isEdit = !!editingReportId;
      const newItems = cart.filter(i => i.notes !== 'original');
      const shouldPrintPartial = isEdit && overrideStatus === 'POR COBRAR' && newItems.length > 0;

      const finalItemsToPrint = shouldPrintPartial ? newItems : cartToPrint;
      const customDetails = overrideStatus ? { ...detailsToPrint, paymentMethod: overrideStatus } : detailsToPrint;

      const receiptTitle = shouldPrintPartial
        ? "ADICIONAL - POR PAGAR"
        : (isReprint ? "RECIBO DE PEDIDO (COPIA)" : "RECIBO DE PEDIDO");

      let previousTotal = 0;
      if (shouldPrintPartial) {
        previousTotal = cart.reduce((acc, item) => {
          if (item.notes === 'original') {
            const pizzaModPrice = item.pizzaConfig ? item.pizzaConfig.ingredients.reduce((acc, sel) => acc + (sel.ingredient.prices[item.pizzaConfig!.size] / (sel.half === 'full' ? 1 : 2)), 0) : 0;
            const traditionalModsPrice = item.selectedModifiers.reduce((acc, mod) => acc + mod.option.price, 0);
            return acc + ((item.price + pizzaModPrice + traditionalModsPrice) * item.quantity);
          }
          return acc;
        }, 0);
      }

      const commands = generateReceiptCommands(finalItemsToPrint, customDetails, { ...settings, businessName: businessName }, session.waiter, receiptTitle, previousTotal);

      if (settings.useSystemPrint) {
        printViaSystem(commands);
      } else if (printerCharacteristic) {
        const data = textEncoder.encode(commands);
        await sendDataToPrinter(printerCharacteristic, data);
      }
    } catch (error) {
      console.error("Error al imprimir recibo:", error);
    }
  };

  const handleReprintSaleRecord = async (sale: SaleRecord) => {
    if (!printerCharacteristic && !settings.useSystemPrint) return;
    try {
      const customerDetailsForReprint: CustomerDetails = {
        name: sale.customerName || (sale.tableNumber > 0 ? `Ref: ${sale.tableNumber}` : 'Pedido Directo'),
        paymentMethod: sale.notes || 'No especificado',
        phone: '',
        instructions: '',
      };
      const commands = generateReceiptCommands(sale.order as CartItem[], customerDetailsForReprint, { ...settings, businessName: businessName }, sale.waiter, "RECIBO DE PEDIDO (COPIA)");

      if (settings.useSystemPrint) {
        printViaSystem(commands);
      } else if (printerCharacteristic) {
        const data = textEncoder.encode(commands);
        await sendDataToPrinter(printerCharacteristic, data);
      }
    } catch (error) {
      console.error("Error al re-imprimir recibo:", error);
    }
  };

  const handleEditPendingReport = (report: SaleRecord, targetView: View = 'cart') => {
    const mappedOrder = (report.order as CartItem[]).map(item => ({
      ...item,
      notes: 'original'
    }));
    setCart(mappedOrder);
    setCustomerDetails({
      name: report.customerName || '',
      phone: '',
      paymentMethod: 'Efectivo',
      instructions: ''
    });
    setEditingReportId(report.id);
    setCurrentView(targetView);
  };

  const handleVoidReport = (reportId: string) => {
    setPendingVoidReportId(reportId);
  };

  const executeVoidReport = () => {
    if (!pendingVoidReportId) return;
    setReports(prev => prev.map(r => r.id === pendingVoidReportId ? { ...r, notes: 'ANULADO', total: 0, type: 'refund' } : r));
    setPendingVoidReportId(null);
  };

  const [loginPin, setLoginPin] = useState('');
  const [loginError, setLoginError] = useState('');

  const handlePersonnelLogin = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const personnelId = formData.get('personnelId') as string;
    const pin = formData.get('pin') as string;
    const targetNumber = formData.get('targetNumber') as string;

    const person = (settings.personnel || []).find(p => p.id === personnelId);
    if (person) {
      if (person.pin === pin) {
        setSession({ waiter: person.name, targetNumber: targetNumber.replace(/\D/g, '') });
        setLoginError('');
        setLoginPin('');
        setCurrentView('menu');
      } else {
        setLoginError('PIN Incorrecto');
      }
    }
  };

  const handleLogout = () => {
    setSession({ waiter: '', targetNumber: '' });
    setCurrentView('menu');
  };

  const handleStartNewDay = () => {
    if (window.confirm("¿Estás seguro de finalizar tu jornada actual? Al hacerlo, el contador de ventas de hoy volverá a cero (las cuentas pendientes seguirán abiertas).")) {
      setReports(prev => prev.map(r => {
        if (r.waiter === session.waiter && r.notes !== 'PENDIENTE') {
          return { ...r, isShiftClosed: true };
        }
        return r;
      }));

      setCart([]);
      setEditingReportId(null);
      setSession({ waiter: '', targetNumber: '' });
      setCurrentView('menu');
    }
  };

  const handleUpdateQuantity = (cartItemId: string, newQuantity: number) => {
    const item = cart.find(i => i.id === cartItemId);
    if (item?.notes === 'original') {
      alert("No puedes modificar items ya servidos. Agrega uno nuevo al pedido.");
      return;
    }

    if (newQuantity <= 0) {
      setCart(prev => prev.filter(i => i.id !== cartItemId));
    } else {
      setCart(prev => prev.map(i => i.id === cartItemId ? { ...i, quantity: newQuantity } : i));
    }
    setTriggerCartShake(true);
    setTimeout(() => setTriggerCartShake(false), 500);
  };

  const handleAddItem = (item: MenuItem, selectedModifiers: SelectedModifier[], quantity: number, instructions?: string, pizzaConfig?: PizzaConfiguration) => {
    const hasModifiers = (item.modifierGroupTitles && item.modifierGroupTitles.length > 0) || pizzaConfig;

    // Si no hay modificadores y no hay instrucciones y no es pizza, podemos agrupar
    if (!hasModifiers && (!instructions || instructions.trim() === '')) {
      const existingItem = cart.find(cartItem => cartItem.name === item.name && cartItem.selectedModifiers.length === 0 && cartItem.notes !== 'original' && (!cartItem.specialInstructions || cartItem.specialInstructions === ''));
      if (existingItem) {
        handleUpdateQuantity(existingItem.id, existingItem.quantity + quantity);
        return;
      }
    }

    setCart(prev => [...prev, {
      id: Math.random().toString(36).substr(2, 9),
      name: item.name,
      price: item.price,
      quantity: quantity,
      selectedModifiers: selectedModifiers,
      specialInstructions: instructions,
      description: item.description,
      pizzaConfig: pizzaConfig
    }]);
    setTriggerCartShake(true);
    setTimeout(() => setTriggerCartShake(false), 500);
  };

  const handleClearCart = () => {
    const isEditing = !!editingReportId;
    const hasItems = cart.length > 0;

    if (!hasItems && !isEditing && !customerDetails.name) {
      return;
    }

    const msg = isEditing
      ? "¿Seguro que deseas ABANDONAR la edición actual? Se perderán los cambios no guardados."
      : "¿Seguro que deseas borrar todo el pedido actual y empezar de cero?";

    if (window.confirm(msg)) {
      setCart([]);
      setEditingReportId(null);
      setCustomerDetails({
        name: '',
        phone: '',
        paymentMethod: 'Efectivo',
        instructions: ''
      });
      setCurrentView('menu');
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 100);
    }
  };

  const finalizeOrder = (isPaid: boolean = true) => {
    const cartTotal = cart.reduce((acc, item) => {
      const pizzaModPrice = item.pizzaConfig ? item.pizzaConfig.ingredients.reduce((acc, sel) => acc + (sel.ingredient.prices[item.pizzaConfig!.size] / (sel.half === 'full' ? 1 : 2)), 0) : 0;
      const traditionalModsPrice = item.selectedModifiers.reduce((acc, mod) => acc + mod.option.price, 0);
      return acc + ((item.price + pizzaModPrice + traditionalModsPrice) * item.quantity);
    }, 0);

    const newReport: SaleRecord = {
      id: Math.random().toString(36).substr(2, 9),
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString(),
      tableNumber: parseInt(customerDetails.name) || 0,
      waiter: session.waiter,
      total: cartTotal,
      order: [...cart],
      type: 'sale',
      notes: isPaid ? customerDetails.paymentMethod : 'PENDIENTE',
      customerName: customerDetails.name
    };

    setReports(prev => {
      const filtered = editingReportId ? prev.filter(r => r.id !== editingReportId) : prev;
      return [newReport, ...filtered];
    });

    setLastSoldRecord({ cart: [...cart], details: { ...customerDetails } });

    setCart([]);
    setEditingReportId(null);
    setCustomerDetails({ name: '', phone: '', paymentMethod: 'Efectivo', instructions: '' });

    setCurrentView('success');
  };

  const handleStartNewOrder = () => {
    setCart([]);
    setEditingReportId(null);
    setCustomerDetails({ name: '', phone: '', paymentMethod: 'Efectivo', instructions: '' });
    setCurrentView('menu');
  };

  const executeSendToWhatsapp = (isUnpaid: boolean = false) => {
    const cartTotal = cart.reduce((acc, item) => {
      const pizzaModPrice = item.pizzaConfig ? item.pizzaConfig.ingredients.reduce((acc, sel) => acc + (sel.ingredient.prices[item.pizzaConfig!.size] / (sel.half === 'full' ? 1 : 2)), 0) : 0;
      const traditionalModsPrice = item.selectedModifiers.reduce((acc, mod) => acc + mod.option.price, 0);
      return acc + ((item.price + pizzaModPrice + traditionalModsPrice) * item.quantity);
    }, 0);

    const isEdit = !!editingReportId;
    const newItems = cart.filter(i => i.notes !== 'original');

    const shouldSendPartial = isEdit && isUnpaid;
    const itemsToSend = shouldSendPartial && newItems.length > 0 ? newItems : cart;
    const displayTotal = shouldSendPartial ? newItems.reduce((acc, item) => {
      const pMod = item.pizzaConfig ? item.pizzaConfig.ingredients.reduce((acc, sel) => acc + (sel.ingredient.prices[item.pizzaConfig!.size] / (sel.half === 'full' ? 1 : 2)), 0) : 0;
      const tMod = item.selectedModifiers.reduce((s, m) => s + m.option.price, 0);
      return acc + ((item.price + pMod + tMod) * item.quantity);
    }, 0) : cartTotal;

    let message = "";

    if (isEdit && shouldSendPartial) {
      message = `*📝 PEDIDO ADICIONAL / EXTRA*\n\n`;
    } else if (isEdit) {
      message = isUnpaid ? `*♻️ ACTUALIZACIÓN DE PENDIENTE*\n\n` : `*✅ CUENTA COBRADA / CERRADA*\n\n`;
    } else {
      message = isUnpaid ? `*⚠️ NUEVO PEDIDO (POR COBRAR)*\n\n` : `*🔔 NUEVO PEDIDO*\n\n`;
    }

    message += `*🤵 Mesero:* ${session.waiter}\n`;
    message += `*📍 Referencia:* ${customerDetails.name}\n`;
    if (customerDetails.instructions) message += `*📝 Nota:* ${customerDetails.instructions}\n`;
    message += `\n*🛒 DETALLE:* \n`;

    itemsToSend.forEach(item => {
      message += `▪️ *${item.quantity}x ${item.name}* ${!shouldSendPartial && item.notes === 'original' ? '_(Ya servido)_' : ''}\n`;

      if (item.pizzaConfig) {
        message += `   _Tamaño: ${item.pizzaConfig.size}_\n`;
        const ingredientsByHalf: Record<string, string[]> = { full: [], left: [], right: [] };
        item.pizzaConfig.ingredients.forEach(sel => {
          ingredientsByHalf[sel.half].push(sel.ingredient.name);
        });
        if (ingredientsByHalf.full.length > 0) message += `   ✓ ${ingredientsByHalf.full.join(', ')}\n`;
        if (ingredientsByHalf.left.length > 0) message += `   ◐ ${ingredientsByHalf.left.join(', ')}\n`;
        if (ingredientsByHalf.right.length > 0) message += `   ◑ ${ingredientsByHalf.right.join(', ')}\n`;
      }

      if (item.selectedModifiers.length > 0) {
        message += `   + ${item.selectedModifiers.map(m => m.option.name).join(', ')}\n`;
      }
      if (item.specialInstructions) {
        message += `   📝 *Nota:* ${item.specialInstructions}\n`;
      }
    });

    if (shouldSendPartial) {
      const previousDebt = cartTotal - displayTotal;
      message += `\n*💰 DEUDA PREVIA: $${previousDebt.toFixed(2)}*\n`;
      message += `*➕ ADICIONAL: $${displayTotal.toFixed(2)}*\n`;
      message += `*💲 TOTAL FINAL: $${cartTotal.toFixed(2)}*\n`;
    } else {
      message += `\n*💰 TOTAL: $${cartTotal.toFixed(2)}*\n`;
    }

    message += `*💳 Estado:* ${isUnpaid ? 'PENDIENTE' : customerDetails.paymentMethod}\n`;
    window.open(`https://wa.me/${session.targetNumber}?text=${encodeURIComponent(message)}`, '_blank');
  };

  if (isAppReady && (!session.waiter || !session.targetNumber)) {
    return (
      <div className="h-full w-full bg-black p-2 box-border theme-bro">
        <div className="h-full w-full bg-card rounded-[38px] flex flex-col relative overflow-hidden border border-white/5 bro-paper-card" style={{ backgroundColor: 'var(--page-bg-color)' }}>
          <div className="h-full w-full flex flex-col items-center justify-center p-8 overflow-y-auto">
            <div className="w-24 h-24 bg-black/40 rounded-[2.5rem] flex items-center justify-center mb-8 shadow-2xl border border-white/5 p-4 bro-shadow">
              <img src={businessLogo} alt="Logo" className="w-full h-full object-contain drop-shadow-2xl" />
            </div>
            <h1 className="text-3xl font-black mb-2 uppercase text-center italic tracking-tighter bro-gradient-text">{businessName}</h1>
            <p className="text-gray-500 text-center mb-10 text-[10px] font-black uppercase tracking-[0.4em] opacity-80">Control de Acceso</p>

            <form onSubmit={handlePersonnelLogin} className="w-full space-y-4 max-w-[300px]">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest ml-4">Usuario</label>
                <select name="personnelId" required className="w-full p-5 bg-black/40 border border-white/10 text-white rounded-[22px] font-black outline-none appearance-none focus:ring-2 focus:ring-brand transition-all">
                  {(settings.personnel || []).map(p => (
                    <option key={p.id} value={p.id} className="bg-card text-white">{p.name} ({p.role === 'admin' ? 'Admin' : 'Staff'})</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest ml-4">PIN de Acceso</label>
                <input name="pin" type="password" required placeholder="••••" className="w-full p-5 bg-black/40 border border-white/10 text-white text-center tracking-[1.5em] rounded-[22px] font-black outline-none focus:ring-2 focus:ring-brand placeholder:text-gray-800" maxLength={4} inputMode="numeric" />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest ml-4">WhatsApp Cocina</label>
                <input name="targetNumber" type="tel" required defaultValue={session.targetNumber || ""} placeholder="Ej: 58412..." className="w-full p-5 bg-black/40 border border-white/10 text-white rounded-[22px] font-black outline-none focus:ring-2 focus:ring-brand placeholder:text-gray-800" />
              </div>

              {loginError && <p className="text-center text-red-600 font-bold text-xs animate-bounce">{loginError}</p>}

              <button type="submit" className="w-full py-5 bg-brand text-black font-black rounded-[22px] uppercase tracking-[0.2em] mt-6 shadow-xl border-b-4 border-black/20 active:scale-95 transition-all">Entrar</button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  if (!isAppReady) return <SplashScreen onEnter={() => setIsAppReady(true)} />;

  return (
    <>
      <div className="h-full w-full bg-black p-2 box-border theme-bro">
        <div className="h-full w-full bg-black rounded-[38px] flex flex-col relative overflow-hidden bro-paper-card border border-white/5" style={{ backgroundColor: 'var(--page-bg-color)' }}>
          {/* Header Unificado: Logo + Nav en una sola línea */}
          <div className="bg-black/80 backdrop-blur-xl border-b border-white/5 px-4 py-3 flex justify-between items-center shrink-0 z-20">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-white/10 p-1 border border-white/10 shrink-0">
                <img src={businessLogo} alt="Logo" className="w-full h-full object-contain" />
              </div>
              <h1 className="text-sm font-black text-white italic tracking-tighter uppercase bro-gradient-text hidden sm:block">BRO</h1>
            </div>

            <div className="flex items-center gap-4">
              <button onClick={() => setCurrentView('menu')} className={`flex items-center gap-1.5 transition-all px-2 py-1 rounded-xl ${currentView === 'menu' ? 'text-brand bg-brand/10' : 'text-gray-500 hover:text-gray-300'}`}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                <span className="text-[8px] font-black uppercase tracking-widest hidden xs:block">Menú</span>
              </button>

              <button onClick={() => setCurrentView('reports')} className={`flex items-center gap-1.5 transition-all px-2 py-1 rounded-xl ${currentView === 'reports' ? 'text-brand bg-brand/10' : 'text-gray-500 hover:text-gray-300'}`}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                <span className="text-[8px] font-black uppercase tracking-widest hidden xs:block">Ventas</span>
              </button>

              <button onClick={() => {
                const currentPerson = (settings.personnel || []).find(p => p.name === session.waiter);
                if (currentPerson?.role === 'admin') {
                  setCurrentView('settings');
                } else {
                  setIsAdminAuthForSettings(true);
                }
              }} className={`flex items-center gap-1.5 transition-all px-2 py-1 rounded-xl ${currentView === 'settings' ? 'text-brand bg-brand/10' : 'text-gray-500 hover:text-gray-300'}`}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37a1.724 1.724 0 002.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                <span className="text-[8px] font-black uppercase tracking-widest hidden xs:block">Admin</span>
              </button>

              <button onClick={handleLogout} className="p-2 text-red-500/40 hover:text-red-500 transition-all">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
              </button>
            </div>
          </div>

          {(() => {
            switch (currentView) {
              case 'menu': return <MenuScreen menu={menu} cart={cart} onAddItem={handleAddItem} onUpdateQuantity={handleUpdateQuantity} onRemoveItem={(id) => setCart(prev => prev.filter(i => i.id !== id))} onClearCart={handleClearCart} cartItemCount={cart.reduce((acc, item) => acc + item.quantity, 0)} onOpenModifierModal={setModifierModalItem} onGoToCart={() => setCurrentView('cart')} businessName={businessName} businessLogo={businessLogo} triggerShake={triggerCartShake} showInstallButton={showInstallBtn} onInstallApp={handleInstallClick} activeRate={activeRate} isEditing={!!editingReportId} customerDetails={customerDetails} />;
              case 'cart': return <CartScreen cart={cart} onUpdateQuantity={handleUpdateQuantity} onRemoveItem={(id) => setCart(prev => prev.filter(i => i.id !== id))} onClearCart={handleClearCart} onBackToMenu={() => setCurrentView('menu')} onGoToCheckout={() => setCurrentView('checkout')} onEditItem={(id) => { const item = cart.find(i => i.id === id); if (item) { setEditingCartItemId(id); for (const cat of menu) { const original = cat.items.find(i => i.name === item.name); if (original) { setModifierModalItem(original); break; } } } }} activeRate={activeRate} isEditing={!!editingReportId} />;
              case 'checkout': return <CheckoutScreen cart={cart} customerDetails={customerDetails} paymentMethods={['Efectivo', 'Pago Móvil', 'Zelle', 'Divisas']} onUpdateDetails={setCustomerDetails} onBack={() => setCurrentView('cart')} onSubmitOrder={() => setConfirmOrderModalOpen(true)} onEditUserDetails={handleLogout} onClearCart={handleClearCart} activeRate={activeRate} isEditing={!!editingReportId} />;
              case 'settings': return <SettingsScreen settings={settings} onSaveSettings={setSettings} onGoToTables={() => setCurrentView('menu')} waiter={session.waiter} onLogout={handleLogout} waiterAssignments={{}} onSaveAssignments={{}} storeProfiles={[{ id: 'main', name: businessName, logo: businessLogo, menu: menu, whatsappNumber: session.targetNumber, modifierGroups: modifierGroups, theme: theme, paymentMethods: [] }]} onUpdateStoreProfiles={(profiles) => { const p = Array.isArray(profiles) ? profiles[0] : (typeof profiles === 'function' ? profiles([])[0] : null); if (p) { setBusinessName(p.name); setMenu(p.menu); setModifierGroups(p.modifierGroups); setTheme(p.theme); if (p.whatsappNumber && p.whatsappNumber !== session.targetNumber) { setSession(prev => ({ ...prev, targetNumber: p.whatsappNumber })); } } }} activeTableNumbers={[]} onBackupAllSalesData={() => { }} onClearAllSalesData={() => { if (window.confirm("¿Borrar definitivamente todo el historial?")) { setReports([]); } }} onConnectPrinter={handleConnectPrinter} onDisconnectPrinter={handleDisconnectPrinter} isPrinterConnected={isPrinterConnected} printerName={printerDevice?.name} onPrintTest={handlePrintTest} />;
              case 'reports': return <ReportsScreen reports={reports} onGoToTables={() => setCurrentView('menu')} onDeleteReports={(ids) => { setReports(prev => prev.filter(r => !ids.includes(r.id))); return true; }} settings={settings} onStartNewDay={handleStartNewDay} currentWaiter={session.waiter} currentRole={settings.personnel.find(p => p.name === session.waiter)?.role || 'waiter'} onOpenSalesHistory={() => setIsSalesHistoryModalOpen(true)} onReprintSaleRecord={handleReprintSaleRecord} isPrinterConnected={isPrinterConnected} onEditPendingReport={handleEditPendingReport} onVoidReport={handleVoidReport} />;
              case 'success': return <SuccessScreen cart={lastSoldRecord?.cart || []} customerDetails={lastSoldRecord?.details || customerDetails} onStartNewOrder={handleStartNewOrder} onReprint={() => handlePrintOrder(undefined, true)} isPrinterConnected={isPrinterConnected || !!settings.useSystemPrint} activeRate={activeRate} />;
              default: return null;
            }
          })()}
        </div>
      </div>

      {modifierModalItem && (
        (modifierModalItem.isPizza || modifierModalItem.isSpecialPizza) ? (
          <PizzaBuilderModal
            item={modifierModalItem}
            initialCartItem={editingCartItemId ? cart.find(i => i.id === editingCartItemId) : null}
            pizzaIngredients={PIZZA_INGREDIENTS}
            pizzaBasePrices={PIZZA_BASE_PRICES}
            allModifierGroups={modifierGroups}
            onClose={() => { setModifierModalItem(null); setEditingCartItemId(null); }}
            onSubmit={(item, config, qty, mods) => {
              if (editingCartItemId) {
                setCart(prev => prev.map(i => i.id === editingCartItemId ? { ...i, pizzaConfig: config, quantity: qty, selectedModifiers: mods } : i));
                setEditingCartItemId(null);
              } else {
                handleAddItem(item, mods, qty, undefined, config);
              }
              setModifierModalItem(null);
            }}
            activeRate={activeRate}
            isSpecialPizza={modifierModalItem.isSpecialPizza}
            defaultIngredients={modifierModalItem.defaultIngredients}
          />
        ) : (
          <ProductModifierModal
            item={modifierModalItem}
            initialCartItem={editingCartItemId ? cart.find(i => i.id === editingCartItemId) : null}
            allModifierGroups={modifierGroups}
            onClose={() => { setModifierModalItem(null); setEditingCartItemId(null); }}
            onSubmit={(item, mods, qty, instructions) => {
              if (editingCartItemId) {
                setCart(prev => prev.map(i => i.id === editingCartItemId ? { ...i, selectedModifiers: mods, quantity: qty, specialInstructions: instructions } : i));
                setEditingCartItemId(null);
              } else {
                handleAddItem(item, mods, qty, instructions);
              }
              setModifierModalItem(null);
            }}
            activeRate={activeRate}
          />
        )
      )}

      {isConfirmOrderModalOpen && (
        <ConfirmOrderModal isOpen={isConfirmOrderModalOpen} onClose={() => setConfirmOrderModalOpen(false)} isPrinterConnected={isPrinterConnected || !!settings.useSystemPrint} isEdit={!!editingReportId} onConfirmPrintAndSend={async () => { if (isPrinterConnected || settings.useSystemPrint) await handlePrintOrder(); executeSendToWhatsapp(); finalizeOrder(true); setConfirmOrderModalOpen(false); }} onConfirmPrintOnly={async () => { if (isPrinterConnected || settings.useSystemPrint) await handlePrintOrder(); finalizeOrder(true); setConfirmOrderModalOpen(false); }} onConfirmSendOnly={() => { executeSendToWhatsapp(); finalizeOrder(true); setConfirmOrderModalOpen(false); }} onConfirmSendUnpaid={async () => { if (isPrinterConnected || settings.useSystemPrint) await handlePrintOrder("POR COBRAR"); executeSendToWhatsapp(true); finalizeOrder(false); setConfirmOrderModalOpen(false); }} />
      )}
      {isSalesHistoryModalOpen && <SalesHistoryModal reports={reports} onClose={() => setIsSalesHistoryModalOpen(false)} />}
      {pendingVoidReportId && (
        <AdminAuthModal adminPin={settings.adminPin || '0000'} onClose={() => setPendingVoidReportId(null)} onSuccess={executeVoidReport} title="Anular Ticket" />
      )}
      {isAdminAuthForSettings && (
        <AdminAuthModal adminPin={settings.adminPin || '0000'} onClose={() => setIsAdminAuthForSettings(false)} onSuccess={() => { setIsAdminAuthForSettings(false); setCurrentView('settings'); }} title="Acceso a Configuración" />
      )}
      {showInstallModal && (
        <InstallPromptModal
          onClose={() => setShowInstallModal(false)}
          onInstall={triggerNativeInstall}
          platform={platform}
        />
      )}
    </>
  );
}

export default App;
