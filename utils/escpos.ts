
import { Table, AppSettings, OrderItem, CartItem, CustomerDetails, SelectedModifier } from '../types';

interface PrintSettings extends AppSettings {
  businessName: string;
}

/**
 * Limpia el texto de caracteres especiales que la mayoría de las impresoras térmicas
 * no pueden procesar correctamente (especialmente la Ñ y los acentos).
 */
const cleanText = (text: string): string => {
  if (!text) return '';
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Elimina acentos
    .replace(/\u00d1/g, 'N') // Ñ -> N
    .replace(/\u00f1/g, 'n') // ñ -> n
    .toUpperCase(); // Forzar mayúsculas para mejor legibilidad en tickets
};

// Helper to format text lines for the printer
const formatLine = (left: string, right: string, width: number): string => {
  const cleanLeft = cleanText(left);
  const cleanRight = cleanText(right);
  const leftTruncated = cleanLeft.substring(0, width - cleanRight.length - 1);
  const spaceCount = width - leftTruncated.length - cleanRight.length;
  return `${leftTruncated}${' '.repeat(Math.max(0, spaceCount))}${cleanRight}\n`;
};

export const generateReceiptCommands = (cart: CartItem[], customer: CustomerDetails, settings: PrintSettings, waiterName: string, title: string = 'RECIBO DE PEDIDO', previousTotal: number = 0): string => {
  const paperWidth = settings.printerPaperWidth === '80mm' ? 42 : 30;
  const divider = '-'.repeat(paperWidth) + '\n';
  let commands = '';

  const cartTotal = cart.reduce((acc, item) => {
    const pizzaModPrice = item.pizzaConfig ? item.pizzaConfig.ingredients.reduce((acc, sel) => acc + (sel.ingredient.prices[item.pizzaConfig!.size] / (sel.half === 'full' ? 1 : 2)), 0) : 0;
    const traditionalModsPrice = item.selectedModifiers.reduce((s, m) => s + m.option.price, 0);
    return acc + ((item.price + pizzaModPrice + traditionalModsPrice) * item.quantity);
  }, 0);

  // Initialize
  commands += '\x1B\x40'; // Initialize printer
  commands += '\x1B\x74\x02'; // Select Code Page CP850 (Multilingual)

  // Header
  commands += '\x1B\x61\x31'; // Center align
  commands += '\x1B\x21\x30'; // Double height, double width
  commands += `${cleanText(settings.businessName)}\n`;
  commands += '\x1B\x21\x00'; // Normal size
  commands += `${cleanText(title)}\n`;
  commands += '\x1B\x61\x30'; // Left align

  // Order Details
  const now = new Date();
  const dateStr = now.toLocaleDateString('es-ES');
  const timeStr = now.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });

  commands += formatLine(`REF: ${customer.name}`, timeStr, paperWidth);
  commands += `FECHA: ${dateStr}\n`;
  commands += `ATENDIDO POR: ${cleanText(waiterName)}\n`;
  commands += divider;

  // Order Items
  commands += formatLine('PRODUCTO', 'TOTAL', paperWidth);
  commands += divider;

  // Insert previous debt
  if (previousTotal > 0) {
    commands += `\x1B\x21\x08`;
    commands += `${cleanText("(- SALDO PENDIENTE -)").substring(0, paperWidth)}\n`;
    commands += formatLine("  MONTO PREVIO", `$${previousTotal.toFixed(2)}`, paperWidth);
    commands += '\x1B\x21\x00';
    commands += '-'.repeat(Math.floor(paperWidth / 2)) + '\n';
  }

  cart.forEach(item => {
    const pizzaModPrice = item.pizzaConfig ? item.pizzaConfig.ingredients.reduce((acc, sel) => acc + (sel.ingredient.prices[item.pizzaConfig!.size] / (sel.half === 'full' ? 1 : 2)), 0) : 0;
    const traditionalModsPrice = item.selectedModifiers.reduce((s, m) => s + m.option.price, 0);
    const itemTotal = (item.price + pizzaModPrice + traditionalModsPrice) * item.quantity;

    commands += `\x1B\x21\x08`;
    commands += formatLine(`${item.quantity}X ${item.name}`, `$${itemTotal.toFixed(2)}`, paperWidth);
    commands += '\x1B\x21\x00';

    if (item.pizzaConfig) {
      commands += `  TAMANO: ${cleanText(item.pizzaConfig.size)}\n`;
      item.pizzaConfig.ingredients.forEach(sel => {
        const sym = sel.half === 'full' ? '(T)' : sel.half === 'left' ? '(I)' : '(D)';
        commands += `  ${sym} ${cleanText(sel.ingredient.name)}\n`;
      });
    }

    if (item.description) {
      const descLines = cleanText(item.description).match(new RegExp(`.{1,${paperWidth - 2}}`, 'g')) || [];
      descLines.forEach(line => {
        commands += `  ${line}\n`;
      });
    }

    if (item.selectedModifiers.length > 0) {
      item.selectedModifiers.forEach(mod => {
        let modText = ` + ${mod.option.name}`;
        if (mod.option.price > 0) modText += ` ($${mod.option.price.toFixed(2)})`;
        commands += cleanText(modText).substring(0, paperWidth) + '\n';
      });
    }

    if (item.specialInstructions) {
      commands += `  NOTA: ${cleanText(item.specialInstructions)}\n`;
    }
  });

  commands += divider;

  // Totals
  const finalTotal = cartTotal + previousTotal;

  commands += '\x1B\x61\x32';
  commands += '\x1B\x21\x30';
  commands += `TOTAL: $${finalTotal.toFixed(2)}\n`;
  commands += '\x1B\x21\x00';

  commands += '\x1B\x61\x30';
  commands += formatLine('METODO:', customer.paymentMethod, paperWidth);

  // Footer
  if (customer.instructions) {
    commands += divider;
    commands += 'NOTAS:\n';
    commands += `${cleanText(customer.instructions)}\n`;
  }

  commands += '\n\x1B\x61\x31';
  commands += 'GRACIAS POR SU COMPRA!\n';
  commands += '\n\n\n';
  commands += '\x1D\x56\x41\x03';

  return commands;
};

