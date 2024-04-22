const { expect, test } = require("@jest/globals");
const {
  decodeUplink,
  isKthBitSet,
  registerCommand,
  getCommand,
  parseHeader,
  uint16,
  uint32
} = require('./decoder');


test('should check if the bit  0 is set', () => {
  const byte = parseInt('00000001', 2);
  expect(isKthBitSet(byte, 0)).toBeTruthy();
});

test('should check if bit 0 is not set', () => {
  const byte = parseInt('00000000', 2);
  expect(isKthBitSet(byte, 0)).toBeFalsy();
});

test('should check if all bits are set', () => {
  const bit_0_set = parseInt('00000001', 2);
  const bit_1_set = parseInt('00000010', 2);
  const bit_2_set = parseInt('00000100', 2);
  const bit_3_set = parseInt('00001000', 2);
  const bit_4_set = parseInt('00010000', 2);
  const bit_5_set = parseInt('00100000', 2);
  const bit_6_set = parseInt('01000000', 2);
  const bit_7_set = parseInt('10000000', 2);

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
  const bit_0_set = parseInt('00000000', 2);
  const bit_1_set = parseInt('00000000', 2);
  const bit_2_set = parseInt('00000000', 2);
  const bit_3_set = parseInt('00000000', 2);
  const bit_4_set = parseInt('00000000', 2);
  const bit_5_set = parseInt('00000000', 2);
  const bit_6_set = parseInt('00000000', 2);
  const bit_7_set = parseInt('00000000', 2);

  expect(isKthBitSet(bit_0_set, 0)).toBeFalsy();
  expect(isKthBitSet(bit_1_set, 1)).toBeFalsy();
  expect(isKthBitSet(bit_2_set, 2)).toBeFalsy();
  expect(isKthBitSet(bit_3_set, 3)).toBeFalsy();
  expect(isKthBitSet(bit_4_set, 4)).toBeFalsy();
  expect(isKthBitSet(bit_5_set, 5)).toBeFalsy();
  expect(isKthBitSet(bit_6_set, 6)).toBeFalsy();
  expect(isKthBitSet(bit_7_set, 7)).toBeFalsy();
});

describe('uint16', () => {
  it("should convert arbitrary uint16", () => {
    expect(uint16([5, 220])).toBe(1500);
  });

  it("should convert max uint16", () => {
    expect(uint16([255, 255])).toBe(65535);
  });

  it("should convert min uint16", () => {
    expect(uint16([0, 0])).toBe(0);
  });

  it("should fail with too many bytes error", () => {
    expect(() => uint16([0, 2, 2])).toThrow('uint16 must have exactly 2 bytes');
  });

  it("should fail with too little bytes error", () => {
    expect(() => uint16([1])).toThrow('uint16 must have exactly 2 bytes');
  });
});

describe('uint32', () => {
  it("should convert arbitrary uint32", () => {
    expect(uint32([0, 0, 1, 200])).toBe(456);
  });

  it("should convert max uint32", () => {
    expect(uint32([255, 255, 255, 255])).toBe(4294967295);
  });

  it("should convert min uint32", () => {
    expect(uint32([0, 0, 0, 0])).toBe(0);
  });

  it("should fail with too many bytes error", () => {
    expect(() => uint32([0, 2, 2, 4 ,5])).toThrow('uint32 must have exactly 4 bytes');
  });

  it("should fail with too little bytes error", () => {
    expect(() => uint32([0, 2, 2])).toThrow('uint32 must have exactly 4 bytes');
  });
});

