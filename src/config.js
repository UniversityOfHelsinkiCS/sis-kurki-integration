import dotenv from 'dotenv';

dotenv.config();

import knexfile from '../knexfile';

const { SIS_API_URL, SIS_API_TOKEN } = process.env;

export default {
  kurkiDatabase: knexfile,
  sis: {
    apiUrl: SIS_API_URL,
    token: SIS_API_TOKEN,
  },
};
