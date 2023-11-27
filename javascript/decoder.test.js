const { expect, test } = require("@jest/globals");
const {
  decodeUplink,
  isKthBitSet
} = require('./decoder');


test('should check if the bit  0 is set', () => {
  byte = parseInt('00000001', 2);
  expect(isKthBitSet(byte, 0)).toBeTruthy();
});

test('should check if bit 0 is not set', () => {
  byte = parseInt('00000000', 2);
  expect(isKthBitSet(byte, 0)).toBeFalsy();
});

test('should check if all bits are set', () => {
  bit_0_set = parseInt('00000001', 2);
  bit_1_set = parseInt('00000010', 2);
  bit_2_set = parseInt('00000100', 2);
  bit_3_set = parseInt('00001000', 2);
  bit_4_set = parseInt('00010000', 2);
  bit_5_set = parseInt('00100000', 2);
  bit_6_set = parseInt('01000000', 2);
  bit_7_set = parseInt('10000000', 2);

  expect(isKthBitSet(bit_0_set, 0)).toBeTruthy();
  expect(isKthBitSet(bit_1_set, 1)).toBeTruthy();
  expect(isKthBitSet(bit_2_set, 2)).toBeTruthy();
  expect(isKthBitSet(bit_3_set, 3)).toBeTruthy();
  expect(isKthBitSet(bit_4_set, 4)).toBeTruthy();
  expect(isKthBitSet(bit_5_set, 5)).toBeTruthy();
  expect(isKthBitSet(bit_6_set, 6)).toBeTruthy();
  expect(isKthBitSet(bit_7_set, 7)).toBeTruthy();
});

test('should check if all bits are not set', () => {
  bit_0_set = parseInt('00000000', 2);
  bit_1_set = parseInt('00000000', 2);
  bit_2_set = parseInt('00000000', 2);
  bit_3_set = parseInt('00000000', 2);
  bit_4_set = parseInt('00000000', 2);
  bit_5_set = parseInt('00000000', 2);
  bit_6_set = parseInt('00000000', 2);
  bit_7_set = parseInt('00000000', 2);

  expect(isKthBitSet(bit_0_set, 0)).toBeFalsy();
  expect(isKthBitSet(bit_1_set, 1)).toBeFalsy();
  expect(isKthBitSet(bit_2_set, 2)).toBeFalsy();
  expect(isKthBitSet(bit_3_set, 3)).toBeFalsy();
  expect(isKthBitSet(bit_4_set, 4)).toBeFalsy();
  expect(isKthBitSet(bit_5_set, 5)).toBeFalsy();
  expect(isKthBitSet(bit_6_set, 6)).toBeFalsy();
  expect(isKthBitSet(bit_7_set, 7)).toBeFalsy();
});

describe('decodeUplink', () => {
  it('should parse uplink with no zones created', () => {
    const input = {
      fPort: 1,
      bytes: [0, 0, 255, 255, 255, 255, 255, 255, 255, 255]
    }

    expect(decodeUplink(input))
      .toMatchObject({
        data:
        {
          zone_global: 0,
          zone_0: "not set",
          zone_1: "not set",
          zone_2: "not set",
          zone_3: "not set",
          zone_4: "not set",
          zone_5: "not set",
          zone_6: "not set",
          zone_7: "not set",
        }
      })
  })

  it('should parse uplink with all zones created', () => {
    const input = {
      fPort: 1,
      bytes: [0, 8, 1, 1, 1, 1, 1, 1, 1, 1]
    }

    expect(decodeUplink(input))
      .toMatchObject({
        data:
        {
          zone_global: 8,
          zone_0: 1,
          zone_1: 1,
          zone_2: 1,
          zone_3: 1,
          zone_4: 1,
          zone_5: 1,
          zone_6: 1,
          zone_7: 1,
        }
      })
  })

  it('should parse uplink with zone 0 occupancy created', () => {
    const input = {
      fPort: 1,
      bytes: [0, 5, 5, 255, 255, 255, 255, 255, 255, 255]
    }

    expect(decodeUplink(input))
      .toMatchObject({
        data:
        {
          zone_global: 5,
          zone_0: 5,
          zone_1: "not set",
          zone_2: "not set",
          zone_3: "not set",
          zone_4: "not set",
          zone_5: "not set",
          zone_6: "not set",
          zone_7: "not set",
        }
      })
  })

  it('should parse uplink with zone 0 occupancy created and reporting 0 people (min)', () => {
    const input = {
      fPort: 1,
      bytes: [0, 0, 0, 255, 255, 255, 255, 255, 255, 255]
    }

    expect(decodeUplink(input))
      .toMatchObject({
        data:
        {
          zone_global: 0,
          zone_0: 0,
          zone_1: "not set",
          zone_2: "not set",
          zone_3: "not set",
          zone_4: "not set",
          zone_5: "not set",
          zone_6: "not set",
          zone_7: "not set",
        }
      })
  })

  it('should parse uplink with zone 0 occupancy created and reporting 254 people (max)', () => {
    const input = {
      fPort: 1,
      bytes: [0, 254, 254, 255, 255, 255, 255, 255, 255, 255]
    }

    expect(decodeUplink(input))
      .toMatchObject({
        data:
        {
          zone_global: 254,
          zone_0: 254,
          zone_1: "not set",
          zone_2: "not set",
          zone_3: "not set",
          zone_4: "not set",
          zone_5: "not set",
          zone_6: "not set",
          zone_7: "not set",
        }
      })
  })

  it('should return WARMUP flag', () => {
    const input = {
      fPort: 1,
      bytes: [8, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    }
    expect(decodeUplink(input))
      .toMatchObject({
        data:
        {
          flags: {
            WARMUP: 1
          }
        }
      }
      )
  })

  it('should return WIFI_ACCESS_POINT_ON flag', () => {
    const input = {
      fPort: 1,
      bytes: [4, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    }
    expect(decodeUplink(input))
      .toMatchObject({
        data:
        {
          flags: {
            WIFI_ACCESS_POINT_ON: 1
          }
        }
      }
      )
  })

  it('should return STUCK flag', () => {
    const input = {
      fPort: 1,
      bytes: [2, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    }
    expect(decodeUplink(input))
      .toMatchObject({
        data:
        {
          flags: {
            STUCK: 1
          }
        }
      }
      )
  })


  it('should return STOPPED flag', () => {
    const input = {
      fPort: 1,
      bytes: [1, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    }
    expect(decodeUplink(input))
      .toMatchObject({
        data:
        {
          flags: {
            STOPPED: 1
          }
        }
      }
      )
  })

  it('should return WARMUP, STOPPED, STUCK, WIFI_ACCESS_POINT_ON flags', () => {
    const input = {
      fPort: 1,
      bytes: [15, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    }
    expect(decodeUplink(input))
      .toMatchObject({
        data:
        {
          flags: {
            STUCK: 1,
            STOPPED: 1,
            WIFI_ACCESS_POINT_ON: 1,
            WARMUP: 1
          }
        }
      }
      )
  })
})
