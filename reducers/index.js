import * as types from '../actions/actionTypes';

type Reservation = {
  category: string,
  id: string,
  name: string,
  startTime: string,
  endTime: string,
}

const initialState = {
  busy: true,
  userData: {
    username: null,
    password: null,
    error: '',
  },
  reservations: [],
  // reservations: null,
};

/**
 * Data looks something like:
 * <td>Bronze</td><td>CT25</td><td>Delta</td><td>D-D</td><td>0</td><td>Monday<br/>February 15<br/>9am</td><td>Tuesday<br/>February 16<br/>9pm</td>
 * Parse it out.
 */
function getReservationData(reservationSection: string) {
  let data = reservationSection.split('</td><td>')
  let category = data[0].replace('\t<td>', '');
  let id = data[1]
  let name = data[2];
  let startTime = data[5].replace('<br/>', ' ').replace('<br/>', ' ')
  let endTime = data[6].replace('<br/>', ' ').replace('<br/>', ' ').replace('</td>', '')
  return {category, id, name, startTime, endTime};
}

function getCancellationData(cancellationSection: string) {
  let output = {}
  let data = cancellationSection.split('<Input type="hidden"')
  for (line of data) {
    let match = /.*name\s*=\s*"(\w+)"\s+value\s*=\s*"(\S+)"+/m.exec(line)
    if (!_.isNull(match)) {
      let key = match[1]
      let value = match[2]
      output[key] = value
    }
  }
  return output
}

function parseReservations(html): Array<Reservation>  {
  let start = false
  let lines = _.filter(html.split('\n').map(line => {
    if (start) return line
    if (/\<h6 class=wsdlcenter\>(.*)/m.exec(line)) start = true
  }))

  let reservationSection = _.filter(lines, line => {
    return line && line.startsWith('\t<td>')
  })

  let cancellationSection = _.filter(lines, line => {
    return line && line.startsWith('\t\t\t\t<Input type="hidden" name ="begins"')
  })

  let output = []
  for (let i = 0, len = reservationSection.length; i < len; i++) {
    let reservation = reservationSection[i]
    let reservationData = getReservationData(reservation);
    let cancellation = cancellationSection[i]
    let cancellationData = getCancellationData(cancellation);
    let newLine = Object.assign({}, reservationData, cancellationData)
    output.push({...reservationData, ...cancellationData})
  }
  return output;
}

export default function counter(state = initialState, action = {}) {
  switch (action.type) {
    case types.SET_BUSY:
      return {
        ...state,
        busy: true
      };
    case types.CLEAR_BUSY:
      return {
        ...state,
        busy: false
      };
    case types.SET_USER_DATA:
      return {
        ...state,
        userData: action.userData
      };
    case types.SET_RESERVATIONS:
      const reservations = parseReservations(action.reservationResponse)
      return {
        ...state,
        reservations,
      };
    default:
      return state;
  }
}
