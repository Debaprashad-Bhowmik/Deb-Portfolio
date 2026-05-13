Drop the final Coupling Bolt GLB here as:

coupling-bolt.glb

The current site uses a procedural CSS/SVG mechanical artifact so the viewer works before the 3D model is available.

The CubeSat thermal section now includes the supplied STEP source asset:

3U-WEATHER-CUBESAT-v1.step

Three.js cannot load STEP directly in the browser. Export this source to one of these web mesh names and the section will prefer it first:

3U-WEATHER-CUBESAT-v1.glb
3U-WEATHER-CUBESAT-v1.gltf
3U-WEATHER-CUBESAT-v1.fbx

The GLB version is currently present and used first.

The fallback FBX model is:

CubeSat-Final-Assembly.fbx

It will then try a converted Assem2 asset in this order:

Assem2.glb
Assem2.gltf
Assem2.fbx

SolidWorks .SLDASM files are source assembly files and cannot be loaded by Three.js directly.

The diesel digital twin section uses the supplied CAT engine OBJ:

CAT_C32_1417KW_Engine.obj

This OBJ is large, so a future GLB/DRACO export would improve first-load performance.
