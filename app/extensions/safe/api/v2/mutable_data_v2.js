const { genHandle, getObj, freeObj, marshallObj } = require('../helpers');

module.exports.manifest = {
//  _return_object_newRandomPrivate: 'promise',
  _return_object_newRandomPublic: 'promise',
/*  _return_object_newPrivate: 'promise',
  _return_object_newPublic: 'promise',
  _return_object_newPermissions: 'promise',
  _return_object_newMutation: 'promise',
  _return_object_newEntries: 'promise',
  _return_object_fromSerial: 'promise'*/
};

class MutableData {
  constructor(handle) {
    this.__handle = handle;
  }

  quickSetup(data, name, description) {
    return window.safeMutableData.quickSetup(this.__handle, data, name, description);
  }

  setMetadata(name, description) {
    return window.safeMutableData.setMetadata(this.__handle, name, description);
  }

  encryptKey(key) {
    return window.safeMutableData.encryptKey(this.__handle, key);
  }

  encryptValue(value) {
    return window.safeMutableData.encryptValue(this.__handle, value);
  }

  decrypt(value) {
    return window.safeMutableData.decrypt(this.__handle, value);
  }

  getNameAndTag() {
    return window.safeMutableData.getNameAndTag(this.__handle);
  }

  getVersion() {
    return window.safeMutableData.getVersion(this.__handle);
  }

  get(key) {
    return window.safeMutableData.get(this.__handle, key);
  }

  put(permissions, entries) {
    return window.safeMutableData.put(this.__handle, permissions.__handle, entries.__handle);
  }

  getEntries() {
    return window.safeMutableData.getEntries(this.__handle);
  }

  getKeys() {
    return window.safeMutableData.getKeys(this.__handle);
  }

  getValues() {
    return window.safeMutableData.getValues(this.__handle);
  }

  getPermissions() {
    return window.safeMutableData.getPermissions(this.__handle);
  }

  getUserPermissions(signKey) {
    return window.safeMutableData.getUserPermissions(this.__handle, signKey.__handle);
  }

  delUserPermissions(signKey, version) {
    return window.safeMutableData.delUserPermissions(this.__handle, signKey.__handle, version);
  }

  setUserPermissions(signKey, permSet, version) {
    return window.safeMutableData.setUserPermissions(this.__handle, signKey.__handle, permSet.__handle, version);
  }

  applyEntriesMutation(mutations) {
    return window.safeMutableData.applyEntriesMutation(this.__handle, mutations.__handle);
  }

  serialise() {
    return window.safeMutableData.serialise(this.__handle);
  }

  emulateAs(eml) {
    return window.safeMutableData.emulateAs(this.__handle, eml);
  }

  free() {
    return window.safeMutableData.free(this.__handle);
  }
};

const _genMarshalledMd = (app, md) => {
  const handle = genHandle(app, md);
  const mdObj = new MutableData(handle);
  return marshallObj(mdObj);
};

module.exports._return_object_newRandomPrivate = (safeApp, typeTag) => getObj(safeApp.__handle)
  .then((obj) => obj.app.mutableData.newRandomPrivate(typeTag)
    .then((md) => _genMarshalledMd(obj.app, md))
  );

module.exports._return_object_newRandomPublic = (safeApp, typeTag) => getObj(safeApp.__handle)
  .then((obj) => obj.app.mutableData.newRandomPublic(typeTag)
    .then((md) => _genMarshalledMd(obj.app, md))
  );

module.exports._return_object_fromSerial = (safeApp, data) => getObj(safeApp.__handle)
  .then((obj) => obj.app.mutableData.fromSerial(data)
    .then((md) => _genMarshalledMd(obj.app, md))
  );
