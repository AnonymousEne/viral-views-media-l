# PowerShell script for automating Vercel + Firebase + Custom Domain setup
# Usage: .\scripts\setup-vercel-firebase.ps1

Write-Host "Logging into Vercel..."
vercel login

Write-Host "Linking project to Vercel..."
vercel link

Write-Host "Adding custom domain to Vercel..."
vercel domains add viralviewsmedia.com

Write-Host "Setting Firebase env variables in Vercel..."
vercel env add NEXT_PUBLIC_FIREBASE_API_KEY
vercel env add NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
vercel env add NEXT_PUBLIC_FIREBASE_PROJECT_ID
vercel env add NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
vercel env add NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
vercel env add NEXT_PUBLIC_FIREBASE_APP_ID

Write-Host "Deploying to Vercel..."
vercel --prod

Write-Host "\nSetup complete!"
Write-Host "Check your site at: https://viralviewsmedia.com (DNS propagation may take a few minutes)"
Write-Host "Firebase backend is still fully supported."
