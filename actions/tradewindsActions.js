/* @flow */

import {AsyncStorage} from 'react-native';
import * as types from './actionTypes';
import _ from 'lodash';
const CookieManager = require('react-native-cookies');

type UserData = {
  username: ?string,
  password: ?string,
  error?: string,
}

const urls = {
  newReservations: 'http://www.tradewindssailing.com/wsdl/ReserveDates.php',
};

const userDataKeys = [
    'username','password',
];

/*********************************************************************
 *                        Synchronous actions                        *
 *********************************************************************/

export function setBusy() : any {
  return {
    type: types.SET_BUSY
  };
}

export function clearBusy(): any {
  return {
    type: types.CLEAR_BUSY
  };
}

export function setUser(userData: UserData): any {
  return {
    type: types.SET_USER_DATA,
    userData,
  };
}

export function setReservations(html: ?string): any {
  return {
    type: types.SET_RESERVATIONS,
    reservationResponse: html,
  }
}

export function setWorking(activity: string): any {
  return {
    type: types.SET_WORKING,
    activity,
  }
}


/*********************************************************************
 *                           Async actions                           *
 *********************************************************************/

export function readUserFromStorage() : any {
  return function(dispatch) {
    dispatch(setBusy());

    let savedUserData = {
      username: '',
      password: '',
    };

    Promise.all(_.map(userDataKeys, (key) => {
      let fullKey = '@tradewinds:' + key;
      let promise = AsyncStorage.getItem(fullKey)
      promise.then((value) => {
        savedUserData[key] = value;
      });
      return promise;
    }))
    .then((allResults) => {
      if (_.isNull(savedUserData.username) || _.isNull(savedUserData.password)) {
        console.log('no saved user data')
        dispatch(clearBusy());
      } else {
        dispatch(setUser(savedUserData));
        dispatch(loginUser(savedUserData, false));
      }
    })
    .catch((error) => {
      console.log('Error reading data from storage:')
      console.log(error);
      dispatch(clearBusy());
      // TODO: Return user to login screen
    })
    .done();
  }
};

function getExpiry() {
  let exDate = new Date();
  exDate.setDate(exDate.getDate() + 10);
  return `${exDate.getUTCFullYear()}-${exDate.getUTCMonth()}-${exDate.getUTCDate()}T12:30:00.00-05:00`;
}

export function setCookie(newCookie: any, userData: UserData, rememberMe: bool) : any {
  return function(dispatch) {
    CookieManager.set(newCookie, (err, res) => {
      const params = {
        method: 'POST',
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: `userid=${userData.username}&pwd=${userData.password}&Submit=Submit`,
      };

      return fetch('http://www.tradewindssailing.com/wsdl/Logon-action.php', params)
        .then(logonResponse => {
          if (logonResponse.url === 'http://www.tradewindssailing.com/wsdl/Logon.php') {
            dispatch(setUser({username: null, password: null, cookie: null, error: 'Bad username or password'}));
            dispatch(clearBusy());
          } else {
            if (rememberMe) {
              saveUserData(userData)
            }
            return fetch('http://www.tradewindssailing.com/wsdl/Reservations.php')
              .then(reservationResponse => {
                const html = reservationResponse._bodyText;
                dispatch(setReservations(html))
                dispatch(clearBusy());
              });
          }
        })
        .catch(error => {
          dispatch(setUser({username: null, password: null, cookie: null, error: 'Bad username or password'}));
          dispatch(clearBusy());
        });
    });
  }
}

function saveUserData(userData: UserData): Promise {
  return Promise.all(_.map(userDataKeys, (key) => {
    let fullKey = '@tradewinds:' + key;
    return AsyncStorage.setItem(fullKey, userData[key])
  }))

}

export function loginUser(userData: UserData, rememberMe: bool) : any {
  return function(dispatch) {

    // dispatch(setBusy());
    dispatch(setWorking('login'))
    dispatch(setUser(userData))

    fetch('http://www.tradewindssailing.com/wsdl/Logon.php')
      .then(output => {

        // list cookies
        CookieManager.getAll((cookies, status) => {
          // set cookie

          const newCookie = {
            name: 'PHPSESSID',
            value: cookies.PHPSESSID.value,
            domain: 'www.tradewindssailing.com',
            origin: 'www.tradewindssailing.com',
            path: '/',
            version: '1',
            expiration: '2016-05-30T12:30:00.00-05:00'
          }
          dispatch(setCookie(newCookie, userData, rememberMe))
        });
    });
  }
};

export function logoutUser(): any {
  return function(dispatch) {
    // clear cookies
    CookieManager.clearAll((err, res) => {
      console.log('clearing cookies', err, res);
    });
    Promise.all(_.map(userDataKeys, (key) => {
        let fullKey = '@tradewinds:' + key;
        return AsyncStorage.removeItem(fullKey)
    }))
    .then(output => {
      dispatch(setUser({username: null, password: null, cookie: null}));
      dispatch(setReservations(null));
    })
    .catch(error => {
      dispatch(setUser({username: null, password: null, cookie: null}));
      dispatch(setReservations(null));
      console.log('error encountered:', error)
    })
  }
}
