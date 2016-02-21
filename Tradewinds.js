import React, { Component, Text, View } from 'react-native';
import BusyIndicator from './BusyIndicator';
import Login from './Login';
import MainMenu from './MainMenu';
import _ from 'lodash'


export default class Tradewinds extends Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    this.props.readUserFromStorage();
  }

  render() {
    if (this.props.busy) {
      return (
        <BusyIndicator/>
      );
    }
    if (_.isNull(this.props.username)) {
      return (
        <Login onSubmit={this.props.loginUser}/>
      );
    } else {
        return (
          <MainMenu
            username={this.props.username}
            reservations={this.props.reservations}
            setReservations={this.props.setReservations}
            logoutUser={this.props.logoutUser}
          />
        )
    }
  }
}
