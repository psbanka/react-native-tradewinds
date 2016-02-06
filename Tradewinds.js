import React, { Component, Text } from 'react-native';
import BusyIndicator from './busy-indicator';

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
    return (
      <Text>Hello world</Text>
    );
  }
}
