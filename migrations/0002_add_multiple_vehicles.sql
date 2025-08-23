-- Add support for multiple vehicles and external contractor costs
-- This migration adds new columns while preserving existing data

-- Add columns for multiple vehicle support
ALTER TABLE estimates ADD COLUMN vehicle_2t_count INTEGER NOT NULL DEFAULT 0;
ALTER TABLE estimates ADD COLUMN vehicle_4t_count INTEGER NOT NULL DEFAULT 0;

-- Add column for external contractor costs
ALTER TABLE estimates ADD COLUMN external_contractor_cost REAL NOT NULL DEFAULT 0;

-- Add column to track if the estimate uses new multiple vehicle format
ALTER TABLE estimates ADD COLUMN uses_multiple_vehicles BOOLEAN NOT NULL DEFAULT FALSE;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_estimates_multiple_vehicles ON estimates(uses_multiple_vehicles);