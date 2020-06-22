import promiseMap from 'p-map';

import KurssiUpdater from './kurssiUpdater';
import getOpintojaksoByCourseUnit from './kurssiUpdatergetOpintojaksoByCourseUnit';

class OpintojaksoUpdater {
  constructor({
    courseUnit,
    sisClient,
    models,
    logger,
    fallbackKurssiOmistaja,
  }) {
    this.courseUnit = courseUnit;
    this.sisClient = sisClient;
    this.models = models;
    this.logger = logger;
    this.fallbackKurssiOmistaja = fallbackKurssiOmistaja;
  }

  async update() {
    const opintojakso = getOpintojaksoByCourseUnit(this.courseUnit);
    const { kurssikoodi } = opintojakso;

    await this.models.Opintojakso.query().patchOrInsertById(
      kurssikoodi,
      opintojakso,
    );

    this.opintojakso = await this.models.Opintojakso.query().findById(
      kurssikoodi,
    );

    await this.updateKurssit();
  }

  async updateKurssit() {
    const { kurssikoodi } = this.opintojakso;

    const courseUnitRealisations = await this.sisClient.getCourseUnitRealisationsByCode(
      kurssikoodi,
    );

    await promiseMap(
      courseUnitRealisations,
      (realisation) => {
        return this.updateKurssi(realisation).catch((error) => {
          this.logger.error('Failed to update course unit realisation', {
            courseUnit: this.courseUnit,
            courseUnitRealisation: realisation,
          });

          this.logger.error(error);
        });
      },
      { concurrency: 5, stopOnError: false },
    );
  }

  async updateKurssi(courseUnitRealisation) {
    const updater = new KurssiUpdater({
      opintojakso: this.opintojakso,
      courseUnitRealisation,
      sisClient: this.sisClient,
      models: this.models,
      logger: this.logger,
      fallbackKurssiOmistaja: this.fallbackKurssiOmistaja,
    });

    await updater.update();
  }
}

export default OpintojaksoUpdater;
