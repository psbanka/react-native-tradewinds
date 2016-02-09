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

  render() {
    return (
        <Tradewinds
          busy={this.props.busy}
          {...this.props.actions}
        />
    );
  }
}

const mapStateToProps = (state) => {
  return state.default;
};

const mapDispatchToProps = (dispatch) => {
  return {
    actions: bindActionCreators(tradewindsActions, dispatch)
  }
};

export default connect(mapStateToProps, mapDispatchToProps)(CounterApp);

/*
export default connect(state => ({
    state
  }),
  (dispatch) => ({
    actions: bindActionCreators(tradewindsActions, dispatch)
  })
)(CounterApp);
*/
