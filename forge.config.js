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
    }
  ],
  outDir: "release"
};