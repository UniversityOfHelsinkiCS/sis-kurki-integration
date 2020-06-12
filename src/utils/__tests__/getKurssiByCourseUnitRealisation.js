import courseUnit from '../../testData/sis/courseUnit';
import courseUnitRealisation from '../../testData/sis/courseUnitRealisation';
import getKurssiByCourseUnitRealisation from '../getKurssiByCourseUnitRealisation';

describe('getKurssiByCourseUnitRealisation', () => {
  it('returns correct kurssi given course unit realisation', () => {
    expect(
      getKurssiByCourseUnitRealisation(courseUnitRealisation, courseUnit),
    ).toMatchSnapshot();
  });
});
