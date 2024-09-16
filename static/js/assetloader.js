class AssetLoader{
    constructor(){
        this.assets = {};
    }

    setAll(){
        for(let assetName in this.assets){
            let tp = this.assets[assetName]._type;
            if(tp == "svg"){
                this.assets[assetName].asset = this.assets[assetName].asset.toImage(1000, 1000);
            }
        }
    }

    loadAssetImage(name, path){
        this.assets[name] = {
            asset: loadImage(`static/assets/${path}`),
            _type: "image"
        }
    }

    async loadAssetSVG(name, path){
        let svg = new SVG(window, `static/assets/${path}`)
        //console.log(svg);
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
    }

    getAsset(assetName){
        if(this.assets[assetName]){
            return this.assets[assetName].asset;
        }
        else{
            console.error(`Asset ${assetName} not found`);
            return false;
        }
    }
}



function getVerticesFromSvgPath(pathData) {
    const path = Matter.Svg.pathToVertices(pathData, 100);
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
        console.log(pathElement);

        if (!pathElement) {
            throw new Error('No <path> element found in SVG');
        }

        const pathData = pathElement.getAttribute('d');

        // Get vertices from SVG path data
        const vertices = getVerticesFromSvgPath(pathElement);
        return vertices;
        // Create a Matter.js body from vertices
        const body = Bodies.fromVertices(400, 300, [vertices], {
            render: {
                fillStyle: 'blue'
            }
        });

        // Add the body to the world
        World.add(world, body);
    } catch (error) {
        console.error('Error loading SVG:', error);
    }
}