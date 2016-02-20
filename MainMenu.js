/* @flow */

/**
 * main menu
 */

import React, {
  Component,
  Navigator,
  PropTypes,
  StyleSheet,
} from 'react-native'

import commonStyles from './common-styles'
import AddReservations from './AddReservations'
import Reservations from './Reservations'
import CustomTabBar from './CustomTabBar'
const ScrollableTabView = require('react-native-scrollable-tab-view');

/****************
 *  Main class  *
 ****************/

let styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor:  'rgba(158,212,209,1)',
    width: commonStyles.deviceWidth,
    height: commonStyles.deviceHeight,
  },
})

export default class MainMenu extends Component {
  constructor(props: any) {
    super(props);
  }

  render() {
    return (
      <ScrollableTabView renderTabBar={() => <CustomTabBar/>}>
        <Reservations
          key={'reorder'}
          reservations={this.props.reservations}
          setReservations={this.props.setReservations}
          tabLabel={'Reorder'}
        />
        <AddReservations
          key={'add-circle'}
          tabLabel={'add-circle'}
          setReservations={this.props.setReservations}
        />
      </ScrollableTabView>
    )
  }
}

MainMenu.displayName = 'MainMenu';
MainMenu.propTypes = {
  reservations: PropTypes.array.isRequired,
  setReservations: PropTypes.func.isRequired,
}
