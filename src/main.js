import config from './config';
import createContext from './context';

const context = createContext(config);

const { models, sisClient } = context;

models.Kurssi.query().then(console.log).catch(console.log);

sisClient.getCourseUnitRealisationByCode('TKT21002')
  .then(console.log)
  .catch(console.log);