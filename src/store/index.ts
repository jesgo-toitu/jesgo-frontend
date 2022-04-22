import { createStore, combineReducers } from 'redux';
import formDataReducer from './formDataReducer';
import schemaDataReducer from './schemaDataReducer';

const rootReducer = combineReducers({
  formDataReducer,
  schemaDataReducer,
});
export type RootState = ReturnType<typeof rootReducer>;

const store = createStore(rootReducer);

export default store;
