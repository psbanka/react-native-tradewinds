/* @flow */

/**
 * main menu
 */

import React, {
  Component,
  PropTypes,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import commonStyles from './common-styles'
import IconButton from './IconButton'
const versionData = require('./package.json')

/****************
 *  Main class  *
 ****************/

let styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor:  'rgba(158,212,209,1)',
    width: commonStyles.deviceWidth,
    height: commonStyles.deviceHeight,
    alignItems: 'center',
  },
  data: {
    lineHeight: 40,
    fontSize: 24,
  },
  logoutButton: {
    width: 120,
    height: 50,
    backgroundColor: '#872b2b',
  },
  logoutButtonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 24,
    marginTop: 50,
    marginBottom: 50,
  },
})

export default class Settings extends Component {
  constructor(props: any) {
    super(props);
  }

  render() {
    return (
      <View style={styles.container}>
        <Text style={styles.data}>Logged in as {this.props.username}</Text>
        <Text style={styles.data}>Running version {versionData.version}</Text>
        <TouchableOpacity onPress={this.props.logoutUser} style={styles.logoutButton}>
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </View>
    )
  }
}

Settings.displayName = 'Settings';
Settings.propTypes = {
  username: PropTypes.string.isRequired,
}

