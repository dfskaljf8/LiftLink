#!/bin/bash
# Fix all DelightfulAnimations and DelightfulComponents imports in components directory

# Fix DelightfulAnimations imports
sed -i "s|from './DelightfulAnimations'|from '../DelightfulAnimations'|g" /app/frontend/src/components/*.js

# Fix DelightfulComponents imports  
sed -i "s|from './DelightfulComponents'|from '../DelightfulComponents'|g" /app/frontend/src/components/*.js

# Fix CSS imports
sed -i "s|import '../styles/ProfessionalDesign.css'|import '../styles/ProfessionalDesign.css'|g" /app/frontend/src/components/*.js

echo "Import paths fixed!"