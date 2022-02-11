import {
  ref, push, child, update, remove,
} from 'firebase/database';
import firebase from '../firebase';

class DataService {
  constructor(dbRef) {
    this.db = ref(firebase.database, dbRef);
  }

  getAll = () => this.db;

  create = (record) => push(this.db, record);

  update = (key, record) => update(child(this.db, key), record);

  delete = (key) => remove(child(this.db, key));

  deleteAll = () => remove(this.db);
}

export default DataService;
