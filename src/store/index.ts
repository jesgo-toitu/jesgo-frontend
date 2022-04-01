import { createStore, combineReducers } from 'redux';
import formDataReducer from './formDataReducer';

const rootReducer = combineReducers({
  formDataReducer,
});
export type RootState = ReturnType<typeof rootReducer>;

const store = createStore(rootReducer);

export default store;
