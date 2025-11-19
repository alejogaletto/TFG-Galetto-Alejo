-- =====================================================
-- Employee Lifecycle Hub - Database Structure Seed Script
-- =====================================================
-- Crea la estructura completa del hub de ciclo de vida del empleado:
-- VirtualSchema, VirtualTableSchemas y VirtualFieldSchemas en español.
-- Ejecuta este script para preparar la base de datos virtual.
-- =====================================================

-- (Opcional) Limpia versiones anteriores del template
-- DELETE FROM "VirtualFieldSchema" WHERE "virtual_table_schema_id" IN (
--   SELECT id FROM "VirtualTableSchema" WHERE "virtual_schema_id" IN (
--     SELECT id FROM "VirtualSchema" WHERE "template_type" = 'employee_lifecycle'
--   )
-- );
-- DELETE FROM "VirtualTableSchema" WHERE "virtual_schema_id" IN (
--   SELECT id FROM "VirtualSchema" WHERE "template_type" = 'employee_lifecycle'
-- );
-- DELETE FROM "VirtualSchema" WHERE "template_type" = 'employee_lifecycle';

-- =====================================================
-- 1. Crear Virtual Schema principal
-- =====================================================
INSERT INTO "VirtualSchema" (
  "name",
  "description",
  "template_type",
  "is_template",
  "icon",
  "color",
  "category",
  "configs"
) VALUES (
  'Base de datos - Ciclo de Vida del Empleado',
  'Seguimiento completo del ciclo de vida: altas, tareas de onboarding, seguimiento de checklists y entregas de equipamiento.',
  'employee_lifecycle',
  true,
  'users',
  'bg-amber-500',
  'Recursos Humanos',
  '{"features": ["Altas de personal", "Tareas y checklists", "Control de equipamiento", "Estados del empleado"], "version": "1.0"}'
) RETURNING id;

DO $$
DECLARE
  v_schema_id INTEGER;
  v_empleados_table_id INTEGER;
  v_tareas_table_id INTEGER;
  v_checklists_table_id INTEGER;
  v_equipamiento_table_id INTEGER;
