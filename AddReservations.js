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
    backgroundColor: '#eaf4be',
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
    let tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    this.state = {
      startDate: new Date(),
      endDate: tomorrow,
      modalOpen: false,
    };
  }

  open(varName: string) {
    this.refs[`${varName}-modal`].open()
    this.setState({modalOpen: true})
  }

  close(varName: string) {
    this.refs[`${varName}-modal`].close()
    this.setState({modalOpen: false})
  }

  onDateChange(varName: string, date: any) {
    this.setState({[varName]: date})
  }

  onClose() {
    console.log('closed')
  }

  onOpen() {
    console.log('open')
  }

  niceDate(varName: string): string {
    return this.state[varName].toString().split(' ').splice(0,3).join(' ')
  }

  getCalendarModal(varName: string) {
    return (
      <Modal
        style={styles.modal}
        ref={`${varName}-modal`}
        onClosed={this.onClose}
        onOpened={this.onOpen}
      >
        <CalendarPicker
          selectedDate={this.state[varName]}
          onDateChange={this.onDateChange.bind(this, varName)}
        />
        <IconButton
          active={true}
          color={'green'}
          iconName={'check'}
          iconFamily={'material'}
          buttonStyle={styles.buttonStyle}
          onPress={this.close.bind(this, varName)}
        />
      </Modal>
    )
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
      <View style={styles.container}>
        {this.getCalendarModal('startDate')}
        {this.getCalendarModal('endDate')}
        <Text style={styles.heading}>New reservation</Text>
        <View style={styles.inputSection}>
          <TouchableOpacity onPress={this.open.bind(this, 'startDate')}>
            <Text style={styles.inputLabel}>Start
              Date:  {this.niceDate('startDate')}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={this.open.bind(this, 'endDate')}>
            <Text style={styles.inputLabel}>End
              Date:  {this.niceDate('endDate')}
            </Text>
          </TouchableOpacity>
          {iconButton}
        </View>
      </View>
    )
  }
}

AddReservations.displayName = 'AddReservations';
AddReservations.propTypes = {
}
