/* @flow */

import {AsyncStorage} from 'react-native';
import * as types from './actionTypes';
import _ from 'lodash';

const userDataKeys = [
    'username','password', 'cookie',
];

/*********************************************************************
 *                        Synchronous actions                        *
 *********************************************************************/

export function setBusy() {
  return {
    type: types.SET_BUSY
  };
}

export function clearBusy() {
  return {
    type: types.CLEAR_BUSY
  };
}

export function setUser(savedUserData) {
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
            })
            .catch((error) => {
                console.log('Error reading data from storage:')
                console.log(error);
                dispatch(clearBusy());
            })
            .done();
    }
};

