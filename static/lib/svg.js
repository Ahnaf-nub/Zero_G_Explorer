class SVG {
    constructor(p5, path, successCallback, failureCallback) {
      const img = new Image();
      img.onerror = e => {
        p5._friendlyFileLoadError(0, img.src);
        if (typeof failureCallback === 'function') {
          failureCallback(e);
        } else {
          console.error(e);
        }
      };
      
      img.onload = () => {
        this.elt.videoWidth = img.width
        this.elt.videoHeight = img.height
        if (typeof successCallback === 'function') {
          successCallback(this);
        }
        p5._decrementPreload();
      };
      
      // Set crossOrigin in case image is served with CORS headers.
      // This will let us draw to the canvas without tainting it.
      // See https://developer.mozilla.org/en-US/docs/HTML/CORS_Enabled_Image
      // When using data-uris the file will be loaded locally
      // so we don't need to worry about crossOrigin with base64 file types.
      if (path.indexOf('data:image/') !== 0) {
        img.crossOrigin = 'Anonymous';
      }
      // start loading the image
      img.src = path;
      
      // Hack to make `image` treat this like video
      this.elt = img;
      this.elt.videoWidth = 1;
      this.elt.videoHeight = 1;
      p5._incrementPreload();
    }
    
    toGraphics(width, height) {
      const g = createGraphics(width, height);
      g.image(this, 0, 0, width, height);
      return g;
    }
    
    toImage(width, height) {
      const g = this.toGraphics(width, height);
      const img = g.get();
      g.remove();
      return img;
    }
  }