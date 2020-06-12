import BaseModel from './baseModel';

class Henkilo extends BaseModel {
  static get idColumn() {
    return 'htunnus';
  }

  static get tableName() {
    return 'henkilo';
  }
}

export default Henkilo;
