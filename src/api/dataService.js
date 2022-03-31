import {
  ref, set, child, update, remove, onValue,
} from 'firebase/database';
import firebase from '../firebase';

class DataService {
  constructor(dbRef) {
    this.db = ref(firebase.database, dbRef);
    this.dbRef = dbRef;
  }

  getDbString = () => this.dbRef;

  getAll = () => this.db;

  listenOn = (callback) => {
    onValue(this.db, (snapshot) => {
      callback(snapshot.val());
    });
  };

  create = (record, dbRef) => set(((dbRef !== undefined) ? ref(firebase.database, dbRef) : this.db), record);

  update = (key, record) => update(child(this.db, key), record);

  delete = (key) => remove(child(this.db, key));

  deleteAll = () => remove(this.db);
}

export default DataService;
