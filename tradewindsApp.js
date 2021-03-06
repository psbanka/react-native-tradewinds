import React, { Component, Text, View } from 'react-native';
import {bindActionCreators} from 'redux';
import Tradewinds from './Tradewinds';
import * as tradewindsActions from './actions/tradewindsActions';
import { connect } from 'react-redux';

class TradewindsApp extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
        <Tradewinds
          busy={this.props.busy}
          userData={this.props.userData}
          reservations={this.props.reservations}
          working={this.props.working}
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

export default connect(mapStateToProps, mapDispatchToProps)(TradewindsApp);
