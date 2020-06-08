import Knex from 'knex';
import knexfile from '../knexfile';

const knex = Knex(knexfile);

knex.raw("select 1 as test from dual").then(console.log).catch(console.log)