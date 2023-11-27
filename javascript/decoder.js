function isKthBitSet(byte, k) {
  return byte & (1 << k);
}

function decodeFlags(flagByte) {
  var flags = new Object()

  if (isKthBitSet(flagByte, 0))
    flags.STOPPED = 1

  if (isKthBitSet(flagByte, 1))
    flags.STUCK = 1

  if (isKthBitSet(flagByte, 2))
    flags.WIFI_ACCESS_POINT_ON = 1

  if (isKthBitSet(flagByte, 3))
    flags.WARMUP = 1

  return flags
}

function decodeZoneOccupancy(byte){

  if (byte == 255)
    return "not set"

  return byte
}


/* UPLINKS WITH CUSTOM FRAME STRUCTURE */
COUNTING_DATA_UPLINK = 1
/* UPLINKS WITH CUSTOM FRAME STRUCTURE END */

function decodeUplink(input) {

  var data = new Object()

  var fport = input.fPort

  if (fport === COUNTING_DATA_UPLINK) {
    data.flags = decodeFlags(input.bytes[0])
    data.zone_global = input.bytes[1]
    data.zone_0 = decodeZoneOccupancy(input.bytes[2])
    data.zone_1 = decodeZoneOccupancy(input.bytes[3])
    data.zone_2 = decodeZoneOccupancy(input.bytes[4])
    data.zone_3 = decodeZoneOccupancy(input.bytes[5])
    data.zone_4 = decodeZoneOccupancy(input.bytes[6])
    data.zone_5 = decodeZoneOccupancy(input.bytes[7])
    data.zone_6 = decodeZoneOccupancy(input.bytes[8])
    data.zone_7 = decodeZoneOccupancy(input.bytes[9])

    return {
      data
    };
  }

}


// Exporting for testing only, don't copy the lines below
// To Network Server Decoder
module.exports = {
  decodeUplink,
  decodeFlags,
  isKthBitSet,
  decodeZoneOccupancy
};
