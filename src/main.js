import config from './config';
import createContext from './context';

const context = createContext(config);

const { kurkiUpdater, logger } = context;

kurkiUpdater
  .updateCourseUnits({
    codes: ['TKT21002'],
  })
  .catch((error) => logger.error(error));