export const generateTestPrintCommands = (settings: PrintSettings): string => {
  const paperWidth = settings.printerPaperWidth === '80mm' ? 42 : 30;
  const divider = '-'.repeat(paperWidth) + '\n';
  let commands = '';

  commands += '\x1B\x40';
  commands += '\x1B\x74\x02';
  commands += '\x1B\x61\x31';
  commands += '\x1B\x21\x30';
  commands += `${cleanText(settings.businessName)}\n`;
  commands += '\x1B\x21\x00';
  commands += divider;
  commands += 'PRUEBA DE IMPRESION OK\n';
  commands += divider;
  commands += '\x1B\x61\x30';
  commands += `ANCHO: ${paperWidth} CARACTERES\n`;
  commands += 'ESTA ES UNA PRUEBA DE TEXTO\n';
  commands += 'LIMPIO DE ACENTOS Y ENES.\n\n';
  commands += '\x1B\x61\x31';
  commands += 'FECHA: ' + new Date().toLocaleDateString() + '\n';
  commands += 'HORA: ' + new Date().toLocaleTimeString() + '\n';

  commands += '\n\n\n';
  commands += '\x1D\x56\x41\x03';

  return commands;
};

export const generateEscPosCommands = (table: Table, settings: PrintSettings, waiterName: string, printType: 'ORIGINAL' | 'COPIA'): string => {
  const paperWidth = settings.printerPaperWidth === '80mm' ? 42 : 30;
  const divider = '-'.repeat(paperWidth) + '\n';
  let commands = '';
  commands += '\x1B\x40';
  commands += '\x1B\x74\x02';
  commands += '\x1B\x61\x31';
  commands += '\x1B\x21\x08';
  commands += `${printType === 'COPIA' ? '--- COPIA ---' : cleanText(settings.businessName)}\n`;
  commands += '\x1B\x21\x00';
  commands += `COMANDA DE COCINA\n\n`;
  commands += '\x1B\x61\x30';
  const orderIdentifier = table.orderType === 'para llevar' ? `PEDIDO #${table.number}` : `MESA: ${table.number}`;
  commands += formatLine(orderIdentifier, new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }), paperWidth);
  commands += `MESONERO: ${cleanText(waiterName)}\n`;
  if (table.customerName) commands += `CLIENTE: ${cleanText(table.customerName)}\n`;
  commands += divider;
  table.order.filter(item => item.status !== 'cancelled').forEach(item => {
    commands += `\x1B\x21\x08`;
    commands += `${item.quantity}X ${cleanText(item.name)}\n`;
    commands += '\x1B\x21\x00';

    if (item.pizzaConfig) {
      commands += `  TAM: ${cleanText(item.pizzaConfig.size)}\n`;
      item.pizzaConfig.ingredients.forEach(sel => {
        const sym = sel.half === 'full' ? '(T)' : sel.half === 'left' ? '(I)' : '(D)';
        commands += `  ${sym} ${cleanText(sel.ingredient.name)}\n`;
      });
    }

    if ((item as any).description) {
      commands += `  (${cleanText((item as any).description)})\n`;
    }
    if (item.selectedModifiers.length > 0) {
      item.selectedModifiers.forEach(mod => {
        // En comanda usualmente no ponemos precio
        commands += `  + ${cleanText(mod.option.name)}\n`;
      });
    }
  });
  if (table.observations?.trim()) {
    commands += divider + 'NOTAS:\n' + cleanText(table.observations.trim()) + '\n';
  }
  commands += '\n\n\n\n\n\n\x1D\x56\x41\x03';
  return commands;
};

