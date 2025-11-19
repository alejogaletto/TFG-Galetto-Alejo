-- =====================================================
-- Employee Lifecycle Hub - User Solution Seeder
-- =====================================================
-- Crea una instancia completa de la solución para un usuario
-- específico, reutilizando los assets ya clonados (DB, forms,
-- workflows) para que aparezca en /dashboard/solutions.
--
-- Ejecutar después de:
--   1) seed-employee-lifecycle-database.sql
--   2) seed-employee-lifecycle-forms.sql
--   3) seed-employee-lifecycle-workflows.sql
--   4) seed-employee-lifecycle-user-assets.sql
-- =====================================================

DO $$
DECLARE
  v_user_id TEXT := '7b9effee-7ae8-455b-8096-ec81390518a2';
  v_schema_id INTEGER;
  v_empleados_table_id INTEGER;
  v_tareas_table_id INTEGER;
  v_checklists_table_id INTEGER;
  v_equipamiento_table_id INTEGER;
  v_form_alta_id INTEGER;
  v_form_tareas_id INTEGER;
  v_form_checklist_id INTEGER;
  v_form_equipamiento_id INTEGER;
  v_workflow_bienvenida_id INTEGER;
  v_workflow_tareas_id INTEGER;
  v_existing_solution_id INTEGER;
  v_solution_id INTEGER;
  v_canvas JSONB;
