/* @flow */

/**
 * main menu
 */

import React, {
  Component,
  PickerIOS,
  PickerItemIOS,
  PropTypes,
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
    padding: 15,
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
  },
  inputSection: {
    flexDirection: 'column',
    marginTop: 25,
    marginBottom: 10,
  },
  dateSection: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
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
    let charterdays = reservationValues[2]
    let time = reservationValues[3]
    let start = reservationValues[4]
    let boatSize = reservationValues[5]
    return {name, boatId, charterdays, time, start, boatSize};
  })
  return output;
}

export default class AddReservations extends Component {
  constructor(props: any) {
    super(props);
    this.state = {
      availableBoats: [],
      boatId: null,
      startDate: null,
      endDate: null,
      startTime: true,
      endTime: false,
      modalOpen: false,
    };
  }

  open(varName: string) {
    if (_.isNull(this.state[varName])) {
      // TODO: choose tomorrow if it's too late!
      let initialDate = new Date();
      if (varName === 'endDate') {
        if (_.isNull(this.state.startDate)) {
          return; // Do nothing if end is tapped but start not picked.
        }
        initialDate.setDate(this.state.startDate.getDate() + 1);
      }
      this.setState({
        [varName]: initialDate,
        modalOpen: true,
      })
    }
    this.refs[`${varName}-modal`].open()
  }

  close(varName: string) {
    this.refs[`${varName}-modal`].close()
    this.setState({modalOpen: false})
  }

  onDateChange(varName: string, date: any) {
    this.setState({[varName]: date})
  }

  onClose() {
    let complete = !_.isNull(this.state.startDate) && !_.isNull(this.state.endDate)
    if (complete) {
      this._findBoats()
    }
  }

  /**
   * Part of API for calendar- not used
   */
  onOpen() {
  }

  niceDate(varName: string): string {
    if (_.isNull(this.state[varName])) {
      return 'Tap to pick date'
    }
    return this.state[varName].toString().split(' ').splice(0,3).join(' ')
  }

  getCalendarModal(varName: string) {
    if (_.isNull(this.state[varName])) {
      return null
    }
    return (
      <Modal
        style={styles.modal}
        ref={`${varName}-modal`}
        onClosed={this.onClose.bind(this)}
        onOpened={this.onOpen.bind(this)}
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

    fetch('http://www.tradewindssailing.com/wsdl/ReservationsAvailable.php', params)
      .then(fetchResults => {
        const html = fetchResults._bodyText;
        const availableBoats = parseAvailableBoats(html)
        if (availableBoats.length) {
          this.setState({
            availableBoats,
            boatId: availableBoats[0].boatId
          })
        }
       })
      .catch((error) => {
        console.log('error retrieving bosts', error);
        this.props.setMessage('error retrieving boats')
      })
  }

  _reserveBoats() {
    const boat = _.find(this.state.availableBoats, {boatId: this.state.boatId})
    if (!boat) {
      console.log('ERROR: cannot find record for ', this.state.boatId)
      return
    }
    const MONTH_NAME = [
      'January', 'February', 'March', 'April', 'May', 'June', 'July',
      'August', 'September', 'October', 'November', 'December'
    ]
    const sd = this.state.startDate
    let start = `${MONTH_NAME[sd.getMonth()]}+${sd.getDate()}+${sd.getFullYear()}`
    if (this.state.startTime) {
      start += '+9+AM'
    } else {
      start += '+9+PM'
    }

    const params = {
      method: 'POST',
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: `BoatID=${boat.boatId}&charterdays=${boat.charterdays}&time=${boat.time}&start=${start}&BoatSize=${boat.boatSize}`,
    };

    return fetch('http://www.tradewindssailing.com/wsdl/Reserve-action.php', params)
      .then(fetchResults => {
        const html = fetchResults._bodyText;
        this.props.setReservations(html)
        // TODO: Parse message for confirmation
        // TODO: Clear the form and move to reservations page
        this.setMessage('boat reserved')
      })
      .catch((error) => {
        console.log('error when reserving', error)
        this.setMessage('error reserving boat')
      })
  }

  getDateInput(label: string, dateVarName: string, timeVarName: string) {
    return (
      <View style={styles.inputSection}>
        <Text style={styles.inputLabel}>{label}</Text>
        <View style={styles.dateSection}>
          <TouchableOpacity onPress={this.open.bind(this, dateVarName)}>
            <Text style={styles.inputLabel}>
              {this.niceDate(dateVarName)}
            </Text>
          </TouchableOpacity>
          <View>
            <Switch
              onValueChange={(value) => this.setState({[timeVarName]: value})}
              style={{marginBottom: 10}}
              value={this.state[timeVarName]}
            />
            <Text style={{fontSize: 10}}>{this.state[timeVarName] ? 'Morning' : 'Evening'}</Text>
          </View>
        </View>
      </View>
    )
  }

  render() {
    let iconButton = null
    if (!this.state.modalOpen) {
      let active = !_.isNull(this.state.startDate) && !_.isNull(this.state.endDate)
      iconButton = (
        <IconButton
          active={active}
          color={'green'}
          iconName={'chevron-right'}
          iconFamily={'material'}
          buttonStyle={styles.buttonStyle}
          onPress={this._reserveBoats.bind(this)}
        />
      )
    }

    let picker = null
    if (this.state.availableBoats.length) {
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
        {this.getDateInput('Start Date', 'startDate', 'startTime')}
        {this.getDateInput('End Date', 'endDate', 'endTime')}
        {picker}
        {iconButton}
      </View>
    )
  }
}

AddReservations.displayName = 'AddReservations';
AddReservations.propTypes = {
  setReservations: PropTypes.func.isRequired,
}
