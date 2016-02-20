/* @flow */

/**
 * main menu
 */

import React, {
  AlertIOS,
  Component,
  ListView,
  StyleSheet,
  ScrollView,
  Text,
  View,
} from 'react-native'
import commonStyles from './common-styles'
import IconButton from './IconButton'
import _ from 'lodash'

/****************
 *  Main class  *
 ****************/

let styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor:  'rgba(158,212,209,1)',
    width: commonStyles.deviceWidth,
    height: commonStyles.deviceHeight,
  },
  heading: {
    fontSize: 24,
    fontWeight: '300',
    padding: 20,
  },
  resultsList: {
    height: commonStyles.deviceHeight * 0.7,
  },
  row: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 10,
  },
  rowContainerEven: {
    backgroundColor: 'rgba(251,246,228,1)',
  },
  rowContainerOdd: {
    backgroundColor: 'white',
  },
  buttonStyle: {
    width: 30,
    height: 30,
    borderRadius: 30/2,
    paddingLeft: 5,
    paddingTop: 20,
  },
})

export default class Reservations extends Component {
  constructor(props: any) {
    super(props);
    this.ds = new ListView.DataSource({rowHasChanged: (row1, row2) => row1 !== row2});
    this.rowIndex = 0;
    this.state = {
      dataSource: null,
    };
  }

  componentWillMount() {
    this.setState({
      dataSource: this.ds.cloneWithRows(this.props.reservations)
    })
  }

  componentWillReceiveProps(nextProps: any) {
    this.rowIndex = 0;
    this.setState({
      dataSource: this.ds.cloneWithRows(nextProps.reservations)
    })
  }

  _cancelBoat(index: number) {
    const r = this.props.reservations[index - 1]
    if (r === undefined) {
      console.error('trying to cancel nonexistant reservation')
    }

    const begins = encodeURIComponent(r.begins)
    const params = {
      method: 'POST',
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: `begins=${begins}&venuecode=${r.venuecode}&boatsize=${r.boatsize}&boatcode=${r.boatcode}`,
    };

    fetch('http://www.tradewindssailing.com/wsdl/Reservations-action-cancel.php', params)
      .then(cancelResults => {
        const html = cancelResults._bodyText;
        if (cancelResults.status = 200) {
          const message = _.filter(_.map(html.split('\n'), line => {
            if (line.startsWith('<h4 class="wsdlmsg">')) {
              return /\>(.+)\</.exec(line)[1]
            }
          }))
          if (message.length) {
            let text = message[0]
            if (text.toLowerCase().indexOf('cancelled')) {
              AlertIOS.alert('Success', text);
            } else {
              AlertIOS.alert('Error', text);
            }
          } else {
            AlertIOS.alert('Error', 'error cancelling boat');
          }
        }
        this.props.setReservations(html)
       })
      .catch((error) => {
        this.props.setMessage('error cancelling boat')
        console.log('error cancelling boat', error);
      })
  }

  /**
   * Show a single reservation record
   */
  renderRow(rowData : any) : any {
    let rowStyle = styles.rowContainerOdd;
    if (this.rowIndex % 2 === 0) {
      rowStyle = styles.rowContainerEven;
    }
    this.rowIndex += 1;
    return (
      <View>
        <View style={[styles.row, rowStyle]}>
          <View>
            <Text style={{fontWeight: 'bold'}}>{rowData.name}</Text>
            <Text>Start: {rowData.startTime}</Text>
            <Text>End: {rowData.endTime}</Text>
          </View>
          <IconButton
            active={true}
            color={'red'}
            iconName={'clear'}
            iconFamily={'material'}
            iconSize={30}
            buttonStyle={styles.buttonStyle}
            onPress={this._cancelBoat.bind(this, this.rowIndex)}
          />
        </View>
      </View>
    );
  }

  emptyState() {
    return (
      <View>
        <Text style={{color: '#7c3939', fontSize: 20, fontWeight: 'bold', paddingLeft: 20}}>
          You have no reservations
        </Text>
        <View style={{paddingTop: 50, flex: 1, justifyContent: 'space-between', flexDirection: 'row'}}>
          <View/>
            <View>
              <Text style={{paddingTop: 30, width: commonStyles.deviceWidth * 0.5, fontSize: 20, lineHeight: 46, fontStyle: 'italic'}} >
                A ship in harbor is safe, but that is not what ships are built for.
              </Text>
              <Text style={{width: commonStyles.deviceWidth * 0.5, fontSize: 20, lineHeight: 46, textAlign: 'right'}}>
                    —J. A. Shedd
              </Text>
            </View>
          <View/>
        </View>
      </View>
    )
  }

  render() {
    let renderRow = this.renderRow.bind(this)
    let resultsList
    if (this.props.reservations && this.props.reservations.length) {
      resultsList = (
        <ListView
          automaticallyAdjustContentInsets={false}
          dataSource={this.state.dataSource}
          renderRow={renderRow}
          style={styles.resultsList}
        />
      )
    } else {
      resultsList = this.emptyState()
    }
    return (
      <ScrollView style={styles.container}>
        <Text style={styles.heading}>{"Reservations"}</Text>
        {resultsList}
      </ScrollView>
    )
  }
}

Reservations.displayName = 'Reservations';
Reservations.propTypes = {
  reservations: React.PropTypes.array.isRequired,
}

