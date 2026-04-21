import React, {useState, useCallback, useEffect, useRef} from 'react';
import {useNavigation, useRoute} from '@react-navigation/native';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

const Bedroom1 = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const roomName = route.params?.roomName || 'Bedroom 1';
  const scrollViewRef = useRef(null);

  // Set initial state with one ceiling and four walls
  const [sections, setSections] = useState([
    {
      type: 'ceiling',
      width: '20',
      height: '20',
      repaint: true,
      fresh: false,
      label: 'Ceiling 1',
    },
    {
      type: 'wall',
      width: '20',
      height: '20',
      repaint: true,
      fresh: false,
      windows: [],
      label: 'Wall 1',
    },
    {
      type: 'wall',
      width: '21',
      height: '21',
      repaint: true,
      fresh: false,
      windows: [],
      label: 'Wall 2',
    },
    {
      type: 'wall',
      width: '22',
      height: '22',
      repaint: true,
      fresh: false,
      windows: [],
      label: 'Wall 3',
    },
    {
      type: 'wall',
      width: '23',
      height: '23',
      repaint: true,
      fresh: false,
      windows: [],
      label: 'Wall 4',
    },
  ]);

  const [error, setError] = useState('');
  const [roomRepaint, setRoomRepaint] = useState(true);
  const [roomFresh, setRoomFresh] = useState(false);

  const calculateArea = (w, h) => {
    const width = parseFloat(w);
    const height = parseFloat(h);
    return isNaN(width) || isNaN(height) ? 0 : width * height;
  };

  const validateInput = value => {
    if (parseFloat(value) < 0) {
      return 'Negative values in measurement calculations; display a validation warning.';
    }
    return '';
  };

  // Add Ceiling with proper labeling
  const addCeiling = () => {
    const ceilingCount = sections.filter(s => s.type === 'ceiling').length;
    setSections(prev => [
      ...prev,
      {
        type: 'ceiling',
        width: '',
        height: '',
        repaint: roomRepaint,
        fresh: roomFresh,
        label: `Ceiling ${ceilingCount + 1}`, // Proper labeling of ceilings
      },
    ]);
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({animated: true});
    }, 100);
  };

  // Add Wall with proper labeling
  const addWall = () => {
    const wallCount = sections.filter(s => s.type === 'wall').length;
    setSections(prev => [
      ...prev,
      {
        type: 'wall',
        width: '',
        height: '',
        repaint: roomRepaint,
        fresh: roomFresh,
        windows: [],
        label: `Wall ${wallCount + 1}`, // Correctly label walls starting from 1
      },
    ]);
  };

  const addWindow = sectionIndex => {
    const updated = [...sections];
    updated[sectionIndex].windows.push({width: '', height: ''});
    setSections(updated);
  };

  const handleWidthChange = (index, value) => {
    const validationError = validateInput(value);
    setError(validationError);
    if (validationError) return;

    const updated = [...sections];
    updated[index].width = value;
    setSections(updated);
  };

  const handleHeightChange = (index, value) => {
    const validationError = validateInput(value);
    setError(validationError);
    if (validationError) return;

    const updated = [...sections];
    updated[index].height = value;
    setSections(updated);
  };

  const handleWindowWidthChange = (sectionIndex, winIndex, value) => {
    const validationError = validateInput(value);
    setError(validationError);
    if (validationError) return;

    const updated = [...sections];
    updated[sectionIndex].windows[winIndex].width = value;
    setSections(updated);
  };

  const handleWindowHeightChange = (sectionIndex, winIndex, value) => {
    const validationError = validateInput(value);
    setError(validationError);
    if (validationError) return;

    const updated = [...sections];
    updated[sectionIndex].windows[winIndex].height = value;
    setSections(updated);
  };

  const handleDone = () => {
    try {
      const data = {
        ceilings: sections
          .filter(s => s.type === 'ceiling')
          .map((c, i) => ({
            id: i + 1,
            area: calculateArea(c.width, c.height),
            repaint: c.repaint,
            fresh: c.fresh,
          })),
        walls: sections
          .filter(s => s.type === 'wall')
          .map((w, i) => ({
            id: i + 1,
            area: calculateArea(w.width, w.height),
            repaint: w.repaint,
            fresh: w.fresh,
          })),
        items: sections
          .filter(s => s.type === 'wall')
          .flatMap((w, i) =>
            w.windows.map((win, j) => ({
              label: `Window ${j + 1} (Wall ${i + 1})`,
              area: calculateArea(win.width, win.height),
            })),
          ),
      };
      navigation.navigate('StartMeasurement', {roomName, data});
    } catch (e) {
      console.error('Navigation error:', e);
      setError('Failed to navigate: ' + e.message);
    }
  };

  const syncSectionStates = useCallback(() => {
    const updatedSections = sections.map(s => ({
      ...s,
      repaint: roomRepaint,
      fresh: roomFresh,
    }));
    setSections(updatedSections);
  }, [roomRepaint, roomFresh]);

  useEffect(() => {
    syncSectionStates();
  }, [syncSectionStates]);

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollViewRef}
        contentContainerStyle={styles.scrollContent}>
        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <View style={styles.radioRow}>
          <TouchableOpacity
            style={styles.radioOption}
            onPress={() => {
              setRoomRepaint(true);
              setRoomFresh(false);
              syncSectionStates();
            }}>
            <View
              style={[styles.checkbox, roomRepaint && styles.checkboxSelected]}
            />
            <Text
              style={[
                styles.checkboxLabel,
                roomRepaint && styles.checkboxLabelSelected,
              ]}>
              Repaint with Primer
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.radioOption}
            onPress={() => {
              setRoomFresh(true);
              setRoomRepaint(false);
              syncSectionStates();
            }}>
            <View
              style={[styles.checkbox, roomFresh && styles.checkboxSelected]}
            />
            <Text
              style={[
                styles.checkboxLabel,
                roomFresh && styles.checkboxLabelSelected,
              ]}>
              Fresh Paint
            </Text>
          </TouchableOpacity>
        </View>

        {sections.map((section, index) =>
          section.type === 'ceiling' ? (
            <View key={`ceiling-${index}`} style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionLabel}>
                  {section.label || `Ceiling ${index + 1}`}{' '}
                  {roomRepaint ? '' : roomFresh ? '' : ''}
                </Text>
                <Text style={styles.areaText}>
                  {calculateArea(section.width, section.height)} sq ft
                </Text>
              </View>
              <View style={styles.radioRow}>
                <View style={styles.radioOption}>
                  <View
                    style={[
                      styles.checkbox,
                      roomRepaint && styles.checkboxSelected,
                    ]}
                  />
                  <Text
                    style={[
                      styles.checkboxLabel,
                      roomRepaint && styles.checkboxLabelSelected,
                    ]}>
                    Repaint with Primer
                  </Text>
                </View>
                <View style={styles.radioOption}>
                  <View
                    style={[
                      styles.checkbox,
                      roomFresh && styles.checkboxSelected,
                    ]}
                  />
                  <Text
                    style={[
                      styles.checkboxLabel,
                      roomFresh && styles.checkboxLabelSelected,
                    ]}>
                    Fresh Paint
                  </Text>
                </View>
              </View>
              <View style={styles.inputRow}>
                <TextInput
                  placeholder="L"
                  style={styles.input}
                  keyboardType="numeric"
                  value={section.width}
                  onChangeText={text => handleWidthChange(index, text)}
                />
                <Text style={styles.multiply}>×</Text>
                <TextInput
                  placeholder="W"
                  style={styles.input}
                  keyboardType="numeric"
                  value={section.height}
                  onChangeText={text => handleHeightChange(index, text)}
                />
                <Text style={styles.equalSign}>=</Text>
                <Text style={styles.areaText}>
                  {calculateArea(section.width, section.height)}
                </Text>
              </View>
            </View>
          ) : (
            <View key={`wall-${index}`} style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionLabel}>
                  {section.label || `Wall ${index + 1}`}{' '}
                  {roomRepaint ? '' : roomFresh ? '' : ''}
                </Text>
                <Text style={styles.areaText}>
                  {calculateArea(section.width, section.height) +
                    section.windows.reduce(
                      (sum, win) => sum + calculateArea(win.width, win.height),
                      0,
                    )}{' '}
                  sq ft
                </Text>
              </View>
              <View style={styles.radioRow}>
                <View style={styles.radioOption}>
                  <View
                    style={[
                      styles.checkbox,
                      roomRepaint && styles.checkboxSelected,
                    ]}
                  />
                  <Text
                    style={[
                      styles.checkboxLabel,
                      roomRepaint && styles.checkboxLabelSelected,
                    ]}>
                    Repaint with Primer
                  </Text>
                </View>
                <View style={styles.radioOption}>
                  <View
                    style={[
                      styles.checkbox,
                      roomFresh && styles.checkboxSelected,
                    ]}
                  />
                  <Text
                    style={[
                      styles.checkboxLabel,
                      roomFresh && styles.checkboxLabelSelected,
                    ]}>
                    Fresh Paint
                  </Text>
                </View>
              </View>
              <View style={styles.inputRow}>
                <TextInput
                  placeholder="L"
                  style={styles.input}
                  keyboardType="numeric"
                  value={section.width}
                  onChangeText={text => handleWidthChange(index, text)}
                />
                <Text style={styles.multiply}>×</Text>
                <TextInput
                  placeholder="W"
                  style={styles.input}
                  keyboardType="numeric"
                  value={section.height}
                  onChangeText={text => handleHeightChange(index, text)}
                />
                <Text style={styles.equalSign}>=</Text>
                <Text style={styles.areaText}>
                  {calculateArea(section.width, section.height)}
                </Text>
              </View>

              {section.windows.map((win, winIndex) => (
                <View key={winIndex} style={styles.windowSection}>
                  <Text style={styles.windowLabel}>Window {winIndex + 1}</Text>
                  <View style={styles.inputRow}>
                    <TextInput
                      placeholder="L"
                      style={styles.input}
                      keyboardType="numeric"
                      value={win.width}
                      onChangeText={text =>
                        handleWindowWidthChange(index, winIndex, text)
                      }
                    />
                    <Text style={styles.multiply}>×</Text>
                    <TextInput
                      placeholder="W"
                      style={styles.input}
                      keyboardType="numeric"
                      value={win.height}
                      onChangeText={text =>
                        handleWindowHeightChange(index, winIndex, text)
                      }
                    />
                    <Text style={styles.equalSign}>=</Text>
                    <Text style={styles.areaText}>
                      {calculateArea(win.width, win.height)}
                    </Text>
                  </View>
                </View>
              ))}

              <View style={styles.iconRow}>
                <TouchableOpacity
                  style={styles.iconButton}
                  onPress={() => addWindow(index)}>
                  <Image
                    source={require('../../assets/icons/Add.png')}
                    style={styles.icon}
                  />
                  <Text style={styles.iconCheck}>Window</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.iconButton}>
                  <Image
                    source={require('../../assets/icons/Add.png')}
                    style={styles.icon}
                  />
                  <Text style={styles.iconCheck}>Door</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.iconButton}>
                  <Image
                    source={require('../../assets/icons/Add.png')}
                    style={styles.icon}
                  />
                  <Text style={styles.iconCheck}>Cupboard</Text>
                </TouchableOpacity>
              </View>
            </View>
          ),
        )}

        <TouchableOpacity onPress={addCeiling} style={styles.sectionButton}>
          <Text style={styles.sectionButtonText}>Add Ceiling</Text>
          <Ionicons name="add-circle" size={25} color="#4CAF50" />
        </TouchableOpacity>

        <TouchableOpacity onPress={addWall} style={styles.sectionButton}>
          <Text style={styles.sectionButtonText}>Add Wall</Text>
          <Ionicons name="add-circle" size={25} color="#4CAF50" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.doneButton} onPress={handleDone}>
          <Text style={styles.doneButtonText}>Done</Text>
        </TouchableOpacity>
        <View style={styles.underlineRed} />
      </ScrollView>
    </View>
  );
};

