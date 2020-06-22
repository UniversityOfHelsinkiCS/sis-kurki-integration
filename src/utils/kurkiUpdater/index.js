import getDistinctCourseUnits from './getDistinctCourseUnits';
import OpintojaksoUpdater from './opintojaksoUpdater';

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

    return this.updateOpintojaksot(courseUnits);
  }

  async updateCourseUnitsByProgamme(programme) {
    const allCourseUnits = await this.sisClient.getCourseUnitsByProgramme(
      programme,
    );

    const courseUnits = getDistinctCourseUnits(allCourseUnits);

    return this.updateOpintojaksot(courseUnits);
  }

  async updateOpintojaksot(courseUnits) {
    const courseUnitCodes = courseUnits.map(({ code }) => code);

    this.logger.info(`Starting to update ${courseUnits.length} courses`, {
      courseUnitCodes,
    });

    for (let courseUnit of courseUnits) {
      await this.updateOpintojakso(courseUnit).catch((error) => {
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

  async updateOpintojakso(courseUnit) {
    const updater = new OpintojaksoUpdater({
      courseUnit,
      sisClient: this.sisClient,
      models: this.models,
      logger: this.logger,
      fallbackKurssiOmistaja: this.fallbackKurssiOmistaja,
    });

    await updater.update();
  }
}

export default KurkiUpdater;
