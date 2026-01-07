export const toNumber = v => {
  const n = parseFloat(String(v).replace(',', '.'));
  return Number.isFinite(n) ? n : 0;
};

const area = (w, h) => +Math.max(toNumber(w) * toNumber(h), 0).toFixed(2);

const mapOpenings = (arr = []) =>
  (arr || []).map(o => ({
    width: toNumber(o.width),
    height: toNumber(o.height),
    area: area(o.width, o.height),
  }));

export function buildMeasurementPayload({ vendorId, leadId, rooms }) {
  console.log('roomsState', rooms);
  //   const rooms = {};

  //   roomsState.forEach(room => {
  //     const ceilings = [];
  //     const walls = [];

  //     room.sections.forEach(sec => {
  //       const width = toNumber(sec.width);
  //       const height = toNumber(sec.height);

  //       if (sec.type === 'ceiling') {
  //         ceilings.push({
  //           width,
  //           height,
  //           area: area(width, height),
  //         });
  //       } else if (sec.type === 'wall') {
  //         const windows = mapOpenings(sec.windows);
  //         const doors = mapOpenings(sec.doors);
  //         const cupboards = mapOpenings(sec.cupboards);

  //         const openingsArea = [...windows, ...doors, ...cupboards].reduce(
  //           (sum, o) => sum + o.area,
  //           0,
  //         );

  //         const net = Math.max(area(width, height) - openingsArea, 0);

  //         walls.push({
  //           width,
  //           height,
  //           area: +net.toFixed(2),
  //           windows,
  //           doors,
  //           cupboards,
  //         });
  //       }
  //     });

  //     rooms[room.roomName] = {
  //       mode: room.mode || 'REPAINT',
  //       unit: room.unit || 'FT',
  //       ceilings,
  //       walls,
  //     };
  //   });

  return { vendorId, leadId, rooms };
}
