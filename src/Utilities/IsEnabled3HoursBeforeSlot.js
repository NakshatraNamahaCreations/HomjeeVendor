import moment from 'moment';

const IsEnabled3HoursBeforeSlot = (slotDateISOString, slotTimeStr) => {
  if (!slotDateISOString || !slotTimeStr) return false;

  // Get the date portion in local time (IST, user's time)
  const slotDateLocal = moment(slotDateISOString);
  const slotDateLocalString = slotDateLocal.format('YYYY-MM-DD');
  // Combine local date and slot time, then parse in local time!
  const slotDateTime = moment(
    `${slotDateLocalString} ${slotTimeStr}`,
    'YYYY-MM-DD hh:mm A',
  );

  // Debug: console.log('Slot DateTime:', slotDateTime.format(), "Now:", moment().format());

  const activationTime = slotDateTime.clone().subtract(3, 'hours');
  return moment().isSameOrAfter(activationTime);
};

export default IsEnabled3HoursBeforeSlot;
