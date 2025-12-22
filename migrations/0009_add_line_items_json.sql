-- Add line_items_json column to estimates table
-- This column stores structured line item data for PDF generation

ALTER TABLE estimates ADD COLUMN line_items_json TEXT;

-- Add comment explaining the structure
-- line_items_json format:
-- {
--   "vehicle": {
--     "section_name": "車両費用",
--     "items": [
--       {
--         "description": "2t車 2台・1日（Aエリア）",
--         "quantity": 2,
--         "unit_price": 50000,
--         "amount": 100000,
--         "note": ""
--       }
--     ],
--     "subtotal": 140000
--   },
--   "staff": { ... },
--   "services": { ... }
-- }
