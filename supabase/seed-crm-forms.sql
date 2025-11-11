-- =====================================================
-- CRM Solution - Forms Seed Script
-- =====================================================
-- This script creates predefined forms for the CRM solution
-- including Lead Capture, Contact, Deal, and Activity forms
--
-- Run this script after seed-crm-solution.sql
-- =====================================================

DO $$
DECLARE
  v_lead_form_id INTEGER;
  v_contact_form_id INTEGER;
  v_deal_form_id INTEGER;
  v_activity_form_id INTEGER;
BEGIN

  -- =====================================================
  -- 1. Lead Capture Form
  -- =====================================================
  INSERT INTO "Form" (
    "name",
    "description",
    "is_active",
    "configs"
  ) VALUES (
    'Lead Capture Form',
    'Capture new sales leads from website or marketing campaigns',
    true,
    '{"theme": "default", "submitButtonText": "Submit Lead", "successMessage": "Thank you! We will contact you soon."}'
  ) RETURNING id INTO v_lead_form_id;

  -- Lead Form Fields
  INSERT INTO "FormField" ("form_id", "type", "label", "position", "configs") VALUES
    (v_lead_form_id, 'text', 'Full Name', 1, '{"required": true, "placeholder": "John Doe"}'),
    (v_lead_form_id, 'email', 'Email Address', 2, '{"required": true, "placeholder": "john@company.com"}'),
    (v_lead_form_id, 'text', 'Phone Number', 3, '{"required": false, "placeholder": "+1 234 567 8900"}'),
    (v_lead_form_id, 'text', 'Company', 4, '{"required": false, "placeholder": "Company Name"}'),
    (v_lead_form_id, 'select', 'Lead Source', 5, '{"required": true, "options": ["Website", "Referral", "Social Media", "Event", "Cold Call", "Other"], "default": "Website"}'),
    (v_lead_form_id, 'textarea', 'Message / Notes', 6, '{"required": false, "placeholder": "Tell us about your needs...", "rows": 4}');

  RAISE NOTICE 'Lead Capture Form created with ID: %', v_lead_form_id;

  -- =====================================================
  -- 2. Contact Form
  -- =====================================================
  INSERT INTO "Form" (
    "name",
    "description",
    "is_active",
    "configs"
  ) VALUES (
    'Contact Management Form',
    'Add or update contact information in the CRM',
    true,
    '{"theme": "default", "submitButtonText": "Save Contact", "successMessage": "Contact saved successfully!"}'
  ) RETURNING id INTO v_contact_form_id;

  -- Contact Form Fields
  INSERT INTO "FormField" ("form_id", "type", "label", "position", "configs") VALUES
    (v_contact_form_id, 'text', 'Full Name', 1, '{"required": true, "placeholder": "Jane Smith"}'),
    (v_contact_form_id, 'email', 'Email Address', 2, '{"required": true, "placeholder": "jane@company.com"}'),
    (v_contact_form_id, 'text', 'Phone Number', 3, '{"required": false, "placeholder": "+1 234 567 8900"}'),
    (v_contact_form_id, 'text', 'Company', 4, '{"required": false, "placeholder": "Acme Corp"}'),
    (v_contact_form_id, 'select', 'Status', 5, '{"required": true, "options": ["Active", "Inactive", "Prospect"], "default": "Prospect"}'),
    (v_contact_form_id, 'text', 'Assigned To', 6, '{"required": false, "placeholder": "Sales Rep Name"}'),
    (v_contact_form_id, 'text', 'Tags', 7, '{"required": false, "placeholder": "VIP, Partner (comma separated)"}'),
    (v_contact_form_id, 'textarea', 'Notes', 8, '{"required": false, "placeholder": "Additional information about this contact", "rows": 3}');

  RAISE NOTICE 'Contact Management Form created with ID: %', v_contact_form_id;

  -- =====================================================
  -- 3. Deal Form
  -- =====================================================
  INSERT INTO "Form" (
    "name",
    "description",
    "is_active",
    "configs"
  ) VALUES (
    'Deal / Opportunity Form',
    'Create or update sales opportunities and deals',
    true,
    '{"theme": "default", "submitButtonText": "Save Deal", "successMessage": "Deal saved successfully!"}'
  ) RETURNING id INTO v_deal_form_id;

  -- Deal Form Fields
  INSERT INTO "FormField" ("form_id", "type", "label", "position", "configs") VALUES
    (v_deal_form_id, 'text', 'Deal Name', 1, '{"required": true, "placeholder": "Q4 Enterprise Deal"}'),
    (v_deal_form_id, 'number', 'Deal Value (USD)', 2, '{"required": true, "placeholder": "50000", "min": 0}'),
    (v_deal_form_id, 'text', 'Contact Name', 3, '{"required": false, "placeholder": "Associated contact"}'),
    (v_deal_form_id, 'select', 'Stage', 4, '{"required": true, "options": ["Lead", "Qualified", "Proposal", "Negotiation", "Closed Won", "Closed Lost"], "default": "Lead"}'),
    (v_deal_form_id, 'number', 'Win Probability (%)', 5, '{"required": false, "placeholder": "50", "min": 0, "max": 100}'),
    (v_deal_form_id, 'date', 'Expected Close Date', 6, '{"required": false}'),
    (v_deal_form_id, 'text', 'Assigned To', 7, '{"required": false, "placeholder": "Sales Rep Name"}'),
    (v_deal_form_id, 'textarea', 'Notes', 8, '{"required": false, "placeholder": "Deal details and strategy", "rows": 4}');

  RAISE NOTICE 'Deal Form created with ID: %', v_deal_form_id;

  -- =====================================================
  -- 4. Activity Log Form
  -- =====================================================
  INSERT INTO "Form" (
    "name",
    "description",
    "is_active",
    "configs"
  ) VALUES (
    'Activity Log Form',
    'Log customer interactions and activities',
    true,
    '{"theme": "default", "submitButtonText": "Log Activity", "successMessage": "Activity logged successfully!"}'
  ) RETURNING id INTO v_activity_form_id;

  -- Activity Form Fields
  INSERT INTO "FormField" ("form_id", "type", "label", "position", "configs") VALUES
    (v_activity_form_id, 'select', 'Activity Type', 1, '{"required": true, "options": ["Phone Call", "Email", "Meeting", "Note", "Task"], "default": "Note"}'),
    (v_activity_form_id, 'text', 'Related To', 2, '{"required": false, "placeholder": "Contact or Deal name"}'),
    (v_activity_form_id, 'textarea', 'Description', 3, '{"required": true, "placeholder": "Describe what happened...", "rows": 4}'),
    (v_activity_form_id, 'date', 'Date', 4, '{"required": true}'),
    (v_activity_form_id, 'text', 'Assigned To', 5, '{"required": false, "placeholder": "Team member name"}'),
    (v_activity_form_id, 'select', 'Status', 6, '{"required": true, "options": ["Planned", "Completed", "Cancelled"], "default": "Completed"}');

  RAISE NOTICE 'Activity Log Form created with ID: %', v_activity_form_id;

  -- =====================================================
  -- Summary
  -- =====================================================
  RAISE NOTICE '================================================';
  RAISE NOTICE 'CRM Forms created successfully!';
  RAISE NOTICE '================================================';
  RAISE NOTICE 'Lead Capture Form ID: %', v_lead_form_id;
  RAISE NOTICE 'Contact Form ID: %', v_contact_form_id;
  RAISE NOTICE 'Deal Form ID: %', v_deal_form_id;
  RAISE NOTICE 'Activity Form ID: %', v_activity_form_id;
  RAISE NOTICE '================================================';
  RAISE NOTICE 'Next steps:';
  RAISE NOTICE '1. Run seed-crm-solution-template.sql to create the CRM solution template';
  RAISE NOTICE '2. Connect forms to database tables using DataConnection and FieldMapping';
  RAISE NOTICE '================================================';

END $$;

-- =====================================================
-- Verification Query
-- =====================================================
-- Run this to verify forms were created
SELECT 
  f.id,
  f.name,
  f.description,
  COUNT(ff.id) as field_count
FROM "Form" f
LEFT JOIN "FormField" ff ON f.id = ff.form_id
WHERE f.name LIKE '%Form' AND f.name IN (
  'Lead Capture Form',
  'Contact Management Form',
  'Deal / Opportunity Form',
  'Activity Log Form'
)
GROUP BY f.id, f.name, f.description
ORDER BY f.id;

