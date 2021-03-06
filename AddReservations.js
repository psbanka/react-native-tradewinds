/* @flow */

/**
 * main menu
 */

import React, {
  AlertIOS,
  Component,
  PickerIOS,
  PropTypes,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

const PickerItemIOS = PickerIOS.Item;

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
    justifyContent: 'space-between',
  },
  modal: {
    justifyContent: 'center',
    alignItems: 'flex-start',
    height: 450,
    backgroundColor: "#e0e3ff"
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
  dateTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
    paddingBottom: 10,
  },
  inputLabel: {
    textDecorationLine: 'underline',
    fontSize: 18,
    marginBottom: 5,
    paddingBottom: 10,
  },
  viewPlaceholder: {
    color: '#d60000',
    fontSize: 14,
    height: 230,
  },
  hidden: {
    height: 0,
  },
  boxStyle: {
  },
  switchStyle: {
    marginBottom: 10,
  }
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
    this.props.changeView()
    this.state = {
      availableBoats: [],
      currentMessage: 'Please pick dates first',
      boatId: null,
      start: {date: null, time: false},
      end: {date: null, time: true},
      modalOpen: false,
    };
  }

  open(varName: string) {
    if (_.isNull(this.state[varName].date)) {
      let initialDate = new Date();
      initialDate.setHours(0,0,0,0);
      initialDate.setDate(initialDate.getDate() + 1); // Default to tomorrow
      if (varName === 'end') {
        if (_.isNull(this.state.start.date)) {
          AlertIOS.alert('Error', 'Please pick start date first');
          return;
        }
        initialDate.setDate(this.state.start.date.getDate()); // assume return on same day
        initialDate.setMonth(this.state.start.date.getMonth());
        initialDate.setFullYear(this.state.start.date.getFullYear());
      }
      let existing = this.state[varName]
      existing.date = initialDate
      this.setState({
        [varName]: existing,
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
    let data = this.state[varName]
    data.date = date;
    this.setState({[varName]: data})
  }

  onClose() {
    let complete = !_.isNull(this.state.start.date) && !_.isNull(this.state.end.date)
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
    if (_.isNull(this.state[varName].date)) {
      return 'Tap to pick date'
    }
    return this.state[varName].date.toString().split(' ').splice(0,3).join(' ')
  }

  getCalendarModal(varName: string) {
    if (_.isNull(this.state[varName].date)) {
      return null
    }
    return (
      <Modal
        style={styles.modal}
        position={"top"}
        ref={`${varName}-modal`}
        onClosed={this.onClose.bind(this)}
        onOpened={this.onOpen.bind(this)}
      >
        <CalendarPicker
          selectedDate={this.state[varName].date}
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
    this.setState({
      currentMessage: 'Searching for boats…',
    })
    const sd = this.state.start.date
    const ed = this.state.end.date
    const dc1 = encodeDate(this.state.start.date)
    const dc2 = encodeDate(this.state.end.date)
    const time1 = encodeURIComponent(this.state.start.time ? '21:00:00' : '09:00:00')
    const time2 = encodeURIComponent(this.state.end.time ? '21:00:00' : '09:00:00')

    const params = {
      method: 'POST',
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: `dc1=${dc1}&time1=${time1}&dc2=${dc2}&time2=${time2}&senddata=Show+me+available+boats`,
    };

    this.props.setWorking('find-boats')
    fetch('http://www.tradewindssailing.com/wsdl/ReservationsAvailable.php', params)
      .then(fetchResults => {
        this.props.clearBusy()
        const html = fetchResults._bodyText;
        const availableBoats = parseAvailableBoats(html)
        if (availableBoats.length) {
          this.setState({
            availableBoats,
            boatId: availableBoats[0].boatId
          })
        } else {
          const message = 'No boats available for that time interval.'
          AlertIOS.alert('Error', message);
          this.setState({
            currentMessage: message,
          })
        }
       })
      .catch((error) => {
        AlertIOS.alert( 'Error', 'Cannot find any boats' );
        console.log('error retrieving bosts', error);
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
    const sd = this.state.start.date
    let start = `${MONTH_NAME[sd.getMonth()]}+${sd.getDate()}+${sd.getFullYear()}`
    if (this.state.start.time) {
      start += '+9+PM'
    } else {
      start += '+9+AM'
    }

    const params = {
      method: 'POST',
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: `BoatID=${boat.boatId}&charterdays=${boat.charterdays}&time=${boat.time}&start=${start}&BoatSize=${boat.boatSize}`,
    };

    this.props.setWorking('reserve-boat')
    return fetch('http://www.tradewindssailing.com/wsdl/Reserve-action.php', params)
      .then(fetchResults => {
        this.props.clearBusy()
        const html = fetchResults._bodyText;
        const message = _.filter(_.map(html.split('\n'), line => {
          if (line.startsWith('<h4 class="wsdlmsg">')) {
            return /\>(.+)\</.exec(line)[1]
          }
        }))
        if (message.length) {
          let text = message[0]
          if (text.toLowerCase().indexOf('added') !== -1) {
            AlertIOS.alert('Success', text);
            this.setState({
              availableBoats: [],
              currentMessage: 'Please pick dates first',
              boatId: null,
              start: {date: null, time: false},
              end: {date: null, time: true},
              modalOpen: false,
            })
            this.props.changeView(0)
          } else {
            AlertIOS.alert('Error', text);
          }
        } else {
          AlertIOS.alert('Error', 'Could not reserve boat');
        }
        this.props.setReservations(html)
      })
      .catch((error) => {
        AlertIOS.alert('Error', error);
      })
  }

  setTime(varName: string, newTime: bool) {
    let existing = this.state[varName]
    existing.time = newTime
    this.setState({[varName]: existing})
    let complete = !_.isNull(this.state.start.date) && !_.isNull(this.state.end.date)
    if (complete) {
      this._findBoats()
    }
  }

  getDateInput(label: string, varName: string) {
    if (this.state.modalOpen) {
      return null
    }
    return (
      <View style={styles.inputSection}>
        <Text style={styles.dateTitle}>{label}</Text>
        <View style={styles.dateSection}>
          <TouchableOpacity onPress={this.open.bind(this, varName)}>
            <Text style={styles.inputLabel}>
              {this.niceDate(varName)}
            </Text>
          </TouchableOpacity>
          <View style={styles.boxStyle}>
            <Switch
              onValueChange={this.setTime.bind(this, varName)}
              style={styles.switchStyle}
              value={this.state[varName].time}
            />
            <Text style={{fontSize: 12, textAlign: 'center'}}>{this.state[varName].time ? 'Evening' : 'Morning'}</Text>
          </View>
        </View>
      </View>
    )
  }

  getStyles(): any {
    if (this.state.modalOpen) {
      return {
        buttonStyle: styles.hidden,
        viewPlaceholder: styles.hidden,
        container: styles.hidden,
        heading: styles.hidden,
        inputSection: styles.hidden,
      }
    } else {
      return {
        buttonStyle: styles.buttonStyle,
        viewPlaceholder: styles.viewPlaceholder,
        container: styles.container,
        heading: styles.heading,
        inputSection: styles.inputSection,
      }
    }
  }

  pressPlaceholder() {
    AlertIOS.alert('Error', 'Please pick dates first');
  }

  render() {
    const currentStyle = this.getStyles()
    let active = !_.isNull(this.state.start.date) && !_.isNull(this.state.end.date)
    let iconButton
    if (!this.state.modalOpen) {
      iconButton = (
        <IconButton
          active={active}
          color={'green'}
          iconName={'chevron-right'}
          iconFamily={'material'}
          buttonStyle={currentStyle.buttonStyle}
          onPress={this._reserveBoats.bind(this)}
          working={this.props.working === 'find-boats' || this.props.working === 'reserve-boat'}
        />
      )
    }

    let picker = (
      <TouchableOpacity onPress={this.pressPlaceholder}>
        <Text style={currentStyle.viewPlaceholder}>
          {this.state.currentMessage}
        </Text>
      </TouchableOpacity>
    )
    if (this.state.availableBoats.length) {
      picker = (
        <PickerIOS
          selectedValue={this.state.boatId}
          style={{marginTop: -20, paddingBottom: 25}}
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
      <View style={currentStyle.container}>
        {this.getCalendarModal('start')}
        {this.getCalendarModal('end')}
        <Text style={currentStyle.heading}>New reservation</Text>
        {this.getDateInput('Start Date', 'start')}
        {this.getDateInput('End Date', 'end')}
        <View>
          <Text style={styles.dateTitle}>Select Boat</Text>
          {picker}
        </View>
        {iconButton}
      </View>
    )
  }
}

AddReservations.displayName = 'AddReservations';
AddReservations.propTypes = {
  setReservations: PropTypes.func.isRequired,
  //changeView: PropTypes.func.isRequred,
}
