/* @flow */

import {AsyncStorage} from 'react-native';
import * as types from './actionTypes';
import _ from 'lodash';
const CookieManager = require('react-native-cookies');

const userDataKeys = [
    'username','password', 'cookie',
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

export function setUser(savedUserData: any): any {
  return {
    type: types.SET_USER_DATA,
    savedUserData,
  };
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
          cookie: '',
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
                dispatch(setUser(savedUserData));
                dispatch(clearBusy());
            })
            .catch((error) => {
                console.log('Error reading data from storage:')
                console.log(error);
                dispatch(clearBusy());
            })
            .done();
    }
};

function serializeJson (data) {
  return Object.keys(data).map(function (keyName) {
    return encodeURIComponent(keyName) + '=' + encodeURIComponent(data[keyName])
  }).join('&');
}

function getExpiry() {
  let exDate = new Date();
  exDate.setDate(exDate.getDate() + 10);
  return `${exDate.getUTCFullYear()}-${exDate.getUTCMonth()}-${exDate.getUTCDate()}T12:30:00.00-05:00`;
}

export function loginUser(userData: any) : any {
  return function(dispatch) {

    userData.password = '4zBDkV1Agi';
    userData.username = '8637900';
    const params = {
      method: 'POST',
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: 'userid=8637900&pwd=4zBDkV1Agi&Submit=Submit',
    };

    console.log('user is logging in!!!', userData);

    fetch('http://www.tradewindssailing.com/wsdl/Logon.php', params)
      .then(output => {

        // list cookies
        CookieManager.getAll((cookies, status) => {
          console.log(cookies);
          console.log(status);

          // set cookie

          //const newCookie = Object.assign({version: '1', expiration: getExpiry(), origin: 'tradewindssailing.com'}, cookies.PHPSESSID);
          const newCookie = {
            name: 'PHPSESSID',
            value: cookies.PHPSESSID.value,
            domain: 'www.tradewindssailing.com',
            origin: 'www.tradewindssailing.com',
            path: '/',
            version: '1',
            expiration: '2016-05-30T12:30:00.00-05:00'
          }

          CookieManager.set(newCookie, (err, res) => {
            console.log('cookie set!');
            console.log(err);
            console.log(res);

            return fetch('http://www.tradewindssailing.com/wsdl/Logon-action.php', params)
              .then(logonAction => {
                return fetch('http://www.tradewindssailing.com/wsdl/Reservations.php')
                  .then(reservations => {
                    debugger;
                    console.log(reservations);
                  });
              });
          });
        });
      });

  }
};
