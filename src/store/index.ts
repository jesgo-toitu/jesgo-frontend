import { createStore, combineReducers } from "redux";
import {formDataReducer} from "./formDataReducer"

export type RootState = ReturnType<typeof rootReducer>

const rootReducer = combineReducers({
  formDataReducer,
});

const store = createStore(rootReducer);

export default store;