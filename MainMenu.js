/* @flow */

/**
 * main menu
 */

import React, {
  Component,
  Navigator,
  StyleSheet,
} from 'react-native'

import commonStyles from './common-styles'
import AddReservations from './AddReservations'
import Reservations from './Reservations'
import CustomTabBar from './CustomTabBar'
var ScrollableTabView = require('react-native-scrollable-tab-view');

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
        <AddReservations
          tabLabel={'add-circle'}
          key={'add-circle'}
        />
        <Reservations
          reservations={this.props.reservations}
          tabLabel={'Reorder'}
          key={'reorder'}
        />
      </ScrollableTabView>
    )
  }
}

MainMenu.displayName = 'MainMenu';
MainMenu.propTypes = {
    reservations: React.PropTypes.array.isRequired,
}
