export default function handler(_req, res) {
  res.setHeader('Content-Type', 'application/json')
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate')
  res.status(200).json({ status: 'ok' })
}
