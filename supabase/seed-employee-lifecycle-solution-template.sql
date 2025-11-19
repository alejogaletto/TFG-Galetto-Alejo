-- =====================================================
-- Employee Lifecycle Hub - Solution Template Seed Script
-- =====================================================
-- Ejecuta en el siguiente orden recomendado:
-- 1) seed-employee-lifecycle-database.sql
-- 2) seed-employee-lifecycle-forms.sql
-- 3) seed-employee-lifecycle-workflows.sql
-- 4) seed-employee-lifecycle-solution-template.sql (este archivo)
-- =====================================================

DO $$
DECLARE
  v_schema_id INTEGER;
  v_empleados_table_id INTEGER;
  v_tareas_table_id INTEGER;
  v_checklists_table_id INTEGER;
  v_equipamiento_table_id INTEGER;
  v_alta_form_id INTEGER;
  v_tareas_form_id INTEGER;
  v_checklist_form_id INTEGER;
  v_equipamiento_form_id INTEGER;
  v_bienvenida_workflow_id INTEGER;
  v_notificacion_workflow_id INTEGER;
  v_solution_id INTEGER;
  v_canvas_config JSONB;
BEGIN

  -- Obtener recursos existentes
  SELECT id INTO v_schema_id
  FROM "VirtualSchema"
  WHERE template_type = 'employee_lifecycle' AND is_template = true
  ORDER BY creation_date DESC
  LIMIT 1;

  IF v_schema_id IS NULL THEN
    RAISE EXCEPTION 'No se encontró el VirtualSchema del Employee Lifecycle Hub.';
  END IF;

  SELECT id INTO v_empleados_table_id FROM "VirtualTableSchema" WHERE virtual_schema_id = v_schema_id AND name = 'Empleados';
  SELECT id INTO v_tareas_table_id FROM "VirtualTableSchema" WHERE virtual_schema_id = v_schema_id AND name = 'Tareas';
  SELECT id INTO v_checklists_table_id FROM "VirtualTableSchema" WHERE virtual_schema_id = v_schema_id AND name = 'Checklists';
  SELECT id INTO v_equipamiento_table_id FROM "VirtualTableSchema" WHERE virtual_schema_id = v_schema_id AND name = 'Equipamiento';

  SELECT id INTO v_alta_form_id FROM "Form" WHERE name = 'Alta de empleado' ORDER BY creation_date DESC LIMIT 1;
  SELECT id INTO v_tareas_form_id FROM "Form" WHERE name = 'Asignación de tareas de onboarding' ORDER BY creation_date DESC LIMIT 1;
  SELECT id INTO v_checklist_form_id FROM "Form" WHERE name = 'Checklist de incorporación' ORDER BY creation_date DESC LIMIT 1;
  SELECT id INTO v_equipamiento_form_id FROM "Form" WHERE name = 'Solicitud de equipamiento' ORDER BY creation_date DESC LIMIT 1;

  SELECT id INTO v_bienvenida_workflow_id FROM "Workflow" WHERE name = 'ELH: Bienvenida automática' ORDER BY creation_date DESC LIMIT 1;
  SELECT id INTO v_notificacion_workflow_id FROM "Workflow" WHERE name = 'ELH: Notificar tarea asignada' ORDER BY creation_date DESC LIMIT 1;

  -- Configuración del canvas
  v_canvas_config := jsonb_build_array(
    -- Métricas
    jsonb_build_object(
      'id', 'stat-empleados',
      'type', 'stat-card',
      'size', jsonb_build_object('width', 1, 'height', 1),
      'config', jsonb_build_object(
        'title', 'Total de empleados',
        'tableId', v_empleados_table_id::text,
        'icon', 'users',
        'color', 'amber'
      )
    ),
    jsonb_build_object(
      'id', 'stat-onboarding',
      'type', 'stat-card',
      'size', jsonb_build_object('width', 1, 'height', 1),
      'config', jsonb_build_object(
        'title', 'En onboarding',
        'tableId', v_empleados_table_id::text,
        'icon', 'user-plus',
        'color', 'sky'
      )
    ),
    jsonb_build_object(
      'id', 'stat-tareas',
      'type', 'stat-card',
      'size', jsonb_build_object('width', 1, 'height', 1),
      'config', jsonb_build_object(
        'title', 'Tareas abiertas',
        'tableId', v_tareas_table_id::text,
        'icon', 'check-square',
        'color', 'emerald'
      )
    ),
    jsonb_build_object(
      'id', 'stat-equipamiento',
      'type', 'stat-card',
      'size', jsonb_build_object('width', 1, 'height', 1),
      'config', jsonb_build_object(
        'title', 'Equipamiento pendiente',
        'tableId', v_equipamiento_table_id::text,
        'icon', 'laptop',
        'color', 'indigo'
      )
    ),
    -- Tabla principal de empleados
    jsonb_build_object(
      'id', 'empleados-tabla',
      'type', 'data-table',
      'size', jsonb_build_object('width', 2, 'height', 2),
      'config', jsonb_build_object(
        'title', 'Empleados activos',
        'tableId', v_empleados_table_id::text,
        'allowCreate', true,
        'allowEdit', true,
        'allowDelete', false,
        'columnConfigs', jsonb_build_array(
          jsonb_build_object('field', 'nombre_completo', 'label', 'Nombre', 'type', 'text', 'editable', true),
          jsonb_build_object('field', 'puesto', 'label', 'Puesto', 'type', 'dropdown', 'editable', true),
          jsonb_build_object('field', 'departamento', 'label', 'Departamento', 'type', 'dropdown', 'editable', true),
          jsonb_build_object('field', 'manager', 'label', 'Manager', 'type', 'text', 'editable', true),
          jsonb_build_object('field', 'fecha_ingreso', 'label', 'Ingreso', 'type', 'date', 'editable', false),
          jsonb_build_object('field', 'estado', 'label', 'Estado', 'type', 'dropdown', 'editable', true)
        )
      )
    ),
    -- Tabla de tareas
    jsonb_build_object(
      'id', 'tareas-tabla',
      'type', 'data-table',
      'size', jsonb_build_object('width', 2, 'height', 2),
      'config', jsonb_build_object(
        'title', 'Tareas de onboarding',
        'tableId', v_tareas_table_id::text,
        'allowCreate', true,
        'allowEdit', true,
        'allowDelete', true,
        'columnConfigs', jsonb_build_array(
          jsonb_build_object('field', 'titulo', 'label', 'Título', 'type', 'text', 'editable', true),
          jsonb_build_object('field', 'tipo', 'label', 'Tipo', 'type', 'dropdown', 'editable', true),
          jsonb_build_object('field', 'prioridad', 'label', 'Prioridad', 'type', 'dropdown', 'editable', true),
          jsonb_build_object('field', 'estado', 'label', 'Estado', 'type', 'dropdown', 'editable', true),
          jsonb_build_object('field', 'responsable', 'label', 'Responsable', 'type', 'text', 'editable', true),
          jsonb_build_object('field', 'fecha_limite', 'label', 'Fecha límite', 'type', 'date', 'editable', true)
        )
      )
    ),
    -- Tabla de checklists
    jsonb_build_object(
      'id', 'checklists-tabla',
      'type', 'data-table',
      'size', jsonb_build_object('width', 2, 'height', 2),
      'config', jsonb_build_object(
        'title', 'Checklists por fase',
        'tableId', v_checklists_table_id::text,
        'allowCreate', true,
        'allowEdit', true,
        'allowDelete', true,
        'columnConfigs', jsonb_build_array(
          jsonb_build_object('field', 'nombre', 'label', 'Checklist', 'type', 'text', 'editable', true),
          jsonb_build_object('field', 'fase', 'label', 'Fase', 'type', 'dropdown', 'editable', true),
          jsonb_build_object('field', 'responsable', 'label', 'Responsable', 'type', 'text', 'editable', true),
          jsonb_build_object('field', 'items_completados', 'label', 'Completados', 'type', 'number', 'editable', true),
          jsonb_build_object('field', 'total_items', 'label', 'Total', 'type', 'number', 'editable', true),
          jsonb_build_object('field', 'estado', 'label', 'Estado', 'type', 'dropdown', 'editable', true)
        )
      )
    ),
    -- Formulario embebido para alta rápida
    jsonb_build_object(
      'id', 'form-alta-empleado',
      'type', 'form-embed',
      'size', jsonb_build_object('width', 2, 'height', 2),
      'config', jsonb_build_object(
        'title', 'Crear nuevo empleado',
        'formId', v_alta_form_id,
        'tableId', v_empleados_table_id,
        'submitButtonText', 'Crear empleado',
        'successMessage', '¡Alta registrada!'
      )
    )
  );

  -- Crear solución
  INSERT INTO "Solution" (
    "name",
    "description",
    "template_type",
    "is_template",
    "status",
    "icon",
    "color",
    "category",
    "configs"
  ) VALUES (
    'Employee Lifecycle Hub',
    'Panel integral para gestionar altas, tareas de onboarding, checklists y entregas de equipamiento en español.',
    'employee_lifecycle_hub',
    true,
    'active',
    'users',
    'bg-amber-500',
    'Recursos Humanos',
    jsonb_build_object(
      'features', jsonb_build_array(
        'Alta de empleados en vivo',
        'Seguimiento de tareas y responsables',
        'Checklists por fase',
        'Control de equipamiento'
      ),
      'version', '1.0',
      'canvas', v_canvas_config
    )
  ) RETURNING id INTO v_solution_id;

  RAISE NOTICE 'Solución creada con ID: %', v_solution_id;

  -- Vincular componentes
  INSERT INTO "SolutionComponent" ("solution_id", "component_type", "component_id", "configs")
  VALUES (
    v_solution_id, 'virtual_schema', v_schema_id, '{"display_order": 1, "name": "Base de datos Employee Lifecycle"}'
  );

  IF v_alta_form_id IS NOT NULL THEN
    INSERT INTO "SolutionComponent" ("solution_id", "component_type", "component_id", "configs")
    VALUES (v_solution_id, 'form', v_alta_form_id, '{"display_order": 2, "name": "Alta de empleado"}');
  END IF;

  IF v_tareas_form_id IS NOT NULL THEN
    INSERT INTO "SolutionComponent" ("solution_id", "component_type", "component_id", "configs")
    VALUES (v_solution_id, 'form', v_tareas_form_id, '{"display_order": 3, "name": "Asignación de tareas"}');
  END IF;

  IF v_checklist_form_id IS NOT NULL THEN
    INSERT INTO "SolutionComponent" ("solution_id", "component_type", "component_id", "configs")
    VALUES (v_solution_id, 'form', v_checklist_form_id, '{"display_order": 4, "name": "Checklist de incorporación"}');
  END IF;

  IF v_equipamiento_form_id IS NOT NULL THEN
    INSERT INTO "SolutionComponent" ("solution_id", "component_type", "component_id", "configs")
    VALUES (v_solution_id, 'form', v_equipamiento_form_id, '{"display_order": 5, "name": "Solicitud de equipamiento"}');
  END IF;

  IF v_bienvenida_workflow_id IS NOT NULL THEN
    INSERT INTO "SolutionComponent" ("solution_id", "component_type", "component_id", "configs")
    VALUES (v_solution_id, 'workflow', v_bienvenida_workflow_id, '{"display_order": 6, "name": "Bienvenida automática"}');
  END IF;

  IF v_notificacion_workflow_id IS NOT NULL THEN
    INSERT INTO "SolutionComponent" ("solution_id", "component_type", "component_id", "configs")
    VALUES (v_solution_id, 'workflow', v_notificacion_workflow_id, '{"display_order": 7, "name": "Notificar tareas"}');
  END IF;

  RAISE NOTICE 'Componentes vinculados a la solución.';

END $$;

-- =====================================================
-- Consulta de verificación
-- =====================================================
SELECT 
  s.id,
  s.name,
  s.template_type,
  COUNT(sc.id) AS component_count,
  jsonb_array_length(s.configs->'canvas') AS canvas_components
FROM "Solution" s
LEFT JOIN "SolutionComponent" sc ON sc.solution_id = s.id
WHERE s.template_type = 'employee_lifecycle_hub' AND s.is_template = true
GROUP BY s.id, s.name, s.template_type, s.configs;

