import re
import logging

logger = logging.getLogger(__name__)

# Base coordinate around Hyderabad for mock fallback
HYDERABAD_LAT = 17.4410
HYDERABAD_LON = 78.3820

def extract_metadata_and_coordinates(text: str):
    """
    Parses OCR text to extract:
    1. Owner Name
    2. Survey Number
    3. Property Area
    4. Boundary Coordinates (Polygon)
    """
    # 1. Owner name extraction
    owner_match = re.search(r'(?:owner|sold to|purchaser|name of owner|owner_name)\s*:\s*([A-Za-z\s\.]+)', text, re.IGNORECASE)
    owner_name = owner_match.group(1).strip() if owner_match else "Unknown Owner"
    
    # 2. Survey number extraction
    survey_match = re.search(r'(?:survey|survey number|plot no|plot number|survey_number)\s*:\s*([A-Z0-9\-\/\s\.]+)', text, re.IGNORECASE)
    survey_number = survey_match.group(1).strip() if survey_match else "TS-102/A"
    
    # 3. Area extraction
    area_match = re.search(r'(?:area|size|extent)\s*:\s*([0-9\.,]+)\s*(sq\.?\s*ft|sq\.?\s*yards|sq\.?\s*meters|acres)', text, re.IGNORECASE)
    area = 2000.00
    if area_match:
        try:
            area_str = area_match.group(1).replace(",", "")
            area = float(area_str)
        except Exception:
            pass

    # 4. Coordinate extraction
    # Look for patterns like "17.4410, 78.3820" or "78.3820, 17.4410" or "17.4410 78.3820"
    # Matches decimals with 3+ decimal places
    coord_pattern = r'(\d{2}\.\d{3,7})\s*,\s*(\d{2}\.\d{3,7})|(\d{2}\.\d{3,7})\s+(\d{2}\.\d{3,7})'
    found_coords = []
    
    for match in re.finditer(coord_pattern, text):
        groups = match.groups()
        # Find which values are not None
        if groups[0] is not None and groups[1] is not None:
            v1, v2 = float(groups[0]), float(groups[1])
        elif groups[2] is not None and groups[3] is not None:
            v1, v2 = float(groups[2]), float(groups[3])
        else:
            continue
            
        # Determine which is Lat and Lon
        # For India, Lat is around 10-35, Lon is around 70-95
        if 8.0 <= v1 <= 38.0 and 68.0 <= v2 <= 98.0:
            lat, lon = v1, v2
        elif 8.0 <= v2 <= 38.0 and 68.0 <= v1 <= 98.0:
            lat, lon = v2, v1
        else:
            # General fallback: assume first is lat, second is lon
            lat, lon = v1, v2
            
        found_coords.append((lon, lat)) # PostGIS uses Longitude Latitude (X Y) format

    # Dedup consecutive duplicate coordinates
    deduped_coords = []
    for c in found_coords:
        if not deduped_coords or deduped_coords[-1] != c:
            deduped_coords.append(c)

    # PostGIS Polygon needs at least 4 coordinates (3 unique + closing)
    if len(deduped_coords) >= 3:
        # Close polygon if not closed
        if deduped_coords[0] != deduped_coords[-1]:
            deduped_coords.append(deduped_coords[0])
        logger.info(f"Extracted real coordinates from text: {deduped_coords}")
    else:
        # Generate a simulated polygon based on the survey number to allow testing spatial overlaps
        # We vary coordinates slightly using hash of survey number to make it stable but unique
        logger.warning("Fewer than 3 coordinates found. Generating simulated coordinates from survey number.")
        seed = sum(ord(c) for c in survey_number) % 100
        offset_x = (seed % 10) * 0.001
        offset_y = ((seed // 10) % 10) * 0.001
        
        # Base coordinates for simulated deed
        # A rectangular plot of ~50m size
        base_lon = HYDERABAD_LON + offset_x
        base_lat = HYDERABAD_LAT + offset_y
        
        # Create a closed square polygon
        deduped_coords = [
            (base_lon, base_lat),
            (base_lon + 0.0005, base_lat),
            (base_lon + 0.0005, base_lat + 0.0005),
            (base_lon, base_lat + 0.0005),
            (base_lon, base_lat) # Closed
        ]

    # Convert coordinates list to WKT (Well-Known Text) POLYGON format
    # POLYGON((lon1 lat1, lon2 lat2, ...))
    wkt_points = ", ".join([f"{c[0]:.6f} {c[1]:.6f}" for c in deduped_coords])
    wkt_polygon = f"POLYGON(({wkt_points}))"

    # Return coordinates in list of [lat, lon] format for frontend Map rendering
    frontend_coords = [[c[1], c[0]] for c in deduped_coords]

    return {
        "owner_name": owner_name,
        "survey_number": survey_number,
        "area": area,
        "wkt_polygon": wkt_polygon,
        "frontend_coords": frontend_coords
    }
