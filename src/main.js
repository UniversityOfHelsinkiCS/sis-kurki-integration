import Knex from 'knex';
import knexfile from '../knexfile';

console.log(knexfile);

const knex = Knex(knexfile);

knex.raw("SELECT table_name FROM all_tables").then(console.log).catch(console.log)