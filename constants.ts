
import { MenuCategory, ModifierGroup, PizzaIngredient } from './types';

export const DELIVERY_PROMO_DAYS = [1, 2, 3, 4];
export const TOGO_ORDER_START_NUMBER = 101;

// ============= PRECIOS BASE DE PIZZA =============
export const PIZZA_BASE_PRICES = {
  'Pequeña': 7,
  'Mediana': 9,
  'Familiar': 11
};

// ============= INGREDIENTES DE PIZZA =============
export const PIZZA_INGREDIENTS: PizzaIngredient[] = [
  // Categoría A - Proteínas/Premium
  { name: 'Pepperoni', category: 'A', prices: { Pequeña: 1.5, Mediana: 2, Familiar: 2.5 } },
  { name: 'Pollo Crispy', category: 'A', prices: { Pequeña: 1.5, Mediana: 2, Familiar: 2.5 } },
  { name: 'Tocineta', category: 'A', prices: { Pequeña: 1.5, Mediana: 2, Familiar: 2.5 } },
  { name: 'Jamón', category: 'A', prices: { Pequeña: 1, Mediana: 1.5, Familiar: 2 } },

  // Categoría B - Vegetales
  { name: 'Maíz', category: 'B', prices: { Pequeña: 0.5, Mediana: 1, Familiar: 1.5 } },
  { name: 'Champiñones', category: 'B', prices: { Pequeña: 1, Mediana: 1.5, Familiar: 2 } },
  { name: 'Aceitunas Negras', category: 'B', prices: { Pequeña: 0.5, Mediana: 1, Familiar: 1.5 } },
  { name: 'Cebolla', category: 'B', prices: { Pequeña: 0.5, Mediana: 0.5, Familiar: 1 } },
  { name: 'Pimentón', category: 'B', prices: { Pequeña: 0.5, Mediana: 0.5, Familiar: 1 } },
  { name: 'Pesto', category: 'B', prices: { Pequeña: 1, Mediana: 1.5, Familiar: 2 } },

  // Categoría C - Especiales
  { name: 'Extra Queso', category: 'C', prices: { Pequeña: 2, Mediana: 3, Familiar: 4 } },
  { name: 'Camarones', category: 'C', prices: { Pequeña: 3, Mediana: 5, Familiar: 7 } },
];

// --- GRUPOS DE MODIFICADORES ---
export const BRO_MODIFIERS: ModifierGroup[] = [
  {
    title: "Elige tu Proteína",
    selectionType: "single", minSelection: 1, maxSelection: 1,
    options: [
      { name: "Carne", price: 0 },
      { name: "Chorizo", price: 0 },
      { name: "Crispy", price: 0 }
    ],
  },
  {
    title: "Proteínas Extras",
    selectionType: "multiple", minSelection: 0, maxSelection: 5,
    options: [
      { name: "Carne", price: 2 },
      { name: "Pollo Crispy", price: 2.5 },
      { name: "Chorizo", price: 2 },
      { name: "Tocineta", price: 1.5 },
    ]
  },
  {
    title: "Personaliza (Opcional)",
    selectionType: "multiple", minSelection: 0, maxSelection: 15,
    options: [
      { name: "Sin Cebolla", price: 0 },
      { name: "Sin Repollo", price: 0 },
      { name: "Sin Mayonesa", price: 0 },
      { name: "Sin Salsa Bro", price: 0 },
      { name: "Sin Ketchup", price: 0 },
      { name: "Sin Mostaza", price: 0 },
      { name: "Sin Pepinillos", price: 0 },
      { name: "Sin Tomate", price: 0 },
      { name: "Sin Lechuga", price: 0 },
      { name: "Papas Ralladas aparte", price: 0 },
    ],
  },
  {
    title: "Tamaño Pizza (+2)",
    selectionType: "single", minSelection: 1, maxSelection: 1,
    options: [
      { name: "Mediana", price: 0 },
      { name: "Familiar", price: 2 }
    ],
  },
  {
    title: "Tamaño Pizza (+3)",
    selectionType: "single", minSelection: 1, maxSelection: 1,
    options: [
      { name: "Mediana", price: 0 },
      { name: "Familiar", price: 3 }
    ],
  },
  {
    title: "Extras (Hamburguesa)",
    selectionType: "multiple", minSelection: 0, maxSelection: 10,
    options: [
      { name: "Carne", price: 2 },
      { name: "Pollo Crispy", price: 2.5 },
      { name: "Tocineta", price: 1.5 },
      { name: "Queso Americano", price: 0.5 },
      { name: "Queso Cebu", price: 1.5 },
      { name: "Queso de Cabra", price: 1 },
      { name: "Coleslaw", price: 1 },
      { name: "Aguacate", price: 1 },
      { name: "Huevo", price: 0.5 },
      { name: "Platano", price: 0.5 },
      { name: "Pesto", price: 0.5 },
      { name: "Jalapeño", price: 0.5 },
      { name: "Aros de Cebolla", price: 1.5 }
    ],
  }
];

