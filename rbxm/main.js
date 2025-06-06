const fs = require('fs');
const { readModel } = require('rbx-reader');

const assetRegex = /\d{5,}/g; // Match 5+ digit numbers
const wantedProps = ["MeshId", "TextureID", "Texture", "SoundId", "AnimationId", "Graphic", "LinkedSource", "SourceAssetId"];

function extractAssets(instances, results = new Set()) {
    for (const instance of instances) {
        for (const [key, val] of Object.entries(instance.properties || {})) {
            if (wantedProps.includes(key) && typeof val === 'string') {
                const matches = val.match(assetRegex);
                if (matches) {
                    for (const id of matches) {
                        results.add("rbxassetid://" + id);
                    }
                }
            }
        }
        if (instance.children) extractAssets(instance.children, results);
    }
    return results;
}

// Run from CLI
const filePath = process.argv[2];
if (!filePath) {
    console.error("Usage: node extract-assets.js <file.rbxm>");
    process.exit(1);
}

const buffer = fs.readFileSync(filePath);
const model = readModel(buffer);
const assets = extractAssets(model.children);

for (const asset of assets) {
    console.log(asset);
}
