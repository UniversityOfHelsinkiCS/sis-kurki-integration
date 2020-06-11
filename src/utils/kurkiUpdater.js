import promiseMap from 'p-map';

import getOpintojaksoByCourseUnit from './getOpintojaksoByCourseUnit';

class KurkiUpdater {
  constructor({ models, sisClient, logger }) {
    this.models = models;
    this.sisClient = sisClient;
    this.logger = logger;
  }

  async updateCourseUnits(options = {}) {
    const { codes } = options;

    const courseUnits = await this.sisClient.getCourseUnits({
      codes,
    });

    const result = await promiseMap(
      courseUnits,
      async (courseUnit) => {
        try {
          await this.updateCourseUnit(courseUnit);

          return {
            payload: courseUnit,
            error: null,
          };
        } catch (error) {
          this.logger.error(error, { courseUnit });

          return { payload: courseUnit, error };
        }
      },
      { concurrency: 1 },
    );

    const successCodes = result
      .filter(({ error }) => !error)
      .map(({ payload }) => payload.code);

    const failureCodes = result
      .filter(({ error }) => error)
      .map(({ payload }) => payload.code);

    this.logger.info(
      `Attempted to update ${result.length} courses. ${successCodes.length} updates succeeded and ${failureCodes.length} updates failed`,
      { successCodes, failureCodes },
    );

    return result;
  }

  async updateCourseUnit(courseUnit) {
    const { code } = courseUnit;

    const opintojakso = getOpintojaksoByCourseUnit(courseUnit);

    await this.models.Opintojakso.query().patchOrInsertById(code, opintojakso);
  }
}

export default KurkiUpdater;
