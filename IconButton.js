/* @flow */

import React from 'react-native';
let {
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
        marginTop: -1,
        marginLeft: -7,
        backgroundColor: 'rgba(0,0,0,0)',
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
        const extra = this.props.active ? {backgroundColor: this.props.color} : styles.inactive;
        const iconColor = this.props.iconColor || 'white';
        let icon;
        if (this.props.iconFamily === 'material') {
            icon = (
                <MaterialIcon
                    name={this.props.iconName}
                    size={this.props.iconSize || 65}
                    color={iconColor}
                    style={styles.materialIcon}
                />
            );
        } else if (this.props.iconFamily === 'evil') {
            icon = (
                <EvilIcon
                    name={this.props.iconName}
                    size={this.props.iconSize || 65}
                    color={iconColor}
                    style={styles.evilIcon}
                />
            );
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
    buttonStyle: PropTypes.number, // Stylesheet
    color: PropTypes.string.isRequired,
    iconColor: PropTypes.string,
    iconFamily: PropTypes.string,
    iconName: PropTypes.string.isRequired,
    iconSize: PropTypes.number,
    onPress: PropTypes.func,
};

export default IconButton;
