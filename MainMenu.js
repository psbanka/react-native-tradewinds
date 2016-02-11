/* @flow */

/**
 * main menu
 */

import React, {
  Component,
  ListView,
  StyleSheet,
  ScrollView,
  Text,
  View,
} from 'react-native';
import commonStyles from './common-styles';
import IconButton from './IconButton';

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
  },
  rowContainerEven: {
    padding: 10,
    backgroundColor: 'rgba(251,246,228,1)',
  },
  rowContainerOdd: {
    padding: 10,
    backgroundColor: 'white',
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
})

export default class MainMenu extends Component {
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
        <View style={rowStyle}>
          <Text>{rowData.name}</Text>
        </View>
      </View>
    );
  }

  addReservations() {
    console.log('add a reservation!')
  }

  render() {
    let renderRow = this.renderRow.bind(this)
    let resultsList = (
      <ListView
        automaticallyAdjustContentInsets={false}
        dataSource={this.state.dataSource}
        renderRow={renderRow}
        style={styles.resultsList}
      />
    );
    return (
      <ScrollView style={styles.container}>
          <Text style={styles.heading}>{"Reservations"}</Text>
          {resultsList}
          <IconButton
            active={true}
            color={'green'}
            iconName={'add-circle'}
            iconFamily={'material'}
            buttonStyle={styles.buttonStyle}
            onPress={this.addReservations.bind(this, null)}
          />
      </ScrollView>
    )
  }
}

MainMenu.displayName = 'MainMenu';
MainMenu.propTypes = {
    reservations: React.PropTypes.array.isRequired,
};

