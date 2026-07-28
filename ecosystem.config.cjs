module.exports = {
  apps: [
    {
      name: "sim-nurhealth",
      script: "./dist/server.cjs",
      cwd: __dirname,
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "1G",
      env: {
        NODE_ENV: "production",
        PORT: 30004,
        DATABASE_FILE: "database.sqlite"
      }
    }
  ]
};
