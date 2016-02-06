/* @flow */

import React from 'react-native';

let {
    Component, StyleSheet, View, ActivityIndicatorIOS,
} = React;

import commonStyles from './common-styles';

var styles = StyleSheet.create({
    container: {
        flex: 1,
        width: commonStyles.deviceWidth,
        height: commonStyles.deviceHeight,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F5FCFF',
    },
    centering: {
        width: 200,
        height: 200,
        alignItems: 'center',
        alignSelf: 'center',
        justifyContent: 'center',
    },
});

/**
 * Just a screen which shows busy...
 */
class BusyIndicator extends Component {
    constructor(props:any) {
        super(props);
    }

    render() {
        return (
            <View style={styles.container}>
                <ActivityIndicatorIOS
                    animating={true}
                    size="large"
                    style={[styles.centering, {height: 80}]}
                />
            </View>
        );
    }
}

BusyIndicator.propTypes = {};
BusyIndicator.displayName = 'BusyIndicator';

export default BusyIndicator;