export default Bedroom1;
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F8F8',
    paddingTop: 20,
  },
  scrollContent: {
    paddingVertical: 10,
    paddingHorizontal: 15,
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    marginVertical: 10,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: {width: 0, height: 1},
    shadowRadius: 3,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  sectionLabel: {
    color: '#000000',
    fontSize: 14,
    fontFamily: 'Poppins-SemiBold',
  },
  areaText: {
    color: '#000000',
    fontSize: 14,
    fontFamily: 'Poppins-SemiBold',
  },
  radioRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 15,
    height: 15,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#ED1F24',
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxSelected: {
    backgroundColor: '#ED1F24',
  },
  checkboxLabel: {
    color: '#000000',
    fontSize: 13,
    fontFamily: 'Poppins-SemiBold',
  },
  checkboxLabelSelected: {
    color: '#000000',
    fontFamily: 'Poppins-SemiBold',
    fontSize: 12,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ED1F24',
    paddingHorizontal: 10,
    height: 40,
    width: 80,
    borderRadius: 5,
    marginHorizontal: 5,
    textAlign: 'center',
  },
  multiply: {
    fontSize: 16,
    color: '#000000',
    marginHorizontal: 5,
  },
  equalSign: {
    fontSize: 16,
    color: '#000',
    marginHorizontal: 5,
  },
  iconRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  iconButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    width: 18,
    height: 18,
    marginRight: 5,
  },
  iconCheck: {
    color: '#000000',
    fontSize: 12,
    fontFamily: 'Poppins-SemiBold',
  },
  infoText: {
    color: '#ED1F24',
    fontSize: 12,
    marginTop: 5,
    fontFamily: 'Poppins-Medium',
  },
  windowSection: {
    marginVertical: 10,
    paddingLeft: 10,
  },
  windowLabel: {
    fontSize: 13,

    color: '#000',
    marginBottom: 4,
    fontFamily: 'Poppins-SemiBold',
  },
  sectionButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 15,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: {width: 0, height: 1},
    shadowRadius: 3,
    elevation: 2,
  },
  sectionButtonText: {
    color: '#000000',
    fontFamily: 'Poppins-SemiBold',
    fontSize: 14,
  },
  doneButton: {
    backgroundColor: '#FF0000',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 20,
  },
  doneButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  underlineRed: {
    height: 5,
    width: '35%',
    backgroundColor: '#ED1F24',
    alignSelf: 'center',
    borderRadius: 20,
    marginBottom: 30,
  },
  errorText: {
    color: '#ED1F24',
    fontSize: 12,
    marginBottom: 10,
    textAlign: 'center',
    fontFamily: 'Poppins-SemiBold',
  },
});
