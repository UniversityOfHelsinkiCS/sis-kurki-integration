import { isNumber } from 'lodash';

import getKurssiByCourseUnitRealisation from './getKurssiByCourseUnitRealisation';
import getKurssiOmistajaByResponsibilityInfos from './getKurssiOmistajaByResponsibilityInfos';
import getOpetuksetByStudyGroupSets from './getOpetuksetByStudyGroupSets';

class KurssiUpdater {
  constructor({
    courseUnitRealisation,
    opintojakso,
    models,
    sisClient,
    logger,
    fallbackKurssiOmistaja,
  }) {
    this.courseUnitRealisation = courseUnitRealisation;
    this.opintojakso = opintojakso;
    this.models = models;
    this.sisClient = sisClient;
    this.logger = logger;
    this.fallbackKurssiOmistaja = fallbackKurssiOmistaja;
  }

  async update() {
    const responsibilityInfos = await this.sisClient.getCourseUnitRealisationResponsibilityInfos(
      this.courseUnitRealisation.id,
    );

    const owner = getKurssiOmistajaByResponsibilityInfos(responsibilityInfos);

    const ownerHenkilo = owner
      ? await this.models.Henkilo.query().findOneByPerson(owner)
      : undefined;

    const baseKurssi = getKurssiByCourseUnitRealisation(
      this.courseUnitRealisation,
    );

    const kurssi = {
      ...baseKurssi,
      kurssikoodi: this.opintojakso.kurssikoodi,
      omistaja: ownerHenkilo
        ? ownerHenkilo.htunnus
        : this.fallbackKurssiOmistaja,
    };

    await this.models.Kurssi.query().patchOrInsertWithKurssiNro(kurssi);

    this.kurssi = await this.models.Kurssi.query().findOne({
      sisId: this.courseUnitRealisation.id,
    });

    await this.updateOpetukset();
  }

  async getOpetukset() {
    const {
      kurssikoodi,
      lukukausi,
      lukuvuosi,
      tyyppi,
      kurssiNro,
    } = this.kurssi;

    let opetukset = [];

    if (this.kurssi.isExam()) {
      opetukset = [
        { ryhmaNro: 1, ilmoJnro: 1, sisId: this.courseUnitRealisation.id },
      ];
    } else {
      const groupSets = await this.sisClient.getCourseUnitRealisationStudyGroupSets(
        this.courseUnitRealisation.id,
      );

      opetukset = getOpetuksetByStudyGroupSets(groupSets, this.kurssi);
    }

    return opetukset.map((opetus) => ({
      ...opetus,
      kurssikoodi,
      lukukausi,
      lukuvuosi,
      tyyppi,
      kurssiNro,
      ilmo: 'K',
      opetustehtava: isNumber(opetus.ilmoJnro) ? 'LH' : 'LU',
    }));
  }

  async updateOpetukset() {
    const opetukset = this.getOpetukset();

    for (let opetus of opetukset) {
      const { teacher, ...restOpetus } = opetus;

      await this.updateOpetus(restOpetus, teacher).catch((error) => {
        this.logger.error('Failed to update study group', {
          studyGroup: opetus,
        });

        this.logger.error(error);
      });
    }
  }

  async updateOpetus(opetus) {
    await this.models.Opetus.query().patchOrInsertById(
      [
        opetus.kurssikoodi,
        opetus.lukukausi,
        opetus.lukuvuosi,
        opetus.tyyppi,
        opetus.kurssiNro,
        opetus.ryhmaNro,
      ],
      opetus,
    );
  }
}

export default KurssiUpdater;
