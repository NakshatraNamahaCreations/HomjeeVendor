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
    onChange?.(item); // pass selected value to parent
  };

  const label = value ? value.name || value.label : placeholder;

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.selector}
        onPress={() => setVisible(true)}
      >
        <Text style={styles.selectorText}>{label}</Text>
      </TouchableOpacity>

      <Modal visible={visible} transparent animationType="slide">
        <View style={styles.overlay}>
          <View style={styles.modalBox}>
            <View style={styles.header}>
              <Text style={styles.title}>Type of Paint</Text>
              <TouchableOpacity onPress={() => setVisible(false)}>
                <Text style={styles.close}>✕</Text>
              </TouchableOpacity>
            </View>

            <FlatList
              data={options}
              keyExtractor={item => item._id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.item,
                    selected?._id === item._id && styles.selectedItem,
                  ]}
                  onPress={() => {
                    handleSelect(item); // update selected value
                    setVisible(false); // close modal immediately
                  }}
                >
                  <View style={{
                    justifyContent: 'flex-start',
                    flex: 0.7
                  }}>
                    {item.isSpecial && <Text style={styles.star}>⭐ </Text>}
                    <Text style={styles.itemText}>{item.name}</Text>
                  </View>
                  <Text style={styles.price}>
                    (Rs. {item.price.toFixed(2)})
                  </Text>
                </TouchableOpacity>
              )}
            />

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
    padding: 12,
    borderRadius: 7,
    backgroundColor: 'white',
  },
  selectorText: { fontSize: 14, color: '#000', fontFamily: 'Poppins-Medium' },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.56)',
    justifyContent: 'center',
  },
  modalBox: {
    backgroundColor: 'white',
    maxHeight: '80%',
    // width: '100%',
    margin: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  title: { fontSize: 16, fontFamily: 'Poppins-SemiBold' },
  close: { fontSize: 18, color: 'red', fontFamily: 'Poppins-Bold' },
  item: {
    flexDirection: 'row',
    flex: 1, alignItems: "center",
    // justifyContent: 'space-between',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  selectedItem: { backgroundColor: '#f0f8ff' },
  itemText: { fontSize: 13, fontFamily: 'Poppins-Medium' },
  price: { flex: 0.3, flexDirection: "row", justifyContent: "flex-end", fontSize: 13, color: '#555', fontFamily: 'Poppins-Medium' },
  star: {
    fontSize: 16,
    color: 'gold',
    marginRight: 4,
    marginTop: -3,
    fontFamily: 'Poppins-Medium',
  },
});
