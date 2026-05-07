import { Pool } from 'pg';
import Database from 'better-sqlite3';
export declare let pgPool: Pool;
export declare let sqliteDb: Database.Database;
export declare const connectDatabase: () => Promise<void>;
export declare const closeDatabase: () => Promise<void>;
//# sourceMappingURL=connection.d.ts.map