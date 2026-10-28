# Roadmap

What is planned next, and what is deliberately not built yet. The app stays static: anything below is prepared at build time, committed as files and served from GitHub Pages. Nothing is fetched from another site while someone uses the page, and no API keys are needed.

## Next: a map and area facts

These three pieces would answer "what is it like round here?" for each saved home. They are not built because each needs a reviewed build step, a size budget and a clear statement of what the data can and cannot say.

### 1. A map of the saved homes

- **What:** a map beside the Homes list, one marker per postcode area, the list still carrying every figure.
- **How:** [MapLibre GL JS](https://github.com/maplibre/maplibre-gl-js) to draw it, with the map tiles built once for Winchester into a single [PMTiles](https://github.com/protomaps/PMTiles) file in the repository, read with HTTP range requests from GitHub Pages. No tile server and no map API key.
- **Licences:** MapLibre GL JS is BSD-3-Clause. The PMTiles reference code is BSD-3-Clause and the format specification is public domain. Map data would come from OpenStreetMap (ODbL), which needs on-map attribution.
- **Open questions:** the tile file size for the district at useful zoom levels, and keeping the map keyboard-accessible with the list as the main way in.

### 2. Real walking times to the station

- **What:** replace each example home's single "minutes to the station" figure with a walking area: everywhere within 15 and 22 minutes of Winchester station, the same yardsticks the fit score uses.
- **How:** run [Valhalla](https://github.com/valhalla/valhalla) once at build time over OpenStreetMap data to produce isochrones (walk-time outlines), saved as GeoJSON beside the map tiles. The browser only reads the file.
- **Licences:** Valhalla is MIT. The routing data is OpenStreetMap (ODbL).
- **Open questions:** walking speed and the effect of hills, which would need to be stated plainly next to the result.

### 3. Area facts by postcode

- **What:** for each postcode area, a short set of facts: recorded street-level crime, flood risk and how local prices have moved.
- **Sources, all published under the [Open Government Licence v3.0](https://www.nationalarchives.gov.uk/doc/open-government-licence/version/3/):**
  - [police.uk open data](https://data.police.uk/about/). Crime locations are deliberately moved to the nearest anonymous map point, so they describe an area, never a street or a home.
  - Environment Agency [Risk of Flooding from Rivers and Sea](https://www.data.gov.uk/dataset/943d2bbb-aa08-45d1-96cb-42556cd01d94/risk-of-flooding-from-rivers-and-sea2). It estimates risk to an area of land and is not a property-level assessment.
  - HM Land Registry [UK House Price Index](https://www.gov.uk/government/publications/about-the-uk-house-price-index/about-the-uk-house-price-index), which needs its set attribution statement.
- **How:** a script in `scripts/` downloads each source, keeps only the Winchester postcode areas, records the download URL, date and checksum, and writes a small JSON file. CI rebuilds it and fails on any difference, the same way the market snapshot works today.
- **Open questions:** how to show area figures without implying anything about a single home, and how often to refresh them.

## Done in this round

- Fit score computed from fixed yardsticks with editable weights and a ranking stability check.
- Stamp duty from the GOV.UK rates and the money needed on completion day.
- Lifetime ISA rules shown where they apply.
- Evidence checklist rebuilt around the National Trading Standards material information list.
