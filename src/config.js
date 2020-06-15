import dotenv from 'dotenv';

dotenv.config();

import knexfile from '../knexfile';

const {
  SIS_API_URL,
  SIS_API_TOKEN,
  KURKI_FALLBACK_KURSSI_OMISTAJA_HTUNNUS,
} = process.env;

export default {
  kurki: {
    db: knexfile,
    fallbackKurssiOmistajaHtunnus: KURKI_FALLBACK_KURSSI_OMISTAJA_HTUNNUS,
  },
  sis: {
    apiUrl: SIS_API_URL,
    token: SIS_API_TOKEN,
  },
};
