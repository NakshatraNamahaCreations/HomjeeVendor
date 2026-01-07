// PaintDropdownModal.js
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  FlatList,
  StyleSheet,
} from 'react-native';

export default function PaintDropdownModal({
  value,
  onChange,
  options,
  placeholder = 'Type of Paint',
}) {
  const [visible, setVisible] = useState(false);
  const [selected, setSelected] = useState(value);

  const handleSelect = item => {
    setSelected(item);
    onChange?.(selected);
    setVisible(false);
  };

  return (
    <View style={styles.container}>
      {/* Trigger Button */}
      <TouchableOpacity
        style={styles.selector}
        onPress={() => setVisible(true)}
      >
        <Text style={styles.selectorText}>
          {selected?.paintName || placeholder}
        </Text>
      </TouchableOpacity>

      {/* Modal */}
      <Modal visible={visible} transparent animationType="slide">
        <View style={styles.overlay}>
          <View style={styles.modalBox}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.title}>Type of Paint</Text>
              <TouchableOpacity onPress={() => setVisible(false)}>
                <Text style={styles.close}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* List */}
            <FlatList
              data={options}
              keyExtractor={item => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.item,
                    selected?.id === item.id && styles.selectedItem,
                  ]}
                  onPress={() => handleSelect(item)}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    {item.isSpecial && <Text style={styles.star}>⭐</Text>}
                    <Text style={styles.itemText}>{item.paintName}</Text>
                  </View>
                  <Text style={styles.price}>
                    (Rs. {item.price.toFixed(2)})
                  </Text>
                </TouchableOpacity>
              )}
            />

            {/* Footer */}
            {/* <TouchableOpacity style={styles.doneBtn} onPress={handleDone}>
              <Text style={styles.doneText}>Done</Text>
            </TouchableOpacity> */}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginHorizontal: 20, marginTop: 10 },
  selector: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
  },
  selectorText: { fontSize: 14, color: '#000', fontFamily: 'Poppins-Medium' },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.64)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBox: {
    backgroundColor: 'white',
    // borderRadius: 10,
    maxHeight: '80%',
    width: '100%',
    alignSelf: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  title: { fontSize: 16, fontFamily: 'Poppins-Bold' },
  close: { fontSize: 18, color: 'red', fontFamily: 'Poppins-Bold' },
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  selectedItem: { backgroundColor: '#f0f8ff' },
  itemText: { fontSize: 14, fontFamily: 'Poppins-Medium' },
  price: { fontSize: 14, color: '#555', fontFamily: 'Poppins-Medium' },
  star: { fontSize: 14, color: 'gold', marginTop: -5, marginRight: 4 },
  doneBtn: {
    backgroundColor: '#ED1F24',
    padding: 15,
    alignItems: 'center',
  },
  doneText: { color: 'white', fontFamily: 'Poppins-SemiBold', fontSize: 16 },
});
