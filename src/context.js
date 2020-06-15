import https from 'https';
import createKnex from 'knex';
import axios from 'axios';

import bindModels from './models';
import SisClient from './utils/sisClient';
import createLogger from './utils/logger';
import KurkiUpdater from './utils/kurkiUpdater';

const createSisHttpClient = (config) => {
  return axios.create({
    baseURL: config.sis.apiUrl,
    httpsAgent: new https.Agent({
      rejectUnauthorized: false,
    }),
  });
};

const createContext = (config) => {
  const db = createKnex(config.kurki.db);

  const models = bindModels(db);

  const sisClient = new SisClient({
    token: config.sis.token,
    httpClient: createSisHttpClient(config),
  });

  const logger = createLogger();

  const kurkiUpdater = new KurkiUpdater({
    models,
    sisClient,
    logger,
    fallbackKurssiOmistaja: config.kurki.fallbackKurssiOmistaja,
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
