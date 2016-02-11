import * as types from '../actions/actionTypes';

const initialState = {
  busy: true,
  userData: {
    username: null,
    password: null,
    cookie: null,
  },
  reservations: [],
  // reservations: null,
};

export default function counter(state = initialState, action = {}) {
  switch (action.type) {
    case types.SET_BUSY:
      return {
        ...state,
        busy: true
      };
    case types.CLEAR_BUSY:
      return {
        ...state,
        busy: false
      };
    case types.SET_USER_DATA:
      return {
        ...state,
        userData: action.userData
      };
    case types.SET_RESERVATIONS:
      return {
        ...state,
        reservations: action.reservations,
      };
    default:
      return state;
  }
}
