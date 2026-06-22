import os
import subprocess
import sys

def check_and_install_reportlab():
    try:
        import reportlab
        print("reportlab is already installed.")
    except ImportError:
        print("Installing reportlab for PDF generation...")
        subprocess.check_call([sys.executable, "-m", "pip", "install", "reportlab"])

# Ensure reportlab is installed
check_and_install_reportlab()

from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors

def create_deed(filename, owner, survey, area, coords, title="DEED OF CONVEYANCE", tamper_font=False, remove_stamp=False):
    doc = SimpleDocTemplate(filename, pagesize=letter,
                            rightMargin=72, leftMargin=72, topMargin=72, bottomMargin=72)
    
    styles = getSampleStyleSheet()
    story = []
    
    # Custom Styles
    title_style = ParagraphStyle(
        'DeedTitle',
        parent=styles['Heading1'],
        fontSize=22,
        leading=26,
        alignment=1, # Center
        spaceAfter=20,
        textColor=colors.HexColor('#1A365D')
    )
    
    body_style = ParagraphStyle(
        'DeedBody',
        parent=styles['Normal'],
        fontSize=11,
        leading=16,
        spaceAfter=12
    )

    tampered_style = ParagraphStyle(
        'DeedTampered',
        parent=styles['Normal'],
        fontSize=20, # Distinctly larger font
        leading=22,
        textColor=colors.black,
        spaceAfter=12
    )
    
    # Title
    story.append(Paragraph(title, title_style))
    story.append(Spacer(1, 20))
    
    # Stamp / Seal Reference
    if not remove_stamp:
        story.append(Paragraph("<b>[ GOVERNMENT OF TELANGANA - OFFICIAL STAMP SEAL - REGISTERED ]</b>", 
                               ParagraphStyle('Stamp', parent=styles['Normal'], alignment=1, textColor=colors.HexColor('#9B2C2C'), spaceAfter=15)))
        story.append(Spacer(1, 10))
        
    # Document Body
    story.append(Paragraph(f"This Sale Deed is executed on this 22nd day of June, 2026, by and between the seller, "
                           f"and the buyer who shall hereafter be recognized as the lawful holder of the described property.", body_style))
    
    # Metadata Block
    story.append(Paragraph("<b>PROPERTY AND REGISTRATION METADATA:</b>", ParagraphStyle('SubHeader', parent=styles['Normal'], fontSize=12, spaceAfter=8)))
    
    if tamper_font:
        # Font height anomaly simulated here
        story.append(Paragraph(f"Owner Name: <font face='Courier' size='22'><b>{owner}</b></font>", body_style))
    else:
        story.append(Paragraph(f"Owner Name: <b>{owner}</b>", body_style))
        
    story.append(Paragraph(f"Survey Number: <b>{survey}</b>", body_style))
    story.append(Paragraph(f"Area: <b>{area}</b> sq.ft", body_style))
    story.append(Spacer(1, 10))
    
    # Coordinate Boundaries Block
    story.append(Paragraph("<b>GEOGRAPHIC PARCEL COORDINATES (WGS 84):</b>", ParagraphStyle('SubHeader', parent=styles['Normal'], fontSize=12, spaceAfter=8)))
    story.append(Paragraph(f"The parcel boundary is mathematically defined by the following coordinates:", body_style))
    story.append(Paragraph(f"Coordinates: <b>{coords}</b>", ParagraphStyle('Coords', parent=styles['Normal'], fontSize=10, leading=14, textColor=colors.HexColor('#2C5282'))))
    story.append(Spacer(1, 15))
    
    story.append(Paragraph("IN WITNESS WHEREOF, the parties hereto have signed and executed this deed on the day, month and year first above written.", body_style))
    story.append(Spacer(1, 30))
    
    # Signature fields
    story.append(Paragraph("<b>Signature of the Executant:</b> ____________________", body_style))
    story.append(Paragraph("<b>Witness 1:</b> ____________________", body_style))
    story.append(Paragraph("<b>Witness 2:</b> ____________________", body_style))
    
    doc.build(story)
    print(f"Created deed: {filename}")

if __name__ == "__main__":
    os.makedirs("sample-deeds", exist_ok=True)
    
    # Deed 1: Valid & safe deed
    create_deed(
        "sample-deeds/deed_1_valid.pdf",
        owner="Ramesh Kumar",
        survey="TS-102/A",
        area="2500",
        coords="17.4410,78.3820 17.4415,78.3820 17.4415,78.3825 17.4410,78.3825"
    )
    
    # Deed 2: Overlapping Deed (overlaps with Deed 1 coordinates!)
    # Deed 1 coordinates: Lon 78.3820 to 78.3825, Lat 17.4410 to 17.4415
    # Deed 2 coordinates overlap on the top-right of Deed 1
    create_deed(
        "sample-deeds/deed_2_overlapping.pdf",
        owner="Suresh Reddy",
        survey="TS-102/B",
        area="2500",
        coords="17.4412,78.3822 17.4417,78.3822 17.4417,78.3827 17.4412,78.3827"
    )

    # Deed 3: Tampered Deed (font size mismatch on owner name & missing stamp keyword)
    create_deed(
        "sample-deeds/deed_3_tampered.pdf",
        owner="Vikram Singh",
        survey="TS-102/A",
        area="2500",
        coords="17.4420,78.3830 17.4425,78.3830 17.4425,78.3835 17.4420,78.3835",
        tamper_font=True,
        remove_stamp=True
    )
