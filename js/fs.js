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
  this.ContentFile = function ({name, mode, created, size, mimetype, content}) {
    const file = new fs.File({name: name, mode: mode, created: created, size: size, mimetype: mimetype});
    file.content = content;
    return file;
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
    this.unlink = function (file) {
      if (!(file instanceof fs.File || file instanceof fs.Directory || file instanceof String)) throw new Error(`@file must be fs.File(), fs.Directory() or String(); ${file?.constructor?.name} given`);
      if (!(file instanceof String)) file = file.basename;
      if (this.get(file) === undefined) return false;
      else {
        const deletedIndex = this.map[file];
        const success = delete this[deletedIndex] && delete this.map[file];
        if (success) {
          --this.length;
          for (let i = deletedIndex + 1; i <= this.length; ++i) {
            this[+i - 1] = this[i];
            --this.map[this[i].basename];
            if (+i === this.length) delete this[i];
          }
        }
        return success;
      }
    }
  }
  this.Directory = function ({name, collection, mode}) {
    if (typeof mode !== "number") mode = 0;
    if (!(collection instanceof fs.FileCollection)) throw new Error(`@collection must be Array(); ${collection?.constructor?.name} given`)
    const path = name.split("/");
    this.path = name;
    this.basename = path.slice(path.length - 1)[0];
    this.files = collection;
    this.parent = null;
    this.mode = mode;
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
      let path = file.path;
      while (path.startsWith("/")) path = path.substr(1);
      path = path.split("/");
      let parent = fs.tree;
      for (let i in path) {
        if (path[i] === "") continue;
        const segment = path[i];
        let nDir = parent.files.get(segment);
        if (+i < path.length - 1) {
          if (!(nDir instanceof fs.Directory)) {
            const dir = fs.mkdir(parent, new fs.Directory({name: "/" + path.slice(0, +i + 1).join("/"), collection: new fs.FileCollection(), mode: file.mode}));
            parent = dir;
          }
          else parent = nDir;
        }
        else parent.files.push(file, parent);
      }
    });
  }
  this.mkdir = function (parent, dir) {
    if (!(parent instanceof fs.Directory || parent instanceof fs.FileCollection)) throw new Error(`@parent fs.Directory() or fs.FileCollection(); ${parent?.constructor?.name} given`);
    else if (!(dir instanceof fs.Directory)) throw new Error(`@dir must be fs.Directory(); ${dir?.constructor?.name} given`);
    if (parent instanceof fs.Directory) {
      dir.parent = parent;
      parent.files.push(dir);
    }
    else
      parent.push(dir);
    return dir;
  }
  this.tree = new fs.Directory({name:"/", collection: new fs.FileCollection(), mode:0});
}

