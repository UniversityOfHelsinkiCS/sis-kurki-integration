exports.seed = async (knex) => {
  await knex('henkilo').del();

  await knex('henkilo').insert([
    { htunnus: 'DOE_J', firstName: 'John', lastName: 'Doe' },
  ]);
};