export const generateKitchenOrderCommands = (table: Table, settings: PrintSettings, waiterName: string, actionType: 'Pedido Nuevo' | 'Adicional' | 'Cancelación', itemsToPrint: OrderItem[]): string => {
  const paperWidth = settings.printerPaperWidth === '80mm' ? 42 : 30;
  const divider = '-'.repeat(paperWidth) + '\n';
  let commands = '';
  commands += '\x1B\x40';
  commands += '\x1B\x74\x02';
  commands += '\x1B\x61\x31';
  commands += '\x1B\x21\x30';
  commands += `${cleanText(actionType)}\n`;
  commands += '\x1B\x21\x00';
  commands += `${cleanText(settings.businessName)}\n`;
  commands += '\x1B\x61\x30';
  const orderIdentifier = table.orderType === 'para llevar' ? `PEDIDO #${table.number}` : `MESA: ${table.number}`;
  commands += formatLine(orderIdentifier, new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }), paperWidth);
  commands += `MESONERO: ${cleanText(waiterName)}\n`;
  commands += divider;
  itemsToPrint.forEach(item => {
    commands += `\x1B\x21\x08${item.quantity}X ${cleanText(item.name)}\n\x1B\x21\x00`;

    if (item.pizzaConfig) {
      commands += `  TAM: ${cleanText(item.pizzaConfig.size)}\n`;
      item.pizzaConfig.ingredients.forEach(sel => {
        const sym = sel.half === 'full' ? '(T)' : sel.half === 'left' ? '(I)' : '(D)';
        commands += `  ${sym} ${cleanText(sel.ingredient.name)}\n`;
      });
    }

    if ((item as any).description) {
      commands += `  (${cleanText((item as any).description)})\n`;
    }
    if (item.selectedModifiers.length > 0) {
      item.selectedModifiers.forEach(mod => {
        commands += `  + ${cleanText(mod.option.name)}\n`;
      });
    }
  });
  if ((actionType === 'Pedido Nuevo' || actionType === 'Adicional') && table.observations?.trim()) {
    commands += divider + 'OBS:\n' + cleanText(table.observations.trim()) + '\n';
  }
  commands += '\n\n\n\x1D\x56\x41\x03';
  return commands;
};
