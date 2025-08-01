export default {
  packagerConfig: {
    appBundleId: "top.isyuah.dev",
    name: 'Yumuzk',
    icon: "./logo",
    ignore: [],
  },
  makers: [
    {
      name: '@electron-forge/maker-zip',
      config: {}
    },
    // {
    //   name: '@electron-forge/maker-deb',
    //   platforms: ['linux'],
    //   config: {}
    // }
  ],
  outDir: "release"
};