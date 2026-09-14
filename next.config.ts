import type { NextConfig } from 'next';
const config: NextConfig = {
  output: 'standalone', poweredByHeader: false,
  devIndicators: false,
  distDir: process.env.FEB_TEST_RUN==='1'?'.next-test':'.next',
  serverExternalPackages: ['postgres', '@electric-sql/pglite'],
  outputFileTracingIncludes: {'/*': ['./db/*.sql']},
  async headers() { return [{source:'/:path*',headers:[
    {key:'X-Content-Type-Options',value:'nosniff'}, {key:'X-Frame-Options',value:'DENY'},
    {key:'Referrer-Policy',value:'same-origin'}, {key:'Permissions-Policy',value:'camera=(), microphone=(), geolocation=()'},
    {key:'Content-Security-Policy',value:("default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' blob: data:; font-src 'self'; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'").replace(process.env.NODE_ENV==='production'?" 'unsafe-eval'":'__development_only__','')}
  ]}]; }
};
export default config;