BEGIN

  SELECT id INTO v_schema_id
  FROM "VirtualSchema"
  WHERE "template_type" = 'employee_lifecycle' AND "is_template" = true
  ORDER BY "creation_date" DESC
  LIMIT 1;

  -- =====================================================
  -- 2. Tabla Empleados
  -- =====================================================
  INSERT INTO "VirtualTableSchema" (
    "virtual_schema_id",
    "name",
    "description",
    "configs"
  ) VALUES (
    v_schema_id,
    'Empleados',
    'Base maestra del empleado y su información crítica',
    '{"icon": "user-circle", "color": "amber", "permissions": {"create": true, "read": true, "update": true, "delete": true}}'
  ) RETURNING id INTO v_empleados_table_id;

  INSERT INTO "VirtualFieldSchema" ("virtual_table_schema_id", "name", "type", "properties") VALUES
    (v_empleados_table_id, 'nombre_completo', 'text', '{"label": "Nombre completo", "required": true, "placeholder": "Ana Gómez"}'),
    (v_empleados_table_id, 'email_corporativo', 'email', '{"label": "Correo corporativo", "required": true, "placeholder": "ana.gomez@empresa.com"}'),
    (v_empleados_table_id, 'telefono', 'text', '{"label": "Teléfono", "required": false, "placeholder": "+54 9 11 5555-1111"}'),
    (v_empleados_table_id, 'puesto', 'dropdown', '{"label": "Puesto", "required": true, "options": [
      {"value": "generalista", "label": "Generalista", "color": "blue"},
      {"value": "analista", "label": "Analista", "color": "purple"},
      {"value": "lider", "label": "Líder", "color": "amber"},
      {"value": "gerente", "label": "Gerente", "color": "green"},
      {"value": "practicante", "label": "Practicante", "color": "gray"}
    ], "default": "generalista"}'),
    (v_empleados_table_id, 'departamento', 'dropdown', '{"label": "Departamento", "required": true, "options": [
      {"value": "recursos_humanos", "label": "Recursos Humanos", "color": "amber"},
      {"value": "tecnologia", "label": "Tecnología", "color": "blue"},
      {"value": "finanzas", "label": "Finanzas", "color": "green"},
      {"value": "operaciones", "label": "Operaciones", "color": "orange"},
      {"value": "comercial", "label": "Comercial", "color": "purple"}
    ], "default": "recursos_humanos"}'),
    (v_empleados_table_id, 'fecha_ingreso', 'date', '{"label": "Fecha de ingreso", "required": true, "default": "now"}'),
    (v_empleados_table_id, 'modalidad', 'dropdown', '{"label": "Modalidad de trabajo", "required": true, "options": [
      {"value": "presencial", "label": "Presencial", "color": "green"},
      {"value": "remoto", "label": "Remoto", "color": "blue"},
      {"value": "hibrido", "label": "Híbrido", "color": "purple"}
    ], "default": "presencial"}'),
    (v_empleados_table_id, 'manager', 'text', '{"label": "Persona responsable", "required": false, "placeholder": "Laura Méndez"}'),
    (v_empleados_table_id, 'ubicacion', 'text', '{"label": "Ubicación", "required": false, "placeholder": "Buenos Aires"}'),
    (v_empleados_table_id, 'estado', 'dropdown', '{"label": "Estado del empleado", "required": true, "options": [
      {"value": "en_onboarding", "label": "En onboarding", "color": "blue"},
      {"value": "activo", "label": "Activo", "color": "green"},
      {"value": "licencia", "label": "En licencia", "color": "yellow"},
      {"value": "baja", "label": "Baja", "color": "red"},
      {"value": "offboarding", "label": "Offboarding", "color": "purple"}
    ], "default": "en_onboarding"}'),
    (v_empleados_table_id, 'notas_personales', 'textarea', '{"label": "Notas internas", "required": false, "placeholder": "Observaciones relevantes", "rows": 4}');

  -- =====================================================
  -- 3. Tabla Tareas
  -- =====================================================
  INSERT INTO "VirtualTableSchema" (
    "virtual_schema_id",
    "name",
    "description",
    "configs"
  ) VALUES (
    v_schema_id,
    'Tareas',
    'Plan de tareas y recordatorios asignados a cada empleado',
    '{"icon": "check-square", "color": "emerald", "permissions": {"create": true, "read": true, "update": true, "delete": true}}'
  ) RETURNING id INTO v_tareas_table_id;

  INSERT INTO "VirtualFieldSchema" ("virtual_table_schema_id", "name", "type", "properties") VALUES
    (v_tareas_table_id, 'titulo', 'text', '{"label": "Título de la tarea", "required": true, "placeholder": "Configurar acceso a sistemas"}'),
    (v_tareas_table_id, 'descripcion', 'textarea', '{"label": "Descripción", "required": false, "placeholder": "Detalle del paso a realizar", "rows": 3}'),
    (v_tareas_table_id, 'tipo', 'dropdown', '{"label": "Tipo de tarea", "required": true, "options": [
      {"value": "documentacion", "label": "Documentación", "color": "blue"},
      {"value": "onboarding", "label": "Onboarding", "color": "amber"},
      {"value": "capacitacion", "label": "Capacitación", "color": "purple"},
      {"value": "it", "label": "IT / Tecnología", "color": "green"},
      {"value": "beneficios", "label": "Beneficios", "color": "pink"}
    ], "default": "onboarding"}'),
    (v_tareas_table_id, 'prioridad', 'dropdown', '{"label": "Prioridad", "required": true, "options": [
      {"value": "alta", "label": "Alta", "color": "red"},
      {"value": "media", "label": "Media", "color": "yellow"},
      {"value": "baja", "label": "Baja", "color": "green"}
    ], "default": "media"}'),
    (v_tareas_table_id, 'estado', 'dropdown', '{"label": "Estado", "required": true, "options": [
      {"value": "pendiente", "label": "Pendiente", "color": "gray"},
      {"value": "en_progreso", "label": "En progreso", "color": "blue"},
      {"value": "bloqueada", "label": "Bloqueada", "color": "red"},
      {"value": "completada", "label": "Completada", "color": "green"}
    ], "default": "pendiente"}'),
    (v_tareas_table_id, 'responsable', 'text', '{"label": "Responsable", "required": false, "placeholder": "Nombre del responsable"}'),
    (v_tareas_table_id, 'responsable_email', 'email', '{"label": "Correo del responsable", "required": false, "placeholder": "responsable@empresa.com"}'),
    (v_tareas_table_id, 'empleado_relacionado', 'text', '{"label": "Empleado asignado", "required": false, "placeholder": "ID o nombre del empleado"}'),
    (v_tareas_table_id, 'fecha_limite', 'date', '{"label": "Fecha límite", "required": false}'),
    (v_tareas_table_id, 'canal_notificacion', 'dropdown', '{"label": "Canal de notificación", "required": false, "options": [
      {"value": "email", "label": "Email", "color": "blue"},
      {"value": "slack", "label": "Slack", "color": "purple"},
      {"value": "whatsapp", "label": "WhatsApp", "color": "green"}
    ]}');

  -- =====================================================
  -- 4. Tabla Checklists
  -- =====================================================
  INSERT INTO "VirtualTableSchema" (
    "virtual_schema_id",
    "name",
    "description",
    "configs"
  ) VALUES (
    v_schema_id,
    'Checklists',
    'Seguimiento de hitos y listas de verificación por fase',
    '{"icon": "list-checks", "color": "sky", "permissions": {"create": true, "read": true, "update": true, "delete": true}}'
  ) RETURNING id INTO v_checklists_table_id;

  INSERT INTO "VirtualFieldSchema" ("virtual_table_schema_id", "name", "type", "properties") VALUES
    (v_checklists_table_id, 'nombre', 'text', '{"label": "Nombre del checklist", "required": true, "placeholder": "Primer día"}'),
    (v_checklists_table_id, 'fase', 'dropdown', '{"label": "Fase", "required": true, "options": [
      {"value": "pre_onboarding", "label": "Pre-onboarding", "color": "purple"},
      {"value": "primer_dia", "label": "Primer día", "color": "amber"},
      {"value": "primera_semana", "label": "Primera semana", "color": "blue"},
      {"value": "primer_mes", "label": "Primer mes", "color": "green"}
    ], "default": "pre_onboarding"}'),
    (v_checklists_table_id, 'responsable', 'text', '{"label": "Responsable", "required": false, "placeholder": "Equipo dueño del checklist"}'),
    (v_checklists_table_id, 'items_completados', 'number', '{"label": "Items completados", "required": false, "min": 0, "default": 0}'),
    (v_checklists_table_id, 'total_items', 'number', '{"label": "Total de items", "required": true, "min": 1, "default": 5}'),
    (v_checklists_table_id, 'estado', 'dropdown', '{"label": "Estado", "required": true, "options": [
      {"value": "pendiente", "label": "Pendiente", "color": "gray"},
      {"value": "en_progreso", "label": "En progreso", "color": "blue"},
      {"value": "completado", "label": "Completado", "color": "green"}
    ], "default": "pendiente"}'),
    (v_checklists_table_id, 'comentarios', 'textarea', '{"label": "Comentarios", "required": false, "placeholder": "Notas del avance", "rows": 3}');

  -- =====================================================
  -- 5. Tabla Equipamiento
  -- =====================================================
  INSERT INTO "VirtualTableSchema" (
    "virtual_schema_id",
    "name",
    "description",
    "configs"
  ) VALUES (
    v_schema_id,
    'Equipamiento',
    'Entrega y recuperación de assets asignados al empleado',
    '{"icon": "laptop", "color": "indigo", "permissions": {"create": true, "read": true, "update": true, "delete": true}}'
  ) RETURNING id INTO v_equipamiento_table_id;

  INSERT INTO "VirtualFieldSchema" ("virtual_table_schema_id", "name", "type", "properties") VALUES
    (v_equipamiento_table_id, 'empleado', 'text', '{"label": "Empleado", "required": true, "placeholder": "Nombre del empleado"}'),
    (v_equipamiento_table_id, 'tipo_equipo', 'dropdown', '{"label": "Tipo de equipo", "required": true, "options": [
      {"value": "notebook", "label": "Notebook", "color": "blue"},
      {"value": "monitor", "label": "Monitor", "color": "purple"},
      {"value": "telefono", "label": "Teléfono", "color": "green"},
      {"value": "tarjeta_acceso", "label": "Tarjeta de acceso", "color": "amber"},
      {"value": "mobiliario", "label": "Mobiliario", "color": "pink"}
    ], "default": "notebook"}'),
    (v_equipamiento_table_id, 'marca_modelo', 'text', '{"label": "Marca / modelo", "required": false, "placeholder": "MacBook Pro 14\""}'),
    (v_equipamiento_table_id, 'numero_serie', 'text', '{"label": "Número de serie", "required": false, "placeholder": "SN-000123"}'),
    (v_equipamiento_table_id, 'fecha_entrega', 'date', '{"label": "Fecha de entrega", "required": true, "default": "now"}'),
    (v_equipamiento_table_id, 'estado_entrega', 'dropdown', '{"label": "Estado de entrega", "required": true, "options": [
      {"value": "pendiente", "label": "Pendiente", "color": "gray"},
      {"value": "entregado", "label": "Entregado", "color": "green"},
      {"value": "devuelto", "label": "Devuelto", "color": "blue"},
      {"value": "extraviado", "label": "Extraviado", "color": "red"}
    ], "default": "pendiente"}'),
    (v_equipamiento_table_id, 'responsable_it', 'text', '{"label": "Responsable IT", "required": false, "placeholder": "Nombre de quien entrega"}'),
    (v_equipamiento_table_id, 'observaciones', 'textarea', '{"label": "Observaciones", "required": false, "placeholder": "Notas sobre el estado del equipo", "rows": 3}');

  RAISE NOTICE '===============================================';
  RAISE NOTICE 'Hub de ciclo de vida creado correctamente';
  RAISE NOTICE 'Schema ID: %', v_schema_id;
  RAISE NOTICE 'Tabla Empleados ID: %', v_empleados_table_id;
  RAISE NOTICE 'Tabla Tareas ID: %', v_tareas_table_id;
  RAISE NOTICE 'Tabla Checklists ID: %', v_checklists_table_id;
  RAISE NOTICE 'Tabla Equipamiento ID: %', v_equipamiento_table_id;
  RAISE NOTICE '===============================================';

END $$;

-- =====================================================
-- 6. Consulta de verificación
-- =====================================================
SELECT 
  vs.name AS schema_name,
  vts.name AS table_name,
  COUNT(vfs.id) AS field_count
FROM "VirtualSchema" vs
JOIN "VirtualTableSchema" vts ON vs.id = vts.virtual_schema_id
LEFT JOIN "VirtualFieldSchema" vfs ON vts.id = vfs.virtual_table_schema_id
WHERE vs.template_type = 'employee_lifecycle' AND vs.is_template = true
GROUP BY vs.name, vts.name
ORDER BY vts.name;

