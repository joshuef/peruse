const safeApp = require('@maidsafe/safe-node-app');
import { CONFIG } from 'appConstants';
const { genHandle, marshallObj, netStateCallbackHelper } = require('../helpers');

/* eslint no-underscore-dangle: ["error", { "allow": ["_with_async_cb_initialise"] }] */

module.exports.manifest = {
  _return_object_initialise: 'promise',
};

class safeAppObj {
  constructor(handle) {
    this.__handle = handle;
  }

  connect() {
    console.log("Handle: ", this.__handle);
  }

  authorise(permissions, options) {
    console.log("Handle: ", this.__handle);
  }

}

/**
 * Create a new SAFEApp instance without a connection to the network
 * @name window.safeApp.initialise
 *
 * @param {AppInfo} appInfo
 * @param {Function} [networkStateCallback=null] optional callback function
 * to receive network state updates after a unregistered/registered
 * connection is made with `connect`/`connectAuthorised` functions.
 * @param {Boolean} enableLog specifies whether or not to enable backend logs. Defaults to false
 * @returns {Promise<SAFEApp>} new app object
 *
 * @example
 * window.safeApp.initialise({
 *       id: 'net.maidsafe.test.webapp.id',
 *       name: 'WebApp Test',
 *       vendor: 'MaidSafe Ltd.'
 *    }, (newState) => {
 *       console.log("Network state changed to: ", newState);
 *    })
 *    .then((appHandle) => {
 *       console.log('SAFEApp instance initialised and handle returned: ', appHandle);
 *    });
 */
module.exports._return_object_initialise = (appInfo, enableLog, safeAppGroupId) => { // eslint-disable-line no-underscore-dangle, max-len
  const appInfoCopy = Object.assign({}, appInfo);
  if (this && this.sender) {
    const wholeUrl = this.sender.getURL();
    appInfoCopy.scope = wholeUrl;
  } else {
    appInfoCopy.scope = null;
  }

  return safeApp.initializeApp(appInfo, null,
    { log: enableLog, registerScheme: false, libPath: CONFIG.LIB_PATH })
    .then((app) => {
      // We assign null to 'netObj' to signal this is a SAFEApp instance
      const handle = genHandle(app, null, safeAppGroupId);
      let appObj = new safeAppObj(handle);
      let str = marshallObj(appObj);
      console.log("safeAppObj serial: ", str);
      return str;
    });
};
