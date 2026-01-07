import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ongoing from '../screens/Ongoing';
import Money from '../screens/Money';
import Performance from '../screens/Performance';
import Menu from '../screens/Menu/Menu';
import Leadone from '../screens/Leadone';
import Ionicons from 'react-native-vector-icons/Ionicons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';

const Tab = createBottomTabNavigator();

const BottomTab = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          height: 70,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          switch (route.name) {
            case 'New':
              iconName = 'briefcase-outline';
              break;
            case 'Ongoing':
              iconName = 'time';
              break;
            case 'Money':
              iconName = 'wallet';
              break;
            case 'Performance':
              iconName = 'ribbon';
              break;
            case 'Menu':
              iconName = 'apps';
              break;
          }

          return (
            <Ionicons
              name={iconName}
              size={24}
              color={focused ? '#E50000' : '#999'}
            />
          );
        },
        tabBarActiveTintColor: '#E50000',
        tabBarInactiveTintColor: '#9D9D9D',
        // tabBarActiveBackgroundColor: '#0F6A97',
        // tabBarInactiveBackgroundColor: '#7cd0faff',

        tabBarLabelStyle: {
          fontSize: 10,
          fontFamily: 'Poppins-SemiBold',
          // fontWeight: '500',
          borderRadius: 10,
        },
      })}
    >
      <Tab.Screen name="New" initialRouteName="New" component={Leadone} />
      <Tab.Screen name="Ongoing" component={Ongoing} />
      <Tab.Screen
        name="Money"
        component={Money}
        options={{
          tabBarIcon: ({ color, size }) => (
            <FontAwesome name="rupee" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen name="Performance" component={Performance} />
      <Tab.Screen name="Menu" component={Menu} />
    </Tab.Navigator>
  );
};

export default BottomTab;
