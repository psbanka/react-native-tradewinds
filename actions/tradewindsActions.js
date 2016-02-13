/* @flow */

import {AsyncStorage} from 'react-native';
import * as types from './actionTypes';
import _ from 'lodash';
const CookieManager = require('react-native-cookies');

const urls = {
  newReservations: 'http://www.tradewindssailing.com/wsdl/ReserveDates.php',
};

const userDataKeys = [
    'username','password', 'cookie',
];

type Reservation = {
  category: string,
  id: string,
  name: string,
  startTime: string,
  endTime: string,
}

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

export function setReservations(reservations: Array<Reservation>): any {
  return {
    type: types.SET_RESERVATIONS,
    reservations,
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
                dispatch(loginUser(savedUserData));
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

function getExpiry() {
  let exDate = new Date();
  exDate.setDate(exDate.getDate() + 10);
  return `${exDate.getUTCFullYear()}-${exDate.getUTCMonth()}-${exDate.getUTCDate()}T12:30:00.00-05:00`;
}

function parseReservations(html) {
  let start = false
  let lines = _.filter(html.split('\n').map(line => {
    if (start) return line
    if (/\<h6 class=wsdlcenter\>(.*)/m.exec(line)) start = true
  }))

  let reservationSection = _.filter(lines, line => {
    return line && line.startsWith('\t<td>')
  })

  let output = reservationSection.map(reservation => {
    let data = reservation.split('</td><td>')
    let category = data[0].replace('\t<td>', '');
    let id = data[1]
    let name = data[2];
    let startTime = data[5].replace('<br/>', ' ').replace('<br/>', ' ')
    let endTime = data[6].replace('<br/>', ' ').replace('<br/>', ' ')
    return {category, id, name, startTime, endTime};
  })
  return output;
}

export function setCookie(newCookie: any) : any {
  return function(dispatch) {
    console.log('Setting cookies...');
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
              console.log('parsing reservations...');
              const html = reservationResponse._bodyText;
              const reservations = parseReservations(html)
              console.log('reservations: ', reservations)
              dispatch(setReservations(reservations))
            });
        })
        .catch(error => {
          console.log('error encountered: ', error);
        });
    });
  }
}

export function loginUser(userData: any) : any {
  return function(dispatch) {

    userData.password = '4zBDkV1Agi';
    userData.username = '8637900';

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
