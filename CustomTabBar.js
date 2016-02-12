/* @flow */

import React from 'react-native';
const {
  Component,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Dimensions,
  Animated,
} = React;
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';

const deviceWidth = Dimensions.get('window').width;

const styles = StyleSheet.create({
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 5,
    paddingBottom: 20,
  },
  tabs: {
    height: 55,
    flexDirection: 'row',
    paddingTop: 5,
    borderWidth: 1,
    borderTopWidth: 0,
    borderLeftWidth: 0,
    borderRightWidth: 0,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  materialIcon: {
    width: 50,
    height: 55,
    marginTop: 50,
    marginLeft: -5,
    backgroundColor: 'rgba(0,0,0,0)',
  },
});

export default class CustomTabBar extends Component {

  constructor(props: any) {
    super(props);
    this.selectedTabIcons = [];
    this.unselectedTabIcons = [];
    this._listener = null;
  }

  renderTabOption(name: string, page: string) {
    const isTabActive = this.props.activeTab === page;
    const color = isTabActive ? 'orange' : '#D3D3D3';

    return (
      <TouchableOpacity key={name} onPress={() => this.props.goToPage(page)} style={[styles.tab]}>
        <MaterialIcon
          name={name.toLowerCase()}
          color={color}
          style={styles.materialIcon}
          size={35}
        />
      </TouchableOpacity>
    );
  }

  componentDidMount() {
    this.setAnimationValue({value: this.props.activeTab});
    this._listener = this.props.scrollValue.addListener(this.setAnimationValue.bind(this));
  }

  setAnimationValue({value}: any) {
    const currentPage = this.props.activeTab;

    this.unselectedTabIcons.forEach((icon, i) => {
      let iconRef = icon;

      if (!icon.setNativeProps && icon !== null) {
        iconRef = icon.refs.icon_image
      }

      if (value - i >= 0 && value - i <= 1) {
        iconRef.setNativeProps({opacity: value - i});
      }
      if (i - value >= 0 &&  i - value <= 1) {
        iconRef.setNativeProps({opacity: i - value});
      }
    });
  }

  render() {
    const numberOfTabs = this.props.tabs.length;
    const tabUnderlineStyle = {
      position: 'absolute',
      width: deviceWidth / numberOfTabs,
      height: 3,
      backgroundColor: '#3b5998',
      bottom: 0,
    };

    const left = this.props.scrollValue.interpolate({
      inputRange: [0, 1], outputRange: [0, deviceWidth / numberOfTabs]
    });

    return (
      <View>
        <View style={styles.tabs}>
          {this.props.tabs.map((tab, i) => this.renderTabOption(tab, i))}
        </View>
        <Animated.View style={[tabUnderlineStyle, {left}]} />
      </View>
    );
  }
}

CustomTabBar.propTypes = {
    goToPage: React.PropTypes.func,
    activeTab: React.PropTypes.number,
    tabs: React.PropTypes.array
};

export default CustomTabBar;
