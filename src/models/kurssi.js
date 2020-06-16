import { format } from 'date-fns';
import { transaction } from 'objection';

import BaseModel, { QueryBuilder } from './baseModel';

class EnhancedQueryBuilder extends QueryBuilder {
  patchOrInsertWithKurssiNro(data) {
    return transaction(this.modelClass(), async (Model) => {
      const { sisId } = data;

      if (!sisId) {
        throw new Error(`sisId is required`);
      }

      const sisKurssi = await Model.query().findOne({
        sisId,
      });

      if (sisKurssi) {
        await sisKurssi.$query().patch(data);
        return true;
      }

      const simultaneousKurssit = await Model.query().where({
        kurssikoodi: data.kurssikoodi,
        lukukausi: data.lukukausi,
        lukuvuosi: data.lukuvuosi,
        tyyppi: data.tyyppi,
      });

      const kurssiWithSameAlkamisPvm = simultaneousKurssit.find(
        ({ alkamisPvm }) => {
          const normalizedAlkamisPvm = alkamisPvm
            ? alkamisPvm instanceof Date
              ? alkamisPvm
              : new Date(alkamisPvm)
            : null;

          if (!normalizedAlkamisPvm) {
            return false;
          }

          return (
            format(normalizedAlkamisPvm, 'yyyy-MM-dd') ===
            format(data.alkamisPvm, 'yyyy-MM-dd')
          );
        },
      );

      if (kurssiWithSameAlkamisPvm) {
        await Model.query()
          .findById([
            kurssiWithSameAlkamisPvm.kurssikoodi,
            kurssiWithSameAlkamisPvm.lukukausi,
            kurssiWithSameAlkamisPvm.lukuvuosi,
            kurssiWithSameAlkamisPvm.tyyppi,
            kurssiWithSameAlkamisPvm.kurssiNro,
          ])
          .patch(data);

        return true;
      }

      const kurssiNro =
        simultaneousKurssit.length === 0
          ? 1
          : Math.max(...simultaneousKurssit.map(({ kurssiNro }) => kurssiNro)) +
            1;

      await Model.query().insert({ ...data, kurssiNro });

      return false;
    });
  }
}

class Kurssi extends BaseModel {
  static get QueryBuilder() {
    return EnhancedQueryBuilder;
  }

  static get idColumn() {
    return ['kurssikoodi', 'lukukausi', 'lukuvuosi', 'tyyppi', 'kurssiNro'];
  }

  static get tableName() {
    return 'kurssi';
  }
}

export default Kurssi;
