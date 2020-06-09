import https from 'https';
import createKnex from 'knex';
import { knexSnakeCaseMappers } from 'objection';
import axios from 'axios';

import bindModels from './models';
import SisClient from './utils/sisClient';
import createLogger from './utils/logger';
import KurkiUpdater from './utils/kurkiUpdater';

const createContext = (config) => {
  const db = createKnex({
    ...config.kurkiDatabase,
    ...knexSnakeCaseMappers({ upperCase: true }),
  });

  const models = bindModels(db);

  const sisClient = new SisClient({
    token: config.sis.token,
    httpClient: axios.create({
      baseURL: config.sis.apiUrl,
      httpsAgent: new https.Agent({
        rejectUnauthorized: false,
      }),
    }),
  });

  const logger = createLogger();

  const kurkiUpdater = new KurkiUpdater({ models, sisClient, logger });

  return {
    db,
    models,
    sisClient,
    logger,
    kurkiUpdater,
  };
};

export default createContext;
