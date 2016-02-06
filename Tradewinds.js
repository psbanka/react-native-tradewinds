import React, { Component, Text } from 'react-native';

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
    // const { state, actions } = this.props;
    return (
      <Text>Hello world</Text>
    );
  }
}
