import {
  ref, push, child, update, remove,
} from 'firebase/database';
import firebase from '../firebase';

const db = ref(firebase, 'tutorials');

class TutorialDataService {
  getAll = () => db;

  create = (tutorial) => push(db, tutorial);

  update = (key, value) => update(child(db, key), value);

  delete = (key) => remove(child(db, key));

  deleteAll = () => remove(db);
}

export default new TutorialDataService();
