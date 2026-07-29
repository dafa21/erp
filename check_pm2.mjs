import { NodeSSH } from 'node-ssh';

const ssh = new NodeSSH();

async function main() {
  try {
    console.log('🔌 Connecting to VPS...');
    await ssh.connect({
      host: '148.230.98.197',
      username: 'root',
      password: ' @Bismillah212\\',
      port: 22,
      tryKeyboard: true,
    });
    console.log('✅ Connected to VPS!\n');

    // Check PM2 status
    console.log('📋 PM2 Status:');
    const status = await ssh.execCommand('pm2 status');
    console.log(status.stdout);
    if (status.stderr) console.log('stderr:', status.stderr);

    console.log('\n📜 PM2 Logs (last 40 lines):');
    const logs = await ssh.execCommand('pm2 logs sim-nurhealth --lines 40 --nostream');
    console.log(logs.stdout);
    if (logs.stderr) console.log(logs.stderr);

    // Check if port 30004 is listening
    console.log('\n🔍 Port 30004 check:');
    const portCheck = await ssh.execCommand('ss -tlnp | grep 30004 || echo "Port 30004 NOT listening"');
    console.log(portCheck.stdout);

    // Check nginx config for sim.nurhealthconnection.com
    console.log('\n🌐 Nginx config check:');
    const nginxCheck = await ssh.execCommand('cat /etc/nginx/sites-enabled/sim.nurhealthconnection.com 2>/dev/null || cat /etc/nginx/conf.d/sim.nurhealthconnection.com.conf 2>/dev/null || grep -r "sim.nurhealthconnection" /etc/nginx/ 2>/dev/null | head -20 || echo "No nginx config found"');
    console.log(nginxCheck.stdout);

    // Check disk space
    console.log('\n💾 Disk space:');
    const disk = await ssh.execCommand('df -h / | tail -1');
    console.log(disk.stdout);

    // Check memory
    console.log('\n🧠 Memory:');
    const mem = await ssh.execCommand('free -m | head -2');
    console.log(mem.stdout);

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    ssh.dispose();
  }
}

main();
