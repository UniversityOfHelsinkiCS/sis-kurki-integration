import https from 'https';
import createKnex from 'knex';
import axios from 'axios';

import bindModels from './models';
import SisImporterClient from './utils/sisClient/sisImporterClient';
import SisGraphqlClient from './utils/sisClient/sisGraphqlClient';
import SisClient from './utils/sisClient';
import createLogger from './utils/logger';
import KurkiUpdater from './utils/kurkiUpdater';

const createSisClient = (config) => {
  const importerHttpClient = axios.create({
    baseURL: config.sis.importerApiUrl,
    httpsAgent: new https.Agent({
      rejectUnauthorized: false,
    }),
  });

  const graphqlHttpClient = axios.create({
    baseURL: `${config.sis.apiUrl}/graphql`,
    httpsAgent: new https.Agent({
      rejectUnauthorized: false,
    }),
  });

  const importerClient = new SisImporterClient({
    httpClient: importerHttpClient,
    token: config.sis.importerToken,
  });

  const graphqlClient = new SisGraphqlClient({
    httpClient: graphqlHttpClient,
    token: config.sis.token,
  });

  return new SisClient({
    importerClient,
    graphqlClient,
  });
};

const createContext = (config) => {
  const db = createKnex(config.kurki.db);

  const models = bindModels(db);

  const sisClient = createSisClient(config);

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
