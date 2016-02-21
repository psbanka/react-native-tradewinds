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
import Settings from './Settings'
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

  changeView(id: number) {
    const tabView = this.refs['tabview']
    if (tabView) {
      tabView.goToPage(id)
    }
  }

  render() {
    return (
      <ScrollableTabView ref='tabview' renderTabBar={() => <CustomTabBar/>}>
        <Reservations
          key={'reorder'}
          working={this.props.working}
          reservations={this.props.reservations}
          setReservations={this.props.setReservations}
          tabLabel={'Reorder'}
          setWorking={this.props.setWorking}
          clearBusy={this.props.clearBusy}
        />
        <AddReservations
          key={'add-circle'}
          working={this.props.working}
          tabLabel={'add-circle'}
          setReservations={this.props.setReservations}
          changeView={this.changeView.bind(this)}
          setWorking={this.props.setWorking}
          clearBusy={this.props.clearBusy}
        />
        <Settings
          key={'account-circle'}
          tabLabel={'account-circle'}
          logoutUser={this.props.logoutUser}
          username={this.props.username}
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
