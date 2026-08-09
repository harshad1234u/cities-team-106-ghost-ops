const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    const dirPath = path.join(dir, f);
    const isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

walkDir('./src/pages', (filePath) => {
  if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Fix 'import React from "react";'
    content = content.replace(/import React from 'react';\n/g, '');
    
    // Fix 'import React, { ... } from "react";'
    content = content.replace(/import React,\s*\{/g, 'import {');
    
    // Fix type imports for ReportDetail
    content = content.replace(/import \{([^}]*)ReportDetail([^}]*)\} from '(\.\.\/)*services\/api';/g, "import {$1type ReportDetail$2} from '../../services/api';");
    content = content.replace(/type type ReportDetail/g, "type ReportDetail");

    // Login.tsx fixes
    if (filePath.includes('Login.tsx')) {
      content = content.replace(/const navigate = useNavigate\(\);\n/g, '');
      content = content.replace(/const \{ role \} = useAuth\(\);\n/g, '');
      content = content.replace(/import \{ useNavigate \} from 'react-router-dom';\n/g, '');
      content = content.replace(/import \{ useAuth \} from '\.\.\/\.\.\/contexts\/AuthContext';\n/g, '');
    }

    // Signup.tsx fixes
    if (filePath.includes('Signup.tsx')) {
      content = content.replace(/import \{ useNavigate \} from 'react-router-dom';\n/g, '');
    }
    
    // AdminReports.tsx fixes
    if (filePath.includes('AdminReports.tsx')) {
      content = content.replace(/import \{ Link \} from 'react-router-dom';\n/g, '');
    }

    // EngineerDashboard.tsx fixes
    if (filePath.includes('EngineerDashboard.tsx')) {
      content = content.replace(/import \{ Link \} from 'react-router-dom';\n/g, '');
    }

    fs.writeFileSync(filePath, content, 'utf8');
  }
});

console.log("Fixes applied");
