import promiseMap from 'p-map';

import getOpintojaksoByCourseUnit from './getOpintojaksoByCourseUnit';
import getDistinctCourseUnits from './getDistinctCourseUnits';
import CourseUnitRealisationUpdater from './courseUnitRealisationUpdater';

class KurkiUpdater {
  constructor({ models, sisClient, logger, fallbackKurssiOmistaja }) {
    this.models = models;
    this.sisClient = sisClient;
    this.logger = logger;
    this.fallbackKurssiOmistaja = fallbackKurssiOmistaja;
  }

  async updateCourseUnitsByCodes(codes) {
    const allCourseUnits = await this.sisClient.getCourseUnitsByCodes(codes);
    const courseUnits = getDistinctCourseUnits(allCourseUnits);

    return this.updateCourseUnits(courseUnits);
  }

  async updateCourseUnitsByProgamme(programme) {
    const allCourseUnits = await this.sisClient.getCourseUnitsByProgramme(
      programme,
    );

    const courseUnits = getDistinctCourseUnits(allCourseUnits);

    return this.updateCourseUnits(courseUnits);
  }

  async updateCourseUnits(courseUnits) {
    const courseUnitCodes = courseUnits.map(({ code }) => code);

    this.logger.info(`Starting to update ${courseUnits.length} courses`, {
      courseUnitCodes,
    });

    for (let courseUnit of courseUnits) {
      await this.updateCourseUnit(courseUnit).catch((error) => {
        this.logger.error('Failed to update course unit', {
          courseUnit,
        });

        this.logger.error(error);
      });
    }

    this.logger.info(
      `Done updating ${courseUnits.length} courses. Check logs for possible errors`,
      { courseUnitCodes },
    );
  }

  async updateCourseUnit(courseUnit) {
    const opintojakso = getOpintojaksoByCourseUnit(courseUnit);

    await this.models.Opintojakso.query().patchOrInsertById(
      courseUnit.code,
      opintojakso,
    );

    await this.updateCourseUnitRealisations(courseUnit);
  }

  async updateCourseUnitRealisations(courseUnit) {
    const courseUnitRealisations = await this.sisClient.getCourseUnitRealisationsByCode(
      courseUnit.code,
    );

    await promiseMap(
      courseUnitRealisations,
      (realisation) => {
        return this.updateCourseUnitRealisation(realisation, courseUnit).catch(
          (error) => {
            this.logger.error('Failed to update course unit realisation', {
              courseUnit,
              courseUnitRealisation: realisation,
            });

            this.logger.error(error);
          },
        );
      },
      { concurrency: 5, stopOnError: false },
    );
  }

  async updateCourseUnitRealisation(courseUnitRealisation, courseUnit) {
    const updater = new CourseUnitRealisationUpdater({
      courseUnitRealisation,
      courseUnit,
      models: this.models,
      sisClient: this.sisClient,
      logger: this.logger,
      fallbackKurssiOmistaja: this.fallbackKurssiOmistaja,
    });

    await updater.update();
  }
}

export default KurkiUpdater;
