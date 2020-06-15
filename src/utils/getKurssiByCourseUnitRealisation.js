import { get } from 'lodash';
import { getYear, isValid, getMonth, getDate } from 'date-fns';

const kielikoodiByLanguageCode = {
  fi: 'S',
  en: 'E',
  se: 'R',
};

const tyyppiByCourseUnitRealisationType = {
  'independent-work-essay': 'K',
  'exam-electronic': 'L',
  'exam-final': 'L',
  'teaching-participation-field-course': 'K',
  'teaching-participation-small-group': 'K',
  'independent-work-project': 'A',
  'teaching-participation-seminar': 'S',
  'thesis-doctoral': 'Y',
  'licentiate-thesis': 'Y',
  'independent-work-presentation': 'K',
  'training-training': 'K',
  'exam-exam': 'L',
  'teaching-participation-lab': 'A',
  'exam-midterm': 'L',
  'independent-work-learning-diary': 'K',
  'teaching-participation-lectures': 'K',
  'teaching-participation-online': 'K',
};

const tilaByFlowState = {
  PUBLISHED: 'I',
  CANCELLED: 'J',
  NOT_READY: 'O',
};

const getLukuvuosi = (dateLike) => {
  const date = new Date(dateLike);

  if (!isValid(date)) {
    return undefined;
  }

  return getYear(date);
};

const getLukukausi = (dateLike) => {
  const date = new Date(dateLike);

  if (!isValid(date)) {
    return undefined;
  }

  // Month index starts at 0
  const month = getMonth(date) + 1;
  const dayOfMonth = getDate(date);

  if (month < 5) {
    return 'K';
  } else if (month > 8 || (month === 8 && dayOfMonth > 20)) {
    return 'S';
  }

  return 'V';
};

const getKielikoodiByTeachingLanguageUrn = (teachingLanguageUrn) => {
  if (!teachingLanguageUrn) {
    return undefined;
  }

  const parts = teachingLanguageUrn.split(':');
  const language = parts[parts.length - 1];

  return kielikoodiByLanguageCode[language] || 'E';
};

const getTyyppiByCourseUnitRealisationTypeUrn = (
  courseUnitRealisationTypeUrn,
) => {
  if (!courseUnitRealisationTypeUrn) {
    return undefined;
  }

  const parts = courseUnitRealisationTypeUrn.split(':');
  const type = parts[parts.length - 1];

  return tyyppiByCourseUnitRealisationType[type] || 'K';
};

const getTilaByFlowState = (flowState) => {
  if (!flowState) {
    return undefined;
  }

  return tilaByFlowState[flowState] || 'O';
};

const getKurssiByCourseUnitRealisation = (
  courseUnitRealisation,
  courseUnit,
) => {
  const {
    activityPeriod,
    teachingLanguageUrn,
    courseUnitRealisationTypeUrn,
    flowState,
    name,
  } = courseUnitRealisation;

  const { code } = courseUnit;
  const startDate = get(activityPeriod, 'startDate');

  return {
    kurssikoodi: code,
    lukuvuosi: getLukuvuosi(startDate),
    lukukausi: getLukukausi(startDate),
    tyyppi: getTyyppiByCourseUnitRealisationTypeUrn(
      courseUnitRealisationTypeUrn,
    ),
    kurssiNro: 1,
    kielikoodi: getKielikoodiByTeachingLanguageUrn(teachingLanguageUrn),
    opintoviikot: 1,
    nimi: get(name, 'fi'),
    tila: getTilaByFlowState(flowState),
  };
};

export default getKurssiByCourseUnitRealisation;
