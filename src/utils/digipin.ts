/**
 * Function Get_DIGIPIN() takes latitude-longitude as input and encodes
 * it into a 10 digit alphanumeric code
 * A higher precision (up to 5 decimal places) of latitude-longitude input
 * values results in more precise DIGIPIN
 */
export function Get_DIGIPIN(lat: number, lon: number): string {
  // DIGIPIN Labelling Grid
  const L = [
    ['F', 'C', '9', '8'],
    ['J', '3', '2', '7'],
    ['K', '4', '5', '6'],
    ['L', 'M', 'P', 'T']
  ];
  
  let vDIGIPIN = '';
  // variable for identification of row and column of the cells
  let row = 0; 
  let column = 0;
  
  // Bounding Box Extent
  let MinLat = 2.5; 
  let MaxLat = 38.50; 
  let MinLon = 63.50; 
  let MaxLon = 99.50;
  
  let LatDivBy = 4; 
  let LonDivBy = 4;
  let LatDivDeg = 0; 
  let LonDivDeg = 0;
  
  if (lat < MinLat || lat > MaxLat) {
    // Modified to return error message instead of using alert()
    return '';
  }
  
  if (lon < MinLon || lon > MaxLon) {
    // Modified to return error message instead of using alert()
    return '';
  }
  
  for (let Lvl = 1; Lvl <= 10; Lvl++) {
    LatDivDeg = (MaxLat - MinLat) / LatDivBy;
    LonDivDeg = (MaxLon - MinLon) / LonDivBy;
    
    let NextLvlMaxLat = MaxLat;
    let NextLvlMinLat = MaxLat - LatDivDeg;
    
    for (let x = 0; x < LatDivBy; x++) {
      if (lat >= NextLvlMinLat && lat < NextLvlMaxLat) {
        row = x;
        break;
      } else {
        NextLvlMaxLat = NextLvlMinLat;
        NextLvlMinLat = NextLvlMaxLat - LatDivDeg;
      }
    }
    
    let NextLvlMinLon = MinLon;
    let NextLvlMaxLon = MinLon + LonDivDeg;
    
    for (let x = 0; x < LonDivBy; x++) {
      if (lon >= NextLvlMinLon && lon < NextLvlMaxLon) {
        column = x;
        break;
      } else if ((NextLvlMinLon + LonDivDeg) < MaxLon) { // ADDRESSES BOUNDARY CONDITION
        NextLvlMinLon = NextLvlMaxLon;
        NextLvlMaxLon = NextLvlMinLon + LonDivDeg;
      } else {
        column = x;
      }
    }
    
    if (Lvl == 1) {
      if (L[row][column] == "0") {
        vDIGIPIN = "Out of Bound";
        break;
      }
    }
    
    vDIGIPIN = vDIGIPIN + L[row][column];
    
    // Add spaces for readability
    if (Lvl == 3 || Lvl == 6) {
      vDIGIPIN = vDIGIPIN + " ";
    }
    
    // Set Max boundary for next level
    MinLat = NextLvlMinLat; 
    MaxLat = NextLvlMaxLat;
    MinLon = NextLvlMinLon; 
    MaxLon = NextLvlMaxLon;
  }
  
  return vDIGIPIN;
}

/**
 * Function Get_LatLng_By_Digipin() takes a 10 digit alphanumeric code
 * as input and encodes it into degree-decimal coordinates
 */
export function Get_LatLng_By_Digipin(vDigiPin: string): string {
  vDigiPin = vDigiPin.replace(/\s/g, '');
  
  if (vDigiPin.length != 10) {
    return "Invalid DIGIPIN";
  }
  
  // DIGIPIN Labelling Grid
  const L = [
    ['F', 'C', '9', '8'],
    ['J', '3', '2', '7'],
    ['K', '4', '5', '6'],
    ['L', 'M', 'P', 'T']
  ];
  
  // Bounding Box Extent
  let MinLat = 2.50; 
  let MaxLat = 38.50; 
  let MinLng = 63.50; 
  let MaxLng = 99.50;
  
  const LatDivBy = 4;
  const LngDivBy = 4;
  let LatDivVal = 0;
  let LngDivVal = 0;
  
  let ri: number, ci: number, f: number;
  let Lat1: number, Lat2: number, Lng1: number, Lng2: number;
  
  for (let Lvl = 0; Lvl < 10; Lvl++) {
    ri = -1;
    ci = -1;
    const digipinChar = vDigiPin.charAt(Lvl);
    
    LatDivVal = (MaxLat - MinLat) / LatDivBy;
    LngDivVal = (MaxLng - MinLng) / LngDivBy;
    
    f = 0;
    for (let r = 0; r < LatDivBy; r++) {
      for (let c = 0; c < LngDivBy; c++) {
        if (L[r][c] == digipinChar) {
          ri = r;
          ci = c;
          f = 1;
          break;
        }
      }
      if (f === 1) break;
    }
    
    if (f == 0) {
      return 'Invalid DIGIPIN';
    }
    
    Lat1 = MaxLat - (LatDivVal * (ri + 1));
    Lat2 = MaxLat - (LatDivVal * ri);
    Lng1 = MinLng + (LngDivVal * ci);
    Lng2 = MinLng + (LngDivVal * (ci + 1));
    
    MinLat = Lat1;
    MaxLat = Lat2;
    MinLng = Lng1;
    MaxLng = Lng2;
  }
  
  const cLat = (MaxLat + MinLat) / 2;
  const cLng = (MaxLng + MinLng) / 2;
  
  return `${cLat.toFixed(6)}, ${cLng.toFixed(6)}`;
}
