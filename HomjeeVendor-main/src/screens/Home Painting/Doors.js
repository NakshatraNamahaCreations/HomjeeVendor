import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

const Doors = () => {
  const [doors, setDoors] = useState([{length: '', width: '', touched: false}]);

  const calculateArea = (l, w) => {
    const length = parseFloat(l);
    const width = parseFloat(w);
    if (isNaN(length) || isNaN(width) || length < 0 || width < 0) return null;
    return length * width;
  };

  const addDoor = () => {
    setDoors([...doors, {length: '', width: '', touched: false}]);
  };

  return (
    <ScrollView style={styles.container}>
      {doors.map((door, index) => {
        const length = parseFloat(door.length);
        const width = parseFloat(door.width);
        const area = calculateArea(door.length, door.width);
        const isInvalid = (length < 0 || width < 0) && door.touched;

        return (
          <View key={index} style={styles.card}>
            <Text style={styles.title}>Door {index + 1}</Text>
            <View style={styles.dottedLine} />

            <View style={styles.row}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>L</Text>
                <TextInput
                  value={door.length}
                  keyboardType="numeric"
                  placeholder="Length"
                  style={styles.input}
                  onChangeText={text => {
                    const updated = [...doors];
                    updated[index].length = text;
                    setDoors(updated);
                  }}
                  onBlur={() => {
                    const updated = [...doors];
                    updated[index].touched = true;
                    setDoors(updated);
                  }}
                />
              </View>

              <Text style={styles.multiply}>×</Text>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>W</Text>
                <TextInput
                  value={door.width}
                  keyboardType="numeric"
                  placeholder="Width"
                  style={styles.input}
                  onChangeText={text => {
                    const updated = [...doors];
                    updated[index].width = text;
                    setDoors(updated);
                  }}
                  onBlur={() => {
                    const updated = [...doors];
                    updated[index].touched = true;
                    setDoors(updated);
                  }}
                />
              </View>

              <Text style={styles.equals}>=</Text>
              {area !== null ? (
                <Text style={styles.areaText}>{area} sq ft</Text>
              ) : (
                <Text placeholder="Area(sq ft)" style={styles.errorAreaText}>
                  Invalid
                </Text>
              )}
            </View>

            {isInvalid && (
              <Text style={styles.validationText}>
                ⚠️ Validation: Length and Width must be positive
              </Text>
            )}
          </View>
        );
      })}

      <TouchableOpacity style={styles.addBtn} onPress={addDoor}>
        <Text style={styles.addBtnText}>Add Door</Text>
        <Ionicons name="add-circle" size={18} color="#4CAF50" />
      </TouchableOpacity>
      <TouchableOpacity style={styles.doneButton}>
        <Text style={styles.doneButtonText}>Done</Text>
      </TouchableOpacity>
      <View style={styles.underlineRed} />
    </ScrollView>
  );
};

export default Doors;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
    backgroundColor: '#F8F8F8',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 25,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: {width: 0, height: 1},
    shadowRadius: 2,
    elevation: 1,
  },
  title: {
    color: '#ED1F24',
    fontWeight: 'bold',
    fontSize: 14,
    marginBottom: 8,
    fontFamily: 'Poppins-SemiBold',
  },
  dottedLine: {
    borderBottomWidth: 2,
    borderBottomColor: '#ED1F24',
    borderStyle: 'dotted',
    width: '100%',
    marginBottom: 15,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    justifyContent: 'space-between',
  },
  inputGroup: {
    alignItems: 'center',
    marginTop: 20,
  },
  label: {
    fontSize: 12,
    color: 'gray',
    marginBottom: 3,
    fontFamily: 'Poppins-Medium',
  },
  input: {
    width: 70,
    height: 46,
    borderWidth: 1.5,
    borderColor: '#ED1F24',
    borderRadius: 5,
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '500',
  },
  multiply: {
    marginHorizontal: 10,
    fontWeight: 'bold',
    fontSize: 18,
    color: '#000',
  },
  equals: {
    marginHorizontal: 10,
    fontWeight: 'bold',
    fontSize: 18,
    color: '#000',
  },
  areaText: {
    fontWeight: 'bold',
    fontSize: 14,
    color: '#333',
  },
  errorAreaText: {
    fontSize: 13,
    color: '#ED1F24',
    fontWeight: 'bold',
  },
  validationText: {
    fontSize: 12,
    color: '#ED1F24',
    marginTop: 4,
    fontFamily: 'Poppins-Medium',
  },
  warningText: {
    fontSize: 11,
    color: '#ED1F24',
    marginTop: 8,
    fontFamily: 'Poppins-Regular',
  },
  popUp: {
    textDecorationLine: 'underline',
    fontWeight: '600',
  },
  addBtn: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: {width: 0, height: 1},
    elevation: 1,
  },
  addBtnText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#000',
    fontFamily: 'Poppins-SemiBold',
  },
  doneButton: {
    backgroundColor: '#FF0000',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 360,
  },
  doneButtonText: {color: '#fff', fontWeight: 'bold', fontSize: 16},
  underlineRed: {
    height: 5,
    width: '35%',
    backgroundColor: '#ED1F24',
    alignSelf: 'center',
    borderRadius: 20,
    marginVertical: 30,
  },
  dottedLine: {
    borderBottomWidth: 2, // thicker line
    borderBottomColor: '#ED1F24',
    borderStyle: 'dotted',
    marginTop: 10,
    width: '100%', // full width line
    alignSelf: 'center', // center horizontally
  },
});
