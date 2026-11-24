# Team Astralis lunar portfolio scene

This viewer uses the Orbit, Moon Map, Surface, camera transition and landing suggestion code from [Lunar Landing Site Navigator v1.5.1](https://github.com/Debaprashad-Bhowmik/project-astralis/tree/v1.5.1). The portfolio supplies mission and scene controls through same-origin messages. The rendering window contains the canvases and map markers.

The default is Patch 1 on 25 December 2026 at 00:00 UTC. The bundled SPICE ephemeris covers 2024–2030. The Moon Map projects the Sun and Earth from its current camera using the same perspective and occultation as Orbit. The landing worker screens the original 6,685-patch inventory over the requested mission. Surface meshes load from the four bundled LOLA south-polar grids and the southernmost row of the global terrain tiles. Foreground rocks and the surface texture retain their illustrative treatment.

The globe uses the original 4K LROC texture as its base image. Orbit zoom uses the portfolio controls or Ctrl + scroll so regular scrolling continues through the page. See the team's [source register](https://github.com/Debaprashad-Bhowmik/project-astralis/blob/v1.5.1/docs/submission-sources.md) and [third-party notices](https://github.com/Debaprashad-Bhowmik/project-astralis/blob/v1.5.1/THIRD_PARTY_NOTICES.md) for scientific, imagery, and media credits.
