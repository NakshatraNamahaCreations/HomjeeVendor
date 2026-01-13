import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Login from './src/screens/Login';
import OTP from './src/screens/Otp';
import Leadone from './src/screens/Leadone';
import Newlead from './src/screens/Newlead';
import BottomTab from './src/Bottomtab/BottomTab';
import Leaddetails from './src/screens/Leaddetails';
import Notification from './src/screens/Notification';
import LeadDescriptionScreen from './src/screens/LeadDescriptionScreen';
import JobOngoing from './src/screens/JobOngoing';
import Wallet from './src/screens/Wallet';
import Payment from './src/screens/Payment';
import Performance from './src/screens/Performance';
import Menu from './src/screens/Menu/Menu';
import Viewid from './src/screens/Menu/Viewid';
import Profiledetails from './src/screens/Menu/Profiledetails';
import FinancialDetails from './src/screens/Menu/FinancialDetails';
import TeamMember from './src/screens/Menu/TeamMember';
import Calendar from './src/screens/Menu/Calendar';
import TeamCalendarDetails from './src/screens/Menu/TeamCalendarDetails';
// import StartMeasurement from './src/screens/Home Painting/StartMeasurement';
import Bedroom1 from './src/screens/Home Painting/Bedroom1';
import Doors from './src/screens/Home Painting/Doors';
import Grills from './src/screens/Home Painting/Grills';
import Quotes from './src/screens/Home Painting/Quotes';
import Selectpackage from './src/screens/Home Painting/Selectpackage';
import SelectRoom from './src/screens/Home Painting/SelectRoom';
// import BedroomDetail from './src/screens/Home Painting/SelectPaint';
import QuoteSummary from './src/screens/Home Painting/QuoteSummary';
import AdditionalService from './src/screens/Home Painting/AdditionalService';
import Balcony from './src/screens/Home Painting/Balcony';
import NewQuotes from './src/screens/Home Painting/NewQuotes';
import QuotesPending from './src/screens/Home Painting/QuotesPending';
import Jobquotes from './src/screens/Home Painting/Jobquotes';
import OngoingLeadsScreen from './src/screens/Ongoing';
import QuoteSurvey from './src/screens/Home Painting/QuoteSurvey';
import HiredQuote from './src/screens/Home Painting/HiredQuote';
import Lastongoingpage from './src/screens/Home Painting/Lastongoingpage';
import LeadDescriptionFinal from './src/screens/Home Painting/LeadDescriptionFinal';
import SurveyCompleted from './src/screens/Home Painting/SurveyCompleted';
import PendingHiring from './src/screens/Home Painting/PendingHiring';
import StartProject from './src/screens/Home Painting/StartProject';
import NewPayment from './src/screens/Home Painting/NewPayment';
import JobOngoingFinal from './src/screens/Home Painting/JobOngoingFinal';
import Splashscreen from './src/screens/Splashscreen';
import CompletedScreen from './src/screens/CompletedScreen';
import StartMeasurement from './src/screens/Home Painting/StartMeasurement';
import RoomMeasurementScreen from './src/screens/Home Painting/RoomMeasurementScreen';
import SelectPaint from './src/screens/Home Painting/SelectPaint';
import QuotesView from './src/screens/Home Painting/QuotesView';

const Stack = createNativeStackNavigator();

