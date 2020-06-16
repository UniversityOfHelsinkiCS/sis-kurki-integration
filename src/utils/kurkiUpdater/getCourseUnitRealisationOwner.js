import { get } from 'lodash';

const getCourseUnitRealisationOwner = (responsibilityInfos) => {
  return get(responsibilityInfos, '[0].person');
};

export default getCourseUnitRealisationOwner;
