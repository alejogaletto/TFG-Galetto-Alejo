-- =====================================================
-- Employee Lifecycle Hub - Workflows Seed Script
-- =====================================================
-- Automatizaciones para bienvenida y notificaciones de tareas.
-- Ejecutar después de seed-employee-lifecycle-database.sql.
-- =====================================================

DO $$
DECLARE
  v_empleados_table_id INTEGER;
  v_tareas_table_id INTEGER;
  v_checklists_table_id INTEGER;
  v_bienvenida_workflow_id INTEGER;
  v_tarea_workflow_id INTEGER;
  v_solution_id INTEGER;
BEGIN

  -- Obtener IDs de las tablas del esquema
  SELECT vts.id INTO v_empleados_table_id
  FROM "VirtualTableSchema" vts
  JOIN "VirtualSchema" vs ON vts.virtual_schema_id = vs.id
  WHERE vs.template_type = 'employee_lifecycle' AND vs.is_template = true AND vts.name = 'Empleados'
  ORDER BY vts.creation_date DESC
  LIMIT 1;

  SELECT vts.id INTO v_tareas_table_id
  FROM "VirtualTableSchema" vts
  JOIN "VirtualSchema" vs ON vts.virtual_schema_id = vs.id
  WHERE vs.template_type = 'employee_lifecycle' AND vs.is_template = true AND vts.name = 'Tareas'
  ORDER BY vts.creation_date DESC
  LIMIT 1;

  SELECT vts.id INTO v_checklists_table_id
  FROM "VirtualTableSchema" vts
  JOIN "VirtualSchema" vs ON vts.virtual_schema_id = vs.id
  WHERE vs.template_type = 'employee_lifecycle' AND vs.is_template = true AND vts.name = 'Checklists'
  ORDER BY vts.creation_date DESC
  LIMIT 1;

  IF v_empleados_table_id IS NULL OR v_tareas_table_id IS NULL THEN
    RAISE EXCEPTION 'No se encontraron tablas del Employee Lifecycle Hub. Ejecuta primero seed-employee-lifecycle-database.sql.';
  END IF;

  RAISE NOTICE 'Tablas encontradas: Empleados %, Tareas %, Checklists %',
    v_empleados_table_id, v_tareas_table_id, v_checklists_table_id;

  -- =====================================================
  -- 1. Workflow: Bienvenida automática
  -- =====================================================
  INSERT INTO "Workflow" (
    "name",
    "description",
    "is_active",
    "configs"
  ) VALUES (
    'ELH: Bienvenida automática',
    'Envía correo de bienvenida y crea tareas iniciales al dar de alta un empleado.',
    true,
    jsonb_build_object(
      'trigger_type', 'business_data_insert',
      'trigger_table_id', v_empleados_table_id,
      'description', 'Se ejecuta al crear un registro en Empleados',
      'tags', jsonb_build_array('onboarding', 'bienvenida', 'hr')
    )
  ) RETURNING id INTO v_bienvenida_workflow_id;

  -- Paso 1: Asegurar estado inicial
  INSERT INTO "WorkflowStep" (
    "workflow_id",
    "type",
    "position",
    "configs"
  ) VALUES (
    v_bienvenida_workflow_id,
    'update_data',
    1,
    jsonb_build_object(
      'name', 'Marcar onboarding',
      'table_id', v_empleados_table_id,
      'updates', jsonb_build_object(
        'estado', 'en_onboarding'
      ),
      'description', 'Garantiza que el empleado quede en estado de onboarding'
    )
  );

  -- Paso 2: Enviar correo de bienvenida
  INSERT INTO "WorkflowStep" (
    "workflow_id",
    "type",
    "position",
    "configs",
    "external_services"
  ) VALUES (
    v_bienvenida_workflow_id,
    'send_email',
    2,
    jsonb_build_object(
      'name', 'Correo de bienvenida',
      'to', '{{email_corporativo}}',
      'subject', 'Bienvenido/a al equipo, {{nombre_completo}}',
      'body', 'Hola {{nombre_completo}}, tu onboarding comienza el {{fecha_ingreso}}. Tu manager será {{manager}}. ¡Nos vemos pronto!',
      'description', 'Mensaje automático al nuevo colaborador'
    ),
    jsonb_build_object(
      'service', 'email',
      'provider', 'smtp'
    )
  );

  -- Paso 3: Crear tarea de seguimiento
  INSERT INTO "WorkflowStep" (
    "workflow_id",
    "type",
    "position",
    "configs"
  ) VALUES (
    v_bienvenida_workflow_id,
    'create_data',
    3,
    jsonb_build_object(
      'name', 'Tarea: Reunión de bienvenida',
      'table_id', v_tareas_table_id,
      'data', jsonb_build_object(
        'titulo', 'Reunión inicial con {{nombre_completo}}',
        'tipo', 'onboarding',
        'estado', 'pendiente',
        'prioridad', 'alta',
        'responsable', '{{manager}}',
        'responsable_email', 'people@empresa.com',
        'empleado_relacionado', '{{nombre_completo}}',
        'fecha_limite', '{{tomorrow}}'
      ),
      'description', 'Crea una tarea inmediata para RRHH o manager'
    )
  );

  -- Paso 4: Actualizar checklist si existe
  IF v_checklists_table_id IS NOT NULL THEN
    INSERT INTO "WorkflowStep" (
      "workflow_id",
      "type",
      "position",
      "configs"
    ) VALUES (
      v_bienvenida_workflow_id,
      'create_data',
      4,
      jsonb_build_object(
        'name', 'Checklist: Primer día',
        'table_id', v_checklists_table_id,
        'data', jsonb_build_object(
          'nombre', 'Checklist {{nombre_completo}} - Día 1',
          'fase', 'primer_dia',
          'responsable', 'Equipo de People',
          'items_completados', 0,
          'total_items', 5,
          'estado', 'pendiente',
          'comentarios', 'Checklist generado automáticamente para dar seguimiento.'
        ),
        'description', 'Crea checklist personalizado por empleado'
      )
    );
  END IF;

  RAISE NOTICE 'Workflow Bienvenida creado con ID: %', v_bienvenida_workflow_id;

  -- =====================================================
  -- 2. Workflow: Notificar tarea asignada
  -- =====================================================
  INSERT INTO "Workflow" (
    "name",
    "description",
    "is_active",
    "configs"
  ) VALUES (
    'ELH: Notificar tarea asignada',
    'Notifica al responsable cada vez que se le asigna una tarea y actualiza su estado.',
    true,
    jsonb_build_object(
      'trigger_type', 'business_data_update',
      'trigger_table_id', v_tareas_table_id,
      'trigger_field', 'responsable',
      'description', 'Se ejecuta al actualizar el responsable de una tarea',
      'tags', jsonb_build_array('onboarding', 'tareas', 'notificaciones')
    )
  ) RETURNING id INTO v_tarea_workflow_id;

  -- Paso 1: Validar información
  INSERT INTO "WorkflowStep" (
    "workflow_id",
    "type",
    "position",
    "configs"
  ) VALUES (
    v_tarea_workflow_id,
    'condition',
    1,
    jsonb_build_object(
      'name', 'Validar responsable',
      'condition', jsonb_build_object(
        'field', 'responsable_email',
        'operator', 'not_equals',
        'value', ''
      ),
      'description', 'Solo continúa si existe correo del responsable'
    )
  );

  -- Paso 2: Enviar email al responsable
  INSERT INTO "WorkflowStep" (
    "workflow_id",
    "type",
    "position",
    "configs",
    "external_services"
  ) VALUES (
    v_tarea_workflow_id,
    'send_email',
    2,
    jsonb_build_object(
      'name', 'Aviso de nueva tarea',
      'to', '{{responsable_email}}',
      'subject', 'Nueva tarea asignada: {{titulo}}',
      'body', 'Hola {{responsable}}, se te asignó la tarea "{{titulo}}" para {{empleado_relacionado}}. Fecha límite: {{fecha_limite}}.',
      'description', 'Notifica al responsable para asegurar seguimiento'
    ),
    jsonb_build_object(
      'service', 'email',
      'provider', 'smtp'
    )
  );

  -- Paso 3: Actualizar estado de la tarea
  INSERT INTO "WorkflowStep" (
    "workflow_id",
    "type",
    "position",
    "configs"
  ) VALUES (
    v_tarea_workflow_id,
    'update_data',
    3,
    jsonb_build_object(
      'name', 'Marcar en progreso',
      'table_id', v_tareas_table_id,
      'updates', jsonb_build_object(
        'estado', 'en_progreso'
      ),
      'description', 'Mueve la tarea automáticamente a En progreso'
    )
  );

  RAISE NOTICE 'Workflow Notificación de tarea creado con ID: %', v_tarea_workflow_id;

  -- =====================================================
  -- 3. Intentar vincular workflows a una solución existente
  -- =====================================================
  SELECT id INTO v_solution_id
  FROM "Solution"
  WHERE template_type = 'employee_lifecycle_hub' AND is_template = true
  ORDER BY creation_date DESC
  LIMIT 1;

  IF v_solution_id IS NOT NULL THEN
    INSERT INTO "SolutionComponent" (
      "solution_id",
      "component_type",
      "component_id",
      "configs"
    ) VALUES
      (v_solution_id, 'workflow', v_bienvenida_workflow_id, '{"display_order": 6, "name": "Bienvenida automática"}'),
      (v_solution_id, 'workflow', v_tarea_workflow_id, '{"display_order": 7, "name": "Notificar tarea asignada"}');

    RAISE NOTICE 'Workflows vinculados a la solución %', v_solution_id;
  ELSE
    RAISE NOTICE 'No se encontró solución Employee Lifecycle para vincular. Ejecuta seed-employee-lifecycle-solution-template.sql para crearla.';
  END IF;

  RAISE NOTICE '================================================';
  RAISE NOTICE 'Workflows creados correctamente.';
  RAISE NOTICE '================================================';

END $$;

-- =====================================================
-- Consulta de verificación
-- =====================================================
SELECT 
  w.id,
  w.name,
  w.description,
  w.is_active,
  COUNT(ws.id) AS step_count
FROM "Workflow" w
LEFT JOIN "WorkflowStep" ws ON w.id = ws.workflow_id
WHERE w.name LIKE 'ELH:%'
GROUP BY w.id, w.name, w.description, w.is_active
ORDER BY w.id;

