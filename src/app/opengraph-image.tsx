import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export const alt = 'NICTIA System'
export const size = {
  width: 1200,
  height: 630,
}

export const contentType = 'image/png'

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'black',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'monospace',
        }}
      >
        <div
          style={{
            fontSize: 120,
            color: 'white',
            letterSpacing: '0.1em',
            marginBottom: 20,
            fontWeight: 'bold',
          }}
        >
          NICTIA
        </div>
        <div
          style={{
            fontSize: 30,
            color: 'white',
            letterSpacing: '0.2em',
            opacity: 0.8,
          }}
        >
          SYSTEM ONLINE
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}
