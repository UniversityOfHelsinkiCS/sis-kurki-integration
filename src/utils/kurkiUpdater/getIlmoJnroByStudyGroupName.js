const group99RegExp = /(Group 99|Jono|Ryhmä 99)/i;

const getIlmoJnroByStudyGroupName = (name) => {
  if (!name) {
    return undefined;
  }

  if (group99RegExp.test(name)) {
    return 99;
  }

  const numberMatch = name.match(/^(\D*)(\d+)/);

  return numberMatch && numberMatch[2] ? parseInt(numberMatch[2]) : undefined;
};

export default getIlmoJnroByStudyGroupName;
