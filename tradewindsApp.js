import React, { Component, Text, View } from 'react-native';
import {bindActionCreators} from 'redux';
import Tradewinds from './Tradewinds';
import * as tradewindsActions from './actions/tradewindsActions';
import { connect } from 'react-redux';

// @connect(state => ({
//   state: state.counter
// }))
class CounterApp extends Component {
  constructor(props) {
    super(props);
  }

  /*
  componentDidMount() {
    this.props.readUserFromStorage();
  }
  */

  render() {
    const { state, actions } = this.props;
    return (
        <Tradewinds
          {...actions}
        />
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
