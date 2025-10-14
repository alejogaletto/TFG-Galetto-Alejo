-- Seed Solution Templates
-- These are predefined solution templates that users can instantiate

-- CRM Template
INSERT INTO "Solution" (
  "name", 
  "description", 
  "template_type", 
  "is_template", 
  "icon", 
  "color", 
  "category", 
  "status",
  "configs"
) VALUES (
  'CRM - Gestión de Clientes',
  'Sistema completo para gestionar leads, clientes y ventas',
  'crm',
  true,
  'users',
  'bg-blue-500',
  'Ventas',
  'active',
  '{"features": ["Dashboard de ventas", "Gestión de leads", "Seguimiento de clientes", "Reportes"]}'
);

-- Inventory Template
INSERT INTO "Solution" (
  "name", 
  "description", 
  "template_type", 
  "is_template", 
  "icon", 
  "color", 
  "category", 
  "status",
  "configs"
) VALUES (
  'Control de Inventario',
  'Gestiona tu inventario, stock y movimientos de productos',
  'inventario',
  true,
  'package',
  'bg-green-500',
  'Inventario',
  'active',
  '{"features": ["Control de stock", "Alertas de inventario", "Movimientos", "Reportes"]}'
);

-- Analytics Template
INSERT INTO "Solution" (
  "name", 
  "description", 
  "template_type", 
  "is_template", 
  "icon", 
  "color", 
  "category", 
  "status",
  "configs"
) VALUES (
  'Dashboard Analítico',
  'Visualiza métricas y KPIs importantes de tu negocio',
  'analytics',
  true,
  'bar-chart-3',
  'bg-purple-500',
  'Analíticas',
  'active',
  '{"features": ["Gráficos interactivos", "KPIs en tiempo real", "Reportes", "Filtros avanzados"]}'
);

-- Helpdesk Template
INSERT INTO "Solution" (
  "name", 
  "description", 
  "template_type", 
  "is_template", 
  "icon", 
  "color", 
  "category", 
  "status",
  "configs"
) VALUES (
  'Mesa de Ayuda',
  'Sistema de tickets y soporte al cliente',
  'helpdesk',
  true,
  'headphones',
  'bg-orange-500',
  'Soporte',
  'active',
  '{"features": ["Gestión de tickets", "Chat en vivo", "Base de conocimiento", "SLA"]}'
);

-- E-commerce Template
INSERT INTO "Solution" (
  "name", 
  "description", 
  "template_type", 
  "is_template", 
  "icon", 
  "color", 
  "category", 
  "status",
  "configs"
) VALUES (
  'E-commerce Dashboard',
  'Panel de control para tienda online',
  'ecommerce',
  true,
  'shopping-cart',
  'bg-pink-500',
  'E-commerce',
  'active',
  '{"features": ["Ventas online", "Productos", "Pedidos", "Clientes"]}'
);

-- Project Management Template
INSERT INTO "Solution" (
  "name", 
  "description", 
  "template_type", 
  "is_template", 
  "icon", 
  "color", 
  "category", 
  "status",
  "configs"
) VALUES (
  'Gestión de Proyectos',
  'Organiza tareas, equipos y proyectos',
  'project',
  true,
  'calendar',
  'bg-indigo-500',
  'Proyectos',
  'active',
  '{"features": ["Kanban board", "Gantt charts", "Equipos", "Tiempo"]}'
);
