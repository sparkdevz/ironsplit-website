const { withInfoPlist } = require("@expo/config-plugins");

module.exports = function removeBackgroundAudio(config) {
  return withInfoPlist(config, (config) => {
    const modes = config.modResults.UIBackgroundModes;
    if (Array.isArray(modes)) {
      config.modResults.UIBackgroundModes = modes.filter((m) => m !== "audio");
      if (config.modResults.UIBackgroundModes.length === 0) {
        delete config.modResults.UIBackgroundModes;
      }
    }
    return config;
  });
};
