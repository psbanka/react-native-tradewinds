/* @flow */

/**
 * main menu
 */

import React, {
  Component,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import commonStyles from './common-styles';
import IconButton from './IconButton';
import Modal from 'react-native-modalbox';
const CalendarPicker = require('react-native-calendar-picker');

let styles = StyleSheet.create({
  container: {
    flex: 1,
    width: commonStyles.deviceWidth,
    height: commonStyles.deviceHeight,
    backgroundColor: '#eaf4be',
    justifyContent: 'space-between',
  },
  modal: {
    justifyContent: 'center',
    alignItems: 'flex-start',
    height: 400,
    backgroundColor: 'white',
  },
  spacer: {
    paddingBottom: 30,
    height:10,
    width: 1,
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
  heading: {
    fontSize: 24,
    marginBottom: 5,
  },
  inputSection: {
    flexDirection: 'column',
    marginBottom: 10,
  },
  inputLabel: {
    fontSize: 18,
    marginBottom: 5,
    paddingBottom: 10,
  },
})

export default class AddReservations extends Component {
  constructor(props: any) {
    super(props);
    this.state = {
      date: new Date(),
      modalOpen: false,
    };
  }

  open() {
    this.refs.modal1.open()
    this.setState({modalOpen: true})
  }

  close() {
    this.refs.modal1.close()
    this.setState({modalOpen: false})
  }

  onDateChange(date: any) {
    this.setState({date})
  }

  onClose() {
    console.log('closed')
  }

  onOpen() {
    console.log('open')
  }

  niceDate(): string {
    return this.state.date.toString().split(' ').splice(0,3).join(' ')
  }

  render() {
    let iconButton = null
    if (!this.state.modalOpen) {
      iconButton = (
        <IconButton
          active={true}
          color={'red'}
          iconName={'clear'}
          iconFamily={'material'}
          buttonStyle={styles.buttonStyle}
          onPress={this.open.bind(this)}
        />
      )
    }
    return (
      <View>
        <View style={styles.container}>
          <Text style={styles.heading}>New reservation</Text>
          <View style={styles.inputSection}>
            <TouchableOpacity
                onPress={this.open.bind(this)}
            >
              <Text style={styles.inputLabel}>Start
                Date:  {this.niceDate()}
              </Text>
            </TouchableOpacity>
            {iconButton}
          </View>
        </View>
        <Modal
          style={styles.modal}
          ref={"modal1"}
          onClosed={this.onClose}
          onOpened={this.onOpen}
        >
          <CalendarPicker
            selectedDate={this.state.date}
            onDateChange={this.onDateChange.bind(this)}
          />
          <IconButton
            active={true}
            color={'green'}
            iconName={'check'}
            iconFamily={'material'}
            buttonStyle={styles.buttonStyle}
            onPress={this.close.bind(this)}
          />
        </Modal>
      </View>
    )
  }
}

AddReservations.displayName = 'AddReservations';
AddReservations.propTypes = {
}
