import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  TextInput,
  Image, // Use @react-native-picker/picker or replace with your dropdown component
} from 'react-native';
import { Picker } from '@react-native-picker/picker';

const services = [
  'Textures',
  'Waterproofing',
  'Terrace Waterproofing',
  'Tile Grouting',
  'POP',
  'Wood Polish',
  'Others',
];

export default function AdditionalServices() {
  const [expandedIndex, setExpandedIndex] = useState(null);

  // Textures states
  const [textureMaterialType, setTextureMaterialType] = useState('');
  const [texturePaintOption, setTexturePaintOption] = useState('without');

  // Waterproofing states
  const [waterproofMaterial, setWaterproofMaterial] = useState('');
  const [waterproofArea, setWaterproofArea] = useState('');
  const [waterproofPaintOption, setWaterproofPaintOption] = useState('without');

  // POP states (example, you can add more)
  const [popOption, setPopOption] = useState('option1');

  const toggleExpand = index => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  const renderTextures = () => (
    <View style={styles.expandedContent}>
      <TextInput
        style={styles.input}
        placeholder="Select material type"
        value={textureMaterialType}
        onChangeText={setTextureMaterialType}
      />
      <Text style={styles.selectLabel}>Select</Text>
      <View style={styles.radioContainer}>
        <TouchableOpacity
          style={styles.radioButton}
          onPress={() => setTexturePaintOption('with')}
        >
          <View style={styles.radioCircle}>
            {texturePaintOption === 'with' && (
              <View style={styles.selectedRb} />
            )}
          </View>
          <Text style={styles.radioText}>with paint</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.radioButton}
          onPress={() => setTexturePaintOption('without')}
        >
          <View style={styles.radioCircle}>
            {texturePaintOption === 'without' && (
              <View style={styles.selectedRb} />
            )}
          </View>
          <Text style={styles.radioText}>without paint</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderWaterproofing = () => (
    <View style={styles.expandedContent}>
      <Text style={styles.selectLabel}>Select material type</Text>
      {/* Replace Picker below with @react-native-picker/picker or custom dropdown */}
      <Picker
        selectedValue={waterproofMaterial}
        onValueChange={itemValue => setWaterproofMaterial(itemValue)}
        style={styles.picker}
      >
        <Picker.Item label="Material A" value="materialA" />
        <Picker.Item label="Material B" value="materialB" />
        <Picker.Item label="Material C" value="materialC" />
      </Picker>

      <TextInput
        style={[styles.input, { marginTop: 10 }]}
        placeholder="Area"
        value={waterproofArea}
        onChangeText={setWaterproofArea}
        keyboardType="numeric"
      />

      <Text style={styles.selectLabel}>Select</Text>
      <View style={styles.radioContainer}>
        <TouchableOpacity
          style={styles.radioButton}
          onPress={() => setWaterproofPaintOption('with')}
        >
          <View style={styles.radioCircle}>
            {waterproofPaintOption === 'with' && (
              <View style={styles.selectedRb} />
            )}
          </View>
          <Text style={styles.radioText}>With Paint</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.radioButton}
          onPress={() => setWaterproofPaintOption('without')}
        >
          <View style={styles.radioCircle}>
            {waterproofPaintOption === 'without' && (
              <View style={styles.selectedRb} />
            )}
          </View>
          <Text style={styles.radioText}>Without Paint</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  // Add similar render methods for other services if needed

  const renderItem = ({ item, index }) => {
    const isExpanded = index === expandedIndex;

    return (
      <View>
        <TouchableOpacity
          style={styles.row}
          onPress={() => toggleExpand(index)}
        >
          <Text style={styles.rowText}>{item}</Text>
          <Image
            source={require('../../assets/icons/arrowredcircle.png')}
            style={styles.iconStyle}
          />
        </TouchableOpacity>

        {isExpanded && (
          <>
            {item === 'Textures' && renderTextures()}
            {item === 'Waterproofing' && renderWaterproofing()}
            {/* Add other service conditional expansions here */}
          </>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>Additional Services</Text>
      <FlatList
        data={services}
        keyExtractor={item => item}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 100 }}
      />
      <View style={styles.footer}>
        <TouchableOpacity style={styles.continueButton}>
          <Text style={styles.continueText}>Continue</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f0f0' },
  header: {
    padding: 15,
    fontSize: 18,

    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    backgroundColor: '#fff',
    fontFamily: 'Poppins-SemiBold',
  },
  row: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginHorizontal: 15,
    marginVertical: 7,
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    fontFamily: 'Poppins-SemiBold',
  },
  rowText: { fontSize: 13, color: '#222', fontFamily: 'Poppins-SemiBold' },

  expandedContent: {
    backgroundColor: '#fff',
    marginHorizontal: 15,
    padding: 15,
    borderRadius: 6,
    marginBottom: 10,
    fontFamily: 'Poppins-SemiBold',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontFamily: 'Poppins-SemiBold',
  },
  selectLabel: {
    marginBottom: 8,
    color: '#d31a1a',
    fontFamily: 'Poppins-SemiBold',
  },
  radioContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  radioButton: {
    flexDirection: 'row',
    marginRight: 30,
    alignItems: 'center',
  },
  radioCircle: {
    height: 18,
    width: 18,
    borderRadius: 9,
    borderWidth: 1.5,
    borderColor: '#d31a1a',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: 'Poppins-SemiBold',
  },
  selectedRb: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#d31a1a',
    fontFamily: 'Poppins-SemiBold',
  },
  radioText: {
    marginLeft: 8,
    fontSize: 15,
    color: '#444',
    fontFamily: 'Poppins-SemiBold',
  },

  picker: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
  },

  footer: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    backgroundColor: '#fff',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
  },
  continueButton: {
    marginHorizontal: 15,
    backgroundColor: '#d31a1a',
    borderRadius: 5,
    paddingVertical: 14,
    alignItems: 'center',
  },
  continueText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 16,
  },
});
