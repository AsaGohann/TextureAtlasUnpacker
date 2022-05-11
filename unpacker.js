const fs = require("fs")
const images = require("images")
const path = require("path")
const defaultOutputDir = "output"
let outputPath
let regions = []
function main() {
    const atlasPath = process.argv[2]
    outputPath = process.argv[3]
    if (!outputPath) {
        outputPath = defaultOutputDir
    }
    parseAtlas(atlasPath + ".atlas")
    slicePng()
}

function loadPng(pngPath) {
    return images(pngPath)
}

function slicePng() {
    for (const region of regions) {
        var originImage = images(region.originalWidth, region.originalHeight)
        var slicePng = images(region.page, region.x, region.y, region.width, region.height).rotate(region.degrees)
        var pngName = path.join(__dirname, outputPath, region.name)
        fs.mkdirSync(path.dirname(pngName), {recursive: true})
        originImage.draw(slicePng, region.offsetX, region.offsetY).save(pngName + ".png")
    }
}

function parseAtlas(atlasPath) {
    if (!fs.existsSync(atlasPath)) {
        console.log("atlas does not exist")
        exit(1)
    }
    var name = path.join(__dirname, atlasPath)
    var dirname = path.dirname(name)
    const fileData = fs.readFileSync(atlasPath, { encoding : "utf8"})
    const reader = new Reader(fileData)
    let page = null;
    let entry = [];
    
    while(true) {
        var line = reader.readLine()
        if(line == null) {
            break;
        }
        line = line.trim()
        if(line.length == 0) {
            page = null
        } else if(page == null) {
            var pngPath = path.join(dirname, line)
            page = loadPng(pngPath)
            for (let i = 0; i < 4; ++i) {
                reader.readLine()
            }
        } else {
            var region = {};
            region.name = line;
            region.page = page;
            while(true) {
                var rotateValue = reader.readValue();
				if(rotateValue.toLowerCase() == "true") {
					region.degrees = 90;
				} else if(rotateValue.toLowerCase() == "false") {
					region.degrees = 0
				} else {
					region.degrees = Number(rotateValue);
				}
				region.rotate = region.degrees == 90
                reader.readEntry(entry)
				region.x = Number(entry[0])
				region.y = Number(entry[1])
                reader.readEntry(entry)
                if (region.rotate) {
                    region.width = Number(entry[1])
				    region.height = Number(entry[0])
                } else {
                    region.width = Number(entry[0])
				    region.height = Number(entry[1])
                }
				
                reader.readEntry(entry)
                region.originalWidth = Number(entry[0])
				region.originalHeight = Number(entry[1])
                reader.readEntry(entry)
                region.offsetX = Number(entry[0])
				region.offsetY = Number(entry[1])
                region.index = reader.readValue()
                if (region.index != -1) {
                    region.name = region.name + "_" + region.index
                }
                 break
            }
            regions.push(region)
        }
    }
}

class Reader {
    constructor(atlasFile) {
        let lineEnd = /\r\n|\r|\n/g
        let newEndString = "__@__"
        this.lines = atlasFile.replace(lineEnd, newEndString).split(newEndString)
        this.index = 0
    }
    readLine() {
        if (this.index >= this.lines.length) {
            return null
        }
        return this.lines[this.index++]
    }
    readValue() {
		var line = this.readLine()
		var colon = line.indexOf(":")
		if(colon == -1) {
			return 0
		}
		return line.substring(colon + 1).trim()
	}
    readEntry(entry) {
        var line = this.readLine()
        var colon = line.indexOf(":")
		if(colon == -1) {
			return 0
		}
        entry[0] = line.substring(0, colon).trim()
        let i = 0
		let lastMatch = colon + 1
        while(true) {
            var comma = line.indexOf("," ,lastMatch)
            var substring = line.substring(lastMatch, comma).trim()
            if (comma == -1) {
                entry[i] = line.substring(lastMatch).trim()
                break
            }
            lastMatch = comma + 1
            entry[i] = substring.trim()
            ++i
        }
        return
    }
}

main()