import { SET_COMPANY, SET_LOGIN } from "./actions/companyAction";

// Quack! This is a duck. https://github.com/erikras/ducks-modular-redux
//const LOAD = "redux-form-examples/account/LOAD";

const initialState = {
    email: "",
    isLogin: false,
  },
  accountReducer = (state = initialState, action) => {
    if (action.type === SET_COMPANY) {
      return Object.assign({}, state, {
        email: action.payload.email,
      });
      /* return {
        ...state,
        email: action.payload.email,
      }; */
    } else if (action.type === SET_LOGIN) {
      return Object.assign({}, state, {
        isLogin: action.payload.isLogin,
      });
    } else return state;
  };

export default accountReducer;
