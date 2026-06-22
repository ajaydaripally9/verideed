-- Enable standard UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop tables if they exist (for clean initialization)
DROP TABLE IF EXISTS forensic_reports CASCADE;
DROP TABLE IF EXISTS properties CASCADE;
DROP TABLE IF EXISTS deeds CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Create Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create Deeds table
CREATE TABLE deeds (
    id VARCHAR(50) PRIMARY KEY,
    owner_name VARCHAR(100) NOT NULL,
    survey_number VARCHAR(50) NOT NULL,
    document_path VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create Properties table (using standard TEXT for geometry WKT to remove PostGIS dependency)
CREATE TABLE properties (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    deed_id VARCHAR(50) REFERENCES deeds(id) ON DELETE CASCADE,
    geometry_wkt TEXT NOT NULL,
    area NUMERIC(12, 2) NOT NULL, -- in square feet
    location VARCHAR(255) NOT NULL
);

-- Create Forensic Reports table
CREATE TABLE forensic_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    deed_id VARCHAR(50) REFERENCES deeds(id) ON DELETE CASCADE,
    ocr_score NUMERIC(5, 2) NOT NULL, -- 0 to 100
    layout_score NUMERIC(5, 2) NOT NULL, -- 0 to 100
    overlap_score NUMERIC(5, 2) NOT NULL, -- 0 to 100
    final_risk NUMERIC(5, 2) NOT NULL, -- 0 to 100
    details JSONB NOT NULL
);

-- Insert Sample User
INSERT INTO users (name, email, password) VALUES 
('Ajay Devgan', 'ajay@verideed.com', '$2a$10$wE4nN2mI.3b3F1NlBf6V5ut3rYJ.2q4fH9Z6hZq05sR7iM6Z0u.qW');

-- Insert Sample Deeds
INSERT INTO deeds (id, owner_name, survey_number, document_path) VALUES 
('DEED-001', 'Ramesh Kumar', 'TS-102/A', 'uploads/deed-001.pdf'),
('DEED-002', 'Suresh Reddy', 'TS-102/B', 'uploads/deed-002.pdf');

-- Insert Sample Properties
INSERT INTO properties (deed_id, geometry_wkt, area, location) VALUES 
(
  'DEED-001', 
  'POLYGON((78.3820 17.4410, 78.3825 17.4410, 78.3825 17.4415, 78.3820 17.4415, 78.3820 17.4410))', 
  2500.00, 
  'Survey No 102/A, Madhapur, Hyderabad, Telangana'
),
(
  'DEED-002', 
  'POLYGON((78.3830 17.4410, 78.3835 17.4410, 78.3835 17.4415, 78.3830 17.4415, 78.3830 17.4410))', 
  2500.00, 
  'Survey No 102/B, Madhapur, Hyderabad, Telangana'
);

-- Insert Sample Reports
INSERT INTO forensic_reports (deed_id, ocr_score, layout_score, overlap_score, final_risk, details) VALUES 
(
  'DEED-001', 
  95.00, 
  98.00, 
  0.00, 
  5.00, 
  '{"issues": [], "ocr_extracted": {"owner": "Ramesh Kumar", "survey": "TS-102/A", "area": "2500 sq.ft"}, "layout_analysis": {"stamp_detected": true, "alignment_issues": false}}'::jsonb
),
(
  'DEED-002', 
  90.00, 
  92.00, 
  0.00, 
  8.00, 
  '{"issues": [], "ocr_extracted": {"owner": "Suresh Reddy", "survey": "TS-102/B", "area": "2500 sq.ft"}, "layout_analysis": {"stamp_detected": true, "alignment_issues": false}}'::jsonb
);
