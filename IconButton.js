/* @flow */

import React from 'react-native';
let {
  ActivityIndicatorIOS,
  Component,
  TouchableOpacity,
  PropTypes,
  StyleSheet,
  Text,
  View,
} = React;

import EvilIcon from 'react-native-vector-icons/EvilIcons';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';

let styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: 'transparent',
  },
  inactive: {
    backgroundColor: 'lightgray',
  },
  active: {
    backgroundColor: 'green',
  },

  materialIcon: {
    width: 60,
    height: 95,
    marginTop: -20,
    marginLeft: -5,
    backgroundColor: 'rgba(0,0,0,0)',
  },
  evilIcon: {
    width: 60,
    height: 60,
    paddingBottom: 26,
    marginTop: -13,
    marginLeft: -8,
    backgroundColor: 'rgba(0,0,0,0)',
  },
  bigBusySpinner: {
    marginTop: -3,
    marginLeft: 1,
  },
  littleBusySpinner: {
    marginTop: -14,
    marginLeft: -4,
  },
  customIcon: {
    width: 90,
    height: 90,
  },
});

class IconButton extends Component {

  constructor(props:any) {
    super(props);
    this.state = {
      error: false,
    };
  }

  render() {
    let extra = styles.inactive
    if (this.props.active || ! this.props.working) {
      extra = {backgroundColor: this.props.color}
    }
    const iconColor = this.props.iconColor || 'white';
    const iconSize = this.props.iconSize || 65
    let icon;
    if (this.props.iconFamily === 'material') {
      icon = (
        <MaterialIcon
          name={this.props.iconName}
          size={iconSize}
          color={iconColor}
          style={styles.materialIcon}
        />
      );
    } else if (this.props.iconFamily === 'evil') {
      icon = (
        <EvilIcon
          name={this.props.iconName}
          size={iconSize}
          color={iconColor}
          style={styles.evilIcon}
        />
      );
    }
    if (this.props.working) {
      icon = (
        <ActivityIndicatorIOS
          animating={true}
          style={iconSize > 50 ? styles.bigBusySpinner : styles.littleBusySpinner}
          size={iconSize > 50 ? 'large' : 'small'}
          color={iconColor}
        />
      )
    }
    let buttonStyle = this.props.buttonStyle || {};
    return (
      <View style={styles.container}>
        <TouchableOpacity
          onPress={this.props.onPress}
          style={[buttonStyle, extra]}
        >
        {icon}
        </TouchableOpacity>
      </View>
    );
  }
}

IconButton.displayName = 'IconButton';

IconButton.propTypes = {
  active: PropTypes.bool,
  working: PropTypes.bool,
  buttonStyle: PropTypes.number, // Stylesheet
  color: PropTypes.string.isRequired,
  iconColor: PropTypes.string,
  iconFamily: PropTypes.string,
  iconName: PropTypes.string.isRequired,
  iconSize: PropTypes.number,
  onPress: PropTypes.func,
};

export default IconButton;
