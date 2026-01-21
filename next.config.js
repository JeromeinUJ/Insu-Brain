/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  output: 'standalone', // Docker 배포를 위한 standalone 모드
}

module.exports = nextConfig
