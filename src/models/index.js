import Kurssi from './kurssi';
import Opintojakso from './opintojakso';

const bindModels = (knex) => {
  return {
    Kurssi: Kurssi.bindKnex(knex),
    Opintojakso: Opintojakso.bindKnex(knex),
  };
};

export default bindModels;
