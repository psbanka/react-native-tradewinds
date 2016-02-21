/* @flow */

/**
 * account-creation screen
 */

import React, {
    Component,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TextInput,
    View,
} from 'react-native';

import _ from 'lodash';
import IconButton from './IconButton';
import BusyIndicator from './BusyIndicator';
import commonStyles from './common-styles';

/***********
 *  types  *
 ***********/

type SyntheticEvent = {
    nativeEvent: NativeEvent,
};

type NativeEvent = {
    text: string,
};

type LocationData = {
    id: number,
    name: string,
};

type AuthMessage = {
    provider: string,
    link: string,
    username: string,
    first_name: string,
    location: LocationData,
    name: string,
    birthday: string,
    gender: string,
    id: number,
    token: string,
};

type AuthError = {
    code: number,
    description: string,
};

/************
 *  styles  *
 ************/

const styles = StyleSheet.create({
    container: {
        marginTop: 15,
        flex: 1,
        flexDirection: 'column',
        paddingTop: 10,
        paddingLeft: 30,
        paddingRight: 30,
    },
    heading: {
        fontSize: 24,
        marginBottom: 5,
    },
    error: {
      fontSize: 16,
      backgroundColor: '#7c2222',
      fontWeight: 'bold',
      color: 'white',
      width: commonStyles.deviceWidth * 0.82,
      textAlign: 'center',
      marginTop: 10,
      marginBottom: 10,
    },
    inputSection: {
        flexDirection: 'column',
        height: 70,
        marginBottom: 10,
    },
    inputLabel: {
        height: 15,
    },
    buttonStyle: {
        width: 50,
        height: 50,
        borderRadius: 50/2,
        paddingBottom: 10,
        marginRight: 10,
        marginTop: -10,
        paddingTop: 12,
    },
    inputWidget: {
        height: 50,
        paddingLeft: 10,
        paddingRight: 10,
          backgroundColor: '#f8e8ff',
    },
    errorBox: {
        paddingLeft: 30,
        paddingRight: 30,
        fontSize: 24,
        fontWeight: 'bold',
    },
});

/****************
 *  Main class  *
 ****************/

export default class Login extends Component {
    constructor(props: any) {
        super(props);
        this.state = {
            // Do we want to ask them for all this stuff?
            userData: {
                username: '',
                errorMessage: '',
                password: '',
            },
            rememberMe: true,
            submitEnabled: false,
        };
    }

    _updateUserData(prop: string, value: string, userData?: any): any {
        userData = userData || this.state.userData;
        let newUserData = Object.assign({}, userData, {[prop]: value});
        return newUserData;
    }

    usernameInput(event: SyntheticEvent) {
        this.setState({userData: this._updateUserData('username', event.nativeEvent.text)});
    }

    passwordInput(event: SyntheticEvent) {
        let password = event.nativeEvent.text;
        let submitEnabled = false;
        if (this.state.userData.username.length > 1) {
            if (password.length > 1) {
                submitEnabled = true;
            }
        }
        let newUserData = this._updateUserData('password', password);
        this.setState({userData: newUserData, submitEnabled});
    }

    handleSubmit() {
        this.props.onSubmit(this.state.userData, this.state.rememberMe);
    }

    render() {
      let errorMessage = null
      if (this.props.error) {
        errorMessage = (<Text style={styles.error}>{this.props.error}</Text>)
      }
      return (
        <ScrollView
          contentInset={{top: -50}}
          scrollEventThrottle={200}
          style={styles.container}
        >
          <Text style={styles.heading}>Log in to Tradewinds</Text>
          {errorMessage}
          <View style={styles.inputSection}>
            <Text style={styles.inputLabel}>Username</Text>
            <TextInput
              autoCapitalize={'none'}
              autoCorrect={false}
              autoFocus={true}
              onChange={this.usernameInput.bind(this)}
              ref="usernameInput"
              style={styles.inputWidget}
              value={this.state.userData.username}
            />
          </View>
          <View style={styles.inputSection}>
            <Text style={styles.inputLabel}>Password</Text>
            <TextInput
              autoCorrect={false}
              onChange={this.passwordInput.bind(this)}
              password={true}
              ref="passwordInput"
              style={styles.inputWidget}
              value={this.state.userData.password}
            />
          </View>
          <View style={styles.inputSection}>
            <Text style={styles.inputLabel}>Remember me?</Text>
            <Switch
              onValueChange={(value) => this.setState({rememberMe: value})}
              style={{marginBottom: 10, marginTop: 10}}
              value={this.state.rememberMe}
            />
          </View>
          <IconButton
            active={this.state.submitEnabled}
            working={this.props.working === 'login'}
            color={'green'}
            iconName={'chevron-right'}
            iconFamily={'material'}
            buttonStyle={styles.buttonStyle}
            onPress={this.handleSubmit.bind(this, null)}
          />
        </ScrollView>
      )
    }
}

Login.displayName = 'Login';
Login.propTypes = {
    onSubmit: React.PropTypes.func.isRequired,
    error: React.PropTypes.string,
};
