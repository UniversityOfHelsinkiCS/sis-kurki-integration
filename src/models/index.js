import db from '../db';
import Kurssi from './kurssi';
import Opintojakso from './opintojakso';
import Henkilo from './henkilo';
import Kielikoodi from './kielikoodi';
import KurssinTila from './kurssinTila';
import KurssinTyyppi from './kurssinTyyppi';
import Opetus from './opetus';
import OpetustehtavanHoito from './opetustehtavanHoito';
import Periodi from './periodi';

export const bindModels = (knex) => {
  return {
    Kurssi: Kurssi.bindKnex(knex),
    Opintojakso: Opintojakso.bindKnex(knex),
    Henkilo: Henkilo.bindKnex(knex),
    Kielikoodi: Kielikoodi.bindKnex(knex),
    KurssinTila: KurssinTila.bindKnex(knex),
    KurssinTyyppi: KurssinTyyppi.bindKnex(knex),
    Opetus: Opetus.bindKnex(knex),
    OpetustehtavanHoito: OpetustehtavanHoito.bindKnex(knex),
    Periodi: Periodi.bindKnex(knex),
  };
};

export default bindModels(db);
