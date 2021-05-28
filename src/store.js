import { createStore, combineReducers } from "redux";
import accountReducer from "./account";

const reducer = combineReducers({
  accountReducer,
});
//const store = (window.devToolsExtension
//  ? window.devToolsExtension()(createStore)
//  : createStore)(reducer);

const store = createStore(reducer);

export default store;
