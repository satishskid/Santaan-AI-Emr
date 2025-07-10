#!/bin/bash

# IVF EMR Presentation Generation Script
# This script generates all presentation materials using Pandoc

echo "🚀 Starting IVF EMR Presentation Generation..."

# Create output directories
mkdir -p presentations
mkdir -p pdfs
mkdir -p html
mkdir -p word

echo "📁 Created output directories"

# Check if pandoc is installed
if ! command -v pandoc &> /dev/null; then
    echo "❌ Pandoc is not installed. Please install pandoc first:"
    echo "   macOS: brew install pandoc"
    echo "   Ubuntu: sudo apt-get install pandoc"
    echo "   Windows: Download from https://pandoc.org/installing.html"
    exit 1
fi

echo "✅ Pandoc found, proceeding with generation..."

# Generate PowerPoint Presentations
echo "📊 Generating PowerPoint presentations..."

# User Manual & Sales Pitch (Primary BDM presentation)
pandoc docs/USER_MANUAL_SALES_PITCH.md \
    -o presentations/IVF_EMR_User_Manual_Sales_Pitch.pptx \
    --slide-level=2 \
    --reference-doc=templates/presentation_template.pptx 2>/dev/null || \
pandoc docs/USER_MANUAL_SALES_PITCH.md \
    -o presentations/IVF_EMR_User_Manual_Sales_Pitch.pptx \
    --slide-level=2

echo "   ✅ User Manual & Sales Pitch → presentations/IVF_EMR_User_Manual_Sales_Pitch.pptx"

# Executive Summary (Leadership presentation)
pandoc docs/EXECUTIVE_SUMMARY.md \
    -o presentations/Executive_Summary_Leadership.pptx \
    --slide-level=2 \
    --reference-doc=templates/presentation_template.pptx 2>/dev/null || \
pandoc docs/EXECUTIVE_SUMMARY.md \
    -o presentations/Executive_Summary_Leadership.pptx \
    --slide-level=2

echo "   ✅ Executive Summary → presentations/Executive_Summary_Leadership.pptx"

# System Overview (Technical overview)
pandoc docs/EMR_SYSTEM_OVERVIEW.md \
    -o presentations/System_Overview_Technical.pptx \
    --slide-level=2 \
    --reference-doc=templates/presentation_template.pptx 2>/dev/null || \
pandoc docs/EMR_SYSTEM_OVERVIEW.md \
    -o presentations/System_Overview_Technical.pptx \
    --slide-level=2

echo "   ✅ System Overview → presentations/System_Overview_Technical.pptx"

# Sales Presentation (Pure sales focus)
pandoc docs/SALES_PRESENTATION.md \
    -o presentations/Sales_Presentation_BDM.pptx \
    --slide-level=2 \
    --reference-doc=templates/presentation_template.pptx 2>/dev/null || \
pandoc docs/SALES_PRESENTATION.md \
    -o presentations/Sales_Presentation_BDM.pptx \
    --slide-level=2

echo "   ✅ Sales Presentation → presentations/Sales_Presentation_BDM.pptx"

# Generate PDF Documents
echo "📄 Generating PDF documents..."

# CIO Technical Document (Comprehensive technical guide)
pandoc docs/CIO_TECHNICAL_DOCUMENT.md \
    -o pdfs/CIO_Technical_Guide.pdf \
    --pdf-engine=xelatex \
    --variable=geometry:margin=1in \
    --variable=fontsize:11pt \
    --variable=linestretch:1.2 \
    --toc \
    --number-sections 2>/dev/null || \
pandoc docs/CIO_TECHNICAL_DOCUMENT.md \
    -o pdfs/CIO_Technical_Guide.pdf \
    --toc \
    --number-sections

echo "   ✅ CIO Technical Guide → pdfs/CIO_Technical_Guide.pdf"

# Technical Documentation (Developer guide)
pandoc docs/TECHNICAL_DOCUMENTATION.md \
    -o pdfs/Technical_Documentation.pdf \
    --pdf-engine=xelatex \
    --variable=geometry:margin=1in \
    --toc \
    --number-sections 2>/dev/null || \
pandoc docs/TECHNICAL_DOCUMENTATION.md \
    -o pdfs/Technical_Documentation.pdf \
    --toc \
    --number-sections

echo "   ✅ Technical Documentation → pdfs/Technical_Documentation.pdf"

# User Manual (Comprehensive user guide)
pandoc docs/USER_MANUAL_SALES_PITCH.md \
    -o pdfs/User_Manual_Complete.pdf \
    --pdf-engine=xelatex \
    --variable=geometry:margin=1in \
    --toc \
    --number-sections 2>/dev/null || \
pandoc docs/USER_MANUAL_SALES_PITCH.md \
    -o pdfs/User_Manual_Complete.pdf \
    --toc \
    --number-sections

echo "   ✅ User Manual → pdfs/User_Manual_Complete.pdf"

# Executive Summary PDF
pandoc docs/EXECUTIVE_SUMMARY.md \
    -o pdfs/Executive_Summary.pdf \
    --pdf-engine=xelatex \
    --variable=geometry:margin=1in 2>/dev/null || \
