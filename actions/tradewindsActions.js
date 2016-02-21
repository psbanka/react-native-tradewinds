/* @flow */

import {AsyncStorage} from 'react-native';
import * as types from './actionTypes';
import _ from 'lodash';
const CookieManager = require('react-native-cookies');

type UserData = {
  username: string,
  password: string,
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

export function setReservations(html: string): any {
  return {
    type: types.SET_RESERVATIONS,
    reservationResponse: html,
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
        console.log('logging in user', savedUserData)
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

export function setCookie(newCookie: any) : any {
  return function(dispatch) {
    CookieManager.set(newCookie, (err, res) => {
      const params = {
        method: 'POST',
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: 'userid=8637900&pwd=4zBDkV1Agi&Submit=Submit',
      };

      return fetch('http://www.tradewindssailing.com/wsdl/Logon-action.php', params)
        .then(logonAction => {
          return fetch('http://www.tradewindssailing.com/wsdl/Reservations.php')
            .then(reservationResponse => {
              const html = reservationResponse._bodyText;
              dispatch(setReservations(html))
              dispatch(clearBusy());
            });
        })
        .catch(error => {
          console.log('error encountered setting cookie: ', error);
          // TODO: Return user to login screen
        });
    });
  }
}

function saveUserData(userData: UserData): Promise {
  debugger
  return Promise.all(_.map(userDataKeys, (key) => {
    let fullKey = '@tradewinds:' + key;
    console.log('setting', fullKey, userData[key])
    return AsyncStorage.setItem(fullKey, userData[key])
  }))

}

export function loginUser(userData: UserData, rememberMe: bool) : any {
  return function(dispatch) {

    // userData.password = '4zBDkV1Agi';
    // userData.username = '8637900';

    if (rememberMe) {
      saveUserData(userData)
    }
    dispatch(setBusy());
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
          dispatch(setCookie(newCookie))
        });
    });
  }
};

export function logoutUser(): any {
  return function(dispatch) {
    // clear cookies
    CookieManager.clearAll((err, res) => {
      console.log('cookies cleared!');
      console.log(err);
      console.log(res);
    });
    Promise.all(_.map(userDataKeys, (key) => {
        let fullKey = '@tradewinds:' + key;
        return AsyncStorage.removeItem(fullKey)
    }))
    .then(output => {
      console.log('clearing user data')
      dispatch(setUser({username: null, password: null, cookie: null}));
    })
    .catch(error => {
      console.log('error encountered:', error)
    })
  }
}
