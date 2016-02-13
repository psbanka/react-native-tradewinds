/* @flow */

/**
 * main menu
 */

import React, {
  Component,
  PickerIOS,
  PickerItemIOS,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import _ from 'lodash'
import commonStyles from './common-styles'
import IconButton from './IconButton'
import Modal from 'react-native-modalbox'
const CalendarPicker = require('react-native-calendar-picker')

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

function pad(n) {
  return (n < 10) ? ("0" + n) : n;
}

function encodeDate(date) {
  return encodeURIComponent(`${pad(date.getMonth() + 1)}/${pad(date.getDate())}/${date.getFullYear()}`)
}

function parseAvailableBoats(html) {
  let start = false
  let lines = _.filter(html.split('\n').map(line => {
    if (start) return line
    if (/\<h4 class="wsdlmsg"\>\<\/h4\>/m.exec(line)) start = true
  }))

  let boatSection = _.filter(lines, line => {
    return line && line.startsWith('<tr><td class="wsdldata">')
  })

  let output = boatSection.map(boatData => {
    let data = boatData.split('</td><td class="wsdldata">')
    let name = data[0].split('<tr><td class="wsdldata">')[1]
    let reservationData = data[2].split('input')
    let reservationValues = reservationData.map(value => {
      let parsedValue = /value="(.*)"/.exec(value)
      if (parsedValue) {
        return parsedValue[1]
      }
    })
    let boatId = reservationValues[1]
    let charterDays = reservationValues[2]
    let time = reservationValues[3]
    let start = reservationValues[4]
    let boatSize = reservationValues[5]
    return {name, boatId, charterDays, time, start, boatSize};
  })
  return output;
}

export default class AddReservations extends Component {
  constructor(props: any) {
    super(props);
    let tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    this.state = {
      availableBoats: [],
      startDate: new Date(),
      endDate: tomorrow,
      startTime: true,
      endTime: false,
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

  _findBoats(): any {
    const sd = this.state.startDate
    const ed = this.state.endDate
    const dc1 = encodeDate(this.state.startDate)
    const dc2 = encodeDate(this.state.endDate)
    const time1 = encodeURIComponent(this.state.startTime ? '09:00:00' : '21:00:00')
    const time2 = encodeURIComponent(this.state.endTime ? '09:00:00' : '21:00:00')

    const params = {
      method: 'POST',
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: `dc1=${dc1}&time1=${time1}&dc2=${dc2}&time2=${time2}&senddata=Show+me+available+boats`,
    };

    return fetch('http://www.tradewindssailing.com/wsdl/ReservationsAvailable.php', params)
      .then(fetchResults => {
        const html = fetchResults._bodyText;
        this.setState({availableBoats: parseAvailableBoats(html)})
      })
  }

  render() {
    let iconButton = null
    if (!this.state.modalOpen) {
      iconButton = (
        <IconButton
          active={true}
          color={'green'}
          iconName={'chevron-right'}
          iconFamily={'material'}
          buttonStyle={styles.buttonStyle}
          onPress={this._findBoats.bind(this)}
        />
      )
    }

    let picker = null
    if (this.state.availableBoats.length) {
      debugger
      picker = (
        <PickerIOS
          selectedValue={this.state.boatId}
          onValueChange={(boatId) => this.setState({boatId})}>
          {this.state.availableBoats.map((boatData) => (
            <PickerItemIOS
              key={boatData.boatId}
              value={boatData.boatId}
              label={boatData.name}
            />
          ))}
        </PickerIOS>
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
          <View style={{flex: 1, flexDirection: 'row'}}>
            <Switch
              onValueChange={(value) => this.setState({startTime: value})}
              style={{marginBottom: 10}}
              value={this.state.startTime}
            />
            <Text>{this.state.startTime ? 'Morning' : 'Evening' }</Text>
          </View>
          <TouchableOpacity onPress={this.open.bind(this, 'endDate')}>
            <Text style={styles.inputLabel}>End
              Date:  {this.niceDate('endDate')}
            </Text>
          </TouchableOpacity>
          <View style={{flex: 1, flexDirection: 'row'}}>
            <Switch
              onValueChange={(value) => this.setState({endTime: value})}
              style={{marginBottom: 10}}
              value={this.state.endTime}
            />
            <Text>{this.state.endTime ? 'Morning' : 'Evening' }</Text>
          </View>
          {iconButton}
          {picker}
        </View>
      </View>
    )
  }
}

AddReservations.displayName = 'AddReservations';
AddReservations.propTypes = {
}
