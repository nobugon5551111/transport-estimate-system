
 ⛅️ wrangler 4.30.0 (update available 4.42.1)
─────────────────────────────────────────────
🌀 Executing on local database transport-estimate-production (7f1910de-adb4-4233-a87e-86a36975d538) from .wrangler/state/v3/d1:
🌀 To execute on your remote database, add a --remote flag to your wrangler command.
🚣 1 command executed successfully.
[
  {
    "results": [
      {
        "sql": "CREATE TABLE d1_migrations(\n\t\tid         INTEGER PRIMARY KEY AUTOINCREMENT,\n\t\tname       TEXT UNIQUE,\n\t\tapplied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL\n)"
      },
      {
        "sql": "CREATE TABLE sqlite_sequence(name,seq)"
      },
      {
        "sql": "CREATE TABLE _cf_METADATA (\n        key INTEGER PRIMARY KEY,\n        value BLOB\n      )"
      },
      {
        "sql": "CREATE TABLE customers (\n  id INTEGER PRIMARY KEY AUTOINCREMENT,\n  name TEXT NOT NULL,                    \n  contact_person TEXT,                   \n  phone TEXT,                           \n  email TEXT,                           \n  address TEXT,                         \n  notes TEXT,                           \n  user_id TEXT NOT NULL,                \n  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,\n  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP\n)"
      },
      {
        "sql": "CREATE TABLE projects (\n  id INTEGER PRIMARY KEY AUTOINCREMENT,\n  customer_id INTEGER NOT NULL,          \n  name TEXT NOT NULL,                    \n  description TEXT,                      \n  status TEXT NOT NULL DEFAULT 'initial', \n  user_id TEXT NOT NULL,\n  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,\n  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,\n  FOREIGN KEY (customer_id) REFERENCES customers(id)\n)"
      },
      {
        "sql": "CREATE TABLE estimates (\n  id INTEGER PRIMARY KEY AUTOINCREMENT,\n  customer_id INTEGER NOT NULL,          \n  project_id INTEGER NOT NULL,           \n  estimate_number TEXT NOT NULL,         \n  \n  \n  delivery_address TEXT NOT NULL,        \n  delivery_postal_code TEXT,             \n  delivery_area TEXT NOT NULL,           \n  \n  \n  vehicle_type TEXT NOT NULL,            \n  operation_type TEXT NOT NULL,          \n  vehicle_cost REAL NOT NULL DEFAULT 0,  \n  \n  \n  supervisor_count INTEGER DEFAULT 0,    \n  leader_count INTEGER DEFAULT 0,        \n  m2_staff_half_day INTEGER DEFAULT 0,   \n  m2_staff_full_day INTEGER DEFAULT 0,   \n  temp_staff_half_day INTEGER DEFAULT 0, \n  temp_staff_full_day INTEGER DEFAULT 0, \n  staff_cost REAL NOT NULL DEFAULT 0,    \n  \n  \n  parking_officer_hours REAL DEFAULT 0,  \n  parking_officer_cost REAL DEFAULT 0,   \n  \n  transport_vehicles INTEGER DEFAULT 0,   \n  transport_within_20km BOOLEAN DEFAULT TRUE, \n  transport_distance REAL DEFAULT 0,     \n  transport_fuel_cost REAL DEFAULT 0,    \n  transport_cost REAL DEFAULT 0,         \n  \n  waste_disposal_size TEXT DEFAULT 'none', \n  waste_disposal_cost REAL DEFAULT 0,    \n  \n  protection_work BOOLEAN DEFAULT FALSE, \n  protection_floors INTEGER DEFAULT 0,   \n  protection_cost REAL DEFAULT 0,        \n  \n  material_collection_size TEXT DEFAULT 'none', \n  material_collection_cost REAL DEFAULT 0, \n  \n  construction_m2_staff INTEGER DEFAULT 0, \n  construction_partner TEXT,              \n  construction_cost REAL DEFAULT 0,      \n  \n  work_time_type TEXT DEFAULT 'normal',  \n  work_time_multiplier REAL DEFAULT 1.0, \n  \n  parking_fee REAL DEFAULT 0,            \n  highway_fee REAL DEFAULT 0,            \n  \n  \n  subtotal REAL NOT NULL DEFAULT 0,      \n  tax_rate REAL NOT NULL DEFAULT 0.1,    \n  tax_amount REAL NOT NULL DEFAULT 0,    \n  total_amount REAL NOT NULL DEFAULT 0,  \n  \n  \n  notes TEXT,                            \n  ai_email_generated TEXT,               \n  pdf_generated BOOLEAN DEFAULT FALSE,   \n  user_id TEXT NOT NULL,\n  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,\n  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP, vehicle_2t_count INTEGER NOT NULL DEFAULT 0, vehicle_4t_count INTEGER NOT NULL DEFAULT 0, external_contractor_cost REAL NOT NULL DEFAULT 0, uses_multiple_vehicles BOOLEAN NOT NULL DEFAULT FALSE,\n  \n  FOREIGN KEY (customer_id) REFERENCES customers(id),\n  FOREIGN KEY (project_id) REFERENCES projects(id)\n)"
      },
      {
        "sql": "CREATE TABLE status_history (\n  id INTEGER PRIMARY KEY AUTOINCREMENT,\n  project_id INTEGER NOT NULL,           \n  estimate_id INTEGER,                   \n  old_status TEXT,                       \n  new_status TEXT NOT NULL,              \n  notes TEXT,                           \n  user_id TEXT NOT NULL,\n  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,\n  FOREIGN KEY (project_id) REFERENCES projects(id),\n  FOREIGN KEY (estimate_id) REFERENCES estimates(id)\n)"
      },
      {
        "sql": "CREATE TABLE master_settings (\n  id INTEGER PRIMARY KEY AUTOINCREMENT,\n  category TEXT NOT NULL,                \n  subcategory TEXT NOT NULL,             \n  key TEXT NOT NULL,                     \n  value TEXT NOT NULL,                   \n  data_type TEXT DEFAULT 'string',       \n  description TEXT,                      \n  user_id TEXT NOT NULL,\n  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,\n  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,\n  UNIQUE(category, subcategory, key, user_id)\n)"
      },
      {
        "sql": "CREATE TABLE area_settings (\n  id INTEGER PRIMARY KEY AUTOINCREMENT,\n  postal_code_prefix TEXT NOT NULL,      \n  area_name TEXT NOT NULL,               \n  area_rank TEXT NOT NULL,               \n  user_id TEXT NOT NULL,\n  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,\n  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,\n  UNIQUE(postal_code_prefix, user_id)\n)"
      },
      {
        "sql": "CREATE TABLE backup_metadata (\n  id INTEGER PRIMARY KEY AUTOINCREMENT,\n  backup_name TEXT NOT NULL,\n  backup_type TEXT NOT NULL DEFAULT 'manual', \n  file_name TEXT NOT NULL,\n  file_size INTEGER DEFAULT 0,\n  record_count INTEGER DEFAULT 0,\n  status TEXT DEFAULT 'pending', \n  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,\n  expires_at DATETIME,\n  created_by TEXT DEFAULT 'system',\n  notes TEXT\n)"
      },
      {
        "sql": "CREATE TABLE backup_history (\n  id INTEGER PRIMARY KEY AUTOINCREMENT,\n  backup_id INTEGER,\n  operation_type TEXT NOT NULL, \n  operation_status TEXT NOT NULL, \n  operation_details TEXT,\n  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,\n  user_id TEXT,\n  FOREIGN KEY (backup_id) REFERENCES backup_metadata(id)\n)"
      },
      {
        "sql": "CREATE TABLE backup_schedules (\n  id INTEGER PRIMARY KEY AUTOINCREMENT,\n  schedule_name TEXT NOT NULL,\n  frequency TEXT NOT NULL, \n  frequency_value INTEGER, \n  time_hour INTEGER DEFAULT 2, \n  time_minute INTEGER DEFAULT 0, \n  target_tables TEXT, \n  retention_days INTEGER DEFAULT 30, \n  is_active INTEGER DEFAULT 1, \n  last_run DATETIME, \n  run_count INTEGER DEFAULT 0, \n  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,\n  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,\n  created_by TEXT DEFAULT 'system'\n)"
      },
      {
        "sql": "CREATE TABLE backup_execution_log (\n  id INTEGER PRIMARY KEY AUTOINCREMENT,\n  schedule_id INTEGER,\n  backup_id INTEGER,\n  execution_status TEXT NOT NULL, \n  execution_details TEXT,\n  execution_time_ms INTEGER,\n  executed_at DATETIME DEFAULT CURRENT_TIMESTAMP,\n  FOREIGN KEY (schedule_id) REFERENCES backup_schedules(id),\n  FOREIGN KEY (backup_id) REFERENCES backup_metadata(id)\n)"
      }
    ],
    "success": true,
    "meta": {
      "duration": 1
    }
  }
]
