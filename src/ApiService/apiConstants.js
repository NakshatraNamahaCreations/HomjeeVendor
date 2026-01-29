export const API_BASE_URL = 'http://192.168.1.70:9000/api'; // development
// export const API_BASE_URL = 'https://homjee-backend.onrender.com/api'; // production

export const API_ENDPOINTS = {
  // USER AUTH
  LOGIN_WITH_MOBILE: '/vendor/login-with-mobile',
  VERIFY_OTP: '/vendor/verify-otp',
  RESEND_OTP: '/vendor/resend-otp',

  // PROFILE
  GET_VENDOR_PROFILE: '/vendor/get-vendor-by-vendorId/',
  // TEAM
  GET_TEAMS_VENDOR_LINE: '/vendor/get-teams-by-vendor/',
  GET_TEAM_MEMBER_BY_OWN_ID: '/vendor/get-team-id/',
  GET_TEAM_MEMBER_BUSY_DATES: '/vendor/get-team-member-busy-dates/',
  TEAM_MEMBERS_STATUS: '/vendor/team-members-status/',
  MARK_LEAVES: '/vendor/team/leaves/',
  VENDOR_AVAILABILITY: '/vendor/check-vendor-availability/',
  CHECK_AVAILABILITY_RANGE: '/vendor/check-teammember-availability/',

  // BOOKINGS
  GET_NEARBY_BOOKING_DEEP_CLEANING:
    '/bookings/get-nearest-booking-by-location-deep-cleaning/',
  GET_NEARBY_BOOKING_HOUSE_PAINTER:
    '/bookings/get-nearest-booking-by-location-house-painting/',
  GET_BOOKINGS_BY_bOOKING_ID: '/bookings/get-bookings-by-bookingid/',
  RESPOND_JOB: '/bookings/response-confirm-job',
  GET_CONFIRM_BOOKINGS: '/bookings/get-confirm-bookings-by-vendorId/',
  START_JOB: '/bookings/start-job',
  COMPLETED_SURVEY: '/bookings/complete-survey',
  UPDATE_STATUS: '/bookings/update-status',
  UPDATE_PRICING: '/bookings/update-price/',
  MARK_PENDING_HIRING: '/bookings/mark-pending-hiring',
  REQUESTING_SEND_OTP: '/bookings/start-project/generating-otp/',
  START_PROJECT_HOUSE_PAINTING: '/bookings/confirm-otp/start/project/',
  // REQUEST_FINAL_PAYMENT: '/bookings/request-final-payment/final/project/',
  REQUEST_NEXT_PAYMENT: '/bookings/request-next-payment/second/project/',
  COMPLETE_PROJECT: '/bookings/completing-job/final-payemt/request/end-job/',
  // need to check finalPayment  requesting and check website and vendor app payment part

  RESCHEDULE_BOOKING: '/bookings/reschedule-booking/vendor',

  // SLOT FOR RESCHEDULE
  FETCH_RESCHEDULE_BOOKING: '/slot/vendor/reschedule-booking/available-slots/',

  // HOUSE PAINTINGS
  SAVE_MEASUREMENTS: '/measurements/save-measurement',
  UPDATE_ROOM_PAINT_PRICE: '/measurements/update_Room_painy_pricing',
  GET_MEASUREMENTS_BY_LEADID: '/measurements/get-measurements-by-leadId/',
  GET_PAINT: '/products/get-all-paints',
  GET_PACKAGES: '/products/get-all-packages',
  GET_ALL_FINISHING_PAINTS: '/products/get-all-finishing-paints',

  //QUOTATION
  SAVE_QUOTATION: '/quotations/create-quote',
  UPDATE_QUOTE_PRICING: '/quotations/quotes-room-price/',
  CLEAR_ROOM_VALUES: '/quotations/clear-room-services/',
  DELETE_EMPTY_DRAFT: '/quotations/delete-quote/',
  ADD_ADDITIONAL_SERVICE: '/quotations/add-finishing-paints/',
  DELETE_ADDITIONAL_SERVICE: '/quotations/delete-finishing-paints/',
  GET_QUOTATION: '/quotations/get-quotes/',
  GET_QUOTATION_BY_ID: '/quotations/quotes-list-by-id',
  DUPLICATE_QUOTE: '/quotations/create-duplicate/',
  FINALIZE_QUOTE: '/quotations/quote/',
  UPDATE_QUOTATION: '/quotations/update-quote/',

  //DEEP-CLEANING PACKAGES
  GET_PACKAGES_BY_SERVICE_TYPE: '/package/get-all-packages-by-service-type',

  // SERVICE CONFIG
  GET_SERVICE_PRICE_CONFIG: '/service/latest',

  // PERFORMANCE
  GET_VENDOR_DEEP_CLEANING_PERFORMANCE_RECORD:
    '/bookings/deep-cleaning-vendor-performance',
  DEEP_CLEANING_PERFORMANCE_METRICS:
    '/bookings/deep-cleaning-vendor-performance-metrics/',
  HOUSE_PAINTING_PERFORMANCE_METRICS:
    '/bookings/house-painting-vendor-performance-metrics/',
  KPI_PARAMETERS: '/kpi-parameters/',

  // WALLET
  FETCH_WALLET_TRANSACTIONS: "/wallet/get-wallet-transaction/vendor/",
  SEND_PAYMENT_LINK: "/wallet/send-recharge-link/",
  PAYMENT_LINK_STATUS: "/wallet/get-link-status/payment-link/",

  // MONET DASHBOARD
  GET_MONEY_DASHBOARD: "/bookings/customer-payments/money-dashboard/"
};




// status stage - house painting
// pending
// Confirmed
// Survey Ongoing
//  survey completed
//  pending hiring
// project ongoing

