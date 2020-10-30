import { flatMap } from 'lodash';

import getIlmoJnroByStudyGroup from './getIlmoJnroByStudyGroup';

const getStudyGroupTeacher = (group) =>
  group.teachers ? group.teachers[0] : undefined;

const getOpetusByStudyGroupSets = (groupSets, kurssi) => {
  const { sisId } = kurssi;
  const groups = flatMap(groupSets, ({ studySubGroups }) => studySubGroups);

  const group99 = groups.find((group) => getIlmoJnroByStudyGroup(group) === 99);

  const validGroups = groups.filter((group) => {
    return getIlmoJnroByStudyGroup(group) !== 99;
  });

  let opetus = validGroups.map((group, i) => {
    return {
      sisId: group.id,
      ryhmaNro: i + 2,
      ilmoJnro: getIlmoJnroByStudyGroup(group),
      teacher: getStudyGroupTeacher(group),
    };
  });

  if (group99) {
    opetus = [...opetus, { ryhmaNro: 1, ilmoJnro: 99, sisId: group99.id }];
  }

  opetus = [...opetus, { ryhmaNro: 0, ilmoJnro: null, sisId }];

  return opetus;
};

export default getOpetusByStudyGroupSets;
