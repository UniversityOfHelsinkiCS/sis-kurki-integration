import createKnex from 'knex';
import { knexSnakeCaseMappers } from 'objection';

import knexfile from '../knexfile';
import bindModels from './models';

const knex = createKnex({
  ...knexfile,
  ...knexSnakeCaseMappers({ upperCase: true })
});

const models = bindModels(knex);

models.Kurssi.query().then(console.log).catch(console.log);
