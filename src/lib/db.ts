import sql, { config as SQLConfig } from "mssql";

const dbConfig: SQLConfig = {
  user: process.env.DATABASE_USER!,
  password: process.env.DATABASE_PASSWORD!,
  database: process.env.DATABASE_NAME!,
  server: process.env.DATABASE_HOST!,
  port: Number(process.env.DATABASE_PORT),
  options: {
    encrypt: false, // for Azure, set false for local dev
    trustServerCertificate: true, // change to false in production if SSL cert is valid
  },
};

let pool: sql.ConnectionPool | null = null;

export async function getConnection() {
  if (!pool) {
    pool = await sql.connect(dbConfig);
  }
  return pool;
}
