import BaseModel from './baseModel';

class Kurssi extends BaseModel {
  static get idColumn() {
    return ['kurssikoodi', 'lukukausi', 'lukuvuosi', 'tyyppi', 'kurssi_nro'];
  }

  static get tableName() {
    return 'kurssi';
  }
}

export default Kurssi;
