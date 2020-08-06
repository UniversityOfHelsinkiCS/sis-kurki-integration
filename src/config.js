import dotenv from 'dotenv';

dotenv.config();

import knexfile from '../knexfile';

export const {
  SIS_IMPORTER_API_TOKEN,
  SIS_IMPORTER_API_URL,
  KURKI_FALLBACK_KURSSI_OMISTAJA,
} = process.env;

export const DB_CONFIG = knexfile;
