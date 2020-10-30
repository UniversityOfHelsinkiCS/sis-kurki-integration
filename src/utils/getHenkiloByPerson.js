import getKtunnusByPerson from './getKtunnusByPerson';

const getHenkiloByPerson = (person) => {
  const { firstName, lastName, id } = person;

  const ktunnus = getKtunnusByPerson(person);

  return {
    ktunnus,
    etunimet: firstName,
    sukunimi: lastName,
    sisId: id,
  };
};

export default getHenkiloByPerson;
