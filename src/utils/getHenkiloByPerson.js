import getHtunnusByFullName from './getHtunnusByFullName';

const getHenkiloByPerson = (person) => {
  const { emailAddress, firstName, lastName } = person;

  return {
    htunnus: getHtunnusByFullName({ firstName, lastName }),
    etunimet: firstName,
    sukunimi: lastName,
    sahkopostiosoite: emailAddress,
  };
};

export default getHenkiloByPerson;
