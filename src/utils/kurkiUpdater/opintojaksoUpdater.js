import models from '../../models';
import logger from '../logger';
import sisClient from '../sisClient';
import KurssiUpdater from './kurssiUpdater';
import getOpintojaksoByCourseUnit from './getOpintojaksoByCourseUnit';

class OpintojaksoUpdater {
  constructor({ courseUnit, fallbackKurssiOmistaja }) {
    this.courseUnit = courseUnit;
    this.fallbackKurssiOmistaja = fallbackKurssiOmistaja;
  }

  async update() {
    const opintojakso = getOpintojaksoByCourseUnit(this.courseUnit);
    const { kurssikoodi } = opintojakso;

    await models.Opintojakso.query().patchOrInsertById(
      kurssikoodi,
      opintojakso,
    );

    this.opintojakso = await models.Opintojakso.query().findById(kurssikoodi);

    await this.updateKurssit();
  }

  async updateKurssit() {
    const { kurssikoodi } = this.opintojakso;

    const courseUnitRealisations = await sisClient.getCourseUnitRealisationsByCode(
      kurssikoodi,
    );

    for (let realisation of courseUnitRealisations) {
      try {
        await this.updateKurssi(realisation);
      } catch (error) {
        logger.error('Failed to update course unit realisation', {
          courseUnit: this.courseUnit,
          courseUnitRealisation: realisation,
        });

        logger.error(error);
      }
    }
  }

  async updateKurssi(courseUnitRealisation) {
    const updater = new KurssiUpdater({
      opintojakso: this.opintojakso,
      courseUnitRealisation,
      fallbackKurssiOmistaja: this.fallbackKurssiOmistaja,
    });

    await updater.update();
  }
}

export default OpintojaksoUpdater;
