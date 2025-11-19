-- =====================================================
-- Employee Lifecycle Hub - User Asset Instantiator
-- =====================================================
-- Clona la base de datos virtual, formularios y workflows
-- del template del Employee Lifecycle Hub para un usuario
-- específico, de modo que aparezcan en el dashboard.
--
-- Ejecutar después de correr los seeds de template:
--   1) seed-employee-lifecycle-database.sql
--   2) seed-employee-lifecycle-forms.sql
--   3) seed-employee-lifecycle-workflows.sql
-- =====================================================

DO $$
DECLARE
  v_user_id TEXT := '7b9effee-7ae8-455b-8096-ec81390518a2';
  v_template_schema_id INTEGER;
  v_user_schema_id INTEGER;
  v_existing_schema_id INTEGER;
  v_table RECORD;
  v_new_table_id INTEGER;
  v_form RECORD;
  v_existing_form_id INTEGER;
  v_new_form_id INTEGER;
  v_workflow RECORD;
  v_existing_workflow_id INTEGER;
  v_new_workflow_id INTEGER;
BEGIN

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Debes definir v_user_id antes de ejecutar este script.';
  END IF;

  -- =====================================================
  -- 1. Clonar VirtualSchema y Tablas
  -- =====================================================
  SELECT id INTO v_template_schema_id
  FROM "VirtualSchema"
  WHERE template_type = 'employee_lifecycle'
    AND is_template = true
  ORDER BY creation_date DESC
  LIMIT 1;

  IF v_template_schema_id IS NULL THEN
    RAISE EXCEPTION 'No se encontró el VirtualSchema template employee_lifecycle. Ejecuta seed-employee-lifecycle-database.sql';
  END IF;

  SELECT id INTO v_existing_schema_id
  FROM "VirtualSchema"
  WHERE user_id = v_user_id
    AND template_type = 'employee_lifecycle'
  ORDER BY creation_date DESC
  LIMIT 1;

  IF v_existing_schema_id IS NULL THEN
    INSERT INTO "VirtualSchema" (
      "user_id",
      "name",
      "description",
      "template_type",
      "is_template",
      "icon",
      "color",
      "category",
      "configs"
    )
    SELECT
      v_user_id,
      name,
      description,
      template_type,
      false,
      icon,
      color,
      category,
      configs || jsonb_build_object('cloned_from_template', v_template_schema_id)
    FROM "VirtualSchema"
    WHERE id = v_template_schema_id
    RETURNING id INTO v_user_schema_id;

    RAISE NOTICE '✅ VirtualSchema clonado (ID: %)', v_user_schema_id;
  ELSE
    v_user_schema_id := v_existing_schema_id;
    RAISE NOTICE 'ℹ️ Ya existe un VirtualSchema ELH para este usuario (ID: %)', v_user_schema_id;
  END IF;

  FOR v_table IN
    SELECT id, name, description, configs
    FROM "VirtualTableSchema"
    WHERE virtual_schema_id = v_template_schema_id
  LOOP
    SELECT id INTO v_new_table_id
    FROM "VirtualTableSchema"
    WHERE virtual_schema_id = v_user_schema_id
      AND name = v_table.name
    LIMIT 1;

    IF v_new_table_id IS NULL THEN
      INSERT INTO "VirtualTableSchema" ("virtual_schema_id", "name", "description", "configs")
      VALUES (v_user_schema_id, v_table.name, v_table.description, v_table.configs)
      RETURNING id INTO v_new_table_id;

      INSERT INTO "VirtualFieldSchema" ("virtual_table_schema_id", "name", "type", "properties")
      SELECT v_new_table_id, name, type, properties
      FROM "VirtualFieldSchema"
      WHERE virtual_table_schema_id = v_table.id;

      RAISE NOTICE '  ➕ Tabla clonada: % (ID nuevo: %)', v_table.name, v_new_table_id;
    ELSE
      RAISE NOTICE '  ℹ️ Tabla % ya existía para el usuario (ID: %)', v_table.name, v_new_table_id;
    END IF;
  END LOOP;

  -- =====================================================
  -- 2. Clonar Formularios
  -- =====================================================
  FOR v_form IN
    SELECT id, name, description, configs, is_active
    FROM "Form"
    WHERE name IN (
      'Alta de empleado',
      'Asignación de tareas de onboarding',
      'Checklist de incorporación',
      'Solicitud de equipamiento'
    )
  LOOP
    SELECT id INTO v_existing_form_id
    FROM "Form"
    WHERE user_id = v_user_id
      AND name = v_form.name
    LIMIT 1;

    IF v_existing_form_id IS NULL THEN
      INSERT INTO "Form" ("user_id", "name", "description", "configs", "is_active")
      VALUES (
        v_user_id,
        v_form.name,
        v_form.description,
        COALESCE(v_form.configs, '{}'::jsonb) || jsonb_build_object('cloned_from_template', v_form.id),
        COALESCE(v_form.is_active, true)
      )
      RETURNING id INTO v_new_form_id;

      INSERT INTO "FormField" ("form_id", "type", "label", "position", "configs")
      SELECT v_new_form_id, type, label, position, configs
      FROM "FormField"
      WHERE form_id = v_form.id;

      RAISE NOTICE '📝 Formulario clonado: % (ID nuevo: %)', v_form.name, v_new_form_id;
    ELSE
      RAISE NOTICE '📝 Formulario % ya existía (ID: %)', v_form.name, v_existing_form_id;
    END IF;
  END LOOP;

  -- =====================================================
  -- 3. Clonar Workflows
  -- =====================================================
  FOR v_workflow IN
    SELECT id, name, description, configs, is_active
    FROM "Workflow"
    WHERE name IN (
      'ELH: Bienvenida automática',
      'ELH: Notificar tarea asignada'
    )
  LOOP
    SELECT id INTO v_existing_workflow_id
    FROM "Workflow"
    WHERE user_id = v_user_id
      AND name = v_workflow.name
    LIMIT 1;

    IF v_existing_workflow_id IS NULL THEN
      INSERT INTO "Workflow" ("user_id", "name", "description", "configs", "is_active")
      VALUES (
        v_user_id,
        v_workflow.name,
        v_workflow.description,
        COALESCE(v_workflow.configs, '{}'::jsonb) || jsonb_build_object('cloned_from_template', v_workflow.id),
        COALESCE(v_workflow.is_active, true)
      )
      RETURNING id INTO v_new_workflow_id;

      INSERT INTO "WorkflowStep" ("workflow_id", "type", "position", "configs", "external_services")
      SELECT v_new_workflow_id, type, position, configs, external_services
      FROM "WorkflowStep"
      WHERE workflow_id = v_workflow.id;

      RAISE NOTICE '⚙️ Workflow clonado: % (ID nuevo: %)', v_workflow.name, v_new_workflow_id;
    ELSE
      RAISE NOTICE '⚙️ Workflow % ya existía (ID: %)', v_workflow.name, v_existing_workflow_id;
    END IF;
  END LOOP;

  RAISE NOTICE '================================================';
  RAISE NOTICE 'Instanciación para usuario % completada.', v_user_id;
  RAISE NOTICE 'VirtualSchema ID: %', v_user_schema_id;
  RAISE NOTICE 'Ahora deberías ver la BD, formularios y workflows en el dashboard.';
  RAISE NOTICE '================================================';

END $$;