function MyStack() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="splashscreen">
        <Stack.Screen
          name="splashscreen"
          component={Splashscreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="login"
          component={Login}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="otp"
          component={OTP}
          options={{ headerShown: false }}
        />
        {/* <Stack.Screen
          name="leadsone"
          component={Leadone}
          options={{headerShown: false}}
        /> */}
        <Stack.Screen
          name="newleads"
          component={Newlead}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="BottomTab"
          component={BottomTab}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="LeadDetails"
          component={Leaddetails}
          options={{
            headerShown: true,
            headerTitle: 'Lead Details',
            headerTitleStyle: {
              fontFamily: 'Poppins-SemiBold',
              fontSize: 17,
            },
          }}
        />
        <Stack.Screen
          name="Notification"
          component={Notification}
          options={{
            headerShown: true,
            headerTitle: 'Notification',
            headerTitleStyle: {
              fontFamily: 'Poppins-SemiBold',
              fontSize: 17,
            },
          }}
        />
        <Stack.Screen
          name="LeadDescriptionScreen"
          component={LeadDescriptionScreen}
          options={{
            headerShown: true,
            headerTitle: 'Lead Details',
            headerTitleStyle: {
              fontFamily: 'Poppins-SemiBold',
              fontSize: 17,
            },
          }}
        />
        <Stack.Screen
          name="JobOngoing"
          component={JobOngoing}
          options={{
            headerShown: false,
            headerTitle: 'End Job',
            headerTitleStyle: {
              fontFamily: 'Poppins-SemiBold',
              fontSize: 17,
            },
          }}
        />
        <Stack.Screen
          name="CompletedScreen"
          component={CompletedScreen}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="Wallet"
          component={Wallet}
          options={{
            headerShown: true,
            headerTitleStyle: {
              fontFamily: 'Poppins-SemiBold',
              fontSize: 17,
            },
          }}
        />
        <Stack.Screen
          name="Payment"
          component={Payment}
          options={{
            headerShown: true,
            headerTitle: 'Buy Coins',
            headerTitleStyle: {
              fontFamily: 'Poppins-Bold',
              fontSize: 18,
            },
          }}
        />
        <Stack.Screen
          name="Performance"
          component={Performance}
          options={{
            headerShown: true,
            headerTitleStyle: {
              fontFamily: 'Poppins-Bold',
              fontSize: 18,
            },
          }}
        />
        <Stack.Screen
          name="Leadone"
          component={Leadone}
          options={{
            headerShown: false,
            headerTitleStyle: {
              fontFamily: 'Poppins-Bold',
              fontSize: 18,
            },
          }}
        />
        <Stack.Screen
          name="Menu"
          component={Menu}
          options={{
            headerShown: true,
            headerTitleStyle: {
              fontFamily: 'Poppins-Bold',
              fontSize: 18,
            },
          }}
        />
        <Stack.Screen
          name="Viewid"
          component={Viewid}
          options={{
            headerShown: true,
            headerTitle: 'View ID',
            headerTitleStyle: {
              fontFamily: 'Poppins-SemiBold',
              fontSize: 17,
            },
          }}
        />
        <Stack.Screen
          name="Profiledetails"
          component={Profiledetails}
          options={{
            headerShown: true,
            headerTitle: 'Profile Details',
            headerTitleStyle: {
              fontFamily: 'Poppins-SemiBold',
              fontSize: 17,
            },
          }}
        />
        <Stack.Screen
          name="FinancialDetails"
          component={FinancialDetails}
          options={{
            headerShown: true,
            headerTitle: 'Financial Details',
            headerTitleStyle: {
              fontFamily: 'Poppins-SemiBold',
              fontSize: 17,
            },
          }}
        />
        <Stack.Screen
          name="TeamMember"
          component={TeamMember}
          options={{
            headerShown: true,
            headerTitle: 'Team Member',
            headerTitleStyle: {
              fontFamily: 'Poppins-SemiBold',
              fontSize: 17,
            },
          }}
        />
        <Stack.Screen
          name="Calendar"
          component={Calendar}
          options={{
            headerShown: true,
            headerTitle: 'Calendar',
            headerTitleStyle: {
              fontFamily: 'Poppins-SemiBold',
              fontSize: 17,
            },
          }}
        />
        <Stack.Screen
          name="TeamCalendarDetails"
          component={TeamCalendarDetails}
          options={{
            headerShown: true,
            headerTitle: 'Calendar',
            headerTitleStyle: {
              fontFamily: 'Poppins-SemiBold',
              fontSize: 17,
            },
          }}
          OngoingCustomerDetails
        />
        <Stack.Screen
          name="StartMeasurement"
          component={StartMeasurement}
          options={{
            headerShown: true,
            headerTitle: 'Measurement',
            headerTitleStyle: {
              fontFamily: 'Poppins-SemiBold',
              fontSize: 17,
            },
          }}
          OngoingCustomerDetails
        />
        <Stack.Screen
          name="RoomMeasurementScreen"
          component={RoomMeasurementScreen}
          options={{
            headerShown: false,
            headerTitle: 'Measurement Screen',
            headerTitleStyle: {
              fontFamily: 'Poppins-SemiBold',
              fontSize: 17,
            },
          }}
          OngoingCustomerDetails
        />
        <Stack.Screen
          name="Bedroom1"
          component={Bedroom1}
          options={{
            headerShown: true,
            headerTitle: 'Bedroom1',
            headerTitleStyle: {
              fontFamily: 'Poppins-SemiBold',
              fontSize: 17,
            },
          }}
          OngoingCustomerDetails
        />
        <Stack.Screen
          name="Doors"
          component={Doors}
          options={{
            headerShown: true,
            headerTitle: 'Doors',
            headerTitleStyle: {
              fontFamily: 'Poppins-SemiBold',
              fontSize: 17,
            },
          }}
          OngoingCustomerDetails
        />
        <Stack.Screen
          name="Grills"
          component={Grills}
          options={{
            headerShown: true,
            headerTitle: 'Grills',
            headerTitleStyle: {
              fontFamily: 'Poppins-SemiBold',
              fontSize: 17,
            },
          }}
          OngoingCustomerDetails
        />
        <Stack.Screen
          name="Balcony"
          component={Balcony}
          options={{
            headerShown: true,
            headerTitle: 'Balcony',
            headerTitleStyle: {
              fontFamily: 'Poppins-SemiBold',
              fontSize: 17,
            },
          }}
          OngoingCustomerDetails
        />
        <Stack.Screen
          name="Quotes"
          component={Quotes}
          options={{
            headerShown: false,
            headerTitle: 'Quotes',
            headerTitleStyle: {
              fontFamily: 'Poppins-SemiBold',
              fontSize: 17,
            },
          }}
          OngoingCustomerDetails
        />
        <Stack.Screen
          name="Selectpackage"
          component={Selectpackage}
          options={{
            headerShown: true,
            headerTitle: 'Select Package',
            headerTitleStyle: {
              fontFamily: 'Poppins-SemiBold',
              fontSize: 17,
            },
          }}
          OngoingCustomerDetails
        />
        <Stack.Screen
          name="SelectRoom"
          component={SelectRoom}
          options={{
            headerShown: false,
            headerTitle: 'Select Room',
            headerTitleStyle: {
              fontFamily: 'Poppins-SemiBold',
              fontSize: 17,
            },
          }}
          OngoingCustomerDetails
        />
        <Stack.Screen
          name="SelectPaint"
          component={SelectPaint}
          options={{
            headerShown: false,
            headerTitle: 'Bedroom Detail',
            headerTitleStyle: {
              fontFamily: 'Poppins-SemiBold',
              fontSize: 17,
            },
          }}
          OngoingCustomerDetails
        />
        <Stack.Screen
          name="QuoteSummary"
          component={QuoteSummary}
          options={{
            headerShown: true,
            headerTitle: 'Quote Summary',
            headerTitleStyle: {
              fontFamily: 'Poppins-SemiBold',
              fontSize: 17,
            },
          }}
          OngoingCustomerDetails
        />
        <Stack.Screen
          name="QuotesView"
          component={QuotesView}
          options={{
            headerShown: true,
            headerTitle: 'View Quotes',
            headerTitleStyle: {
              fontFamily: 'Poppins-SemiBold',
              fontSize: 17,
            },
          }}
          OngoingCustomerDetails
        />
        <Stack.Screen
          name="AdditionalService"
          component={AdditionalService}
          options={{
            headerShown: true,
            headerTitle: 'Additional Service',
            headerTitleStyle: {
              fontFamily: 'Poppins-SemiBold',
              fontSize: 17,
            },
          }}
          OngoingCustomerDetails
        />
        <Stack.Screen
          name="NewQuotes"
          component={NewQuotes}
          options={{
            headerShown: true,
            headerTitle: 'Quotes',
            headerTitleStyle: {
              fontFamily: 'Poppins-SemiBold',
              fontSize: 17,
            },
          }}
          OngoingCustomerDetails
        />
        <Stack.Screen
          name="QuotesPending"
          component={QuotesPending}
          options={{
            headerShown: true,
            headerTitle: 'Quotes',
            headerTitleStyle: {
              fontFamily: 'Poppins-SemiBold',
              fontSize: 17,
            },
          }}
        />
        <Stack.Screen
          name="Jobquotes"
          component={Jobquotes}
          options={{
            headerShown: true,
            headerTitle: 'Sonali',
            headerTitleStyle: {
              fontFamily: 'Poppins-SemiBold',
              fontSize: 17,
            },
          }}
        />
        <Stack.Screen
          name="OngoingLeadsScreen"
          component={OngoingLeadsScreen}
          options={{
            headerShown: true,
            headerTitle: 'OngoingLeads',
            headerTitleStyle: {
              fontFamily: 'Poppins-SemiBold',
              fontSize: 17,
            },
          }}
        />
        <Stack.Screen
          name="QuoteSurvey"
          component={QuoteSurvey}
          options={{
            headerShown: true,
            headerTitle: 'Quotes',
            headerTitleStyle: {
              fontFamily: 'Poppins-SemiBold',
              fontSize: 17,
            },
          }}
        />
        <Stack.Screen
          name="HiredQuote"
          component={HiredQuote}
          options={{
            headerShown: true,
            headerTitle: 'Quotes',
            headerTitleStyle: {
              fontFamily: 'Poppins-SemiBold',
              fontSize: 17,
            },
          }}
        />
        <Stack.Screen
          name="Lastongoingpage"
          component={Lastongoingpage}
          options={{
            headerShown: true,
            headerTitle: 'Sonali',
            headerTitleStyle: {
              fontFamily: 'Poppins-SemiBold',
              fontSize: 17,
            },
          }}
        />
        <Stack.Screen
          name="LeadDescriptionFinal"
          component={LeadDescriptionFinal}
          options={{
            headerShown: true,
            headerTitle: 'Sonali',
            headerTitleStyle: {
              fontFamily: 'Poppins-SemiBold',
              fontSize: 17,
            },
          }}
        />
        <Stack.Screen
          name="SurveyCompleted"
          component={SurveyCompleted}
          options={{
            headerShown: true,
            headerTitle: 'Quotes',
            headerTitleStyle: {
              fontFamily: 'Poppins-SemiBold',
              fontSize: 17,
            },
          }}
        />
        <Stack.Screen
          name="PendingHiring"
          component={PendingHiring}
          options={{
            headerShown: true,
            headerTitle: 'Quotes',
            headerTitleStyle: {
              fontFamily: 'Poppins-SemiBold',
              fontSize: 17,
            },
          }}
        />
        <Stack.Screen
          name="StartProject"
          component={StartProject}
          options={{
            headerShown: true,
            headerTitle: 'Quotes',
            headerTitleStyle: {
              fontFamily: 'Poppins-SemiBold',
              fontSize: 17,
            },
          }}
        />
        <Stack.Screen
          name="NewPayment"
          component={NewPayment}
          options={{
            headerShown: true,
            headerTitle: 'Quotes',
            headerTitleStyle: {
              fontFamily: 'Poppins-SemiBold',
              fontSize: 17,
            },
          }}
        />
        <Stack.Screen
          name="JobOngoingFinal"
          component={JobOngoingFinal}
          options={{
            headerShown: true,
            headerTitle: 'Quotes',
            headerTitleStyle: {
              fontFamily: 'Poppins-SemiBold',
              fontSize: 17,
            },
          }}
        />
        {/*  */}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default MyStack;