describe('decodeUplink', () => {
  it('should parse uplink with no zones created', () => {
    const input = {
      fPort: 83,
      bytes: [0, 0, 255, 255, 255, 255, 255, 255, 255, 255]
    };

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
      });
  });

  it('should parse uplink with all zones created', () => {
    const input = {
      fPort: 83,
      bytes: [0, 8, 1, 1, 1, 1, 1, 1, 1, 1]
    };

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
      });
  });

  it('should parse uplink with zone 0 occupancy created', () => {
    const input = {
      fPort: 83,
      bytes: [0, 5, 5, 255, 255, 255, 255, 255, 255, 255]
    };

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
      });
  });

  it('should parse uplink with zone 0 occupancy created and reporting 0 people (min)', () => {
    const input = {
      fPort: 83,
      bytes: [0, 0, 0, 255, 255, 255, 255, 255, 255, 255]
    };

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
      });
  });

  it('should parse uplink with zone 0 occupancy created and reporting 254 people (max)', () => {
    const input = {
      fPort: 83,
      bytes: [0, 254, 254, 255, 255, 255, 255, 255, 255, 255]
    };

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
      });
  });

  it('should return WARMUP flag', () => {
    const input = {
      fPort: 83,
      bytes: [8, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    };
    expect(decodeUplink(input))
      .toMatchObject({
        data:
        {
          flags: {
            WARMUP: 1
          }
        }
      }
      );
  });

  it('should return WIFI_ACCESS_POINT_ON flag', () => {
    const input = {
      fPort: 83,
      bytes: [4, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    };
    expect(decodeUplink(input))
      .toMatchObject({
        data:
        {
          flags: {
            WIFI_ACCESS_POINT_ON: 1
          }
        }
      }
      );
  });

  it('should return STUCK flag', () => {
    const input = {
      fPort: 83,
      bytes: [2, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    };
    expect(decodeUplink(input))
      .toMatchObject({
        data:
        {
          flags: {
            STUCK: 1
          }
        }
      }
      );
  });


  it('should return STOPPED flag', () => {
    const input = {
      fPort: 83,
      bytes: [1, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    };
    expect(decodeUplink(input))
      .toMatchObject({
        data:
        {
          flags: {
            STOPPED: 1
          }
        }
      }
      );
  });

  it('should return WARMUP, STOPPED, STUCK, WIFI_ACCESS_POINT_ON flags', () => {
    const input = {
      fPort: 83,
      bytes: [15, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    };
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
      );
  });
});

describe('parseHeader', () => {
  it("should parse Header with acknowledge", () => {
    expect(parseHeader([255, 1, 0])).toMatchObject({
      cmd_id: 1,
      ack: true,
      type: "acknowledge"
    });
  });
});

describe('registerCommand', () => {
  it("should register command", () => {
    const registered_commands_map = new Map();

    const fport = 2;
    registerCommand(registered_commands_map, fport, "CMD_FOO", 1);

    expect(registered_commands_map.get("0201")).toMatchObject({
      command_name: "CMD_FOO"
    });

    registerCommand(registered_commands_map, fport, "CMD_BAR", 130);

    expect(registered_commands_map.get("0282")).toMatchObject({
      command_name: "CMD_BAR"
    });
  });

  it("should fail with fport out of bounds", () => {
    const registered_commands_map = new Map();

    const fport = 256;
    expect(() => {
      registerCommand(registered_commands_map, fport, "CMD_ID_FOO", 200)
    }).toThrow("fport must be between 1 and 255");
  });

  it("should fail with cmd_id out of bounds", () => {
    const registered_commands_map = new Map();

    const fport = 30;
    expect(() => {
      registerCommand(registered_commands_map, fport, "CMD_ID_WRONG", 255)
    }).toThrow("cmd_id must be between 0 and 254");
  });

  it("should get handler name and command name", () => {
    const registered_commands_map = new Map();

    const fport = 2;
    registerCommand(registered_commands_map, fport, "CMD_CNT_RST", 1);

    expect(getCommand(registered_commands_map, 2 , 1)).toMatchObject({
      command_name: "CMD_CNT_RST"
    });
  });

  it("should fail with command not registered", () => {
    const registered_commands_map = new Map();

    expect(() => getCommand(registered_commands_map, 10, 10)).toThrow("command not registered");
  });

  it("should execute the foo command payload parser", () => {
    const registered_commands_map = new Map();

    const fooParser = function(payload) {
      return payload;
    };
    const fport = 99;
    registerCommand(registered_commands_map, fport, "CMD_FOO", 99, fooParser);

    const command = getCommand(registered_commands_map, 99, 99);
    expect(command.parsePayload([255, 255])).toStrictEqual([255, 255]);
  });
});

describe('mounting height', () => {

  it('should handle CMD_GET_HEIGHT command', () => {

    const fport = 100;

    const input = {
      fPort: fport,
      bytes: [1, 5, 220]
    };

    expect(decodeUplink(input))
    .toMatchObject({data: {
      cmd: {
        name: "CMD_GET_HEIGHT",
        id: 1,
        success: true,
        value: {
          mounting_height: 1500
        }
      }
    }});
  });

  it('should handle CMD_SET_HEIGHT command', () => {
    const fport = 100;

    const input = {
      fPort: fport,
      bytes: [255, 129, 0]
    };

    expect(decodeUplink(input))
    .toMatchObject({data: {
      cmd: {
        name: "CMD_SET_HEIGHT",
        id: 129,
        success: true
      }
    }});
  });

});

describe('push period', () => {

  it('should handle CMD_GET_PUSH_PERIOD command', () => {
    const fport = 100;

    const input = {
      fPort: fport,
      bytes: [3, 0, 0, 0, 60]
    };

    expect(decodeUplink(input))
    .toMatchObject({data: {
      cmd: {
        name: "CMD_GET_PUSH_PERIOD",
        id: 3,
        success: true,
        value: {
          push_period_s: 60
        }
      }
    }});
  });

  it('should handle CMD_SET_PUSH_PERIOD command', () => {
    const fport = 100;

    const input = {
      fPort: fport,
      bytes: [255, 131, 0]
    };

    expect(decodeUplink(input))
    .toMatchObject({data: {
      cmd: {
        name: "CMD_SET_PUSH_PERIOD",
        id: 131,
        success: true
      }
    }});
  });

});

describe('device use case', () => {

  it('should handle CMD_GET_DEVICE_USE_CASE', () => {
    const fport = 100;

    let input = {
      fPort: fport,
      bytes: [5, 0]
    };

    expect(decodeUplink(input))
      .toMatchObject({
        data: {
          cmd: {
            name: "CMD_GET_DEVICE_USE_CASE",
            id: 5,
            success: true,
            value: {
              device_use_case: "open space"
            }
          }
        }
      });

    input = {
      fPort: fport,
      bytes: [5, 1]
    };

    expect(decodeUplink(input))
      .toMatchObject({
        data: {
          cmd: {
            name: "CMD_GET_DEVICE_USE_CASE",
            id: 5,
            success: true,
            value: {
              device_use_case: "installation mode"
            }
          }
        }
      });

    input = {
      fPort: fport,
      bytes: [5, 2]
    };

    expect(decodeUplink(input))
      .toMatchObject({
        data: {
          cmd: {
            name: "CMD_GET_DEVICE_USE_CASE",
            id: 5,
            success: true,
            value: {
              device_use_case: "meeting room"
            }
          }
        }
      });

    input = {
      fPort: fport,
      bytes: [5, 3]
    };

    expect(decodeUplink(input))
      .toMatchObject({
        data: {
          cmd: {
            name: "CMD_GET_DEVICE_USE_CASE",
            id: 5,
            success: true,
            value: {
              device_use_case: "waiting lounge"
            }
          }
        }
      });


    input = {
      fPort: fport,
      bytes: [5, 4]
    };

    expect(decodeUplink(input))
      .toMatchObject({
        data: {
          cmd: {
            name: "CMD_GET_DEVICE_USE_CASE",
            id: 5,
            success: true,
            value: {
              device_use_case: "work office"
            }
          }
        }
      });

    input = {
      fPort: fport,
      bytes: [5, 5]
    };

    expect(decodeUplink(input))
      .toMatchObject({
        data: {
          cmd: {
            name: "CMD_GET_DEVICE_USE_CASE",
            id: 5,
            success: true,
            value: {
              device_use_case: "point of sale"
            }
          }
        }
      });

    input = {
      fPort: fport,
      bytes: [5, 9]
    };

    expect(decodeUplink(input))
      .toMatchObject({
        data: {
          cmd: {
            name: "CMD_GET_DEVICE_USE_CASE",
            id: 5,
            success: true,
            value: {
              device_use_case: "not recognized"
            }
          }
        }
      });
  });

  it('should handle CMD_SET_DEVICE_USE_CASE', () => {
    const fport = 100;

    const input = {
      fPort: fport,
      bytes: [255, 133, 0]
    };

    expect(decodeUplink(input))
    .toMatchObject({data: {
      cmd: {
        name: "CMD_SET_DEVICE_USE_CASE",
        id: 133,
        success: true
      }
    }});
  });

});

describe("reboot", () => {
  it("should handle CMD_DEVICE_REBOOT", () => {
    const fport = 3;

    const input = {
      fPort: fport,
      bytes: [255, 1, 0]
    };

    expect(decodeUplink(input))
    .toMatchObject({data: {
      cmd: {
        name: "CMD_DEVICE_REBOOT",
        id: 1,
        success: true
      }
    }});
  });
});

describe("software version", () => {
  it('should handle CMD_GET_SW_VER command', () => {

    const fport = 4;

    const input = {
      fPort: fport,
      bytes: [138, 0, 118, 48, 46, 57, 46, 50, 45, 69, 85, 0]
    };

    expect(decodeUplink(input))
    .toMatchObject({data: {
      cmd: {
        name: "CMD_GET_SW_VER",
        id: 138,
        success: true,
        value: {
          software_version: "v0.9.2-EU"
        }
      }
    }});
  });

  it('should handle CMD_GET_DEVICE_TYPE POC', () => {

    const fport = 4;

    const input = {
      fPort: fport,
      bytes: [128, 80, 79, 67]
    };

    expect(decodeUplink(input))
    .toMatchObject({data: {
      cmd: {
        name: "CMD_GET_DEVICE_TYPE",
        id: 128,
        success: true,
        value: {
          device_type: "POC"
        }
      }
    }});
  });

  it('should handle CMD_GET_DEVICE_TYPE PCM', () => {

    const fport = 4;

    const input = {
      fPort: fport,
      bytes: [128, 80, 67, 77]
    };

    expect(decodeUplink(input))
    .toMatchObject({data: {
      cmd: {
        name: "CMD_GET_DEVICE_TYPE",
        id: 128,
        success: true,
        value: {
          device_type: "PCM"
        }
      }
    }});
  });

  it('should handle CMD_GET_DEVICE_TYPE not recognized', () => {

    const fport = 4;

    const input = {
      fPort: fport,
      bytes: [128, 88, 88, 88]
    };

    expect(decodeUplink(input))
    .toMatchObject({data: {
      cmd: {
        name: "CMD_GET_DEVICE_TYPE",
        id: 128,
        success: true,
        value: {
          device_type: "not recognized"
        }
      }
    }});
  });

  it('should handle CMD_GET_LORA_MODULE_VERSION', () => {

    const fport = 4;

    const input = {
      fPort: fport,
      bytes: [139, 82, 85, 73, 95, 52, 46, 48, 46, 50]
    };

    expect(decodeUplink(input))
    .toMatchObject({data: {
      cmd: {
        name: "CMD_GET_LORA_MODULE_VERSION",
        id: 139,
        success: true,
        value: {
          lora_module_version: "RUI_4.0.2"
        }
      }
    }});
  });

  it('should handle CMD_GET_LORA_MODULE_VERSION failed to retrieve module version', () => {

    const fport = 4;

    const input = {
      fPort: fport,
      bytes: [139, 255, 255, 255]
    };

    expect(decodeUplink(input))
    .toMatchObject({data: {
      cmd: {
        name: "CMD_GET_LORA_MODULE_VERSION",
        id: 139,
        success: true,
        value: {
          lora_module_version: "failure to retrieve"
        }
      }
    }});
  });

});

describe("access point", () => {
  it('should handle CMD_SET_ACCESS_POINT_STATE', () => {

    const fport = 5;

    const input = {
      fPort: fport,
      bytes: [255, 129, 0]
    };

    expect(decodeUplink(input))
    .toMatchObject({data: {
      cmd: {
        name: "CMD_SET_ACCESS_POINT_STATE",
        id: 129,
        success: true
      }
    }});
  });

  it('should handle CMD_GET_ACCESS_POINT_STATE', () => {

    const fport = 5;

    let input = {
      fPort: fport,
      bytes: [1, 0]
    };

    expect(decodeUplink(input))
    .toMatchObject({data: {
      cmd: {
        name: "CMD_GET_ACCESS_POINT_STATE",
        id: 1,
        success: true,
        value: {
          state: "DISABLED"
        }
      }
    }});

    input = {
      fPort: fport,
      bytes: [1, 1]
    };

    expect(decodeUplink(input))
    .toMatchObject({data: {
      cmd: {
        name: "CMD_GET_ACCESS_POINT_STATE",
        id: 1,
        success: true,
        value: {
          state: "ENABLED"
        }
      }
    }});
  });
});

describe('rejoin', () => {
  it('should handle CMD_FORCE_REJOIN', () => {
    const fport = 6;

    const input = {
      fPort: fport,
      bytes: [255, 1, 0]
    };

    expect(decodeUplink(input))
    .toMatchObject({data: {
      cmd: {
        name: "CMD_FORCE_REJOIN",
        id: 1,
        success: true
      }
    }});
  });
});

describe("occupancy management", () => {
  it('should handle CMD_SET_OCCUPANCY_ZONE', () => {
    const fport = 101;

    const input = {
      fPort: fport,
      bytes: [255, 129, 0]
    };

    expect(decodeUplink(input))
      .toMatchObject({
        data: {
          cmd: {
            name: "CMD_SET_OCCUPANCY_ZONE",
            id: 129,
            success: true
          }
        }
      });
  });

  it('should handle CMD_SET_EXCLUDING_ZONE', () => {
    const fport = 101;

    const input = {
      fPort: fport,
      bytes: [255, 130, 0]
    };

    expect(decodeUplink(input))
      .toMatchObject({
        data: {
          cmd: {
            name: "CMD_SET_EXCLUDING_ZONE",
            id: 130,
            success: true
          }
        }
      });
  });

  it("should handle CMD_DELETE_OCCUPANCY_ZONE", () => {
    const fport = 101;

    const input = {
      fPort: fport,
      bytes: [255, 131, 0]
    };

    expect(decodeUplink(input))
      .toMatchObject({
        data: {
          cmd: {
            name: "CMD_DELETE_OCCUPANCY_ZONE",
            id: 131,
            success: true
          }
        }
      });
  });

  it('should handle CMD_GET_ACTIVE_ZONES with zero active zones', () => {
    const fport = 101;

    const input = {
      fPort: fport,
      bytes: [1]
    };

    expect(decodeUplink(input))
      .toMatchObject({
        data: {
          cmd: {
            name: "CMD_GET_ACTIVE_ZONES",
            id: 1,
            success: true,
            value: {
              zone_0: false,
              zone_1: false,
              zone_2: false,
              zone_3: false,
              zone_4: false,
              zone_5: false,
              zone_6: false,
              zone_7: false
            }
          }
        }
      });
  });

  it('should handle CMD_GET_ACTIVE_ZONES with one active zone', () => {
    const fport = 101;

    const input = {
      fPort: fport,
      bytes: [1, 0]
    };

    expect(decodeUplink(input))
      .toMatchObject({
        data: {
          cmd: {
            name: "CMD_GET_ACTIVE_ZONES",
            id: 1,
            success: true,
            value: {
              zone_0: true,
              zone_1: false,
              zone_2: false,
              zone_3: false,
              zone_4: false,
              zone_5: false,
              zone_6: false,
              zone_7: false
            }
          }
        }
      });
  });

  it('should handle CMD_GET_ACTIVE_ZONES with all (8) active zones', () => {
    const fport = 101;

    const input = {
      fPort: fport,
      bytes: [1, 0, 1, 2, 3, 4, 5, 6, 7]
    };

    expect(decodeUplink(input))
      .toMatchObject({
        data: {
          cmd: {
            name: "CMD_GET_ACTIVE_ZONES",
            id: 1,
            success: true,
            value: {
              zone_0: true,
              zone_1: true,
              zone_2: true,
              zone_3: true,
              zone_4: true,
              zone_5: true,
              zone_6: true,
              zone_7: true
            }
          }
        }
      });
  });

  it('should handle CMD_GET_OCCUPANCY_ZONE_COORDINATES', () => {
    const fport = 101;

    let input = {
      fPort: fport,
      bytes: [2, 32, 0, 0, 0, 24, 6]
    };

    expect(decodeUplink(input))
      .toMatchObject({
        data: {
          cmd: {
            name: "CMD_GET_OCCUPANCY_ZONE_COORDINATES",
            id: 2,
            success: true,
            value: {
              type: "rectangle",
              zone_id: 0,
              point_1: [0, 0],
              point_2: [3, 3]
            }
          }
        }
      });

    input = {
      fPort: fport,
      bytes: [2, 32, 86, 153, 144, 44, 28]
    };

    expect(decodeUplink(input))
      .toMatchObject({
        data: {
          cmd: {
            name: "CMD_GET_OCCUPANCY_ZONE_COORDINATES",
            id: 2,
            success: true,
            value: {
              type: "rectangle",
              zone_id: 0,
              point_1: [173, 204],
              point_2: [517, 526]
            }
          }
        }
      });
  });

  it('should handle CMD_GET_OCCUPANCY_ZONE_COORDINATES unsuported type', () => {
    const fport = 101;

    const input = {
      fPort: fport,
      bytes: [2, 64, 0, 0, 0, 0]
    };

    expect(decodeUplink(input))
      .toMatchObject({
        data: {
          cmd: {
            name: "CMD_GET_OCCUPANCY_ZONE_COORDINATES",
            id: 2,
            success: true,
            value: {
              type: "not supported",
              zone_id: 0
            }
          }
        }
      });
  });

  it('should handle CMD_GET_EXCLUDING_ZONE_COORDINATES', () => {
    const fport = 101;

    let input = {
      fPort: fport,
      bytes: [3, 32, 0, 0, 0, 24, 6]
    };

    expect(decodeUplink(input))
      .toMatchObject({
        data: {
          cmd: {
            name: "CMD_GET_EXCLUDING_ZONE_COORDINATES",
            id: 3,
            success: true,
            value: {
              type: "rectangle",
              zone_id: 0,
              point_1: [0, 0],
              point_2: [3, 3]
            }
          }
        }
      });

    input = {
      fPort: fport,
      bytes: [3, 32, 86, 153, 144, 44, 28]
    };

    expect(decodeUplink(input))
      .toMatchObject({
        data: {
          cmd: {
            name: "CMD_GET_EXCLUDING_ZONE_COORDINATES",
            id: 3,
            success: true,
            value: {
              type: "rectangle",
              zone_id: 0,
              point_1: [173, 204],
              point_2: [517, 526]
            }
          }
        }
      });
  });


  it('should handle CMD_GET_ANALOG_OUTPUT', () => {
    const fport = 8;

    let input = {
      fPort: fport,
      bytes: [1, 0, 0, 255]
    };

    expect(decodeUplink(input))
    .toMatchObject({data: {
      cmd: {
        name: "CMD_GET_ANALOG_OUTPUT",
        id: 1,
        success: true,
        value: {
          max_occupancy: 255,
          state: "DISABLED"
        }
      }
    }});

    input = {
      fPort: fport,
      bytes: [1, 0, 255, 255]
    };

    expect(decodeUplink(input))
    .toMatchObject({data: {
      cmd: {
        name: "CMD_GET_ANALOG_OUTPUT",
        id: 1,
        success: true,
        value: {
          max_occupancy: 65535,
          state: "DISABLED"
        }
      }
    }});

    input = {
      fPort: fport,
      bytes: [1, 1, 0, 0]
    };

    expect(decodeUplink(input))
    .toMatchObject({data: {
      cmd: {
        name: "CMD_GET_ANALOG_OUTPUT",
        id: 1,
        success: true,
        value: {
          max_occupancy: 0,
          state: "ENABLED"
        }
      }
    }});
  });

  it('should handle CMD_SET_ANALOG_OUTPUT', () => {

    const fport = 8;

    let input = {
      fPort: fport,
      bytes: [255, 129, 0]
    };

    expect(decodeUplink(input))
      .toMatchObject({
        data: {
          cmd: {
            name: "CMD_SET_ANALOG_OUTPUT",
            id: 129,
            success: true
          }
        }
      });
  });

});