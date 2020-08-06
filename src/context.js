import https from 'https';
import createKnex from 'knex';
import axios from 'axios';

import bindModels from './models';
import SisImporterClient from './utils/sisClient/sisImporterClient';
import SisClient from './utils/sisClient';
import createLogger from './utils/logger';
import KurkiUpdater from './utils/kurkiUpdater';

import {
  DB_CONFIG,
  SIS_IMPORTER_API_URL,
  SIS_IMPORTER_API_TOKEN,
  KURKI_FALLBACK_KURSSI_OMISTAJA,
} from './config';

const createSisClient = () => {
  const importerHttpClient = axios.create({
    baseURL: SIS_IMPORTER_API_URL,
    httpsAgent: new https.Agent({
      rejectUnauthorized: false,
    }),
  });

  const importerClient = new SisImporterClient({
    httpClient: importerHttpClient,
    token: SIS_IMPORTER_API_TOKEN,
  });

  return new SisClient({
    importerClient,
  });
};

const createContext = () => {
  const db = createKnex(DB_CONFIG);

  const models = bindModels(db);

  const sisClient = createSisClient();

  const logger = createLogger();

  const kurkiUpdater = new KurkiUpdater({
    models,
    logger,
    fallbackKurssiOmistaja: KURKI_FALLBACK_KURSSI_OMISTAJA,
    sisClient,
  });

  return {
    db,
    models,
    sisClient,
    logger,
    kurkiUpdater,
  };
};

export default createContext;
