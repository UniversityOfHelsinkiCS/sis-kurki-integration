import { flatMap, isNumber, get } from 'lodash';

import getIlmoJnroByStudyGroupName from './getIlmoJnroByStudyGroupName';

const getOpetusByStudyGroupSets = (groupSets, kurssi) => {
  const { sisId } = kurssi;
  const groups = flatMap(groupSets, ({ studySubGroups }) => studySubGroups);

  const group99 = groups.find(
    ({ name }) => getIlmoJnroByStudyGroupName(get(name, 'fi')) === 99,
  );

  const validGroups = groups.filter(({ name }) => {
    const ilmoJnro = getIlmoJnroByStudyGroupName(get(name, 'fi'));

    return isNumber(ilmoJnro) && ilmoJnro !== 99;
  });

  let opetus = validGroups.map((s, i) => {
    return {
      sisId: s.id,
      ryhmaNro: i + 2,
      ilmoJnro: getIlmoJnroByStudyGroupName(get(s.name, 'fi')),
      teacher: s.teachers ? s.teachers[0] : undefined,
    };
  });

  if (group99) {
    opetus = [
      ...opetus,
      { ryhmaNro: 1, ilmoJnro: 99, sisId: group99.id },
    ];
  }

  opetus = [
    ...opetus,
    { ryhmaNro: 0, ilmoJnro: null, sisId },
  ];

  return opetus;
};

export default getOpetusByStudyGroupSets;