pandoc docs/EXECUTIVE_SUMMARY.md \
    -o pdfs/Executive_Summary.pdf

echo "   ✅ Executive Summary → pdfs/Executive_Summary.pdf"

# Generate HTML Presentations (Reveal.js)
echo "🌐 Generating HTML presentations..."

# Sales Presentation HTML
pandoc docs/SALES_PRESENTATION.md \
    -t revealjs \
    -o html/Sales_Presentation.html \
    --standalone \
    --variable=theme:white \
    --variable=transition:slide \
    --slide-level=2

echo "   ✅ Sales Presentation → html/Sales_Presentation.html"

# System Overview HTML
pandoc docs/EMR_SYSTEM_OVERVIEW.md \
    -t revealjs \
    -o html/System_Overview.html \
    --standalone \
    --variable=theme:white \
    --variable=transition:slide \
    --slide-level=2

echo "   ✅ System Overview → html/System_Overview.html"

# Executive Summary HTML
pandoc docs/EXECUTIVE_SUMMARY.md \
    -t revealjs \
    -o html/Executive_Summary.html \
    --standalone \
    --variable=theme:white \
    --variable=transition:slide \
    --slide-level=2

echo "   ✅ Executive Summary → html/Executive_Summary.html"

# Generate Word Documents
echo "📝 Generating Word documents..."

# CIO Technical Document
pandoc docs/CIO_TECHNICAL_DOCUMENT.md \
    -o word/CIO_Technical_Document.docx \
    --toc \
    --reference-doc=templates/document_template.docx 2>/dev/null || \
pandoc docs/CIO_TECHNICAL_DOCUMENT.md \
    -o word/CIO_Technical_Document.docx \
    --toc

echo "   ✅ CIO Technical Document → word/CIO_Technical_Document.docx"

# User Manual Word
pandoc docs/USER_MANUAL_SALES_PITCH.md \
    -o word/User_Manual_Sales_Pitch.docx \
    --toc \
    --reference-doc=templates/document_template.docx 2>/dev/null || \
pandoc docs/USER_MANUAL_SALES_PITCH.md \
    -o word/User_Manual_Sales_Pitch.docx \
    --toc

echo "   ✅ User Manual → word/User_Manual_Sales_Pitch.docx"

# Executive Summary Word
pandoc docs/EXECUTIVE_SUMMARY.md \
    -o word/Executive_Summary.docx \
    --reference-doc=templates/document_template.docx 2>/dev/null || \
pandoc docs/EXECUTIVE_SUMMARY.md \
    -o word/Executive_Summary.docx

echo "   ✅ Executive Summary → word/Executive_Summary.docx"

# Technical Documentation Word
pandoc docs/TECHNICAL_DOCUMENTATION.md \
    -o word/Technical_Documentation.docx \
    --toc \
    --reference-doc=templates/document_template.docx 2>/dev/null || \
pandoc docs/TECHNICAL_DOCUMENTATION.md \
    -o word/Technical_Documentation.docx \
    --toc

echo "   ✅ Technical Documentation → word/Technical_Documentation.docx"

# Generate summary report
echo ""
echo "📋 Generation Summary:"
echo "====================="
echo ""
echo "📊 PowerPoint Presentations:"
echo "   • IVF_EMR_User_Manual_Sales_Pitch.pptx - Complete user manual & sales pitch for BDMs"
echo "   • Executive_Summary_Leadership.pptx - Executive summary for clinic leadership"
echo "   • System_Overview_Technical.pptx - Technical system overview"
echo "   • Sales_Presentation_BDM.pptx - Pure sales presentation for BDMs"
echo ""
echo "📄 PDF Documents:"
echo "   • CIO_Technical_Guide.pdf - Comprehensive technical guide for CIOs"
echo "   • Technical_Documentation.pdf - Developer and technical documentation"
echo "   • User_Manual_Complete.pdf - Complete user manual"
echo "   • Executive_Summary.pdf - Executive summary document"
echo ""
echo "🌐 HTML Presentations:"
echo "   • Sales_Presentation.html - Interactive sales presentation"
echo "   • System_Overview.html - Interactive system overview"
echo "   • Executive_Summary.html - Interactive executive summary"
echo ""
echo "📝 Word Documents:"
echo "   • CIO_Technical_Document.docx - CIO technical guide"
echo "   • User_Manual_Sales_Pitch.docx - User manual and sales pitch"
echo "   • Executive_Summary.docx - Executive summary"
echo "   • Technical_Documentation.docx - Technical documentation"
echo ""
echo "🎯 Target Audiences:"
echo "   • BDMs & Sales Teams: User Manual & Sales Pitch presentations"
echo "   • Doctors & Clinical Staff: User Manual with clinical workflows"
echo "   • CIOs & IT Leadership: Technical architecture and implementation guide"
echo "   • Clinic Executives: Executive summary with ROI and strategic value"
echo ""
echo "✅ All presentations generated successfully!"
echo "📁 Files are organized in: presentations/, pdfs/, html/, word/"
echo ""
echo "🚀 Ready for distribution to different stakeholder groups!"
