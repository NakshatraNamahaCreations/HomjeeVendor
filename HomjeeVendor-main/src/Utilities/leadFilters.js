// leadFilters.js
import moment from 'moment';

export const isFutureSlotToday = lead => {
  const slotDate = lead.selectedSlot?.slotDate;
  const slotTime = lead.selectedSlot?.slotTime;
  if (!slotDate || !slotTime) return false;
  const now = moment();
  const slotDateStr = moment(slotDate).format('YYYY-MM-DD');
  const slotDateTime = moment(
    `${slotDateStr} ${slotTime}`,
    'YYYY-MM-DD hh:mm A',
  );
  return slotDateTime.isAfter(now);
};

// olly for tab filter ... old
// export const filterLeads = (tab, leadsList, selectedStatus) => {
//   const today = moment().startOf('day');
//   const tomorrow = moment().add(1, 'day').startOf('day');

//   return leadsList.filter(lead => {
//     const slotDate = lead.selectedSlot?.slotDate;
//     if (!slotDate) return false;
//     const dateMoment = moment(slotDate);

//     if (tab === 'All Leads') return true;
//     if (tab === 'Today') {
//       return dateMoment.isSame(today, 'day') && isFutureSlotToday(lead);
//     }
//     if (tab === 'Tomorrow') {
//       return dateMoment.isSame(tomorrow, 'day');
//     }
//     if (selectedStatus) {
//       return lead.bookingDetails?.status === selectedStatus;
//     }
//     return false;
//   });
// };

export const filterLeads = (tab, leadsList, selectedStatus, searchText) => {
  const today = moment().startOf('day');
  const tomorrow = moment().add(1, 'day').startOf('day');
  const lowerSearch = searchText ? searchText?.toLowerCase() : '';
  console.log("today", today);

  return leadsList.filter(lead => {
    const slotDate = lead.selectedSlot?.slotDate;
    if (!slotDate) return false;
    const dateMoment = moment(slotDate);

    // Check tab-based filter
    let tabMatch = false;
    if (tab === 'All Leads') {
      tabMatch = true;
    } else if (tab === 'Today') {
      tabMatch = dateMoment.isSame(today, 'day') && isFutureSlotToday(lead);
    } else if (tab === 'Tomorrow') {
      tabMatch = dateMoment.isSame(tomorrow, 'day');
    }

    // Check status filter (if selectedStatus is provided)
    let statusMatch = true; // default true if no filter set
    if (selectedStatus) {
      statusMatch = lead.bookingDetails?.status === selectedStatus;
    }

    // Check search filter
    let searchMatch = true;
    if (lowerSearch) {
      const customerName = lead.customer?.name?.toLowerCase() || '';
      const streetArea = lead.address?.streetArea?.toLowerCase() || '';
      searchMatch =
        customerName.includes(lowerSearch) || streetArea.includes(lowerSearch);
    }

    return tabMatch && statusMatch && searchMatch;
  });
};
