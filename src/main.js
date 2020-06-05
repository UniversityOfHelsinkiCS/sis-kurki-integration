import Knex from 'knex';
import knexfile from '../knexfile';

console.log(knexfile);

const knex = Knex(knexfile);

knex('dual').select('1').as('a').then(console.log).catch(console.log);
