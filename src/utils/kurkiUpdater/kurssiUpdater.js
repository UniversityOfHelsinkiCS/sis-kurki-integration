import { isNumber } from 'lodash';

import models from '../../models';
import logger from '../logger';
import sisClient from '../sisClient';
import getKurssiByCourseUnitRealisation from './getKurssiByCourseUnitRealisation';
import getKurssiOmistajaByResponsibilityInfos from './getKurssiOmistajaByResponsibilityInfos';
import getOpetuksetByStudyGroupSets from './getOpetuksetByStudyGroupSets';
import getLecturersByResponsibilityInfos from './getLecturersByResponsibilityInfos';

class KurssiUpdater {
  constructor({ courseUnitRealisation, opintojakso, fallbackKurssiOmistaja }) {
    this.courseUnitRealisation = courseUnitRealisation;
    this.opintojakso = opintojakso;
    this.fallbackKurssiOmistaja = fallbackKurssiOmistaja;
  }

  async update() {
    const responsibilityInfos = await sisClient.getCourseUnitRealisationResponsibilityInfos(
      this.courseUnitRealisation.id,
    );

    const owner = getKurssiOmistajaByResponsibilityInfos(responsibilityInfos);

    const ownerHenkilo = owner
      ? await models.Henkilo.query().patchOrInsertAndFetchByPerson(owner)
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

    await models.Kurssi.query().patchOrInsertWithKurssiNro(kurssi);

    this.kurssi = await models.Kurssi.query().findBySisId(
      this.courseUnitRealisation.id,
    );

    await this.updateOpetukset();

    if (!this.kurssi.isExam()) {
      await this.updateLecturers(responsibilityInfos);
    }
  }

  async updateLecturers(responsibilityInfos) {
    const persons = getLecturersByResponsibilityInfos(responsibilityInfos);

    await Promise.all(
      persons.map((person) => {
        this.updateOpetustehtavanHoitoForPerson(person, 0, 'LU');
      }),
    );
  }

  async updateOpetustehtavanHoitoForPerson(person, ryhmaNro, opetustehtava) {
    const henkilo = person
      ? await models.Henkilo.query().patchOrInsertAndFetchByPerson(person)
      : undefined;

    const {
      kurssikoodi,
      lukukausi,
      lukuvuosi,
      tyyppi,
      kurssiNro,
    } = this.kurssi;

    if (henkilo) {
      const { htunnus } = henkilo;

      const opetustehtavanHoitoId = [
        kurssikoodi,
        lukukausi,
        lukuvuosi,
        tyyppi,
        kurssiNro,
        ryhmaNro,
        htunnus,
        opetustehtava,
      ];

      const opetustehtavanHoito = {
        kurssikoodi,
        lukukausi,
        lukuvuosi,
        tyyppi,
        kurssiNro,
        ryhmaNro,
        htunnus,
        opetustehtava,
      };

      await models.OpetustehtavanHoito.query().patchOrInsertById(
        opetustehtavanHoitoId,
        opetustehtavanHoito,
      );
    }
  }

  async getOpetukset() {
    const {
      kurssikoodi,
      lukukausi,
      lukuvuosi,
      tyyppi,
      kurssiNro,
      sisId,
    } = this.kurssi;

    let opetukset = [];

    if (this.kurssi.isExam()) {
      opetukset = [{ ryhmaNro: 1, ilmoJnro: 1, sisId }];
    } else {
      const groupSets = await sisClient.getCourseUnitRealisationStudyGroupSets(
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
    const opetukset = await this.getOpetukset();

    for (let opetus of opetukset) {
      const { teacher, ...restOpetus } = opetus;

      await this.updateOpetus(restOpetus, teacher).catch((error) => {
        logger.error('Failed to update study group', {
          studyGroup: opetus,
        });

        logger.error(error);
      });
    }
  }

  async updateOpetus(opetus, teacher) {
    const {
      kurssikoodi,
      lukukausi,
      lukuvuosi,
      tyyppi,
      kurssiNro,
      ryhmaNro,
    } = opetus;

    const opetusId = [
      kurssikoodi,
      lukukausi,
      lukuvuosi,
      tyyppi,
      kurssiNro,
      ryhmaNro,
    ];

    await models.Opetus.query().patchOrInsertById(opetusId, opetus);

    await this.updateOpetustehtavanHoitoForPerson(teacher, ryhmaNro, 'HT');
  }
}

export default KurssiUpdater;
