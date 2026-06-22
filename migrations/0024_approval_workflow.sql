-- 承認者マスタテーブル
CREATE TABLE IF NOT EXISTS approvers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  role TEXT DEFAULT 'approver',
  department TEXT,
  is_active INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 承認リクエストテーブル
CREATE TABLE IF NOT EXISTS approval_requests (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  estimate_id INTEGER NOT NULL,
  requester_name TEXT NOT NULL,
  approver_id INTEGER NOT NULL,
  status TEXT DEFAULT 'pending',
  request_comment TEXT,
  response_comment TEXT,
  requested_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  responded_at DATETIME,
  FOREIGN KEY (estimate_id) REFERENCES estimates(id),
  FOREIGN KEY (approver_id) REFERENCES approvers(id)
);

-- インデックス
CREATE INDEX IF NOT EXISTS idx_approval_requests_estimate ON approval_requests(estimate_id);
CREATE INDEX IF NOT EXISTS idx_approval_requests_approver ON approval_requests(approver_id);
CREATE INDEX IF NOT EXISTS idx_approval_requests_status ON approval_requests(status);
CREATE INDEX IF NOT EXISTS idx_approvers_email ON approvers(email);
CREATE INDEX IF NOT EXISTS idx_approvers_active ON approvers(is_active);