export const BRO_MENU_DATA: MenuCategory[] = [
  {
    title: 'ENTRADAS',
    items: [
      { name: 'Tequeños (8 unidades)', price: 6.5, available: true },
      { name: 'Empanadas (4 unidades)', price: 6.5, available: true, description: 'Carne molida o chili' },
      { name: 'Croquetas (6 unidades)', price: 6.5, available: true, description: 'Papa con chorizo y queso parmesano' },
      { name: 'Nachos', price: 11, available: true, description: 'Tortillas, carne molida, caraotas, queso americano y crema de leche' },
      { name: 'Mozzarella Sticks (5 unidades)', price: 8, available: true, description: 'Tempurizados, con salsa mostaza miel' },
      { name: 'Tostones de Cerdo (4 unidades)', price: 8, available: true, description: 'Con cerdo en salsa ajoporro o reducción de piña' },
      { name: 'Tostones Pollo o Lomo (4 unidades)', price: 8, available: true, description: 'Pollo o lomo de aguja, salsa tártara y pico de gallo' },
      { name: 'Tostones Camarones (4 unidades)', price: 8, available: true, description: 'Con camarones, crema especial blanca o al ajillo' },
      { name: 'Tabla Bro', price: 8, available: true, description: '2 Tequeños, 2 croquetas, 2 empanadas, 2 mozzarella sticks' },
      { name: 'Alitas BBQ (12 unidades)', price: 16, available: true, description: 'Alitas de pollo en salsa BBQ' }
    ]
  },
  {
    title: 'PANES',
    items: [
      { name: 'Deli Teriyaki', price: 8, available: true, description: 'Pan Deli, pollo teriyaki, queso cheddar, pimentón y cebolla grillada', modifierGroupTitles: ["Personaliza (Opcional)"] },
      { name: 'Philly Cheese Steak', price: 12, available: true, description: 'Pan Deli, lomo de aguja, cebolla grillada, queso tipo americano y cheddar', modifierGroupTitles: ["Personaliza (Opcional)"] },
      { name: 'Deli King de Pollo', price: 8, available: true, description: 'Pan Deli, pollo crispy, queso americano, lechuga, tomate, cebolla y mayo pesto', modifierGroupTitles: ["Personaliza (Opcional)"] }
    ]
  },
  {
    title: 'PASTAS',
    items: [
      { name: 'Carbonara', price: 7, available: true, description: 'Salsa blanca, cebolla salteada y tocineta crocante' },
      { name: 'Blanca', price: 7, available: true, description: 'Salsa blanca, maíz dulce y finos cortes de pollo' },
      { name: 'Bro', price: 7, available: true, description: 'Salsa blanca, pollo crispy y queso parmesano' },
      { name: 'Camarones', price: 9, available: true, description: 'Salsa cremosa acompañada de camarones' },
      { name: 'Thai', price: 7, available: true, description: 'Vegetales salteados con pollo crispy teriyaki' },
      { name: 'Pasticho', price: 7, available: true, description: 'Porción de pasticho con salsa boloñesa' }
    ]
  },
  {
    title: 'CHICKEN',
    items: [
      { name: 'Parmesa de Pollo', price: 9, available: true, description: 'Filet de pollo empanizado con queso mozzarella y parmesano' },
      { name: 'Cordon Bleu', price: 10, available: true, description: 'Pollo relleno con base de crema (maíz, champiñones, ajoporro o tocineta)' },
      { name: 'Pollo a la Crema', price: 9, available: true, description: 'Finos cortes de pollo con crema de la casa' },
      { name: 'Pollo Thai', price: 9, available: true, description: 'Cortes de pollo con vegetales salteados y salsa thai' },
      { name: 'Cotoleta', price: 9, available: true, description: 'Pollo crispy, salsa napole y queso mozzarella' }
    ]
  },
  {
    title: 'HAMBURGUESAS',
    items: [
      { name: 'Americana', price: 7, available: true, description: 'Queso americano, vegetales, pepinillos y salsas tradicionales', modifierGroupTitles: ["Elige tu Proteína", "Personaliza (Opcional)", "Extras (Hamburguesa)"] },
      { name: 'Cheese Bacon', price: 8, available: true, description: 'Queso americano, tocineta, BBQ y queso cheddar', modifierGroupTitles: ["Elige tu Proteína", "Personaliza (Opcional)", "Extras (Hamburguesa)"] },
      { name: 'Grilled', price: 8, available: true, description: 'Queso americano, pimentón, tomate y cebolla al grill, salsa Bro', modifierGroupTitles: ["Elige tu Proteína", "Personaliza (Opcional)", "Extras (Hamburguesa)"] },
      { name: 'Honey', price: 8, available: true, description: 'Cebolla caramelizada, queso fundido, tocineta y champiñones', modifierGroupTitles: ["Elige tu Proteína", "Personaliza (Opcional)", "Extras (Hamburguesa)"] },
      { name: 'Crispy', price: 10, available: true, description: 'Queso americano, tocineta, aros de cebolla y salsa BBQ', modifierGroupTitles: ["Elige tu Proteína", "Personaliza (Opcional)", "Extras (Hamburguesa)"] },
      { name: 'Big Bro', price: 8, available: true, description: 'Salsa Bro, pepinillos, queso tipo americano, queso fundido con champiñones y tocineta', modifierGroupTitles: ["Elige tu Proteína", "Personaliza (Opcional)", "Extras (Hamburguesa)"] },
      { name: 'Cesar', price: 9, available: true, description: 'Pollo crispy, queso americano, lechuga, aros de cebolla, aderezo cesar, tocineta y queso', modifierGroupTitles: ["Elige tu Proteína", "Personaliza (Opcional)", "Extras (Hamburguesa)"] },
      { name: 'Chipotle', price: 9, available: true, description: 'Pollo crispy, lechuga, queso americano, mayachipotle, cebolla, tomate y nachos', modifierGroupTitles: ["Elige tu Proteína", "Personaliza (Opcional)", "Extras (Hamburguesa)"] },
      { name: 'Sta. Barbara', price: 9, available: true, description: 'Vegetales, jamón, queso cebú, tajadas y papas rayadas', modifierGroupTitles: ["Elige tu Proteína", "Personaliza (Opcional)", "Extras (Hamburguesa)"] },
      { name: 'Caraqueña', price: 9, available: true, description: 'Vegetales, jamón, queso cebú, huevo y papas rayadas', modifierGroupTitles: ["Elige tu Proteína", "Personaliza (Opcional)", "Extras (Hamburguesa)"] },
      { name: 'Ranch', price: 12, available: true, description: 'Doble carne 150g, cama delgada de papas francesas, salsa ranch, queso americano y tocineta', modifierGroupTitles: ["Personaliza (Opcional)", "Extras (Hamburguesa)"] },
      { name: 'Tosti Burger', price: 12, available: true, description: 'Doble filet de pollo apanado en crispy crunch de doritos, queso americano, BBQ y cebolla crujiente', modifierGroupTitles: ["Personaliza (Opcional)", "Extras (Hamburguesa)"] }
    ]
  },
  {
    title: 'ARMA TU PIZZA',
    items: [
      {
        name: 'Pizza Personalizada',
        price: 7, // Precio base pequeña
        available: true,
        description: 'Salsa napolitana + Queso mozzarella. Elige tamaño e ingredientes al gusto.',
        isPizza: true
      }
    ]
  },
  {
    title: 'PIZZAS ESPECIALES',
    items: [
      { name: 'Napole', price: 9, available: true, description: 'Salsa napole y queso mozzarella', isSpecialPizza: true, defaultIngredients: [] },
      { name: 'White', price: 11, available: true, description: 'Salsa ajoporro, queso mozzarella y finos cortes de pollo', isSpecialPizza: true, defaultIngredients: ['Pollo Crispy'] },
      { name: 'Pepperoni', price: 10, available: true, description: 'Salsa napole, queso mozzarella y pepperoni', isSpecialPizza: true, defaultIngredients: ['Pepperoni'] },
      { name: 'Jamón y Maíz', price: 10, available: true, description: 'Salsa napole, queso mozzarella, jamón y maíz', isSpecialPizza: true, defaultIngredients: ['Jamón', 'Maíz'] },
      { name: '4 Estaciones', price: 11, available: true, description: 'Salsa napole, queso mozzarella, jamón, champiñones, pepperoni y maíz', isSpecialPizza: true, defaultIngredients: ['Jamón', 'Champiñones', 'Pepperoni', 'Maíz'] },
      { name: 'Vegetariana', price: 11, available: true, description: 'Salsa napole, queso mozzarella, cebolla, maíz, aceitunas negras y champiñones', isSpecialPizza: true, defaultIngredients: ['Cebolla', 'Maíz', 'Aceitunas Negras', 'Champiñones'] },
      { name: 'Basilico', price: 11, available: true, description: 'Salsa napole, tomate, pesto y aceitunas negras', isSpecialPizza: true, defaultIngredients: ['Pesto', 'Aceitunas Negras'] },
      { name: 'Hawaiina', price: 11, available: true, description: 'Salsa napole, queso mozzarella, piña y jamón', isSpecialPizza: true, defaultIngredients: ['Jamón'] },
      { name: 'Sta. Barbara', price: 11, available: true, description: 'Salsa napole, queso mozzarella, plátano y tocineta', isSpecialPizza: true, defaultIngredients: ['Tocineta'] },
      { name: 'Boloñesa', price: 11, available: true, description: 'Salsa boloñesa y queso mozzarella', isSpecialPizza: true, defaultIngredients: [] }
    ]
  },
  {
    title: 'HOT DOG',
    items: [
      { name: 'New York', price: 5, available: true, description: "Salchicha nathan's 1/4lb, cebolla picada, mostaza, salsa de tomate y pepinillos dulces", modifierGroupTitles: ["Personaliza (Opcional)"] },
      { name: 'Honolulu', price: 6, available: true, description: "Salchicha nathan's 1/4lb, queso mozzarella fundido, maíz dulce, papitas crunch y salsa de piña", modifierGroupTitles: ["Personaliza (Opcional)"] },
      { name: 'Fratello', price: 6, available: true, description: "Salchicha nathan's 1/4lb, queso mozzarella fundido, pepperoni y queso parmesano", modifierGroupTitles: ["Personaliza (Opcional)"] },
      { name: 'Hijole Wey', price: 6, available: true, description: "Salchicha nathan's 1/4lb, queso cheddar fundido, chili picante y takis", modifierGroupTitles: ["Personaliza (Opcional)"] }
    ]
  },
  {
    title: 'PAPAS',
    items: [
      { name: 'Papas Fritas', price: 3, available: true, description: 'Servicio de papas tradicionales' },
      { name: 'Papas Grandes', price: 3.5, available: true, description: 'Servicio de papas tradicionales 279 gr' },
      { name: 'Cheese Bacon', price: 4.5, available: true, description: 'Papas fritas, queso cheddar y tocineta crocante' },
      { name: 'Tenders', price: 6, available: true, description: 'Papas fritas, pollo crispy y salsa de tomate' },
      { name: 'Kentucky', price: 7.5, available: true, description: 'Papas fritas, pollo crispy, tocineta, queso cheddar y BBQ' }
    ]
  },
  {
    title: 'PICADAS',
    items: [
      { name: 'Parrilla Mixta (500g)', price: 20, available: true, description: 'Para dos personas: lomo de aguja, pollo, cerdo, chorizo, papas fritas, queso, ensalada y tártara' },
      { name: 'Parrilla Personal (300g)', price: 12, available: true, description: 'Dos proteínas a elegir, papas fritas, queso, ensalada y tártara' }
    ]
  },
  {
    title: 'ENSALADAS',
    items: [
      { name: 'Ensalada Bro', price: 9, available: true, description: 'Pollo, lechuga, maíz, aceitunas negras, mozzarella y mostaza miel' },
      { name: 'Ensalada Cesar', price: 9, available: true, description: 'Pollo, lechuga, tocineta, crotones, parmesano y aderezo cesar' }
    ]
  },
  {
    title: 'PATACÓN',
    items: [
      { name: 'Patacón Sencillo', price: 9, available: true, description: 'Carne mechada o pollo, salsas tradicionales, lechuga, tomate, cebolla, jamón, queso cebú y tipo americano', modifierGroupTitles: ["Elige tu Proteína", "Personaliza (Opcional)"] },
      { name: 'Patacón Mixto', price: 13, available: true, description: 'Elige 2 proteínas, salsas tradicionales, lechuga, tomate, cebolla, jamón, queso cebú y tipo americano', modifierGroupTitles: ["Personaliza (Opcional)", { group: "Proteínas Extras", label: "Elige las 2 Proteínas" }] }
    ]
  },
  {
    title: 'POSTRES',
    items: [
      { name: 'Torta de Chocolate', price: 4.6, available: true },
      { name: 'Torta de Banana', price: 2.5, available: true },
      { name: 'Pie de Limón', price: 4, available: true },
      { name: 'Cheesecake', price: 6, available: true }
    ]
  },
  {
    title: 'BEBIDAS',
    items: [
      { name: 'Refresco', price: 1, available: true },
      { name: 'Té Jamaica', price: 2, available: true },
      { name: 'Té Negro', price: 2, available: true },
      { name: 'Té Bro', price: 2.5, available: true },
      { name: 'Jugos Naturales', price: 2.5, available: true },
      { name: 'Yukery 250ml', price: 1.5, available: true },
      { name: 'Gatorade', price: 2.5, available: true },
      { name: 'Agua Mineral', price: 2, available: true }
    ]
  },
  {
    title: 'TRAGOS',
    items: [
      { name: 'Cervezas', price: 2, available: true },
      { name: 'Solera', price: 2.5, available: true },
      { name: 'Mojito', price: 3.5, available: true },
      { name: 'Mojito Fruta', price: 4, available: true },
      { name: 'Piña Colada', price: 5, available: true },
      { name: 'Daiquiri', price: 4.5, available: true },
      { name: 'Buena Vibra', price: 4.5, available: true },
      { name: 'Cuba Libre', price: 3, available: true },
      { name: 'Margarita', price: 5, available: true },
      { name: 'Margarita Frozen', price: 6, available: true },
      { name: 'Tinto Verano', price: 5, available: true },
      { name: 'Gin Tonic', price: 4, available: true },
      { name: 'Vodka Tonic', price: 3.5, available: true },
      { name: 'Caipiriña', price: 4, available: true },
      { name: 'Cosmopolitan', price: 5, available: true },
      { name: 'Destornillador', price: 4, available: true },
      { name: 'Caipiroska', price: 4, available: true },
      { name: 'Long Island', price: 6, available: true }
    ]
  },
  {
    title: 'TRAGOS DE AUTOR',
    items: [
      { name: 'Daquiti', price: 5, available: true },
      { name: 'Broder', price: 5, available: true },
      { name: 'Armagedon', price: 5, available: true },
      { name: 'Blake', price: 5, available: true },
      { name: 'Love Bro', price: 5, available: true }
    ]
  }
];
