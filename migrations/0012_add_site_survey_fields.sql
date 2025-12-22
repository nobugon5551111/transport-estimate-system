-- Add site survey (現地調査) fields to estimates table
ALTER TABLE estimates ADD COLUMN site_survey_people INTEGER DEFAULT 0;
ALTER TABLE estimates ADD COLUMN site_survey_distance REAL DEFAULT 0;
ALTER TABLE estimates ADD COLUMN site_survey_base_cost REAL DEFAULT 0;
ALTER TABLE estimates ADD COLUMN site_survey_vehicle_cost REAL DEFAULT 0;
ALTER TABLE estimates ADD COLUMN site_survey_distance_cost REAL DEFAULT 0;
ALTER TABLE estimates ADD COLUMN site_survey_cost REAL DEFAULT 0;
