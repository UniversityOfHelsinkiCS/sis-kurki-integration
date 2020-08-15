import sisClient from '../sisClient';
import logger from '../logger';
import { KURKI_FALLBACK_KURSSI_OMISTAJA } from '../../config';
import getDistinctCourseUnits from './getDistinctCourseUnits';
import OpintojaksoUpdater from './opintojaksoUpdater';

export class KurkiUpdater {
  constructor({ fallbackKurssiOmistaja }) {
    this.fallbackKurssiOmistaja = fallbackKurssiOmistaja;
  }

  async updateCourseUnitsByCodes(codes) {
    const allCourseUnits = await sisClient.getCourseUnitsByCodes(codes);
    const courseUnits = getDistinctCourseUnits(allCourseUnits);

    return this.updateOpintojaksot(courseUnits);
  }

  async updateCourseUnitsByProgamme(programme) {
    const allCourseUnits = await sisClient.getCourseUnitsByProgramme(programme);

    const courseUnits = getDistinctCourseUnits(allCourseUnits);

    return this.updateOpintojaksot(courseUnits);
  }

  async updateOpintojaksot(courseUnits) {
    const courseUnitCodes = courseUnits.map(({ code }) => code);

    logger.info(`Starting to update ${courseUnits.length} courses`, {
      courseUnitCodes,
    });

    for (let courseUnit of courseUnits) {
      await this.updateOpintojakso(courseUnit).catch((error) => {
        logger.error('Failed to update course unit', {
          courseUnit,
        });

        logger.error(error);
      });
    }

    logger.info(
      `Done updating ${courseUnits.length} courses. Check logs for possible errors`,
      { courseUnitCodes },
    );
  }

  async updateOpintojakso(courseUnit) {
    const updater = new OpintojaksoUpdater({
      courseUnit,
      fallbackKurssiOmistaja: this.fallbackKurssiOmistaja,
    });

    await updater.update();
  }
}

export default new KurkiUpdater({
  fallbackKurssiOmistaja: KURKI_FALLBACK_KURSSI_OMISTAJA,
});
