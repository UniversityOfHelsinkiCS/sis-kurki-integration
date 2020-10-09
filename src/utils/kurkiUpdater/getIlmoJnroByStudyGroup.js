import { get } from 'lodash';

const group99RegExp = /(Group 99|Jono|Ryhmä 99)/i;

const getIlmoJnroByStudyGroup = (group) => {
  const name = get(group, 'name.fi');

  if (!name) {
    return undefined;
  }

  if (group99RegExp.test(name)) {
    return 99;
  }

  const numberMatch = name.match(/^(\D*)(\d+)/);

  return numberMatch && numberMatch[2] ? parseInt(numberMatch[2]) : undefined;
};

export default getIlmoJnroByStudyGroup;