function FileManager (el, fs = new CloudnodeFS(), options = {}) {

  this.options = options;
  this.options.sortFiles = options.sortFiles === undefined ? "name+" : options.sortFiles;

  this.elements = {
    root: el,
    sidebar: el.querySelector(".filemanager-sidebar"),
    body: el.querySelector(".filemanager-body"),
    nav: el.querySelector(".breadcrumb"),
    editor: el.querySelector(".filemanager-editor"),
    editorMd: el.querySelector(".filemanager-editor .editor-md"),
    editorCode: el.querySelector(".filemanager-editor .editor-code"),
    editorLoading: el.querySelector(".filemanager-editor .editor-loading")
  };

  this.navigate = function (path) {
    if (path instanceof fs.Directory) path = path.path;
    let p = path.split("/")
    if (path.startsWith("/")) {
      this.currentLocation = fs.tree;
      p = p.slice(1);
    }
    if (path !== "/") for (let i in p) {
      const d = p[i];
      if (d === "..") {
        if (this.currentLocation.parent instanceof fs.Directory) this.currentLocation = this.currentLocation.parent;
        continue;
      }
      const file = this.currentLocation.files.get(d);
      if (file instanceof fs.Directory) this.currentLocation = file;
      else if (file === undefined) {
        main.page.toast({theme:{background:"danger"},body:{content:`Directory "${d}" does not exist.`}})
        return;
      }
      else if (+i === p.length - 1) {
        if (file instanceof fs.File) this.openEditor(file);
        return file;
      }
      else throw new Error("Unexpected situation");
    }
    this.renderDirectory(this.currentLocation);
  }
  this.currentLocation = null;

  this.editors = {}

  // todo open file edit screen
  this.openEditor = function (file) {
    if (!(file instanceof fs.File)) {
      main.page.toast({theme:{background:"danger"},body:{content:`Error opening file.`}});
      throw new Error(`@file must be fs.File(), ${file?.constructor?.name} given`)
    }
    this.elements.root.querySelectorAll("card-body div").forEach(el => {
      el.classList.contains("filemanager-editor") ? el.style.removeProperty("display") : el.style.display = "none";
    });
    this.elements.nav.style.display = "none";
    

    this.elements.editorLoading.style.removeProperty("display");
    fs.api.file(file => {
      file = new fs.File(file);
      switch (file.mimetype) {
        case "text/x-markdown":
        case "text/markdown": {
          this.elements.editorCode.style.display = "none";
          this.elements.editorMd.style.removeProperty("display");
          if (this.editors.markdown === undefined) {
            // init tui editor
            const tuiCss = document.createElement("link");
            tuiCss.href = "/r/css/tui-editor.css";
            tuiCss.rel = "stylesheet";
            document.head.append(tuiCss);
            if ((matchMedia("(prefers-color-scheme: dark)") ?? false).matches || localStorage.theme === "dark") {
              const tuiCssDark = document.createElement("link");
              tuiCssDark.href = "/r/css/tui-editor-dark.css";
              tuiCssDark.rel = "stylesheet";
              document.head.append(tuiCssDark);
            }
            main.page.loadScript("/r/js/tui-editor.js", () => {
              this.editors.markdown = new toastui.Editor({
                el: this.elements.editorMd.children[0],
                previewStyle: 'tab',
                height: '500px',
                theme: ((matchMedia("(prefers-color-scheme: dark)") ?? false).matches || localStorage.theme === "dark" ? "dark" : void(0))
              });
            });
          }
        }
        default: {

        }
      }
    });
  }

  this.mkdir = function () {
    const modal = main.page.modal({header:"New Folder", body:{content:`<form autocomplete="off" id="newFolder"><div class="form-floating"><input class="form-control" placeholder=" " id="name"><label for="name">Name</label></div><p class="form-text"></p></form>`},footer:{buttons:[{class:"btn btn-primary",attributes:{form:"newFolder",type:"submit"},close:false,text:"Create"},{class:"btn btn-secondary",close:true,text:"Cancel"}]}});
    setTimeout(() => modal._element.querySelector("input").focus(), 350);
    modal._element.querySelector("input").addEventListener("input", () => {
      modal._element.querySelector(".form-text").innerHTML = "";
      let name = modal._element.querySelector("input").value.replace(/\s+/g, " ").trim();
      if (name.includes("../")) {
        modal._element.querySelector(".form-text").innerHTML = `Folder names cannot contain "../".`;
        modal._element.querySelector("input").value = name.replace(/\.\.\//g, "");
      }
      else if (name.includes("/")) {
        modal._element.querySelector(".form-text").innerHTML = `Folder names cannot contain "/".`;
        modal._element.querySelector("input").value = name.replace(/\//g, "");
      }
      if (name.startsWith(".")) modal._element.querySelector(".form-text").innerHTML = `Folders with "." at the beginning of their name are hidden.`;
      if (name === "") name === "New Folder";
      const existingFile = this.currentLocation.files.get(name);
      if (existingFile !== undefined) {
        let i = 1;
        while (this.currentLocation.files.get(`${name} (${i})`) !== undefined) ++i;
        name = `${name} (${i})`;
        modal._element.querySelector(".form-text").innerHTML = `A ${existingFile instanceof fs.File ? "file" : "folder"} with that name already exists. Create <b>${name.replace(/>/g, "&gt;")}</b>?`;
      }
    })
    modal._element.querySelector("form").addEventListener("submit", (e) => {
      e.preventDefault();
      let name = modal._element.querySelector("input").value.replace(/\s+/g, " ").trim();
      if (["", " "].includes(name)) name = "New Folder";
      if (this.currentLocation.files.get(name) !== undefined) {
        let i = 1;
        while (this.currentLocation.files.get(`${name} (${i})`) !== undefined) ++i;
        name = `${name} (${i})`;
      }
      const dir = fs.mkdir(this.currentLocation, new fs.Directory({name: this.currentLocation.path + (this.currentLocation.path.endsWith("/") ? "" : "/") + name, collection: new fs.FileCollection(), mode:0}))
      location.hash = `#browse=${dir.path}`;
      modal.hide();
    })
  }

  this.createFile = function () {
    const modal = main.page.modal({header:"New File", body:{content:`<form autocomplete="off" id="newFolder"><div class="form-floating"><input class="form-control" placeholder=" " id="name"><label for="name">Name</label></div><p class="form-text"></p></form>`},footer:{buttons:[{class:"btn btn-primary",attributes:{form:"newFolder",type:"submit"},close:false,text:"Create"},{class:"btn btn-secondary",close:true,text:"Cancel"}]}});
    setTimeout(() => modal._element.querySelector("input").focus(), 350);
    modal._element.querySelector("input").addEventListener("input", () => {
      modal._element.querySelector(".form-text").innerHTML = "";
      let name = modal._element.querySelector("input").value.replace(/\s+/g, " ").trim();
      if (name.includes("../")) {
        modal._element.querySelector(".form-text").innerHTML = `File names cannot contain "../".`;
        modal._element.querySelector("input").value = name.replace(/\.\.\//g, "");
      }
      else if (name.includes("/")) {
        modal._element.querySelector(".form-text").innerHTML = `File names cannot contain "/".`;
        modal._element.querySelector("input").value = name.replace(/\//g, "");
      }
      if (name.startsWith(".")) modal._element.querySelector(".form-text").innerHTML = `Files with "." at the beginning of their name are hidden.`;
      if (name === "") name === "New File";
      const existingFile = this.currentLocation.files.get(name);
      if (existingFile !== undefined) {
        let i = 1;
        while (this.currentLocation.files.get(`${name} (${i})`) !== undefined) ++i;
        name = `${name} (${i})`;
        modal._element.querySelector(".form-text").innerHTML = `A ${existingFile instanceof fs.File ? "file" : "folder"} with that name already exists. Create <b>${name.replace(/>/g, "&gt;")}</b>?`;
      }
    })
    modal._element.querySelector("form").addEventListener("submit", (e) => {
      e.preventDefault();
      let name = modal._element.querySelector("input").value.replace(/\s+/g, " ").trim();
      if (["", " "].includes(name)) name = "New File";
      if (this.currentLocation.files.get(name) !== undefined) {
        let i = 1;
        while (this.currentLocation.files.get(`${name} (${i})`) !== undefined) ++i;
        name = `${name} (${i})`;
      }
      //{name, mode, created, size, mimetype}
      const file = new fs.File({name: this.currentLocation.path + (this.currentLocation.path.endsWith("/") ? "" : "/") + name, mode: 0, created: Date.now(), size: 0, mimetype: "application/x-empty"});
      fs.link(file);
      location.hash = `#browse=${file.path}`;
      modal.hide();
    })
  }

  this.renderDirectory = function (dir) {
    this.elements.body.innerHTML = "";
    const files = [],
          dirs = [];
    dir.files.forEach(file => {
      if (file instanceof fs.File) files.push(file);
      else dirs.push(file);
    });
    let compareFunction = () => 0;
    switch (this.options.sortFiles) {
      case "name+":
        compareFunction = (a, b) => {
          const nameA = a.basename.toLowerCase();
          const nameB = b.basename.toLowerCase();
          if (nameA < nameB)
            return -1;
          if (nameA > nameB)
            return 1;
          return 0;
        };
        break;
      case "name-":
        compareFunction = (a, b) => {
          const nameA = a.basename.toLowerCase();
          const nameB = b.basename.toLowerCase();
          if (nameA < nameB)
            return 1;
          if (nameA > nameB)
            return -1;
          return 0;
        };
        break;
      case "size+":
        compareFunction = (a, b) => {
          const sizeA = a instanceof fs.Directory ? a.files.length : a.size;
          const sizeB = b instanceof fs.Directory ? b.files.length : b.size;
          return a - b;
        };
        break;
      case "size-":
        compareFunction = (a, b) => {
          const sizeA = a instanceof fs.Directory ? a.files.length : a.size;
          const sizeB = b instanceof fs.Directory ? b.files.length : b.size;
          return b - a;
        };
        break;
    }
    files.sort(compareFunction);
    dirs.sort(compareFunction);
    if (files.length > 0 || dirs.length > 0) {
      this.elements.body.innerHTML = `<div class="filemanager-files"></div>`;
      for (let dir of dirs) this.renderFile(dir);
      for (let file of files) this.renderFile(file);
    }
    else this.elements.body.innerHTML = `<div class="filemanager-empty"><span class="icon-tt icon-folder"><span class="path1"></span><span class="path2"></span></span><p>Folder is Empty</p></div>`;

    // show path in nav
    this.elements.nav.innerHTML = "";
    if (dir.path === "/") this.elements.nav.innerHTML = `<li class="breadcrumb-item active" aria-current="page">Home</li>`;
    else {
      const path = dir.path.split("/");
      let html = "";
      for (let i in path) {
        const fullPath = "/" + path.slice(1, +i + 1).join("/");
        if (+i === path.length - 1) html += `<li class="breadcrumb-item active" aria-current="page">${["", "/"].includes(path[i]) ? "Home" : path[i]}</li>`;
        else html += `<li class="breadcrumb-item"><a href="#browse=${fullPath}">${["", "/"].includes(path[i]) ? "Home" : path[i]}</a></li>`;
      }
      this.elements.nav.innerHTML = html;
    }
  }

  this.renderFile = function (file) {
    const d = document.createElement("div");
    d.draggable = true;
    d.classList.add("filemanager-file");
    const icon = document.createElement("div");
    icon.classList.add("filemanager-file-icon");
    icon.append(this.getIcon(file));
    d.append(icon);
    const data = document.createElement("div");
    data.classList.add("filemanager-file-data");
    d.append(data);
    const name = document.createElement("span");
    name.classList.add("name");
    name.innerHTML = file.basename;
    const meta = document.createElement("span");
    meta.classList.add("meta");
    if (file instanceof fs.Directory) meta.innerHTML = `${file.files.length} item${file.files.length === 1 ? "" : "s"}`;
    else meta.innerHTML = `${main.utils.readableBytes(file.size)}`;
    data.append(name, meta);
    if (file instanceof fs.File && file.mode === 1) {
      const shared = document.createElement("div");
      shared.classList.add("filemamager-file-shared");
      shared.innerHTML = `<span class="icon-tt icon-share"><span class="path1"></span><span class="path2"></span><span class="path3"></span><span class="path4"></span></span>`;
      d.append(shared);
    }
    this.elements.body.querySelector(".filemanager-files").append(d);

    // events
    d.addEventListener("dblclick", () => location.hash = `#browse=${file.path}`);
    d.addEventListener("mousedown", (e) => {
      if (!e.ctrlKey) {
        this.elements.body.querySelectorAll(".filemanager-files .filemanager-file.selected").forEach((e) => e.classList.remove("selected"));
        this.selected = new fs.FileCollection();
      }
      e.target.classList.toggle("selected");
      if (e.target.classList.contains("selected")) this.selected.push(file);
      else this.selected.unlink(file);
    });
    d.addEventListener("dragstart", (e) => {
      e.dataTransfer.dropEffect = "move";
      e.dataTransfer.setData("text/plain", JSON.stringify(this.selected.map));
    })

    return d;
  }
  this.selected = new fs.FileCollection();
  this.getIcon = function (file) {
    const icon = document.createElement("img");
    if (file instanceof fs.Directory) {
      if (file.basename === ".backups") icon.src = `${this.options.icons}/places/default-folder-recent.svg`;
      else if (file.basename.toLowerCase() === "documents") icon.src = `${this.options.icons}/places/default-folder-documents.svg`;
      else if (file.basename.toLowerCase() === "downloads") icon.src = `${this.options.icons}/places/default-folder-download.svg`;
      else if (file.basename.toLowerCase() === "music") icon.src = `${this.options.icons}/places/default-folder-music.svg`;
      else if (["pictures", "photos"].includes(file.basename.toLowerCase())) icon.src = `${this.options.icons}/places/default-folder-pictures.svg`;
      else if (["videos", "movies", "films"].includes(file.basename.toLowerCase())) icon.src = `${this.options.icons}/places/default-folder-video.svg`;
      else if (["public_html", "html", "htdocs", "www"].includes(file.basename.toLowerCase())) icon.src = `${this.options.icons}/places/folder-html.svg`;
      else if (["$recycle.bin", "rubbish bin"].includes(file.basename.toLowerCase())) icon.src = file.files.length === 0 ? `${this.options.icons}/places/user-trash.svg` : `${this.options.icons}/places/user-trash-full.svg`;
      else if (file.basename.endsWith(".srv")) icon.src = `${this.options.icons}/places/network-server.svg`;
      else if (file.mode === 1) icon.src = `${this.options.icons}/places/default-network.svg`;
      else icon.src = `${this.options.icons}/places/default-folder.svg`;
    }
    else {
      icon.src = `${this.options.icons}/mimetypes/${file.mimetype.toLowerCase().replace("/", "-")}.svg`;
    }
    icon.addEventListener("error", () => icon.src = `${this.options.icons}/mimetypes/text-x-generic.svg`);
    icon.alt = file.basename;
    return icon;
  }
}

main.fs = {
  driver: CloudnodeFS,
  cdn: CdnApi,
  fm: FileManager
}