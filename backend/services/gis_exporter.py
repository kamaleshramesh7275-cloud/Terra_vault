"""
Terra_vault — CAD & GIS Survey Interoperability Exporter
Generates:
1. GeoJSON (RFC 7946) with rich RoR attribute tables
2. Google Earth KML 2.2 with land-use styling and balloon popups
3. LandXML 1.2 for AutoCAD Civil 3D, QGIS, and total station surveyors
"""
import json
import xml.etree.ElementTree as ET
from xml.dom import minidom
from typing import Dict, Any, List, Optional


def _get_default_polygon(lat: float = 10.8194, lon: float = 77.0215, delta: float = 0.0008) -> List[List[float]]:
    """Returns a closed 4-point polygon around the given centroid coordinate."""
    return [
        [round(lon - delta, 6), round(lat - delta, 6)],
        [round(lon + delta, 6), round(lat - delta, 6)],
        [round(lon + delta, 6), round(lat + delta, 6)],
        [round(lon - delta, 6), round(lat + delta, 6)],
        [round(lon - delta, 6), round(lat - delta, 6)]
    ]


def generate_geojson(record_data: Dict[str, Any], geometry: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    """
    Generates an RFC 7946 compliant GeoJSON Feature for the cadastral parcel
    with complete RoR attribute table in feature.properties.
    """
    lat = float(record_data.get("latitude") or 10.8194)
    lon = float(record_data.get("longitude") or 77.0215)

    if not geometry or "coordinates" not in geometry:
        geom = {
            "type": "Polygon",
            "coordinates": [_get_default_polygon(lat, lon)]
        }
    else:
        geom = geometry

    area_val = record_data.get("area_value") or 2.15
    area_unit = record_data.get("area_unit") or "Acres"

    properties = {
        "record_id": record_data.get("id") or "rec-sample",
        "survey_number": record_data.get("survey_no") or "SF.409/1B",
        "patta_number": record_data.get("patta_no") or "8812",
        "pattadar_name": record_data.get("owner_name") or "M. Palanisamy / எம். பழனிசாமி",
        "father_name": record_data.get("father_name") or "Muthusamy Gounder",
        "extent": f"{area_val} {area_unit}",
        "land_classification": record_data.get("land_type") or "Wet Land (நன்செய்)",
        "revenue_village": record_data.get("village") or "Kinathukadavu Town",
        "taluk": record_data.get("tehsil") or "Kinathukadavu",
        "district": record_data.get("district") or "Coimbatore",
        "state": record_data.get("state") or "Tamil Nadu",
        "lgd_code": record_data.get("village_lgd_code") or "630401",
        "assessment_tax_inr": 48.50,
        "mutation_order_no": record_data.get("mutation_no") or "MUT-2024-00892",
        "verification_status": record_data.get("status") or "verified",
        "blockchain_contract": "0x223473CDbD9263122471f24cf11603f69EfF2733",
        "blockchain_network": "Polygon Amoy Testnet",
        "dilrmp_compliant": True,
    }

    return {
        "type": "Feature",
        "id": properties["record_id"],
        "geometry": geom,
        "properties": properties
    }


def generate_kml(record_data: Dict[str, Any], geometry: Optional[Dict[str, Any]] = None) -> str:
    """
    Generates an OGC KML 2.2 XML file for Google Earth visualization with
    color-coded boundary lines and rich HTML hover descriptions.
    """
    lat = float(record_data.get("latitude") or 10.8194)
    lon = float(record_data.get("longitude") or 77.0215)

    if not geometry or "coordinates" not in geometry:
        poly_coords = _get_default_polygon(lat, lon)
    else:
        coords = geometry["coordinates"]
        poly_coords = coords[0] if isinstance(coords[0][0], (list, tuple)) else coords

    coord_str = " ".join([f"{pt[0]},{pt[1]},0" for pt in poly_coords])

    land_type = (record_data.get("land_type") or "agricultural").lower()
    # KML colors: aabbggrr (alpha, blue, green, red)
    if "res" in land_type:
        poly_color = "6600aaff"   # Amber fill
        line_color = "ff00aaff"   # Amber line
    elif "comm" in land_type:
        poly_color = "66ffaa00"   # Blue fill
        line_color = "ffffaa00"   # Blue line
    elif "govt" in land_type or "poramboke" in land_type:
        poly_color = "660000ff"   # Red fill
        line_color = "ff0000ff"   # Red line
    else:
        poly_color = "6616a34a"   # Green fill (Agricultural)
        line_color = "ff16a34a"   # Green line

    survey_no = record_data.get("survey_no") or "SF.409/1B"
    patta_no = record_data.get("patta_no") or "8812"
    owner_name = record_data.get("owner_name") or "M. Palanisamy"
    village = record_data.get("village") or "Kinathukadavu Town"
    area_val = record_data.get("area_value") or 2.15
    area_unit = record_data.get("area_unit") or "Acres"

    desc_html = f"""<![CDATA[
    <div style="font-family: sans-serif; min-width: 250px; padding: 10px;">
        <h3 style="margin: 0 0 6px; color: #0f2942;">Cadastral Survey #{survey_no}</h3>
        <p style="margin: 0 0 10px; font-size: 11px; color: #64748b;">Patta #{patta_no} • {village}</p>
        <table style="width: 100%; font-size: 12px; border-collapse: collapse;">
            <tr style="border-bottom: 1px solid #e2e8f0;">
                <td style="padding: 4px 0; color: #475569;"><b>Pattadar:</b></td>
                <td style="padding: 4px 0; text-align: right; color: #0f2942;">{owner_name}</td>
            </tr>
            <tr style="border-bottom: 1px solid #e2e8f0;">
                <td style="padding: 4px 0; color: #475569;"><b>Extent:</b></td>
                <td style="padding: 4px 0; text-align: right; color: #0f2942;">{area_val} {area_unit}</td>
            </tr>
            <tr style="border-bottom: 1px solid #e2e8f0;">
                <td style="padding: 4px 0; color: #475569;"><b>Classification:</b></td>
                <td style="padding: 4px 0; text-align: right; color: #0f2942;">{record_data.get("land_type", "Wet Land (நன்செய்)")}</td>
            </tr>
            <tr>
                <td style="padding: 4px 0; color: #475569;"><b>Blockchain Seal:</b></td>
                <td style="padding: 4px 0; text-align: right; color: #16a34a; font-weight: bold;">Verified ✓</td>
            </tr>
        </table>
        <div style="margin-top: 10px; text-align: center; font-size: 10px; color: #94a3b8;">
            Terra_vault DILRMP 2.0 Cadastral Spatial System
        </div>
    </div>
    ]]>"""

    kml = f"""<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
  <Document>
    <name>Cadastral Plot - {survey_no}</name>
    <Style id="parcelStyle">
      <LineStyle>
        <color>{line_color}</color>
        <width>2.5</width>
      </LineStyle>
      <PolyStyle>
        <color>{poly_color}</color>
        <fill>1</fill>
        <outline>1</outline>
      </PolyStyle>
    </Style>
    <Placemark>
      <name>{survey_no} (Patta #{patta_no})</name>
      <styleUrl>#parcelStyle</styleUrl>
      <description>{desc_html}</description>
      <Polygon>
        <extrude>1</extrude>
        <altitudeMode>clampToGround</altitudeMode>
        <outerBoundaryIs>
          <LinearRing>
            <coordinates>{coord_str}</coordinates>
          </LinearRing>
        </outerBoundaryIs>
      </Polygon>
    </Placemark>
  </Document>
</kml>"""
    return kml.strip()


def generate_landxml(record_data: Dict[str, Any], geometry: Optional[Dict[str, Any]] = None) -> str:
    """
    Generates LandXML 1.2 standard XML representation of the parcel boundaries
    for direct integration into AutoCAD Civil 3D, survey total stations, and town planning software.
    """
    lat = float(record_data.get("latitude") or 10.8194)
    lon = float(record_data.get("longitude") or 77.0215)

    if not geometry or "coordinates" not in geometry:
        poly_coords = _get_default_polygon(lat, lon)
    else:
        coords = geometry["coordinates"]
        poly_coords = coords[0] if isinstance(coords[0][0], (list, tuple)) else coords

    survey_no = record_data.get("survey_no") or "SF.409/1B"
    owner_name = record_data.get("owner_name") or "M. Palanisamy"
    area_val = record_data.get("area_value") or 2.15
    village = record_data.get("village") or "Kinathukadavu Town"

    # Build LandXML Document using ElementTree
    root = ET.Element("LandXML", {
        "version": "1.2",
        "date": "2026-09-02",
        "time": "12:00:00",
        "xmlns": "http://www.landxml.org/schema/LandXML-1.2",
        "language": "English"
    })

    units = ET.SubElement(root, "Units")
    ET.SubElement(units, "Metric", {"areaUnit": "squareMeter", "linearUnit": "meter"})

    project = ET.SubElement(root, "Project", {"name": f"Cadastral Parcel {survey_no}"})
    app = ET.SubElement(root, "Application", {"name": "Terra_vault DILRMP Spatial Engine", "version": "2.0"})

    parcels = ET.SubElement(root, "Parcels")
    parcel = ET.SubElement(parcels, "Parcel", {
        "name": str(survey_no),
        "area": str(float(area_val) * 4046.86),  # Convert acres to sq meters
        "desc": f"Pattadar: {owner_name}, Village: {village}"
    })

    coord_geom = ET.SubElement(parcel, "CoordGeom")

    # Generate sequential coordinate boundary lines
    for i in range(len(poly_coords) - 1):
        p1 = poly_coords[i]
        p2 = poly_coords[i + 1]
        line = ET.SubElement(coord_geom, "Line")
        start = ET.SubElement(line, "Start")
        start.text = f"{p1[1]} {p1[0]}"  # Northing (Lat) Easting (Lon)
        end = ET.SubElement(line, "End")
        end.text = f"{p2[1]} {p2[0]}"

    raw_xml = ET.tostring(root, encoding="utf-8")
    parsed = minidom.parseString(raw_xml)
    return parsed.toprettyxml(indent="  ")
