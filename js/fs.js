/* Copyright (C) 2021 Cloudnode - All Rights Reserved
 * Any use, distribution or modification of this code
 * is subject to the terms of the provided license.
 *
 * The license is available at the root (/) of the
 * repository. If not, please write to:
 * support@cloudnode.pro
 */

 function CdnApi (api, ep = `cdn.${location.hostname}`, enabled = true) {
  for (let ep in api) this[ep] = api[ep];
  this.endpoint = ep;
  this.enabled = true;
}
function CloudnodeFS (api) {
  const fs = this;
  if (api instanceof CdnApi) this.api = api;
  this.File = function ({name, mode, created, size, mimetype}) {
    const path = name.split("/");
    this.path = name;
    this.basename = path.slice(path.length - 1)[0];
    this.mode = mode;
    this.created = new Date(created);
    this.size = size;
    this.mimetype = mimetype;
    this.toObject = function () {
      return {
        path: this.path,
        basename: this.basename,
        mode: this.mode,
        created: this.created,
        size: this.size
      };
    }
  }
  this.FileCollection = function (files = []) {
    if (!(files instanceof Array)) throw new Error(`@files must be Array(); ${files?.constructor?.name} given`)
    this.length = 0;
    this.map = {};
    this.push = function (file, parent = null) {
      if (file instanceof fs.File || file instanceof fs.Directory) {
        if (parent instanceof fs.Directory) file.parent = parent;
        this[this.length] = file;
        this.map[file.basename] = this.length;
        ++this.length;
      }
      else throw new Error(`@file must be fs.File() or fs.Directory; ${file?.constructor?.name} given`);
    }
    for (let file of files) if (file instanceof fs.File) this.push(file);
    this.forEach = function (fn = new Function) {
      for (let i in this) {
        const file = this[i];
        if (file instanceof fs.File || file instanceof fs.Directory) fn(file, +i, this);
      }
    }
    this.get = function (basename) {
      return this[this.map[basename]];
    }
  }
  this.Directory = function ({name, collection}) {
    if (!(collection instanceof fs.FileCollection)) throw new Error(`@files must be Array(); ${collection?.constructor?.name} given`)
    const path = name.split("/");
    this.path = name;
    this.basename = path.slice(path.length - 1)[0];
    this.files = collection;
    this.parent = null;
    this.toObject = function (options) {
      if (typeof options !== "object") options = {};
      const slashes = options.slashes === true;
      const fullPath = options.fullPath === true;
      const dirName = slashes ? this.basename + "/" : (fullPath ? this.path : this.basename);
      let obj = {};
      this.files.forEach(file => {
        const fileName = slashes ? file.basename + "/" : (fullPath ? file.path : file.basename);
        obj[fileName] = file.toObject();
      });
      return obj;
    }
  }
  this.link = function (files) {
    if (files instanceof fs.File) files = new fs.FileCollection([files]);
    else if (files instanceof Array) files = new fs.FileCollection(files);
    if (!(files instanceof fs.FileCollection)) throw new Error(`Cannot construct fs.FileCollection() from @files. Acceptable options for @files are Array(), fs.File() and fs.FileCollection(); ${files?.constructor?.name} given`);
    files.forEach(file => {
      const path = file.path.split("/");
      let parent = fs.tree;
      for (let i in path) {
        const segment = path[i];
        let nDir = parent.files.get(segment);
        if (!(nDir instanceof fs.Directory) && i < path.length - 1) {
          const dir = fs.mkdir(parent, new fs.Directory({name: path.slice(0, i).join("/"), collection: new fs.FileCollection()}));
          parent = dir;
        }
        else parent.files.push(file, parent);
      }
    });
  }
  this.mkdir = function (parent, dir) {
    if (!(parent instanceof fs.Directory || parent instanceof fs.FileCollection)) throw new Error(`@parent fs.Directory() or fs.FileCollection(); ${parent?.constructor?.name} given`);
    else if (!(dir instanceof fs.Directory)) throw new Error(`@dir must be fs.Directory(); ${dir?.constructor?.name} given`);
    if (parent instanceof fs.Directory) parent = parent.files;
    dir.parent = parent;
    parent.push(dir);
    return dir;
  }
  this.tree = new fs.Directory({name:"@root", collection: new fs.FileCollection()});
}

function FileManager (el, fs = new CloudnodeFS()) {
  this.element = el;
  this.sidebar = el.querySelector(".filemanager-sidebar");
  this.body = el.querySelector(".filemanager-body");
  this.nav = el.querySelector(".breadcrumb");

  this.renderFile = function (file) {
    const d = document.createElement("div");
    d.classList.add("filemanager-file");
  }
}

main.fs = {
  driver: CloudnodeFS,
  cdn: CdnApi,
  fm: FileManager
}