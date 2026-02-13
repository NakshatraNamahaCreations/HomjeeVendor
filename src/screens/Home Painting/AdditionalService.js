import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  TextInput,
  Modal,
  Alert,
} from 'react-native';
import axios from 'axios';
import { useNavigation, useRoute } from '@react-navigation/native';
import { getRequest } from '../../ApiService/apiHelper';
import { API_BASE_URL, API_ENDPOINTS } from '../../ApiService/apiConstants';
import PageLoader from '../../components/PageLoader';
import Entypo from 'react-native-vector-icons/Entypo';
import { useVendorContext } from '../../Utilities/VendorContext';

const services = [
  'Textures',
  'Waterproofing',
  'Terrace Waterproofing',
  'Tile Grouting',
  'POP',
  'Wood Polish',
  'Others',
];

const norm = s => String(s || '').trim().toLowerCase().replace(/\s+/g, ' ');
const rupee = n => `₹ ${Number(n || 0).toFixed(2)}`;

export default function AdditionalServices() {
  const { vendorDataContext } = useVendorContext();
  const vendorCity = vendorDataContext.vendor.city
  const navigation = useNavigation();
  const route = useRoute();
  const { quoteId, roomName, surfaceType, surfaceRef, breakdownItem } =
    route.params || {};

  const [expandedIndex, setExpandedIndex] = useState(null);
  const [existingForSurface, setExistingForSurface] = useState([]);

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
  const [terracePaintOption, setTerracePaintOption] = useState('with');

  // tile grouting states
  const [tileMaterialType, setTileMaterialType] = useState('');
  const [tileArea, setTileArea] = useState('');
  const [tilePaintOption, setTilePaintOption] = useState('with');

  // pop states
  const [popMaterialType, setPopMaterialType] = useState('');
  const [popArea, setPopArea] = useState('');
  const [popPaintOption, setPopPaintOption] = useState('with');

  // wood polish states
  const [woodMaterialType, setWoodMaterialType] = useState('');
  const [woodArea, setWoodArea] = useState('');
  const [woodPaintOption, setWoodPaintOption] = useState('with');

  // others states
  const [otherServiceName, setOtherServiceName] = useState('');
  const [otherServicePrice, setOtherServicePrice] = useState('');
  const [othersArea, setOthersArea] = useState('');
  const [othersPaintOption, setOthersPaintOption] = useState('with');

  const [loading, setLoading] = useState(false);
  const [paintType, setPaintType] = useState([]);

  // ✅ fallback sqft for "WITHOUT paint" when area not entered (Textures etc.)
  const [surfaceSqftFallback, setSurfaceSqftFallback] = useState(0);

  const fetchFinishingPaints = async () => {
    setLoading(true);
    try {
      const response = await getRequest(`${API_ENDPOINTS.GET_ALL_FINISHING_PAINTS}?city=${vendorCity}`);
      if (response) setPaintType(response.data || []);
    } catch (err) {
      console.log('Error fetching paints:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFinishingPaints();
  }, []);

  const findBreakdownSqftBySurfaceRef = (line, ref) => {
    try {
      if (!line || !ref?.type || ref?.index == null) return 0;

      const bd = Array.isArray(line.breakdown) ? line.breakdown : [];
      const targetType = String(ref.type); // "Wall" | "Ceiling" | "Measurement"
      const targetIndex = Number(ref.index);
      const targetMode = ref.mode ? String(ref.mode) : null;

      // Prefer exact match by displayIndex (since you already store it)
      let candidates = bd.filter(b => String(b.type) === targetType);
      if (targetMode) {
        const modeFiltered = candidates.filter(b => String(b.mode || '') === targetMode);
        if (modeFiltered.length) candidates = modeFiltered;
      }

      // If displayIndex exists, use it
      const hitByDisplay = candidates.find(b => Number(b.displayIndex) === targetIndex);
      if (hitByDisplay) return Number(hitByDisplay.sqft || 0);

      // Else fallback: ordinal position within that type
      const ordered = candidates.slice().sort((a, b) => {
        const da = Number(a.displayIndex || 0);
        const db = Number(b.displayIndex || 0);
        if (da && db) return da - db;
        return 0;
      });

      const byOrdinal = ordered[targetIndex - 1];
      return Number(byOrdinal?.sqft || 0);
    } catch (e) {
      console.log('findBreakdownSqftBySurfaceRef error', e);
      return 0;
    }
  };

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const { data } = await axios.get(
          `${API_BASE_URL}${API_ENDPOINTS.GET_QUOTATION}${encodeURIComponent(quoteId)}`,
        );

        const quote = data?.data?.quote || data?.data || null;

        const line = (quote?.lines || []).find(
          l => norm(l?.roomName) === norm(roomName),
        );

        // ✅ compute surface fallback sqft
        const refSqft = findBreakdownSqftBySurfaceRef(line, surfaceRef);
        const directSqft = Number(breakdownItem?.sqft || 0);
        const fallback = directSqft > 0 ? directSqft : refSqft;
        if (mounted) setSurfaceSqftFallback(fallback);

        // existing additional services for this surface
        const list = (line?.additionalServices || []).filter(
          s => norm(s?.surfaceType) === norm(surfaceType),
        );

        if (!mounted) return;

        setExistingForSurface(list);

        // PREFILL each section’s state from what’s saved
        for (const s of list) {
          const opt = s.withPaint ? 'with' : 'without';

          if (s.serviceType === 'Textures') {
            setTextureMaterialType(s.materialName || '');
            setTexturePaintOption(opt);
          } else if (s.serviceType === 'Chemical Waterproofing') {
            setWaterproofMaterialType(s.materialName || '');
            setWaterproofPaintOption(opt);
            setWaterproofArea(String(s.areaSqft || ''));
          } else if (s.serviceType === 'Terrace Waterproofing') {
            setTerraceMaterialType(s.materialName || '');
            setTerracePaintOption(opt);
            setTerraceArea(String(s.areaSqft || ''));
          } else if (s.serviceType === 'Tile Grouting') {
            setTileMaterialType(s.materialName || '');
            setTilePaintOption(opt);
            setTileArea(String(s.areaSqft || ''));
          } else if (s.serviceType === 'POP') {
            setPopMaterialType(s.materialName || '');
            setPopPaintOption(opt);
            setPopArea(String(s.areaSqft || ''));
          } else if (s.serviceType === 'Wood Polish') {
            setWoodMaterialType(s.materialName || '');
            setWoodPaintOption(opt);
            setWoodArea(String(s.areaSqft || ''));
          } else if (s.serviceType === 'Others') {
            setOtherServiceName(s.materialName || s.customName || '');
            setOthersPaintOption(opt);
            setOthersArea(String(s.areaSqft || ''));
            setOtherServicePrice(String(s.unitPrice || ''));
          }
        }
      } catch (e) {
        console.log('prefill fetch error', e?.response?.data || e);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [quoteId, roomName, surfaceType, surfaceRef, breakdownItem]);

  const existingByType = useMemo(() => {
    const m = {};
    for (const s of existingForSurface) {
      const k = s.serviceType || 'Others';
      if (!m[k]) m[k] = [];
      m[k].push(s);
    }
    return m;
  }, [existingForSurface]);

  const isSameService = (a, b) =>
    String(a.materialId || '') === String(b.materialId || '') &&
    (a.materialName || a.customName || '') ===
    (b.materialName || b.customName || '') &&
    (a.serviceType || '') === (b.serviceType || '') &&
    (a.surfaceType || '') === (b.surfaceType || '') &&
    !!a.withPaint === !!b.withPaint &&
    Number(a.areaSqft || 0) === Number(b.areaSqft || 0) &&
    Number(a.unitPrice || 0) === Number(b.unitPrice || 0);

  const confirmDelete = s =>
    Alert.alert('Delete', 'Remove this additional service?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => onDeleteExisting(s) },
    ]);

  const onDeleteExisting = async s => {
    try {
      setLoading(true);
      await axios.delete(
        `${API_BASE_URL}${API_ENDPOINTS.DELETE_ADDITIONAL_SERVICE}` +
        `${encodeURIComponent(quoteId)}/rooms/${encodeURIComponent(roomName)}/additional-services`,
        {
          data: {
            where: {
              surfaceType,
              serviceType: s.serviceType,
              materialId: s.materialId,
              materialName: s.materialName,
              withPaint: s.withPaint,
              areaSqft: s.areaSqft,
              unitPrice: s.unitPrice,
              customName: s.customName,
            },
          },
        },
      );

      setExistingForSurface(prev => prev.filter(x => !isSameService(x, s)));
    } catch (e) {
      Alert.alert('Error', e?.response?.data?.message || 'Delete failed');
    } finally {
      setLoading(false);
    }
  };

  const renderSavedFor = serviceType => {
    const list = existingByType[serviceType] || [];
    if (!list.length) return null;

    return (
      <View style={styles.savedWrap}>
        <Text style={styles.savedHeader}>Saved</Text>
        {list.map((s, i) => {
          const line = `${s.areaSqft} sq ft × ₹${s.unitPrice} = ${rupee(s.total)}`;
          return (
            <View key={`${serviceType}-${i}`} style={styles.savedCard}>
              <View style={styles.savedTop}>
                <Text style={styles.savedName}>{s.materialName || s.serviceType}</Text>
                <Text style={styles.savedAmt}>{rupee(s.total)}</Text>
              </View>
              <Text style={styles.savedMeta}>{line}</Text>
              <Text
                style={[
                  styles.savedFlag,
                  { color: s.withPaint ? '#066a36' : '#b22222' },
                ]}
              >
                ({s.withPaint ? 'With Paint' : 'Without Paint'})
              </Text>

              <View style={{ flexDirection: 'row', gap: 12, marginTop: 6 }}>
                <TouchableOpacity
                  style={{
                    paddingVertical: 6,
                    paddingHorizontal: 10,
                    borderWidth: 1,
                    borderColor: '#f2c3c3',
                    borderRadius: 8,
                    backgroundColor: '#fff5f5',
                  }}
                  onPress={() => confirmDelete(s)}
                >
                  <Text style={{ fontFamily: 'Poppins-Medium', color: '#b22222' }}>
                    Delete
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        })}
        <View style={styles.dottedLine} />
      </View>
    );
  };

  // Modal states
  const [popOption, setPopOption] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [painHead, setPaintHead] = useState('');

  const openModalPopup = type => {
    setPaintHead(type);
    const filterType = paintType.filter(item => item.productType === type);
    setPopOption(filterType);
    setIsModalOpen(true);
  };

  const handleClose = () => {
    setIsModalOpen(false);
    setPopOption(null);
  };

  const toggleExpand = index => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  const mapServiceToProductType = serviceType => {
    switch (serviceType) {
      case 'Textures':
        return 'Texture';
      default:
        return serviceType;
    }
  };

  const resolveMaterial = (serviceType, pickedName) => {
    const productType = mapServiceToProductType(serviceType);
    const list = paintType.filter(p => p.productType === productType);
    const m = list.find(x => x.paintName === pickedName);
    if (!m) return { unitPrice: 0, materialId: undefined };
    return {
      unitPrice: Number(m.paintPrice || 0),
      materialId: String(m._id || m.id || ''),
    };
  };

  const row = (
    serviceType,
    { materialName, withPaint, areaSqft, unitPrice, customName, customNote },
    materialId,
  ) => {
    const isWith = typeof withPaint === 'string' ? withPaint === 'with' : !!withPaint;

    // ✅ For WITHOUT paint: if area not given, take from breakdown / surface fallback
    let area = Number(areaSqft || 0);
    if (!area && !isWith) {
      const fromParam = Number(breakdownItem?.sqft || 0);
      const fromFallback = Number(surfaceSqftFallback || 0);
      area = fromParam > 0 ? fromParam : fromFallback;
    }

    const unit = Number(unitPrice || 0);
    const total = +(area * unit).toFixed(2);

    return {
      serviceType,
      materialId,
      materialName: materialName || '',
      surfaceType,
      withPaint: isWith,
      areaSqft: area,
      unitPrice: unit,
      total,
      customName: customName || '',
      customNote: customNote || '',
    };
  };

  const buildPayload = () => {
    const items = [];

    // Textures
    if (textureMaterialType) {
      const { unitPrice, materialId } = resolveMaterial('Textures', textureMaterialType);
      items.push(
        row(
          'Textures',
          { materialName: textureMaterialType, withPaint: texturePaintOption, areaSqft: 0, unitPrice },
          materialId,
        ),
      );
    }

    // Chemical Waterproofing
    if (waterproofMaterialType && Number(waterproofArea) > 0) {
      const { unitPrice, materialId } = resolveMaterial('Chemical Waterproofing', waterproofMaterialType);
      items.push(
        row(
          'Chemical Waterproofing',
          { materialName: waterproofMaterialType, withPaint: waterproofPaintOption, areaSqft: waterproofArea, unitPrice },
          materialId,
        ),
      );
    }

    // Terrace Waterproofing
    if (terraceMaterialType && Number(terraceArea) > 0) {
      const { unitPrice, materialId } = resolveMaterial('Terrace Waterproofing', terraceMaterialType);
      items.push(
        row(
          'Terrace Waterproofing',
          { materialName: terraceMaterialType, withPaint: terracePaintOption, areaSqft: terraceArea, unitPrice },
          materialId,
        ),
      );
    }

    // Tile Grouting
    if (tileMaterialType && Number(tileArea) > 0) {
      const { unitPrice, materialId } = resolveMaterial('Tile Grouting', tileMaterialType);
      items.push(
        row(
          'Tile Grouting',
          { materialName: tileMaterialType, withPaint: tilePaintOption, areaSqft: tileArea, unitPrice },
          materialId,
        ),
      );
    }

    // POP
    if (popMaterialType && Number(popArea) > 0) {
      const { unitPrice, materialId } = resolveMaterial('POP', popMaterialType);
      items.push(
        row(
          'POP',
          { materialName: popMaterialType, withPaint: popPaintOption, areaSqft: popArea, unitPrice },
          materialId,
        ),
      );
    }

    // Wood Polish
    if (woodMaterialType && Number(woodArea) > 0) {
      const { unitPrice, materialId } = resolveMaterial('Wood Polish', woodMaterialType);
      items.push(
        row(
          'Wood Polish',
          { materialName: woodMaterialType, withPaint: woodPaintOption, areaSqft: woodArea, unitPrice },
          materialId,
        ),
      );
    }

    // Others
    if (otherServiceName && Number(otherServicePrice) > 0) {
      const areaVal = Number(othersArea || 0);
      const unit = Number(otherServicePrice || 0);
      items.push({
        serviceType: 'Others',
        materialId: undefined,
        materialName: otherServiceName,
        surfaceType,
        withPaint: othersPaintOption === 'with',
        areaSqft: areaVal,
        unitPrice: unit,
        total: Number((areaVal * unit).toFixed(2)),
        customName: otherServiceName,
        customNote: '',
      });
    }

    return { items, surfaceRef };
  };

  const enableContinueBtn = buildPayload();
  console.log("enableContinueBtn", enableContinueBtn.items)

  const onContinue = async () => {
    try {
      const payload = buildPayload();
      if (!payload.items.length) {
        Alert.alert('Select service', 'Please add at least one additional service.');
        return;
      }
      setLoading(true);

      await axios.post(
        `${API_BASE_URL}${API_ENDPOINTS.ADD_ADDITIONAL_SERVICE}${encodeURIComponent(quoteId)}/rooms/${encodeURIComponent(roomName)}/additional-services`,
        payload,
      );

      navigation.goBack();
    } catch (err) {
      console.log('save additional services error', err?.response?.data || err);
      Alert.alert('Error', err?.response?.data?.message || 'Failed to save additional services');
    } finally {
      setLoading(false);
    }
  };

  const renderTextures = () => (
    <View style={styles.expandedContent}>
      {renderSavedFor('Textures')}
      <TouchableOpacity style={styles.selector} onPress={() => openModalPopup('Texture')}>
        <Text style={styles.selectorText}>{textureMaterialType || 'Select material type'}</Text>
      </TouchableOpacity>
      <Text style={styles.selectLabel}>Select</Text>
      <View style={styles.radioContainer}>
        <TouchableOpacity style={styles.radioButton} onPress={() => setTexturePaintOption('with')}>
          <View style={styles.radioCircle}>{texturePaintOption === 'with' && <View style={styles.selectedRb} />}</View>
          <Text style={styles.radioText}>with paint</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.radioButton} onPress={() => setTexturePaintOption('without')}>
          <View style={styles.radioCircle}>{texturePaintOption === 'without' && <View style={styles.selectedRb} />}</View>
          <Text style={styles.radioText}>without paint</Text>
        </TouchableOpacity>
      </View>
      {/* {!!surfaceSqftFallback && texturePaintOption === 'without' ? (
        <Text style={{ marginTop: 8, fontFamily: 'Poppins-Medium', color: '#666', fontSize: 12 }}>
          Area will be auto used from paint area: {surfaceSqftFallback} sq ft
        </Text>
      ) : null} */}
    </View>
  );

  const renderWaterProofing = () => (
    <View style={styles.expandedContent}>
      {renderSavedFor('Chemical Waterproofing')}
      <TouchableOpacity style={styles.selector} onPress={() => openModalPopup('Chemical Waterproofing')}>
        <Text style={styles.selectorText}>{waterproofMaterialType || 'Select material type'}</Text>
      </TouchableOpacity>
      <Text style={styles.selectLabel}>Area</Text>
      <TextInput
        style={styles.input}
        placeholder="Area in sqft"
        placeholderTextColor={'#999'}
        value={waterproofArea}
        onChangeText={setWaterproofArea}
        keyboardType="numeric"
      />
      <Text style={styles.selectLabel}>Select</Text>
      <View style={styles.radioContainer}>
        <TouchableOpacity style={styles.radioButton} onPress={() => setWaterproofPaintOption('with')}>
          <View style={styles.radioCircle}>{waterproofPaintOption === 'with' && <View style={styles.selectedRb} />}</View>
          <Text style={styles.radioText}>With Paint</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.radioButton} onPress={() => setWaterproofPaintOption('without')}>
          <View style={styles.radioCircle}>{waterproofPaintOption === 'without' && <View style={styles.selectedRb} />}</View>
          <Text style={styles.radioText}>Without Paint</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderTerraceProofing = () => (
    <View style={styles.expandedContent}>
      <TouchableOpacity style={styles.selector} onPress={() => openModalPopup('Terrace Waterproofing')}>
        <Text style={styles.selectorText}>{terraceMaterialType || 'Select material type'}</Text>
      </TouchableOpacity>
      <Text style={styles.selectLabel}>Area</Text>
      <TextInput
        style={styles.input}
        placeholder="Area in sqft"
        placeholderTextColor={'#999'}
        value={terraceArea}
        onChangeText={setTerraceArea}
        keyboardType="numeric"
      />
      <Text style={styles.selectLabel}>Select</Text>
      <View style={styles.radioContainer}>
        <TouchableOpacity style={styles.radioButton} onPress={() => setTerracePaintOption('with')}>
          <View style={styles.radioCircle}>{terracePaintOption === 'with' && <View style={styles.selectedRb} />}</View>
          <Text style={styles.radioText}>With Paint</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.radioButton} onPress={() => setTerracePaintOption('without')}>
          <View style={styles.radioCircle}>{terracePaintOption === 'without' && <View style={styles.selectedRb} />}</View>
          <Text style={styles.radioText}>Without Paint</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderTileGrouting = () => (
    <View style={styles.expandedContent}>
      <TouchableOpacity style={styles.selector} onPress={() => openModalPopup('Tile Grouting')}>
        <Text style={styles.selectorText}>{tileMaterialType || 'Select material type'}</Text>
      </TouchableOpacity>
      <Text style={styles.selectLabel}>Area</Text>
      <TextInput
        style={styles.input}
        placeholder="Area in sqft"
        placeholderTextColor={'#999'}
        value={tileArea}
        onChangeText={setTileArea}
        keyboardType="numeric"
      />
      <Text style={styles.selectLabel}>Select</Text>
      <View style={styles.radioContainer}>
        <TouchableOpacity style={styles.radioButton} onPress={() => setTilePaintOption('with')}>
          <View style={styles.radioCircle}>{tilePaintOption === 'with' && <View style={styles.selectedRb} />}</View>
          <Text style={styles.radioText}>With Paint</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.radioButton} onPress={() => setTilePaintOption('without')}>
          <View style={styles.radioCircle}>{tilePaintOption === 'without' && <View style={styles.selectedRb} />}</View>
          <Text style={styles.radioText}>Without Paint</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderPop = () => (
    <View style={styles.expandedContent}>
      <TouchableOpacity style={styles.selector} onPress={() => openModalPopup('POP')}>
        <Text style={styles.selectorText}>{popMaterialType || 'Select material type'}</Text>
      </TouchableOpacity>
      <Text style={styles.selectLabel}>Area</Text>
      <TextInput
        style={styles.input}
        placeholder="Area in sqft"
        placeholderTextColor={'#999'}
        value={popArea}
        onChangeText={setPopArea}
        keyboardType="numeric"
      />
      <Text style={styles.selectLabel}>Select</Text>
      <View style={styles.radioContainer}>
        <TouchableOpacity style={styles.radioButton} onPress={() => setPopPaintOption('with')}>
          <View style={styles.radioCircle}>{popPaintOption === 'with' && <View style={styles.selectedRb} />}</View>
          <Text style={styles.radioText}>With Paint</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.radioButton} onPress={() => setPopPaintOption('without')}>
          <View style={styles.radioCircle}>{popPaintOption === 'without' && <View style={styles.selectedRb} />}</View>
          <Text style={styles.radioText}>Without Paint</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderWoodPolish = () => (
    <View style={styles.expandedContent}>
      <TouchableOpacity style={styles.selector} onPress={() => openModalPopup('Wood Polish')}>
        <Text style={styles.selectorText}>{woodMaterialType || 'Select material type'}</Text>
      </TouchableOpacity>
      <Text style={styles.selectLabel}>Area</Text>
      <TextInput
        style={styles.input}
        placeholder="Area in sqft"
        placeholderTextColor={'#999'}
        value={woodArea}
        onChangeText={setWoodArea}
        keyboardType="numeric"
      />
      <Text style={styles.selectLabel}>Select</Text>
      <View style={styles.radioContainer}>
        <TouchableOpacity style={styles.radioButton} onPress={() => setWoodPaintOption('with')}>
          <View style={styles.radioCircle}>{woodPaintOption === 'with' && <View style={styles.selectedRb} />}</View>
          <Text style={styles.radioText}>With Paint</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.radioButton} onPress={() => setWoodPaintOption('without')}>
          <View style={styles.radioCircle}>{woodPaintOption === 'without' && <View style={styles.selectedRb} />}</View>
          <Text style={styles.radioText}>Without Paint</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderOthers = () => (
    <View style={styles.expandedContent}>
      <TextInput
        style={styles.input}
        placeholder="Enter Name of Service"
        placeholderTextColor={'#999'}
        value={otherServiceName}
        onChangeText={setOtherServiceName}
      />
      <TextInput
        style={styles.input}
        placeholder="Price"
        placeholderTextColor={'#999'}
        value={otherServicePrice}
        onChangeText={setOtherServicePrice}
        keyboardType="numeric"
      />
      <TextInput
        style={styles.input}
        placeholder="Area in sqft"
        placeholderTextColor={'#999'}
        value={othersArea}
        onChangeText={setOthersArea}
        keyboardType="numeric"
      />

      <Text style={styles.selectLabel}>Select</Text>
      <View style={styles.radioContainer}>
        <TouchableOpacity style={styles.radioButton} onPress={() => setOthersPaintOption('with')}>
          <View style={styles.radioCircle}>{othersPaintOption === 'with' && <View style={styles.selectedRb} />}</View>
          <Text style={styles.radioText}>With Paint</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.radioButton} onPress={() => setOthersPaintOption('without')}>
          <View style={styles.radioCircle}>{othersPaintOption === 'without' && <View style={styles.selectedRb} />}</View>
          <Text style={styles.radioText}>Without Paint</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderItem = ({ item, index }) => {
    const isExpanded = index === expandedIndex;

    return (
      <View style={styles.parentView}>
        <TouchableOpacity style={styles.row} onPress={() => toggleExpand(index)}>
          <Text style={styles.rowText}>{item}</Text>
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

      <FlatList
        data={services}
        keyExtractor={item => item}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 100 }}
      />

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.continueButton, {
            backgroundColor: !enableContinueBtn.items.length ? "#888888" : '#d31a1a'
          }]}
          onPress={enableContinueBtn.items.length && onContinue}
          disabled={!enableContinueBtn.items.length || loading}>
          <Text style={styles.continueText}>{loading ? 'Saving...' : 'Continue'}</Text>
        </TouchableOpacity>
      </View>

      <Modal visible={isModalOpen} transparent animationType="slide">
        <View style={styles.overlay}>
          <View style={styles.modalBox}>
            <View style={styles.modalHeader}>
              <Text style={styles.title}>{painHead}</Text>
              <TouchableOpacity onPress={handleClose}>
                <Text style={styles.close}>✕</Text>
              </TouchableOpacity>
            </View>

            <FlatList
              data={popOption}
              keyExtractor={item => String(item._id)}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.item}
                  onPress={() => {
                    if (expandedIndex === 0) setTextureMaterialType(item.paintName);
                    else if (expandedIndex === 1) setWaterproofMaterialType(item.paintName);
                    else if (expandedIndex === 2) setTerraceMaterialType(item.paintName);
                    else if (expandedIndex === 3) setTileMaterialType(item.paintName);
                    else if (expandedIndex === 4) setPopMaterialType(item.paintName);
                    else if (expandedIndex === 5) setWoodMaterialType(item.paintName);

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

  parentView: {
    marginHorizontal: 15,
    marginBottom: 10,
    backgroundColor: '#fff',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 6,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rowText: { fontSize: 13, color: '#222', fontFamily: 'Poppins-SemiBold' },

  expandedContent: {
    borderRadius: 6,
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
  },
  selectedRb: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#d31a1a',
  },
  radioText: {
    marginLeft: 8,
    fontSize: 13,
    color: '#444',
    fontFamily: 'Poppins-SemiBold',
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
    // backgroundColor: '#d31a1a',
    borderRadius: 5,
    paddingVertical: 14,
    alignItems: 'center',
  },
  continueText: {
    color: 'white',
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
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
    margin: 2,
  },
  modalHeader: {
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
  itemText: { fontSize: 14, fontFamily: 'Poppins-Medium' },
  price: { fontSize: 14, color: '#555', fontFamily: 'Poppins-Medium' },

  savedWrap: { marginBottom: 8 },
  savedHeader: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 12,
    color: '#444',
    marginBottom: 4,
  },
  savedCard: {
    backgroundColor: '#fafafa',
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 10,
    marginBottom: 6,
  },
  savedTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  savedName: { fontFamily: 'Poppins-Medium', fontSize: 12, color: '#222' },
  savedAmt: { fontFamily: 'Poppins-SemiBold', fontSize: 12, color: '#222' },
  savedMeta: { marginTop: 2, fontSize: 11, color: '#666' },
  savedFlag: { marginTop: 2, fontSize: 11, fontFamily: 'Poppins-SemiBold' },

  dottedLine: {
    borderBottomWidth: 1,
    borderBottomColor: '#ED1F24',
    borderStyle: 'dashed',
    marginTop: 8,
    marginBottom: 12,
  },
});
