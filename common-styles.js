/* @flow */

'use strict';

const deviceHeight = require('Dimensions').get('window').height;
const deviceWidth = require('Dimensions').get('window').width;
let deviceType = 'unknown';
let scalingFactor = 1;

switch (deviceHeight) {
    case 568:
        deviceType = 'iphone5';
        scalingFactor = 0.8;
        break;
    case 667:
        deviceType = 'iphone6';
        scalingFactor = 1;
        break;
    default:
        console.log('unknown device height:', deviceHeight);
        deviceType = 'unknown';
        scalingFactor = 0.7;
}

const ns = {
    deviceHeight,
    deviceType,
    deviceWidth,
    scalingFactor,
    submitButton: {
        height: 50 * scalingFactor,
        marginTop: 20 * scalingFactor,
        marginLeft: 10,
        marginRight: 10,
        padding: 10 * scalingFactor,
    },
    submitButtonCondensed: {
        height: 40 * scalingFactor,
        marginTop: 5,
        marginLeft: 10,
        marginRight: 10,
        paddingLeft: 10,
        paddingRight: 10,
        paddingTop: 0,
        paddingBottom: 0,
    },
};

module.exports = ns;
