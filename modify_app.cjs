const fs = require('fs');
const file = 'src/App.tsx';
let content = fs.readFileSync(file, 'utf8');

const funcStr = `
  const hasMenuAccess = (menuKey: string, allowedRoles: string[]) => {
    if (!currentUser) return false;
    if (currentUser.role === 'Superadmin') return true;
    if (currentUser.accessible_menus) {
      let parsed: string[] = [];
      try {
        parsed = typeof currentUser.accessible_menus === 'string' 
          ? JSON.parse(currentUser.accessible_menus) 
          : currentUser.accessible_menus;
      } catch(e) {}
      if (parsed.length > 0) return parsed.includes(menuKey);
    }
    return allowedRoles.includes(currentUser.role);
  };
`;

content = content.replace('const renderSidebarContent = () => (', funcStr + '\n  const renderSidebarContent = () => (');

content = content.replace(/\{\(currentUser\?\.role === 'Superadmin' \|\| currentUser\?\.role === 'Admin' \|\| currentUser\?\.role === 'Suster' \|\| currentUser\?\.role === 'Bidan'\) && \(/g, 
  "{hasMenuAccess('patients', ['Superadmin', 'Admin', 'Suster', 'Bidan']) && (");

content = content.replace(/\{\(currentUser\?\.role === 'Superadmin' \|\| currentUser\?\.role === 'Dokter' \|\| currentUser\?\.role === 'Bidan'\) && \(/g, 
  "{hasMenuAccess('doctorDashboard', ['Superadmin', 'Dokter', 'Bidan']) && (");

content = content.replace(/\{\(currentUser\?\.role === 'Superadmin' \|\| currentUser\?\.role === 'Admin' \|\| currentUser\?\.role === 'Bidan'\) && \(/g, 
  "{hasMenuAccess('anc', ['Superadmin', 'Admin', 'Bidan']) && (");

content = content.replace(/\{\(currentUser\?\.role === 'Superadmin' \|\| currentUser\?\.role === 'Admin' \|\| currentUser\?\.role === 'Bidan' \|\| currentUser\?\.role === 'Suster'\) && \(/g, 
  "{hasMenuAccess('children', ['Superadmin', 'Admin', 'Bidan', 'Suster']) && (");

content = content.replace(/\{\(currentUser\?\.role === 'Superadmin' \|\| currentUser\?\.role === 'Admin'\) && \(\n *<>\n *<button \n *onClick=\{\(\) => \{ setActiveTab\('patientDatabase'\);/g, 
  "{hasMenuAccess('patientDatabase', ['Superadmin', 'Admin']) && (\n              <>\n              <button \n                onClick={() => { setActiveTab('patientDatabase');");

content = content.replace(/\{currentUser\?\.role === 'Superadmin' && \(\n *<>\n *<button \n *onClick=\{\(\) => \{ setActiveTab\('clinics'\);/g, 
  "{hasMenuAccess('clinics', ['Superadmin']) && (\n                <>\n                  <button \n                    onClick={() => { setActiveTab('clinics');");

content = content.replace(/\{currentUser\?\.role === 'Superadmin' && \(\n *<button \n *onClick=\{\(\) => \{ setActiveTab\('map'\);/g, 
  "{hasMenuAccess('map', ['Superadmin']) && (\n                <button \n                  onClick={() => { setActiveTab('map');");

content = content.replace(/\{activeTab === 'clinics' && currentUser\?\.role === 'Superadmin' && \(/g, 
  "{activeTab === 'clinics' && hasMenuAccess('clinics', ['Superadmin']) && (");

content = content.replace(/\{activeTab === 'attendance' && currentUser\?\.role === 'Superadmin' && \(/g, 
  "{activeTab === 'attendance' && hasMenuAccess('attendance', ['Superadmin']) && (");

fs.writeFileSync(file, content, 'utf8');
