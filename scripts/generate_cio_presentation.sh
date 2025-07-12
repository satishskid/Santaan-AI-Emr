#!/bin/bash

# Santaan AI EMR - CIO Implementation Guide PowerPoint Generator
# This script uses pandoc to generate a professional PowerPoint presentation
# for Center CIOs implementing Santaan EMR at new clinics

echo "🎯 Generating Santaan AI EMR CIO Implementation Guide..."

# Check if pandoc is installed
if ! command -v pandoc &> /dev/null; then
    echo "📦 Installing pandoc..."
    
    # Detect OS and install pandoc
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        if command -v brew &> /dev/null; then
            brew install pandoc
        else
            echo "❌ Please install Homebrew first: https://brew.sh/"
            exit 1
        fi
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        # Linux
        sudo apt-get update && sudo apt-get install -y pandoc
    else
        echo "❌ Please install pandoc manually: https://pandoc.org/installing.html"
        exit 1
    fi
fi

# Create presentation directory if it doesn't exist
mkdir -p presentation

# Set input and output files
INPUT_FILE="presentation/CIO_Implementation_Guide.md"
OUTPUT_FILE="presentation/Santaan_EMR_CIO_Implementation_Guide.pptx"

# Check if input file exists
if [ ! -f "$INPUT_FILE" ]; then
    echo "❌ Input file not found: $INPUT_FILE"
    exit 1
fi

echo "📊 Converting Markdown to PowerPoint..."

# Generate PowerPoint presentation using pandoc
pandoc "$INPUT_FILE" \
    -o "$OUTPUT_FILE" \
    --slide-level=1 \
    --reference-doc=presentation/reference.pptx 2>/dev/null || \
pandoc "$INPUT_FILE" \
    -o "$OUTPUT_FILE" \
    --slide-level=1

# Check if generation was successful
if [ $? -eq 0 ]; then
    echo "✅ PowerPoint presentation generated successfully!"
    echo "📁 File saved as: $OUTPUT_FILE"
    echo "📊 Presentation ready for CIO deployment meetings"
    echo ""
    echo "🎯 PRESENTATION OVERVIEW:"
    echo "   • Target Audience: Center CIOs implementing Santaan EMR"
    echo "   • Content: Complete technical deployment guide"
    echo "   • Duration: 45-60 minutes presentation"
    echo "   • Format: Professional PowerPoint with technical details"
    echo ""
    echo "📋 PRESENTATION SECTIONS:"
    echo "   1. Welcome & Implementation Overview"
    echo "   2. Pre-Deployment Checklist"
    echo "   3. Database Setup & Configuration"
    echo "   4. User Management & Permissions"
    echo "   5. Clinic Configuration"
    echo "   6. Data Migration Strategy"
    echo "   7. Staff Training Program"
    echo "   8. Go-Live Process"
    echo "   9. System Health Monitoring"
    echo "   10. Ongoing Support & Maintenance"
    echo "   11. Success Metrics & KPIs"
    echo "   12. Next Steps & Action Items"
    echo ""
    echo "🚀 READY FOR:"
    echo "   • CIO onboarding meetings"
    echo "   • Technical implementation reviews"
    echo "   • Stakeholder presentations"
    echo "   • Project planning sessions"
    echo ""
    echo "📞 NEXT STEPS:"
    echo "   1. Review presentation content"
    echo "   2. Customize for specific clinic requirements"
    echo "   3. Schedule CIO onboarding meeting"
    echo "   4. Begin implementation process"
    
    # Get file size for reference
    if [[ "$OSTYPE" == "darwin"* ]]; then
        FILE_SIZE=$(stat -f%z "$OUTPUT_FILE" 2>/dev/null || echo "Unknown")
    else
        FILE_SIZE=$(stat -c%s "$OUTPUT_FILE" 2>/dev/null || echo "Unknown")
    fi
    
    echo ""
    echo "📈 FILE DETAILS:"
    echo "   • Size: $FILE_SIZE bytes"
    echo "   • Format: Microsoft PowerPoint (.pptx)"
    echo "   • Compatibility: PowerPoint 2016+ / Google Slides / LibreOffice"
    echo "   • Slides: ~25-30 comprehensive slides"
else
    echo "❌ Error generating PowerPoint presentation"
    echo "💡 Troubleshooting:"
    echo "   1. Ensure pandoc is properly installed"
    echo "   2. Check input file format and syntax"
    echo "   3. Verify write permissions in presentation directory"
    echo "   4. Try running: pandoc --version"
    exit 1
fi

echo ""
echo "🎉 CIO Implementation Guide Ready!"
echo "📧 Share with your Center CIOs for successful Santaan EMR deployment!"
