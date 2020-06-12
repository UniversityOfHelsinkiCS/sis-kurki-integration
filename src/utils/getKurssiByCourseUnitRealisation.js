import get from 'lodash/get';
import { getYear, isValid, getMonth, getDate } from 'date-fns';

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

  const mapping = {
    fi: 'S',
    en: 'E',
    se: 'R',
  };

  return mapping[language];
};

const getKurssiByCourseUnitRealisation = (
  courseUnitRealisation,
  courseUnit,
) => {
  const { activityPeriod, teachingLanguageUrn } = courseUnitRealisation;
  const { code } = courseUnit;
  const startDate = get(activityPeriod, 'startDate');

  return {
    kurssikoodi: code,
    lukuvuosi: getLukuvuosi(startDate),
    lukukausi: getLukukausi(startDate),
    tyyppi: 'L',
    kurssiNro: 1,
    kielikoodi: getKielikoodiByTeachingLanguageUrn(teachingLanguageUrn),
    opintoviikot: 1,
    nimi: get(courseUnit, 'name.fi'),
  };
};

export default getKurssiByCourseUnitRealisation;
