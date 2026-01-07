import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  TextInput,
  Image,
  Modal,
  Alert,
} from 'react-native';
import { getRequest } from '../../../ApiService/apiHelper';
import { API_BASE_URL, API_ENDPOINTS } from '../../../ApiService/apiConstants';
import PageLoader from '../../../components/PageLoader';
import Entypo from 'react-native-vector-icons/Entypo';
import { useNavigation, useRoute } from '@react-navigation/native';
import axios from 'axios';

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
  const navigation = useNavigation();
  const route = useRoute();
  const { quoteId, roomName, surfaceType, loadedAdditionalServices } =
    route.params || {};
  console.log('route params', route.params);
  const [expandedIndex, setExpandedIndex] = useState(null);

  console.log('loadedAdditionalServices', loadedAdditionalServices);

  // Textures states
  const [textureMaterialType, setTextureMaterialType] = useState('');
  const [texturePaintOption, setTexturePaintOption] = useState('without');
  // Waterproofing states
  const [waterproofMaterialType, setWaterproofMaterialType] = useState('');
  const [waterproofArea, setWaterproofArea] = useState('');
  const [waterproofPaintOption, setWaterproofPaintOption] = useState('with');
  // terrace proofing states
  const [terraceMaterialType, setTerraceMaterialType] = useState('');
  const [terraceArea, setTerraceArea] = useState('');
  const [terracePaintOption, setTerracePaintOption] = useState('without');
  // tile grouting states
  const [tileMaterialType, setTileMaterialType] = useState('');
  const [tileArea, setTileArea] = useState('');
  const [tilePaintOption, setTilePaintOption] = useState('without');
  // pop states
  const [popMaterialType, setPopMaterialType] = useState('');
  const [popArea, setPopArea] = useState('');
  const [popPaintOption, setPopPaintOption] = useState('without');
  // wood polish states
  const [woodMaterialType, setWoodMaterialType] = useState('');
  const [woodArea, setWoodArea] = useState('');
  const [woodPaintOption, setWoodPaintOption] = useState('without');
  // others states
  const [otherServiceName, setOtherServiceName] = useState('');
  const [otherServicePrice, setOtherServicePrice] = useState('');
  const [othersArea, setOthersArea] = useState('');
  const [othersPaintOption, setOthersPaintOption] = useState('without');

  const [loading, setLoading] = useState(false);
  const [paintType, setPaintType] = useState([]);

  const fetchFinishingPaints = async () => {
    setLoading(true);

    try {
      const response = await getRequest(
        `${API_ENDPOINTS.GET_ALL_FINISHING_PAINTS}`,
      );
      console.log('response', response.data);

      if (response) {
        setPaintType(response.data);
      }
    } catch (err) {
      console.log('Error fetching paints:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFinishingPaints();
  }, []);

  // POP states (example, you can add more)
  const [popOption, setPopOption] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [painHead, setPaintHead] = useState('');

  const openModalPopup = type => {
    setPaintHead(type);
    const filterType = paintType.filter(item => item.productType === type);
    setPopOption(filterType);
    setIsModalOpen(true);
  };
  console.log('popOption', popOption);

  const handleDone = () => {
    setIsModalOpen(false);
  };
  const handleClose = () => {
    setIsModalOpen(false);
    setPopOption(null);
  };
  const toggleExpand = index => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  const row = (
    serviceType,
    { materialName, withPaint, areaSqft, unitPrice, customName, customNote },
    materialId,
  ) => ({
    serviceType,
    materialId,
    materialName: materialName || '',
    surfaceType: surfaceType,
    withPaint: withPaint === 'with',
    areaSqft: Number(areaSqft || 0),
    unitPrice: Number(unitPrice || 0),
    total: Number(
      ((Number(areaSqft || 0) || 0) * (Number(unitPrice || 0) || 0)).toFixed(2),
    ),
    customName: customName || '',
    customNote: customNote || '',
  });

  // returns {unitPrice, materialId} for a chosen name within a productType
  const resolveMaterial = (productType, pickedName, withOrWithout) => {
    const list = paintType.filter(p => p.productType === productType);
    const m = list.find(x => x.paintName === pickedName);
    if (!m) return { unitPrice: 0, materialId: undefined };

    // BASIC RULE: single price field from API
    let unit = Number(m.paintPrice || 0);

    // TODO: If you later add separate prices, switch here:
    // if (withOrWithout === 'without' && m.priceWithoutPaint) unit = m.priceWithoutPaint;

    return { unitPrice: unit, materialId: String(m._id || m.id || '') };
  };

  const buildPayload = () => {
    const items = [];

    // Textures
    if (textureMaterialType) {
      const { unitPrice, materialId } = resolveMaterial(
        'Texture',
        textureMaterialType,
        texturePaintOption,
      );
      // Textures screen has no area input; if you need area, add input & state. Assume 0 means flat → total 0 unless you add per-room dataset.
      items.push(
        row(
          'Textures',
          {
            materialName: textureMaterialType,
            withPaint: texturePaintOption,
            surfaceType: surfaceType,
            areaSqft: 0, // set if you add area input for textures
            unitPrice,
          },
          materialId,
        ),
      );
    }

    // Chemical Waterproofing
    if (waterproofMaterialType && Number(waterproofArea) > 0) {
      const { unitPrice, materialId } = resolveMaterial(
        'Chemical Waterproofing',
        waterproofMaterialType,
        waterproofPaintOption,
      );
      items.push(
        row(
          'Chemical Waterproofing',
          {
            materialName: waterproofMaterialType,
            withPaint: waterproofPaintOption,
            surfaceType: surfaceType,
            areaSqft: waterproofArea,
            unitPrice,
          },
          materialId,
        ),
      );
    }

    // Terrace Waterproofing
    if (terraceMaterialType && Number(terraceArea) > 0) {
      const { unitPrice, materialId } = resolveMaterial(
        'Terrace Waterproofing',
        terraceMaterialType,
        terracePaintOption,
      );
      items.push(
        row(
          'Terrace Waterproofing',
          {
            materialName: terraceMaterialType,
            withPaint: terracePaintOption,
            surfaceType: surfaceType,
            areaSqft: terraceArea,
            unitPrice,
          },
          materialId,
        ),
      );
    }

    // Tile Grouting
    if (tileMaterialType && Number(tileArea) > 0) {
      const { unitPrice, materialId } = resolveMaterial(
        'Tile Grouting',
        tileMaterialType,
        tilePaintOption,
      );
      items.push(
        row(
          'Tile Grouting',
          {
            materialName: tileMaterialType,
            withPaint: tilePaintOption,
            surfaceType: surfaceType,
            areaSqft: tileArea,
            unitPrice,
          },
          materialId,
        ),
      );
    }

    // POP
    if (popMaterialType && Number(popArea) > 0) {
      const { unitPrice, materialId } = resolveMaterial(
        'POP',
        popMaterialType,
        popPaintOption,
      );
      items.push(
        row(
          'POP',
          {
            materialName: popMaterialType,
            withPaint: popPaintOption,
            surfaceType: surfaceType,
            areaSqft: popArea,
            unitPrice,
          },
          materialId,
        ),
      );
    }

    // Wood Polish
    if (woodMaterialType && Number(woodArea) > 0) {
      const { unitPrice, materialId } = resolveMaterial(
        'Wood Polish',
        woodMaterialType,
        woodPaintOption,
      );
      items.push(
        row(
          'Wood Polish',
          {
            materialName: woodMaterialType,
            withPaint: woodPaintOption,
            surfaceType: surfaceType,
            areaSqft: woodArea,
            unitPrice,
          },
          materialId,
        ),
      );
    }

    // Others (free-form). If area is 0, treat as flat (total = 0 unless you interpret unitPrice as flat; easiest: require area)
    if (otherServiceName && Number(otherServicePrice) > 0) {
      const areaVal = Number(othersArea || 0);
      const unit = Number(otherServicePrice || 0);
      items.push({
        serviceType: 'Others',
        materialId: undefined,
        materialName: otherServiceName,
        surfaceType: surfaceType,
        withPaint: othersPaintOption === 'with',
        areaSqft: areaVal,
        unitPrice: unit,
        total: Number((areaVal * unit).toFixed(2)),
        customName: otherServiceName,
        customNote: '',
      });
    }

    return { items };
  };

  const onContinue = async () => {
    try {
      setLoading(true);
      const payload = buildPayload();

      const { data } = await axios.post(
        `${API_BASE_URL}${
          API_ENDPOINTS.ADD_ADDITIONAL_SERVICE
        }${encodeURIComponent(quoteId)}/rooms/${encodeURIComponent(
          roomName,
        )}/additional-services`,
        payload,
      );

      const respData = data?.data || {
        roomName,
        additionalServices: payload.items || [],
        additionalTotal: (payload.items || []).reduce(
          (s, it) => s + Number(it.total || 0),
          0,
        ),
      };

      // update SelectRoom (if provided)
      route.params?.onSavedAdditional?.(
        respData?.roomName || roomName,
        respData,
      );

      // update SelectPaint immediately
      // route.params?.onSavedAdditionalLocal?.(respData);

      navigation.goBack();
    } catch (err) {
      console.log('save additional services error', err?.response?.data || err);
      Alert.alert(
        'Error',
        err?.response?.data?.message || 'Failed to save additional services',
      );
      console.log(
        'Error saving additional services:',
        err?.response?.data?.message,
      );
    } finally {
      setLoading(false);
    }
  };

  const renderTextures = () => (
    <View style={styles.expandedContent}>
      <TouchableOpacity
        style={styles.selector}
        onPress={() => openModalPopup('Texture')}
      >
        <Text style={styles.selectorText}>
          {textureMaterialType || 'Select material type'}
        </Text>
      </TouchableOpacity>
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
  const renderWaterProofing = () => (
    <View style={styles.expandedContent}>
      <TouchableOpacity
        style={styles.selector}
        onPress={() => openModalPopup('Chemical Waterproofing')}
      >
        <Text style={styles.selectorText}>
          {waterproofMaterialType || 'Select material type'}
        </Text>
      </TouchableOpacity>
      <Text style={styles.selectLabel}>Area</Text>
      <TextInput
        style={[styles.input]}
        placeholder="Area in sqft"
        placeholderTextColor={'#999'}
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
  const renderTerraceProofing = () => (
    <View style={styles.expandedContent}>
      <TouchableOpacity
        style={styles.selector}
        onPress={() => openModalPopup('Terrace Waterproofing')}
      >
        <Text style={styles.selectorText}>
          {terraceMaterialType || 'Select material type'}
        </Text>
      </TouchableOpacity>
      <Text style={styles.selectLabel}>Area</Text>
      <TextInput
        style={[styles.input]}
        placeholder="Area in sqft"
        placeholderTextColor={'#999'}
        value={terraceArea}
        onChangeText={setTerraceArea}
        keyboardType="numeric"
      />

      <Text style={styles.selectLabel}>Select</Text>
      <View style={styles.radioContainer}>
        <TouchableOpacity
          style={styles.radioButton}
          onPress={() => setTerracePaintOption('with')}
        >
          <View style={styles.radioCircle}>
            {terracePaintOption === 'with' && (
              <View style={styles.selectedRb} />
            )}
          </View>
          <Text style={styles.radioText}>With Paint</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.radioButton}
          onPress={() => setTerracePaintOption('without')}
        >
          <View style={styles.radioCircle}>
            {terracePaintOption === 'without' && (
              <View style={styles.selectedRb} />
            )}
          </View>
          <Text style={styles.radioText}>Without Paint</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
  const renderTileGrouting = () => (
    <View style={styles.expandedContent}>
      <TouchableOpacity
        style={styles.selector}
        onPress={() => openModalPopup('Tile Grouting')}
      >
        <Text style={styles.selectorText}>
          {tileMaterialType || 'Select material type'}
        </Text>
      </TouchableOpacity>
      <Text style={styles.selectLabel}>Area</Text>
      <TextInput
        style={[styles.input]}
        placeholder="Area in sqft"
        placeholderTextColor={'#999'}
        value={tileArea}
        onChangeText={setTileArea}
        keyboardType="numeric"
      />

      <Text style={styles.selectLabel}>Select</Text>
      <View style={styles.radioContainer}>
        <TouchableOpacity
          style={styles.radioButton}
          onPress={() => setTilePaintOption('with')}
        >
          <View style={styles.radioCircle}>
            {tilePaintOption === 'with' && <View style={styles.selectedRb} />}
          </View>
          <Text style={styles.radioText}>With Paint</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.radioButton}
          onPress={() => setTilePaintOption('without')}
        >
          <View style={styles.radioCircle}>
            {tilePaintOption === 'without' && (
              <View style={styles.selectedRb} />
            )}
          </View>
          <Text style={styles.radioText}>Without Paint</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
  const renderPop = () => (
    <View style={styles.expandedContent}>
      <TouchableOpacity
        style={styles.selector}
        onPress={() => openModalPopup('POP')}
      >
        <Text style={styles.selectorText}>
          {popMaterialType || 'Select material type'}
        </Text>
      </TouchableOpacity>
      <Text style={styles.selectLabel}>Area</Text>
      <TextInput
        style={[styles.input]}
        placeholder="Area in sqft"
        placeholderTextColor={'#999'}
        value={popArea}
        onChangeText={setPopArea}
        keyboardType="numeric"
      />

      <Text style={styles.selectLabel}>Select</Text>
      <View style={styles.radioContainer}>
        <TouchableOpacity
          style={styles.radioButton}
          onPress={() => setPopPaintOption('with')}
        >
          <View style={styles.radioCircle}>
            {popPaintOption === 'with' && <View style={styles.selectedRb} />}
          </View>
          <Text style={styles.radioText}>With Paint</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.radioButton}
          onPress={() => setPopPaintOption('without')}
        >
          <View style={styles.radioCircle}>
            {popPaintOption === 'without' && <View style={styles.selectedRb} />}
          </View>
          <Text style={styles.radioText}>Without Paint</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
  const renderWoodPolish = () => (
    <View style={styles.expandedContent}>
      <TouchableOpacity
        style={styles.selector}
        onPress={() => openModalPopup('Wood Polish')}
      >
        <Text style={styles.selectorText}>
          {woodMaterialType || 'Select material type'}
        </Text>
      </TouchableOpacity>
      <Text style={styles.selectLabel}>Area</Text>
      <TextInput
        style={[styles.input]}
        placeholder="Area in sqft"
        placeholderTextColor={'#999'}
        value={woodArea}
        onChangeText={setWoodArea}
        keyboardType="numeric"
      />

      <Text style={styles.selectLabel}>Select</Text>
      <View style={styles.radioContainer}>
        <TouchableOpacity
          style={styles.radioButton}
          onPress={() => setWoodPaintOption('with')}
        >
          <View style={styles.radioCircle}>
            {woodPaintOption === 'with' && <View style={styles.selectedRb} />}
          </View>
          <Text style={styles.radioText}>With Paint</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.radioButton}
          onPress={() => setWoodPaintOption('without')}
        >
          <View style={styles.radioCircle}>
            {woodPaintOption === 'without' && (
              <View style={styles.selectedRb} />
            )}
          </View>
          <Text style={styles.radioText}>Without Paint</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
  const renderOthers = () => (
    <View style={styles.expandedContent}>
      <TextInput
        style={[styles.input]}
        placeholder="Enter Name of Service"
        placeholderTextColor={'#999'}
        value={otherServiceName}
        onChangeText={setOtherServiceName}
      />
      <TextInput
        style={[styles.input]}
        placeholder="Price"
        placeholderTextColor={'#999'}
        value={otherServicePrice}
        onChangeText={setOtherServicePrice}
        keyboardType="numeric"
      />
      <TextInput
        style={[styles.input]}
        placeholder="Area in sqft"
        placeholderTextColor={'#999'}
        value={othersArea}
        onChangeText={setOthersArea}
        keyboardType="numeric"
      />

      <Text style={styles.selectLabel}>Select</Text>
      <View style={styles.radioContainer}>
        <TouchableOpacity
          style={styles.radioButton}
          onPress={() => setOthersPaintOption('with')}
        >
          <View style={styles.radioCircle}>
            {othersPaintOption === 'with' && <View style={styles.selectedRb} />}
          </View>
          <Text style={styles.radioText}>With Paint</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.radioButton}
          onPress={() => setOthersPaintOption('without')}
        >
          <View style={styles.radioCircle}>
            {othersPaintOption === 'without' && (
              <View style={styles.selectedRb} />
            )}
          </View>
          <Text style={styles.radioText}>Without Paint</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
  const renderItem = ({ item, index }) => {
    const isExpanded = index === expandedIndex;

    return (
      <View style={styles.parentView}>
        <TouchableOpacity
          style={styles.row}
          onPress={() => toggleExpand(index)}
        >
          <Text style={styles.rowText}>{item}</Text>
          {/* <Image
            source={require('../../assets/icons/arrowredcircle.png')}
            style={styles.iconStyle}
          /> */}
          <Entypo name="chevron-with-circle-right" size={18} color="#FF0000" />
        </TouchableOpacity>

        {isExpanded && (
          <>
            {item === 'Textures' && renderTextures()}
            {item === 'Waterproofing' && renderWaterProofing()}
            {item === 'Terrace Waterproofing' && renderTerraceProofing()}
            {item === 'Tile Grouting' && renderTileGrouting()}
            {item === 'POP' && renderPop()}
            {item === 'Wood Polish' && renderWoodPolish()}
            {item === 'Others' && renderOthers()}
          </>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {loading && <PageLoader />}
      {/* <Text style={styles.header}>Additional Services</Text> */}
      <FlatList
        data={services}
        keyExtractor={item => item}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 100 }}
      />
      <View style={styles.footer}>
        <TouchableOpacity style={styles.continueButton} onPress={onContinue}>
          <Text style={styles.continueText}>Continue</Text>
        </TouchableOpacity>
      </View>
      <Modal visible={isModalOpen} transparent animationType="slide">
        <View style={styles.overlay}>
          <View style={styles.modalBox}>
            <View style={styles.header}>
              <Text style={styles.title}>{painHead}</Text>
              <TouchableOpacity onPress={handleClose}>
                <Text style={styles.close}>✕</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={popOption}
              keyExtractor={item => item._id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.item}
                  onPress={() => {
                    if (expandedIndex === 0) {
                      setTextureMaterialType(item.paintName);
                    } else if (expandedIndex === 1) {
                      setWaterproofMaterialType(item.paintName);
                    } else if (expandedIndex === 2) {
                      setTerraceMaterialType(item.paintName);
                    } else if (expandedIndex === 3) {
                      setTileMaterialType(item.paintName);
                    } else if (expandedIndex === 4) {
                      setPopMaterialType(item.paintName);
                    } else if (expandedIndex === 5) {
                      setWoodMaterialType(item.paintName);
                    }
                    // Add similar conditions for other services if needed
                    setIsModalOpen(false);
                    setPopOption(null);
                  }}
                >
                  <Text style={styles.itemText}>{item.paintName}</Text>
                  <Text style={styles.price}>₹ {item.paintPrice}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f0f0', paddingTop: 20 },
  header: {
    padding: 15,
    fontSize: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    backgroundColor: '#fff',
    fontFamily: 'Poppins-SemiBold',
  },
  parentView: {
    marginHorizontal: 15,
    marginBottom: 10,
    backgroundColor: '#fff',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    // marginVertical: 7,
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 6,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    fontFamily: 'Poppins-SemiBold',
  },
  rowText: { fontSize: 13, color: '#222', fontFamily: 'Poppins-SemiBold' },

  expandedContent: {
    // marginHorizontal: 15,
    // padding: 15,
    borderRadius: 6,
    // marginBottom: 10,
    fontFamily: 'Poppins-SemiBold',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontFamily: 'Poppins-SemiBold',
    color: 'black',
    fontSize: 13,
    marginBottom: 10,
  },
  selectLabel: {
    color: '#d31a1a',
    fontFamily: 'Poppins-SemiBold',
  },
  radioContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginTop: 10,
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
    fontSize: 13,
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
  selector: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 12,
    borderRadius: 7,
    marginVertical: 15,
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
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  title: { fontSize: 16, fontFamily: 'Poppins-SemiBold' },
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
  star: {
    fontSize: 16,
    color: 'gold',
    marginRight: 4,
    marginTop: -3,
    fontFamily: 'Poppins-Medium',
  },
});
