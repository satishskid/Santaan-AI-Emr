#!/bin/bash

# IVF EMR Deployment Script
# Supports multiple deployment scenarios

set -e

echo "🚀 IVF EMR Deployment Script"
echo "=============================="

# Function to display usage
show_usage() {
    echo "Usage: $0 [DEPLOYMENT_TYPE]"
    echo ""
    echo "Deployment Types:"
    echo "  demo        - Quick demo deployment for sales presentations"
    echo "  pilot       - Pilot testing deployment for user feedback"
    echo "  vercel      - Deploy to Vercel for sales demonstrations"
    echo "  netlify     - Deploy to Netlify for pilot testing"
    echo "  aws         - Deploy to AWS S3 + CloudFront"
    echo "  build-only  - Build for production without deployment"
    echo ""
    echo "Examples:"
    echo "  $0 demo"
    echo "  $0 pilot"
    echo "  $0 vercel"
    echo ""
}

# Function to build the application
build_app() {
    echo "📦 Building application for production..."
    npm run build
    echo "✅ Build completed successfully"
}

# Function to generate presentations
generate_presentations() {
    echo "📊 Generating presentation materials..."
    if [ -f "./scripts/generate_presentations.sh" ]; then
        ./scripts/generate_presentations.sh
        echo "✅ Presentations generated successfully"
    else
        echo "⚠️  Presentation generation script not found, skipping..."
    fi
}

# Function for demo deployment
deploy_demo() {
    echo "🎯 Setting up demo deployment..."
    build_app
    generate_presentations
    
    echo ""
    echo "🎉 Demo deployment ready!"
    echo "================================"
    echo "To start demo server:"
    echo "  npm run preview"
    echo ""
    echo "Demo will be available at: http://localhost:4173"
    echo "Perfect for:"
    echo "  • Sales presentations"
    echo "  • Screen sharing during calls"
    echo "  • Live product demonstrations"
    echo ""
    echo "Presentation materials available in:"
    echo "  • presentations/ - PowerPoint files"
    echo "  • html/ - Interactive web presentations"
    echo "  • pdfs/ - Documentation for distribution"
}

# Function for pilot deployment
deploy_pilot() {
    echo "🧪 Setting up pilot deployment..."
    build_app
    generate_presentations
    
    echo ""
    echo "🎉 Pilot deployment ready!"
    echo "=================================="
    echo "Built files are in: ./dist/"
    echo ""
    echo "Next steps for pilot deployment:"
    echo "1. Upload dist/ folder to your web server"
    echo "2. Configure SSL certificate"
    echo "3. Set up user feedback collection"
    echo "4. Configure environment variables for clinic"
    echo ""
    echo "Recommended hosting options:"
    echo "  • Netlify (drag & drop deployment)"
    echo "  • Vercel (Git-based deployment)"
    echo "  • Traditional web hosting"
}

# Function for Vercel deployment
deploy_vercel() {
    echo "☁️  Deploying to Vercel..."
    
    # Check if Vercel CLI is installed
    if ! command -v vercel &> /dev/null; then
        echo "Installing Vercel CLI..."
        npm i -g vercel
    fi
    
    build_app
    generate_presentations
    
    echo "Deploying to Vercel..."
    vercel --prod
    
    echo ""
    echo "🎉 Vercel deployment completed!"
    echo "================================"
    echo "Your IVF EMR is now live on Vercel"
    echo "Perfect for:"
    echo "  • Sales demonstrations"
    echo "  • Prospect evaluations"
    echo "  • Global accessibility"
    echo "  • Automatic Git deployments"
}

# Function for Netlify deployment
deploy_netlify() {
    echo "🌐 Preparing for Netlify deployment..."
    
    build_app
    generate_presentations
    
    echo ""
    echo "🎉 Netlify deployment ready!"
    echo "============================="
    echo "Built files are in: ./dist/"
    echo ""
    echo "Netlify deployment options:"
    echo "1. Drag & Drop: Go to netlify.com and drag the dist/ folder"
    echo "2. Git Integration: Connect your repository for auto-deploy"
    echo "3. CLI: Install netlify-cli and run 'netlify deploy --prod --dir=dist'"
    echo ""
    echo "Perfect for:"
    echo "  • Pilot testing"
    echo "  • User feedback collection"
    echo "  • Branch previews"
}

# Function for AWS deployment
deploy_aws() {
    echo "☁️  Preparing for AWS deployment..."
    
    build_app
    generate_presentations
    
    echo ""
    echo "🎉 AWS deployment ready!"
    echo "========================"
    echo "Built files are in: ./dist/"
    echo ""
    echo "AWS deployment steps:"
    echo "1. Create S3 bucket for static website hosting"
    echo "2. Upload dist/ contents: aws s3 sync dist/ s3://your-bucket-name"
    echo "3. Configure CloudFront distribution"
    echo "4. Set up custom domain and SSL certificate"
    echo ""
    echo "Perfect for:"
    echo "  • Enterprise deployments"
    echo "  • Global content delivery"
    echo "  • Advanced security requirements"
}

# Function for build-only
build_only() {
    echo "🔨 Building application only..."
    
    build_app
    generate_presentations
    
    echo ""
    echo "🎉 Build completed!"
    echo "=================="
    echo "Built files are in: ./dist/"
    echo "Presentation materials generated in: presentations/, pdfs/, html/, word/"
    echo ""
    echo "Ready for deployment to any static hosting service"
}

# Main script logic
case "${1:-}" in
    "demo")
        deploy_demo
        ;;
    "pilot")
        deploy_pilot
        ;;
    "vercel")
        deploy_vercel
        ;;
    "netlify")
        deploy_netlify
        ;;
    "aws")
        deploy_aws
        ;;
    "build-only")
        build_only
        ;;
    "help"|"-h"|"--help")
        show_usage
        ;;
    "")
        echo "❌ Error: Deployment type required"
        echo ""
        show_usage
        exit 1
        ;;
    *)
        echo "❌ Error: Unknown deployment type '$1'"
        echo ""
        show_usage
        exit 1
        ;;
esac

echo ""
echo "📚 Additional Resources:"
echo "========================"
echo "• README.md - Complete documentation"
echo "• PRESENTATION_GUIDE.md - How to use presentations"
echo "• BDM_QUICK_REFERENCE.md - Sales team guide"
echo "• DELIVERABLES_SUMMARY.md - Complete overview"
echo ""
echo "🎯 For support: support@ivf-emr.com"
echo "✅ Deployment script completed successfully!"
