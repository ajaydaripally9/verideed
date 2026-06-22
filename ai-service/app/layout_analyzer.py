import logging
import numpy as np

logger = logging.getLogger(__name__)

def analyze_layout(pages_data):
    """
    Analyzes document layout structure for potential forgery.
    Checks for:
    - Font height variations in the same lines.
    - Text alignment anomalies.
    - Lack of official signatures or stamp keyword regions.
    """
    issues = []
    font_anomalies_detected = 0
    alignment_anomalies_detected = 0
    stamp_present = False
    signature_present = False
    
    suspicious_regions = []

    for page in pages_data:
        words = page.get("words", [])
        if not words:
            continue
            
        # Group words into approximate lines based on 'top' coordinate (within a threshold)
        lines = {}
        for word in words:
            # round top to nearest 10 pixels to group lines
            line_key = round(word["top"] / 12) * 12
            if line_key not in lines:
                lines[line_key] = []
            lines[line_key].append(word)

        # Sort words in each line by left-to-right
        for line_key in lines:
            lines[line_key] = sorted(lines[line_key], key=lambda w: w["left"])
            
            # Analyze line word heights
            heights = [w["height"] for w in lines[line_key] if len(w["text"]) > 2]
            if len(heights) >= 3:
                median_height = np.median(heights)
                for w in lines[line_key]:
                    # If a word is 1.8x larger or smaller than the line median height, flag it
                    if len(w["text"]) > 2 and (w["height"] > median_height * 1.8 or w["height"] < median_height * 0.5):
                        font_anomalies_detected += 1
                        suspicious_regions.append({
                            "type": "font_anomaly",
                            "text": w["text"],
                            "bbox": [w["left"], w["top"], w["width"], w["height"]],
                            "description": f"Font height mismatch: {w['height']}px vs line median {median_height}px"
                        })
            
            # Check for sudden spacing/alignment gaps in middle of lines
            for i in range(len(lines[line_key]) - 1):
                w1 = lines[line_key][i]
                w2 = lines[line_key][i+1]
                gap = w2["left"] - (w1["left"] + w1["width"])
                # If gap is very large, could indicate manual text insertion or overlay
                if gap > 180 and gap < 400:
                    # Filter out standard spaces, check if it looks like an offset overlay
                    alignment_anomalies_detected += 1
                    suspicious_regions.append({
                        "type": "alignment_anomaly",
                        "text": f"{w1['text']} ... {w2['text']}",
                        "bbox": [w1["left"] + w1["width"], w1["top"], gap, w1["height"]],
                        "description": "Suspicious layout gap / alignment offset"
                    })

        # Scan text for stamp & signature keywords
        page_text_lower = page["text"].lower()
        if any(kw in page_text_lower for kw in ["stamp", "seal", "sub-registrar", "official seal"]):
            stamp_present = True
        if any(kw in page_text_lower for kw in ["signature", "signed by", "witness signature", "executant"]):
            signature_present = True

    # Calculate layout score out of 100
    # Start at 100 and deduct for anomalies
    score = 100.0
    score -= font_anomalies_detected * 5
    score -= alignment_anomalies_detected * 5
    
    if not stamp_present:
        score -= 20
        issues.append("Official stamp/seal keyword not found in document text.")
    if not signature_present:
        score -= 15
        issues.append("Signature reference or executant signature area missing.")

    if font_anomalies_detected > 0:
        issues.append(f"Detected {font_anomalies_detected} font size anomalies, suggesting manual text overlay or alterations.")
    if alignment_anomalies_detected > 0:
        issues.append(f"Detected {alignment_anomalies_detected} irregular layout gaps in document lines.")

    # Clamp score
    score = max(10.0, min(100.0, score))
    
    # Generate overall status
    status = "SAFE"
    if score < 60:
        status = "DANGER"
    elif score < 85:
        status = "WARNING"

    return {
        "score": round(score, 2),
        "status": status,
        "issues": issues,
        "suspicious_regions": suspicious_regions[:10]  # Limit output
    }
