import React, { Component, Text, View } from 'react-native';
import BusyIndicator from './BusyIndicator';
import Login from './Login';
import MainMenu from './MainMenu';
import _ from 'lodash'

// @connect(state => ({
//   state: state.counter
// }))
export default class Tradewinds extends Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    this.props.readUserFromStorage();
  }

  render() {
    console.log('busy?', this.props.busy);
    if (this.props.busy) {
      return (
        <BusyIndicator/>
      );
    }
    if (_.isNull(this.props.reservations)) {
      return (
        <Login onSubmit={this.props.loginUser}/>
      );
    } else {
        return (
          <MainMenu
            reservations={this.props.reservations}
            setReservations={this.props.setReservations}
          />
        )
    }
  }
}
