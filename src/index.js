import config from './config';
import createContext from './context';

const context = createContext(config);

const { kurkiUpdater, logger } = context;

kurkiUpdater
  .updateCourseUnitsByCodes(['TKT20010'])
  .catch((error) => logger.error(error));
