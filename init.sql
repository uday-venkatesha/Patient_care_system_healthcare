-- ============================================================
-- Seed Data for Patient Care Coordination System
-- ============================================================

-- Departments
INSERT INTO departments (name, description, department_code) VALUES
  ('Emergency Department', 'Emergency and trauma care', 'ED'),
  ('Cardiology', 'Cardiac care unit', 'CARD'),
  ('Oncology', 'Cancer treatment and care', 'ONC'),
  ('ICU', 'Intensive Care Unit', 'ICU'),
  ('General Medicine', 'General inpatient medicine', 'GM')
ON CONFLICT (department_code) DO NOTHING;

-- Users (passwords are BCrypt of: admin123, coord123, doc123, nurse123)
INSERT INTO users (username, email, password, first_name, last_name, role, department_id, is_active, created_at, updated_at) VALUES
  ('admin', 'admin@hospital.com',
   '$2a$12$j0HrNZYtX.6nrkTvtFgyKODlLn0hhgp9TphVTGO6gkluNjrYvPMUq',
   'System', 'Administrator', 'ADMIN', NULL, true, NOW(), NOW()),

  ('coordinator1', 'coordinator@hospital.com',
   '$2a$12$YLaH7c0Vv2lqQyr3WDQOfeU.24bxPIw70l7uSJU1fFRNjyne1g9e.',
   'Sarah', 'Johnson', 'CARE_COORDINATOR',
   (SELECT id FROM departments WHERE department_code = 'GM'), true, NOW(), NOW()),

  ('dr.smith', 'smith@hospital.com',
   '$2a$12$RlpsrVdIqxkHwqtCnrAd9OhentwGtZJ7WFLFF07xXnm49AKUAf.wa',
   'James', 'Smith', 'DOCTOR',
   (SELECT id FROM departments WHERE department_code = 'CARD'), true, NOW(), NOW()),

  ('nurse.jones', 'jones@hospital.com',
   '$2a$12$iLEY2ggA4c5fxNbljTztDOmisxidY485TQX/Zn6sAhmrw9pW3c6mi',
   'Emily', 'Jones', 'NURSE',
   (SELECT id FROM departments WHERE department_code = 'GM'), true, NOW(), NOW()),

  ('dr.patel', 'patel@hospital.com',
   '$2a$12$RlpsrVdIqxkHwqtCnrAd9OhentwGtZJ7WFLFF07xXnm49AKUAf.wa',
   'Priya', 'Patel', 'DOCTOR',
   (SELECT id FROM departments WHERE department_code = 'ONC'), true, NOW(), NOW())
ON CONFLICT (username) DO NOTHING;

-- Sample Patients
INSERT INTO patients (mrn, first_name, last_name, date_of_birth, gender, phone_number, status, department_id, primary_doctor_id, diagnosis, admitted_at, created_at, updated_at)
SELECT
  'MRN-001', 'Robert', 'Williams', '1958-03-14', 'MALE', '555-0101', 'ADMITTED',
  d.id, u.id, 'Acute myocardial infarction, post-stent placement', NOW() - INTERVAL '3 days', NOW(), NOW()
FROM departments d, users u
WHERE d.department_code = 'CARD' AND u.username = 'dr.smith'
ON CONFLICT (mrn) DO NOTHING;

INSERT INTO patients (mrn, first_name, last_name, date_of_birth, gender, phone_number, status, department_id, primary_doctor_id, diagnosis, admitted_at, created_at, updated_at)
SELECT
  'MRN-002', 'Linda', 'Garcia', '1965-07-22', 'FEMALE', '555-0102', 'ICU',
  d.id, u.id, 'Severe pneumonia with respiratory failure', NOW() - INTERVAL '1 day', NOW(), NOW()
FROM departments d, users u
WHERE d.department_code = 'ICU' AND u.username = 'dr.smith'
ON CONFLICT (mrn) DO NOTHING;

INSERT INTO patients (mrn, first_name, last_name, date_of_birth, gender, phone_number, status, department_id, primary_doctor_id, diagnosis, admitted_at, created_at, updated_at)
SELECT
  'MRN-003', 'David', 'Chen', '1972-11-05', 'MALE', '555-0103', 'ADMITTED',
  d.id, u.id, 'Stage 3 colorectal cancer, chemotherapy cycle 4', NOW() - INTERVAL '7 days', NOW(), NOW()
FROM departments d, users u
WHERE d.department_code = 'ONC' AND u.username = 'dr.patel'
ON CONFLICT (mrn) DO NOTHING;
