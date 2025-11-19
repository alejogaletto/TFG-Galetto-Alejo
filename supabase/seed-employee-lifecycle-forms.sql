-- =====================================================
-- Employee Lifecycle Hub - Forms Seed Script
-- =====================================================
-- Este script crea los formularios necesarios para alimentar la
-- base de datos virtual del ciclo de vida del empleado.
-- Ejecutar después de seed-employee-lifecycle-database.sql
-- =====================================================

DO $$
DECLARE
  v_alta_form_id INTEGER;
  v_tareas_form_id INTEGER;
  v_checklist_form_id INTEGER;
  v_equipamiento_form_id INTEGER;
BEGIN

  -- =====================================================
  -- 1. Formulario de alta de empleado
  -- =====================================================
  INSERT INTO "Form" (
    "name",
    "description",
    "is_active",
    "configs"
  ) VALUES (
    'Alta de empleado',
    'Captura de información clave para iniciar el onboarding.',
    true,
    '{"theme": "default", "submitButtonText": "Crear empleado", "successMessage": "¡Empleado creado y listo para onboarding!"}'
  ) RETURNING id INTO v_alta_form_id;

  INSERT INTO "FormField" ("form_id", "type", "label", "position", "configs") VALUES
    (v_alta_form_id, 'text', 'Nombre completo', 1, '{"required": true, "placeholder": "Ana Gómez"}'),
    (v_alta_form_id, 'email', 'Correo corporativo', 2, '{"required": true, "placeholder": "ana.gomez@empresa.com"}'),
    (v_alta_form_id, 'text', 'Teléfono', 3, '{"required": false, "placeholder": "+54 9 11 5555-1111"}'),
    (v_alta_form_id, 'select', 'Departamento', 4, '{"required": true, "options": ["Recursos Humanos", "Tecnología", "Finanzas", "Operaciones", "Comercial"], "default": "Recursos Humanos"}'),
    (v_alta_form_id, 'select', 'Puesto', 5, '{"required": true, "options": ["Generalista", "Analista", "Líder", "Gerente", "Practicante"], "default": "Generalista"}'),
    (v_alta_form_id, 'date', 'Fecha de ingreso', 6, '{"required": true}'),
    (v_alta_form_id, 'select', 'Modalidad de trabajo', 7, '{"required": true, "options": ["Presencial", "Remoto", "Híbrido"], "default": "Presencial"}'),
    (v_alta_form_id, 'text', 'Manager directo', 8, '{"required": false, "placeholder": "Laura Méndez"}'),
    (v_alta_form_id, 'textarea', 'Notas internas', 9, '{"required": false, "placeholder": "Observaciones relevantes", "rows": 3}');

  RAISE NOTICE 'Formulario "Alta de empleado" creado con ID: %', v_alta_form_id;

  -- =====================================================
  -- 2. Formulario de tareas de onboarding
  -- =====================================================
  INSERT INTO "Form" (
    "name",
    "description",
    "is_active",
    "configs"
  ) VALUES (
    'Asignación de tareas de onboarding',
    'Define las tareas que cada equipo debe completar en el onboarding.',
    true,
    '{"theme": "default", "submitButtonText": "Guardar tarea", "successMessage": "Tarea registrada correctamente."}'
  ) RETURNING id INTO v_tareas_form_id;

  INSERT INTO "FormField" ("form_id", "type", "label", "position", "configs") VALUES
    (v_tareas_form_id, 'text', 'Título de la tarea', 1, '{"required": true, "placeholder": "Configurar acceso a sistemas"}'),
    (v_tareas_form_id, 'select', 'Tipo', 2, '{"required": true, "options": ["Documentación", "Onboarding", "Capacitación", "IT / Tecnología", "Beneficios"], "default": "Onboarding"}'),
    (v_tareas_form_id, 'textarea', 'Descripción', 3, '{"required": false, "placeholder": "Detalle del paso a realizar", "rows": 3}'),
    (v_tareas_form_id, 'select', 'Prioridad', 4, '{"required": true, "options": ["Alta", "Media", "Baja"], "default": "Media"}'),
    (v_tareas_form_id, 'select', 'Estado', 5, '{"required": true, "options": ["Pendiente", "En progreso", "Bloqueada", "Completada"], "default": "Pendiente"}'),
    (v_tareas_form_id, 'text', 'Responsable', 6, '{"required": true, "placeholder": "Nombre del responsable"}'),
    (v_tareas_form_id, 'email', 'Correo del responsable', 7, '{"required": false, "placeholder": "responsable@empresa.com"}'),
    (v_tareas_form_id, 'text', 'Empleado asignado', 8, '{"required": false, "placeholder": "ID o nombre del empleado"}'),
    (v_tareas_form_id, 'date', 'Fecha límite', 9, '{"required": false}'),
    (v_tareas_form_id, 'select', 'Canal de notificación', 10, '{"required": false, "options": ["Email", "Slack", "WhatsApp"]}');

  RAISE NOTICE 'Formulario "Asignación de tareas de onboarding" creado con ID: %', v_tareas_form_id;

  -- =====================================================
  -- 3. Formulario de checklist
  -- =====================================================
  INSERT INTO "Form" (
    "name",
    "description",
    "is_active",
    "configs"
  ) VALUES (
    'Checklist de incorporación',
    'Controla hitos críticos por fase del onboarding.',
    true,
    '{"theme": "default", "submitButtonText": "Actualizar checklist", "successMessage": "Checklist guardado correctamente."}'
  ) RETURNING id INTO v_checklist_form_id;

  INSERT INTO "FormField" ("form_id", "type", "label", "position", "configs") VALUES
    (v_checklist_form_id, 'text', 'Nombre del checklist', 1, '{"required": true, "placeholder": "Primer día"}'),
    (v_checklist_form_id, 'select', 'Fase', 2, '{"required": true, "options": ["Pre-onboarding", "Primer día", "Primera semana", "Primer mes"], "default": "Pre-onboarding"}'),
    (v_checklist_form_id, 'text', 'Responsable', 3, '{"required": false, "placeholder": "Equipo dueño del checklist"}'),
    (v_checklist_form_id, 'number', 'Items completados', 4, '{"required": false, "min": 0, "default": 0}'),
    (v_checklist_form_id, 'number', 'Total de items', 5, '{"required": true, "min": 1, "default": 5}'),
    (v_checklist_form_id, 'select', 'Estado', 6, '{"required": true, "options": ["Pendiente", "En progreso", "Completado"], "default": "Pendiente"}'),
    (v_checklist_form_id, 'textarea', 'Comentarios', 7, '{"required": false, "placeholder": "Notas del avance", "rows": 3}');

  RAISE NOTICE 'Formulario "Checklist de incorporación" creado con ID: %', v_checklist_form_id;

  -- =====================================================
  -- 4. Formulario de solicitud de equipamiento
  -- =====================================================
  INSERT INTO "Form" (
    "name",
    "description",
    "is_active",
    "configs"
  ) VALUES (
    'Solicitud de equipamiento',
    'Registro y control de assets asignados a cada persona.',
    true,
    '{"theme": "default", "submitButtonText": "Registrar entrega", "successMessage": "Equipamiento registrado exitosamente."}'
  ) RETURNING id INTO v_equipamiento_form_id;

  INSERT INTO "FormField" ("form_id", "type", "label", "position", "configs") VALUES
    (v_equipamiento_form_id, 'text', 'Empleado', 1, '{"required": true, "placeholder": "Nombre del empleado"}'),
    (v_equipamiento_form_id, 'select', 'Tipo de equipo', 2, '{"required": true, "options": ["Notebook", "Monitor", "Teléfono", "Tarjeta de acceso", "Mobiliario"], "default": "Notebook"}'),
    (v_equipamiento_form_id, 'text', 'Marca / modelo', 3, '{"required": false, "placeholder": "MacBook Pro 14\""}'),
    (v_equipamiento_form_id, 'text', 'Número de serie', 4, '{"required": false, "placeholder": "SN-000123"}'),
    (v_equipamiento_form_id, 'date', 'Fecha de entrega', 5, '{"required": true}'),
    (v_equipamiento_form_id, 'select', 'Estado de entrega', 6, '{"required": true, "options": ["Pendiente", "Entregado", "Devuelto", "Extraviado"], "default": "Pendiente"}'),
    (v_equipamiento_form_id, 'text', 'Responsable IT', 7, '{"required": false, "placeholder": "Nombre de quien entrega"}'),
    (v_equipamiento_form_id, 'textarea', 'Observaciones', 8, '{"required": false, "placeholder": "Notas sobre el estado del equipo", "rows": 3}');

  RAISE NOTICE 'Formulario "Solicitud de equipamiento" creado con ID: %', v_equipamiento_form_id;

  RAISE NOTICE '================================================';
  RAISE NOTICE 'Formularios del Employee Lifecycle Hub creados.';
  RAISE NOTICE 'Alta de empleado: %', v_alta_form_id;
  RAISE NOTICE 'Asignación de tareas: %', v_tareas_form_id;
  RAISE NOTICE 'Checklist: %', v_checklist_form_id;
  RAISE NOTICE 'Solicitud de equipamiento: %', v_equipamiento_form_id;
  RAISE NOTICE '================================================';
  RAISE NOTICE 'Recuerda enlazar cada formulario con su tabla usando';
  RAISE NOTICE 'DataConnection y FieldMapping dentro del dashboard.';
  RAISE NOTICE '================================================';

END $$;

-- =====================================================
-- Consulta de verificación
-- =====================================================
SELECT 
  f.id,
  f.name,
  f.description,
  COUNT(ff.id) AS field_count
FROM "Form" f
LEFT JOIN "FormField" ff ON f.id = ff.form_id
WHERE f.name IN (
  'Alta de empleado',
  'Asignación de tareas de onboarding',
  'Checklist de incorporación',
  'Solicitud de equipamiento'
)
GROUP BY f.id, f.name, f.description
ORDER BY f.id;

