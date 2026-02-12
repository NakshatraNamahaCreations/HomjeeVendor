import { useNavigation, useRoute } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Image,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { API_BASE_URL, API_ENDPOINTS } from '../../ApiService/apiConstants';
import { getRequest } from '../../ApiService/apiHelper';
import PageLoader from '../../components/PageLoader';
import { useBackHandler } from '@react-native-community/hooks';
import { useEstimateContext } from '../../Utilities/EstimateContext';

const Selectpackage = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { dupMode, quoteId, leadId, measurementId, vendorId } = route.params;
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [packagesList, setPackagesList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [estimateData] = useEstimateContext();
  console.log("estimateData", estimateData);

  const fetchPackages = async () => {
    setLoading(true);
    try {
      const response = await getRequest(`${API_ENDPOINTS.GET_PACKAGES}`);
      // console.log('response package', response);

      if (response) {
        setPackagesList(response.data);
      }
    } catch (err) {
      console.log('Error fetching paint:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPackages();
  }, []);

  const deleteQuote = async id => {
    console.log('calling funtion');

    const tryDelete = async url => {
      try {
        await axios.delete(url);
        return true;
      } catch {
        return false;
      }
    };

    // Try your available endpoints; keep the ones you have and remove the rest if not used in your codebase.
    return await tryDelete(
      `${API_BASE_URL}${API_ENDPOINTS.DELETE_EMPTY_DRAFT}${encodeURIComponent(
        id,
      )}/empty-draft`,
    ); // fallback if you only support draft deletion
  };

  useBackHandler(() => {
    console.log('calling funtion');
    if (!quoteId) return false;
    (async () => {
      try {
        await deleteQuote(quoteId);
      } finally {
        navigation.goBack(); // or navigation.popToTop() as per your flow
      }
    })();
    return true;
  });

  useEffect(() => {
    const sub = navigation.addListener('beforeRemove', e => {
      // If you want deletion on header back too, uncomment below
      e.preventDefault();
      (async () => {
        try {
          await deleteQuote(quoteId);
        } finally {
          navigation.dispatch(e.data.action);
        }
      })();
    });
    return () => sub && sub();
  }, [navigation, quoteId]);

  return (
    <View style={styles.container}>
      {loading && <PageLoader />}
      <ScrollView>
        {/* Custom Package */}
        <TouchableOpacity
          style={styles.customPackageButton}
          onPress={() => {
            setSelectedPackage(null);
            setTimeout(() => {
              navigation.push('SelectRoom', {
                dupMode,
                quoteId,
                leadId,
                measurementId,
                vendorId,
                predefPackage: null,
                autoApplyOnMount: true,
                applyMode: 'clear',
                applyKey: `clear-${Date.now()}`,
              });
            }, 500);
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={styles.customPackageText}>
              Make My Own Custom Package
            </Text>
            <Image
              source={require('../../assets/icons/arrowrightcircle.png')}
              style={{
                marginLeft: 'auto',
                marginRight: 10,
                width: 20,
                height: 20,
                marginTop: 20,
              }}
            />
          </View>
          <Text style={styles.customPackageSubText}>
            Select different paint for walls and ceiling
          </Text>
        </TouchableOpacity>

        {/* Pre-defined packages */}
        <Text style={styles.sectionTitle}>All Package</Text>

        {packagesList.map(pkg => {
          console.log("pkg", pkg)
          return (
            <TouchableOpacity
              key={pkg._id}
              style={[
                styles.packageCard,
                selectedPackage === pkg._id && styles.selectedCard,
              ]}
              onPress={() => setSelectedPackage(pkg)}
            >
              <View style={styles.cardHeader}>
                <Text style={styles.packageTitle}>{pkg.packageName}</Text>
                <TouchableOpacity
                  onPress={() => setSelectedPackage(pkg)}
                  style={[
                    styles.checkbox,
                    selectedPackage?._id === pkg._id && styles.checkedCheckbox,
                  ]}
                >
                  {selectedPackage?._id === pkg._id && (
                    <Icon name="check" size={16} color="#fff" />
                  )}
                </TouchableOpacity>
              </View>
              <View style={styles.dottedLine} />

              {pkg.details?.map((detail, index) => {
                return (
                  <View key={index} style={styles.packageDetailRow}>
                    <Text style={styles.packageDetail}>
                      • {detail.paintName} ({detail.category} {detail.itemName}) -{' '}
                      {detail.sqft || 25}
                    </Text>
                    <Text style={styles.packagePrice}>
                      {' '}
                      ₹ {detail.paintPrice}
                    </Text>
                  </View>
                );
              })}

              <View style={styles.priceDivider} />
              <Text style={styles.totalPrice}>
                ₹ {pkg.packagePrice?.toLocaleString()}
              </Text>
            </TouchableOpacity>
          )
        })}
        <View style={{ marginBottom: 100 }} />
      </ScrollView>

      {selectedPackage && (
        <TouchableOpacity
          onPress={() =>
            navigation.push('SelectRoom', {
              dupMode,
              quoteId,
              leadId,
              measurementId,
              vendorId,
              predefPackage: selectedPackage,
              autoApplyOnMount: true,
              applyMode: 'replace',
              applyKey: `pkg-${selectedPackage._id}-${Date.now()}`,
            })
          }
          style={styles.proceedButton}
        >
          <Text style={styles.proceedText}>Continue</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

export default Selectpackage;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F6F6F6',
  },
  customPackageButton: {
    backgroundColor: '#0F6A97',
    marginHorizontal: 10,
    borderRadius: 10,
    marginTop: 20,
    paddingVertical: 10,
  },
  customPackageText: {
    color: '#fff',
    fontFamily: 'Poppins-Bold',
    fontSize: 12,
    paddingTop: 10,
    marginLeft: 10,
  },
  customPackageSubText: {
    color: '#e0e0e0',
    fontSize: 10,
    fontFamily: 'Poppins-SemiBold',
    marginBottom: 10,
    marginLeft: 10,
  },
  sectionTitle: {
    margin: 20,
    fontSize: 16,
    fontFamily: 'Poppins-Bold',
  },
  packageCard: {
    backgroundColor: 'white',
    padding: 15,
    marginHorizontal: 20,
    marginBottom: 20,
  },
  selectedCard: {
    borderColor: '#ED1F24',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  packageTitle: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    color: '#ED1F24',
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#ED1F24',
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkedCheckbox: {
    backgroundColor: '#ED1F24',
  },
  packageDetailRow: {
    flexDirection: 'row',
    marginTop: 8,
  },
  packageDetail: {
    fontSize: 10,
    color: '#444',
    fontFamily: 'Poppins-SemiBold',
    flex: 0.8
  },
  packagePrice: {
    fontSize: 10,
    color: '#444',
    fontFamily: 'Poppins-SemiBold',
    textAlign: 'right',
    flex: 0.2
  },
  dottedLine: {
    borderBottomWidth: 1,
    borderBottomColor: '#ED1F24',
    borderStyle: 'dashed',
    marginTop: 8,
    marginBottom: 12,
  },
  priceDivider: {
    borderBottomWidth: 1,
    borderBottomColor: '#d10000',
    borderStyle: 'dashed',
    marginTop: 12,
    marginBottom: 8,
  },
  totalPrice: {
    fontSize: 15,
    fontFamily: 'Poppins-SemiBold',
    color: '#ED1F24',
    textAlign: 'right',
  },
  proceedButton: {
    backgroundColor: '#d10000',
    // borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    // marginHorizontal: 20,
    // marginBottom: 30,
    position: 'absolute',
    width: '100%',
    bottom: 0,
  },
  proceedText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontFamily: 'Poppins-Medium',
  },
  bottomBar: {
    paddingVertical: 10,
  },
  downborder: {
    position: 'absolute',
    // top: -15,
    // left: 110,
    borderBottomWidth: 5,
    borderBottomColor: '#ED1F24',
    // width: '40%',
    borderRadius: 20,
  },
});
