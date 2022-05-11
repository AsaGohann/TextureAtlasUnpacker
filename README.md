# TextureAtlasUnpacker
It's used to slice a set of `png` and `atlas` to some small pngs. There are other scripts which slice png with `plist` or `json`, or get the same size pngs.
I don't find `Javascript` to finish this task, so I write this program refrence by other similar scripts

## Usage
```bash
node unpacker.js yourAtlasName outputPath
```
The first parameter is  atlas file name without extention. the second parameter is output path, default value is output.

## Dependence
It depend on NodeJS module `fs`,`path`, `images`.

# Welcome to use and feedback