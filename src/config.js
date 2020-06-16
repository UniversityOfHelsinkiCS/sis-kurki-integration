import dotenv from 'dotenv';

dotenv.config();

import knexfile from '../knexfile';

const {
  SIS_API_URL,
  SIS_API_TOKEN,
  SIS_IMPORTER_API_URL,
  SIS_IMPORTER_API_TOKEN,
  KURKI_FALLBACK_KURSSI_OMISTAJA,
} = process.env;

export default {
  kurki: {
    db: knexfile,
    fallbackKurssiOmistaja: KURKI_FALLBACK_KURSSI_OMISTAJA,
  },
  sis: {
    apiUrl: SIS_API_URL,
    token: SIS_API_TOKEN,
    importerApiUrl: SIS_IMPORTER_API_URL,
    importerToken: SIS_IMPORTER_API_TOKEN,
  },
};
