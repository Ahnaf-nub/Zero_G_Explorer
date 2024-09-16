class AssetLoader{
    constructor(){
        this.assets = {};
    }

    allLoaded(lst){
        for(let i=0; i<lst.length; i++){
            if(!this.getAsset(lst[i])){
                return lst[i];
            }
        }
        return true;
    }
    loadAssetImage(name, path){
        this.assets[name] = {
            asset: loadImage(`static/assets/${path}`),
            _type: "image"
        }
    }

    async loadAssetSVG(name, path){
        let svg = new SVG(window, `static/assets/${path}`)
        console.log(name);
        this.assets[name] = {
            asset: svg,
            _type: "svg"
        }
    }

    async loadAssetSVGPath(name, path){
        let p = await loadSvgAndCreateVerts(`static/assets/${path}`);
        this.assets[name] = {
            asset: p,
            _type: "path"
        }
        return true;
    }

    getAsset(assetName){
        if(this.assets[assetName]){
            if(this.assets[assetName].asset){
                if(this.assets[assetName]._type == "path"){
                    let path = [];
                    for(let i=0; i<this.assets[assetName].asset.length; i++){
                        path.push({
                            x: this.assets[assetName].asset[i].x,
                            y: this.assets[assetName].asset[i].y
                        });
                    }
                    return path;
                }
                return this.assets[assetName].asset;
            }
        }
        else{
            return false;
        }
        return false;
    }
}



function getVerticesFromSvgPath(pathData) {
    const path = Matter.Svg.pathToVertices(pathData);    
    return path;
}

async function loadSvgAndCreateVerts(svgUrl) {
    try {
        const response = await fetch(svgUrl);
        const svgText = await response.text();

        // Create an SVG element and parse the SVG data
        const parser = new DOMParser();
        const svgDoc = parser.parseFromString(svgText, 'image/svg+xml');
        const pathElement = svgDoc.querySelector('path');

        if (!pathElement) {
            throw new Error('No <path> element found in SVG');
        }

        const pathData = pathElement.getAttribute('d');

        // Get vertices from SVG path data
        let vertices = getVerticesFromSvgPath(pathElement);
        vertices = vertices.filter((vertex, index) => {
            const prevVertex = vertices[index - 1];
            let dupl = false;
            if(prevVertex) dupl = (Math.abs(vertex.x - prevVertex.x) > 5 || Math.abs(vertex.y - prevVertex.y) > 5);
            return dupl;
        });
        return vertices;
    } catch (error) {
        console.error('Error loading SVG:', error);
    }
}