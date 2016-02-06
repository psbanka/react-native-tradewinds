import React, { Component, Text } from 'react-native';
import {bindActionCreators} from 'redux';
// import Counter from '../components/counter';
import * as tradewindsActions from './actions/tradewindsActions';
import { connect } from 'react-redux';

// @connect(state => ({
//   state: state.counter
// }))
class CounterApp extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { state, actions } = this.props;
    return (
      <Text>Hello world</Text>
    );
  }
}

export default connect(state => ({
    state: state.counter
  }),
  (dispatch) => ({
    actions: bindActionCreators(tradewindsActions, dispatch)
  })
)(CounterApp);