BEGIN

  -- Verificar que exista el schema del usuario
  SELECT id INTO v_schema_id
  FROM "VirtualSchema"
  WHERE user_id = v_user_id
    AND template_type = 'employee_lifecycle'
  ORDER BY creation_date DESC
  LIMIT 1;

  IF v_schema_id IS NULL THEN
    RAISE EXCEPTION 'No se encontró un VirtualSchema employee_lifecycle para este usuario. Ejecuta seed-employee-lifecycle-user-assets.sql primero.';
  END IF;

  -- Evitar duplicados
  SELECT id INTO v_existing_solution_id
  FROM "Solution"
  WHERE user_id = v_user_id
    AND template_type = 'employee_lifecycle_hub'
    AND is_template = false
  LIMIT 1;

  IF v_existing_solution_id IS NOT NULL THEN
    RAISE NOTICE 'ℹ️ Ya existe una solución Employee Lifecycle para este usuario (ID: %). Nada que hacer.', v_existing_solution_id;
    RETURN;
  END IF;

  -- Obtener IDs de tablas
  SELECT id INTO v_empleados_table_id FROM "VirtualTableSchema" WHERE virtual_schema_id = v_schema_id AND name = 'Empleados' LIMIT 1;
  SELECT id INTO v_tareas_table_id FROM "VirtualTableSchema" WHERE virtual_schema_id = v_schema_id AND name = 'Tareas' LIMIT 1;
  SELECT id INTO v_checklists_table_id FROM "VirtualTableSchema" WHERE virtual_schema_id = v_schema_id AND name = 'Checklists' LIMIT 1;
  SELECT id INTO v_equipamiento_table_id FROM "VirtualTableSchema" WHERE virtual_schema_id = v_schema_id AND name = 'Equipamiento' LIMIT 1;

  IF v_empleados_table_id IS NULL OR v_tareas_table_id IS NULL OR v_checklists_table_id IS NULL OR v_equipamiento_table_id IS NULL THEN
    RAISE EXCEPTION 'Faltan tablas del schema del usuario. Revisa seed-employee-lifecycle-user-assets.sql.';
  END IF;

  -- Formularios del usuario
  SELECT id INTO v_form_alta_id
  FROM "Form"
  WHERE user_id = v_user_id AND name = 'Alta de empleado'
  ORDER BY creation_date DESC LIMIT 1;

  SELECT id INTO v_form_tareas_id
  FROM "Form"
  WHERE user_id = v_user_id AND name = 'Asignación de tareas de onboarding'
  ORDER BY creation_date DESC LIMIT 1;

  SELECT id INTO v_form_checklist_id
  FROM "Form"
  WHERE user_id = v_user_id AND name = 'Checklist de incorporación'
  ORDER BY creation_date DESC LIMIT 1;

  SELECT id INTO v_form_equipamiento_id
  FROM "Form"
  WHERE user_id = v_user_id AND name = 'Solicitud de equipamiento'
  ORDER BY creation_date DESC LIMIT 1;

  -- Workflows del usuario
  SELECT id INTO v_workflow_bienvenida_id
  FROM "Workflow"
  WHERE user_id = v_user_id AND name = 'ELH: Bienvenida automática'
  ORDER BY creation_date DESC LIMIT 1;

  SELECT id INTO v_workflow_tareas_id
  FROM "Workflow"
  WHERE user_id = v_user_id AND name = 'ELH: Notificar tarea asignada'
  ORDER BY creation_date DESC LIMIT 1;

  -- Canvas específico del usuario
  v_canvas := jsonb_build_array(
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
    jsonb_build_object(
      'id', 'form-alta-empleado',
      'type', 'form-embed',
      'size', jsonb_build_object('width', 2, 'height', 2),
      'config', jsonb_build_object(
        'title', 'Crear nuevo empleado',
        'formId', v_form_alta_id,
        'tableId', v_empleados_table_id,
        'submitButtonText', 'Crear empleado',
        'successMessage', '¡Alta registrada!'
      )
    )
  );

  -- Crear la solución del usuario
  INSERT INTO "Solution" (
    "user_id",
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
    v_user_id,
    'Employee Lifecycle Hub - Demo',
    'Instancia personalizada del hub de ciclo de vida del empleado con datos dummy en español.',
    'employee_lifecycle_hub',
    false,
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
      'canvas', v_canvas
    )
  ) RETURNING id INTO v_solution_id;

  -- Vincular componentes
  INSERT INTO "SolutionComponent" ("solution_id", "component_type", "component_id", "configs")
  VALUES (v_solution_id, 'virtual_schema', v_schema_id, '{"display_order": 1, "name": "Base de datos Employee Lifecycle"}');

  IF v_form_alta_id IS NOT NULL THEN
    INSERT INTO "SolutionComponent" ("solution_id", "component_type", "component_id", "configs")
    VALUES (v_solution_id, 'form', v_form_alta_id, '{"display_order": 2, "name": "Alta de empleado"}');
  END IF;

  IF v_form_tareas_id IS NOT NULL THEN
    INSERT INTO "SolutionComponent" ("solution_id", "component_type", "component_id", "configs")
    VALUES (v_solution_id, 'form', v_form_tareas_id, '{"display_order": 3, "name": "Asignación de tareas"}');
  END IF;

  IF v_form_checklist_id IS NOT NULL THEN
    INSERT INTO "SolutionComponent" ("solution_id", "component_type", "component_id", "configs")
    VALUES (v_solution_id, 'form', v_form_checklist_id, '{"display_order": 4, "name": "Checklist de incorporación"}');
  END IF;

  IF v_form_equipamiento_id IS NOT NULL THEN
    INSERT INTO "SolutionComponent" ("solution_id", "component_type", "component_id", "configs")
    VALUES (v_solution_id, 'form', v_form_equipamiento_id, '{"display_order": 5, "name": "Solicitud de equipamiento"}');
  END IF;

  IF v_workflow_bienvenida_id IS NOT NULL THEN
    INSERT INTO "SolutionComponent" ("solution_id", "component_type", "component_id", "configs")
    VALUES (v_solution_id, 'workflow', v_workflow_bienvenida_id, '{"display_order": 6, "name": "Bienvenida automática"}');
  END IF;

  IF v_workflow_tareas_id IS NOT NULL THEN
    INSERT INTO "SolutionComponent" ("solution_id", "component_type", "component_id", "configs")
    VALUES (v_solution_id, 'workflow', v_workflow_tareas_id, '{"display_order": 7, "name": "Notificar tareas"}');
  END IF;

  RAISE NOTICE '================================================';
  RAISE NOTICE 'Solución Employee Lifecycle creada para el usuario %', v_user_id;
  RAISE NOTICE 'Solution ID: %', v_solution_id;
  RAISE NOTICE 'Ya debería aparecer en /dashboard/solutions.';
  RAISE NOTICE '================================================';

END $$;

