-- =====================================================
-- Employee Lifecycle Hub - User Sample Data Seed
-- =====================================================
-- Inserta datos ficticios en las tablas clonadas para un
-- usuario específico, de forma que el dashboard muestre
-- información apenas se abre la solución.
--
-- Ejecutar después de seed-employee-lifecycle-user-assets.sql
-- (ya que ese script crea las tablas propias del usuario).
-- =====================================================

DO $$
DECLARE
  v_user_id TEXT := '7b9effee-7ae8-455b-8096-ec81390518a2';
  v_schema_id INTEGER;
  v_empleados_table_id INTEGER;
  v_tareas_table_id INTEGER;
  v_checklists_table_id INTEGER;
  v_equipamiento_table_id INTEGER;
BEGIN

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Debes definir v_user_id antes de ejecutar este seed.';
  END IF;

  SELECT id INTO v_schema_id
  FROM "VirtualSchema"
  WHERE user_id = v_user_id
    AND template_type = 'employee_lifecycle'
  ORDER BY creation_date DESC
  LIMIT 1;

  IF v_schema_id IS NULL THEN
    RAISE EXCEPTION 'No se encontró VirtualSchema para el usuario. Ejecuta seed-employee-lifecycle-user-assets.sql primero.';
  END IF;

  SELECT id INTO v_empleados_table_id FROM "VirtualTableSchema" WHERE virtual_schema_id = v_schema_id AND name = 'Empleados' LIMIT 1;
  SELECT id INTO v_tareas_table_id FROM "VirtualTableSchema" WHERE virtual_schema_id = v_schema_id AND name = 'Tareas' LIMIT 1;
  SELECT id INTO v_checklists_table_id FROM "VirtualTableSchema" WHERE virtual_schema_id = v_schema_id AND name = 'Checklists' LIMIT 1;
  SELECT id INTO v_equipamiento_table_id FROM "VirtualTableSchema" WHERE virtual_schema_id = v_schema_id AND name = 'Equipamiento' LIMIT 1;

  IF v_empleados_table_id IS NULL OR v_tareas_table_id IS NULL OR v_checklists_table_id IS NULL OR v_equipamiento_table_id IS NULL THEN
    RAISE EXCEPTION 'Faltan tablas en el schema del usuario.';
  END IF;

  RAISE NOTICE 'Insertando datos de ejemplo para usuario %', v_user_id;

  -- =====================================================
  -- 1. Empleados
  -- =====================================================
  INSERT INTO "BusinessData" (user_id, virtual_table_schema_id, data_json, creation_date) VALUES
    (v_user_id, v_empleados_table_id, jsonb_build_object(
      'nombre_completo', 'Lucía Fernández',
      'email_corporativo', 'lucia.fernandez@acme.com',
      'telefono', '+54 9 11 4000-1101',
      'puesto', 'analista',
      'departamento', 'tecnologia',
      'fecha_ingreso', (CURRENT_DATE - INTERVAL '10 days')::text,
      'modalidad', 'hibrido',
      'manager', 'Sofía Ávila',
      'ubicacion', 'Buenos Aires',
      'estado', 'en_onboarding',
      'notas_personales', 'Perfil orientado a datos, requiere acceso a Looker.'
    ), CURRENT_DATE - INTERVAL '10 days'),

    (v_user_id, v_empleados_table_id, jsonb_build_object(
      'nombre_completo', 'Diego Morales',
      'email_corporativo', 'diego.morales@acme.com',
      'telefono', '+54 9 11 4000-1102',
      'puesto', 'generalista',
      'departamento', 'recursos_humanos',
      'fecha_ingreso', (CURRENT_DATE - INTERVAL '3 days')::text,
      'modalidad', 'presencial',
      'manager', 'Laura Méndez',
      'ubicacion', 'Buenos Aires',
      'estado', 'en_onboarding',
      'notas_personales', 'Será el nuevo referente de People Operations.'
    ), CURRENT_DATE - INTERVAL '3 days'),

    (v_user_id, v_empleados_table_id, jsonb_build_object(
      'nombre_completo', 'Valentina Ríos',
      'email_corporativo', 'valentina.rios@acme.com',
      'telefono', '+57 1 4000-2103',
      'puesto', 'gerente',
      'departamento', 'comercial',
      'fecha_ingreso', (CURRENT_DATE - INTERVAL '25 days')::text,
      'modalidad', 'remoto',
      'manager', 'Martín Paredes',
      'ubicacion', 'Bogotá',
      'estado', 'activo',
      'notas_personales', 'Liderará la expansión regional.'
    ), CURRENT_DATE - INTERVAL '25 days'),

    (v_user_id, v_empleados_table_id, jsonb_build_object(
      'nombre_completo', 'Julián Ortega',
      'email_corporativo', 'julian.ortega@acme.com',
      'telefono', '+34 600 333 221',
      'puesto', 'practicante',
      'departamento', 'finanzas',
      'fecha_ingreso', (CURRENT_DATE - INTERVAL '1 days')::text,
      'modalidad', 'remoto',
      'manager', 'Elena Ibáñez',
      'ubicacion', 'Madrid',
      'estado', 'en_onboarding',
      'notas_personales', 'Programa de internship 2025.'
    ), CURRENT_DATE - INTERVAL '1 days'),

    (v_user_id, v_empleados_table_id, jsonb_build_object(
      'nombre_completo', 'Camila Pérez',
      'email_corporativo', 'camila.perez@acme.com',
      'telefono', '+52 55 7890-4411',
      'puesto', 'lider',
      'departamento', 'operaciones',
      'fecha_ingreso', (CURRENT_DATE - INTERVAL '60 days')::text,
      'modalidad', 'presencial',
      'manager', 'Ignacio Cabrera',
      'ubicacion', 'Ciudad de México',
      'estado', 'activo',
      'notas_personales', 'Encargada del despliegue logístico en LATAM.'
    ), CURRENT_DATE - INTERVAL '60 days'),

    (v_user_id, v_empleados_table_id, jsonb_build_object(
      'nombre_completo', 'Matías Herrera',
      'email_corporativo', 'matias.herrera@acme.com',
      'telefono', '+54 9 261 500-8899',
      'puesto', 'analista',
      'departamento', 'operaciones',
      'fecha_ingreso', (CURRENT_DATE - INTERVAL '40 days')::text,
      'modalidad', 'hibrido',
      'manager', 'Camila Pérez',
      'ubicacion', 'Mendoza',
      'estado', 'activo',
      'notas_personales', 'Especialista en procesos de abastecimiento.'
    ), CURRENT_DATE - INTERVAL '40 days');

  RAISE NOTICE 'Empleados insertados';

  -- =====================================================
  -- 2. Tareas
  -- =====================================================
  INSERT INTO "BusinessData" (user_id, virtual_table_schema_id, data_json, creation_date) VALUES
    (v_user_id, v_tareas_table_id, jsonb_build_object(
      'titulo', 'Crear usuario en Google Workspace',
      'descripcion', 'Generar acceso completo para Lucía.',
      'tipo', 'it',
      'prioridad', 'alta',
      'estado', 'pendiente',
      'responsable', 'Equipo IT',
      'responsable_email', 'it@acme.com',
      'empleado_relacionado', 'Lucía Fernández',
      'fecha_limite', (CURRENT_DATE + INTERVAL '2 days')::text,
      'canal_notificacion', 'email'
    ), CURRENT_DATE - INTERVAL '1 days'),

    (v_user_id, v_tareas_table_id, jsonb_build_object(
      'titulo', 'Presentación cultura y valores',
      'descripcion', 'Meeting introductorio con People.',
      'tipo', 'onboarding',
      'prioridad', 'media',
      'estado', 'en_progreso',
      'responsable', 'Laura Méndez',
      'responsable_email', 'laura.mendez@acme.com',
      'empleado_relacionado', 'Diego Morales',
      'fecha_limite', (CURRENT_DATE + INTERVAL '3 days')::text,
      'canal_notificacion', 'slack'
    ), CURRENT_DATE - INTERVAL '2 days'),

    (v_user_id, v_tareas_table_id, jsonb_build_object(
      'titulo', 'Capacitación plataforma CRM',
      'descripcion', 'Sesión guiada para Valentina.',
      'tipo', 'capacitacion',
      'prioridad', 'alta',
      'estado', 'pendiente',
      'responsable', 'Equipo Comercial',
      'responsable_email', 'sales.enablement@acme.com',
      'empleado_relacionado', 'Valentina Ríos',
      'fecha_limite', (CURRENT_DATE + INTERVAL '5 days')::text,
      'canal_notificacion', 'email'
    ), CURRENT_DATE - INTERVAL '5 days'),

    (v_user_id, v_tareas_table_id, jsonb_build_object(
      'titulo', 'Entrega de kit de bienvenida',
      'descripcion', 'Kit físico y tarjeta corporativa para Julián.',
      'tipo', 'documentacion',
      'prioridad', 'media',
      'estado', 'bloqueada',
      'responsable', 'People Ops',
      'responsable_email', 'people@acme.com',
      'empleado_relacionado', 'Julián Ortega',
      'fecha_limite', (CURRENT_DATE + INTERVAL '1 days')::text,
      'canal_notificacion', 'email'
    ), CURRENT_DATE - INTERVAL '1 days'),

    (v_user_id, v_tareas_table_id, jsonb_build_object(
      'titulo', 'Checklist seguridad planta CDMX',
      'descripcion', 'Briefing de seguridad con Operaciones.',
      'tipo', 'onboarding',
      'prioridad', 'alta',
      'estado', 'completada',
      'responsable', 'Ignacio Cabrera',
      'responsable_email', 'ignacio.cabrera@acme.com',
      'empleado_relacionado', 'Camila Pérez',
      'fecha_limite', (CURRENT_DATE - INTERVAL '30 days')::text,
      'canal_notificacion', 'slack'
    ), CURRENT_DATE - INTERVAL '30 days');

  RAISE NOTICE 'Tareas insertadas';

  -- =====================================================
  -- 3. Checklists
  -- =====================================================
  INSERT INTO "BusinessData" (user_id, virtual_table_schema_id, data_json, creation_date) VALUES
    (v_user_id, v_checklists_table_id, jsonb_build_object(
      'nombre', 'Checklist Lucía - Semana 1',
      'fase', 'primera_semana',
      'responsable', 'People Ops',
      'items_completados', 2,
      'total_items', 6,
      'estado', 'en_progreso',
      'comentarios', 'Faltan certificados de seguridad y foto de credencial.'
    ), CURRENT_DATE - INTERVAL '7 days'),

    (v_user_id, v_checklists_table_id, jsonb_build_object(
      'nombre', 'Checklist Diego - Día 1',
      'fase', 'primer_dia',
      'responsable', 'People Ops',
      'items_completados', 4,
      'total_items', 4,
      'estado', 'completado',
      'comentarios', 'Onboarding express completado.'
    ), CURRENT_DATE - INTERVAL '2 days'),

    (v_user_id, v_checklists_table_id, jsonb_build_object(
      'nombre', 'Checklist Julián - Pre-onboarding',
      'fase', 'pre_onboarding',
      'responsable', 'Finanzas',
      'items_completados', 1,
      'total_items', 5,
      'estado', 'pendiente',
      'comentarios', 'Pendiente documentación fiscal.'
    ), CURRENT_DATE - INTERVAL '3 days');

  RAISE NOTICE 'Checklists insertados';

  -- =====================================================
  -- 4. Equipamiento
  -- =====================================================
  INSERT INTO "BusinessData" (user_id, virtual_table_schema_id, data_json, creation_date) VALUES
    (v_user_id, v_equipamiento_table_id, jsonb_build_object(
      'empleado', 'Lucía Fernández',
      'tipo_equipo', 'notebook',
      'marca_modelo', 'MacBook Pro 14"',
      'numero_serie', 'MBP-2025-LF',
      'fecha_entrega', (CURRENT_DATE - INTERVAL '9 days')::text,
      'estado_entrega', 'entregado',
      'responsable_it', 'Nicolás Ruiz',
      'observaciones', 'Incluye funda y mouse Logitech.'
    ), CURRENT_DATE - INTERVAL '9 days'),

    (v_user_id, v_equipamiento_table_id, jsonb_build_object(
      'empleado', 'Diego Morales',
      'tipo_equipo', 'notebook',
      'marca_modelo', 'Dell Latitude 7430',
      'numero_serie', 'DELL-7430-DM',
      'fecha_entrega', (CURRENT_DATE - INTERVAL '3 days')::text,
      'estado_entrega', 'entregado',
      'responsable_it', 'Nicolás Ruiz',
      'observaciones', 'Pendiente asignar celular corporativo.'
    ), CURRENT_DATE - INTERVAL '3 days'),

    (v_user_id, v_equipamiento_table_id, jsonb_build_object(
      'empleado', 'Julián Ortega',
      'tipo_equipo', 'tarjeta_acceso',
      'marca_modelo', 'Lector NFC HQ',
      'numero_serie', 'NFC-HQ-5566',
      'fecha_entrega', NULL,
      'estado_entrega', 'pendiente',
      'responsable_it', 'People Ops',
      'observaciones', 'Se entregará en su primer día presencial.'
    ), CURRENT_DATE),

    (v_user_id, v_equipamiento_table_id, jsonb_build_object(
      'empleado', 'Camila Pérez',
      'tipo_equipo', 'monitor',
      'marca_modelo', 'LG 27UL650',
      'numero_serie', 'LG-27-CP',
      'fecha_entrega', (CURRENT_DATE - INTERVAL '55 days')::text,
      'estado_entrega', 'entregado',
      'responsable_it', 'Soporte CDMX',
      'observaciones', 'Incluye brazo ergonómico.'
    ), CURRENT_DATE - INTERVAL '55 days');

  RAISE NOTICE 'Equipamiento insertado';

  RAISE NOTICE '================================================';
  RAISE NOTICE 'Datos de ejemplo creados para usuario %', v_user_id;
  RAISE NOTICE '================================================';

END $$;

-- Verificación rápida
SELECT 
  vts.name,
  COUNT(bd.id) AS registros
FROM "BusinessData" bd
JOIN "VirtualTableSchema" vts ON bd.virtual_table_schema_id = vts.id
WHERE bd.user_id = '7b9effee-7ae8-455b-8096-ec81390518a2'
GROUP BY vts.name
ORDER BY vts.name;

