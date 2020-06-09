import https from 'https';
import createKnex from 'knex';
import { knexSnakeCaseMappers } from 'objection';
import axios from 'axios';

import bindModels from './models';
import SisClient from './utils/sisClient';

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

  return {
    db,
    models,
    sisClient,
  };
};

export default createContext;
