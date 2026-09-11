export type DatabaseDemo = 'none' | '5.1' | '5.2' | '5.3' | '5.4' | '5.5';

// Giá trị này được cập nhật bởi `pnpm db:demo`.
// Chỉ một kịch bản lỗi được phép hoạt động tại một thời điểm.
export const ACTIVE_DATABASE_DEMO: DatabaseDemo = 'none';

export const isDatabaseDemoActive = (demo: Exclude<DatabaseDemo, 'none'>) =>
  (ACTIVE_DATABASE_DEMO as DatabaseDemo) === demo;
