import createContext from './context';

const context = createContext();

const { kurkiUpdater, logger } = context;

kurkiUpdater
  .updateCourseUnitsByCodes(['TKT20010'])
  .catch((error) => logger.error(error));
