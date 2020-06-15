import getHtunnusByFullName from './getHtunnusByFullName';

const getHenkiloByPerson = (person) => {
  const { emailAddress, firstName, lastName } = person;

  return {
    htunnus: getHtunnusByFullName({ firstName, lastName }),
    etunimet: firstName,
    sukunimi: lastName,
    sahkopostiosoite: emailAddress,
    hyPuhelinluettelossa: 'E', // TODO: This shouldn't be hard coded
    hyTyosuhde: 'K', // TODO: This shouldn't be hard coded
  };
};

export default getHenkiloByPerson;
