module.exports = {
  apps: [
    {
      name: 'transport-estimate-system',
      script: 'npx',
      args: 'wrangler pages dev dist --d1=transport-estimate-production:548ba84b-0e8c-498e-8fd2-cadd64776f08 --remote --ip 0.0.0.0 --port 3000',
      env: {
        NODE_ENV: 'development',
        PORT: 3000
      },
      watch: false, // Disable PM2 file monitoring (wrangler handles hot reload)
      instances: 1, // Development mode uses only one instance
      exec_mode: 'fork'
    }
  ]
}