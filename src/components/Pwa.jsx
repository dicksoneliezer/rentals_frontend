import { useEffect, useState } from 'react'
import { Button, Alert, Space } from 'antd'
import { registerSW } from 'virtual:pwa-register'

// Register once per page load — NOT inside a component.
// Using the module scope means StrictMode double-mount
// or route remounts won't register the SW twice.
registerSW({ immediate: true })

export default function Pwa() {
  const [installEvt, setInstallEvt] = useState(null)
  const [offline, setOffline] = useState(false)

  useEffect(() => {
    // Read initial value inside the effect (SSR-safe, StrictMode-safe)
    setOffline(!navigator.onLine)

    const onInstall = (e) => {
      // Required: otherwise Chrome shows the mini-infobar
      e.preventDefault()
      setInstallEvt(e)
    }
    const onInstalled = () => setInstallEvt(null)
    const onOnline = () => setOffline(false)
    const onOffline = () => setOffline(true)

    window.addEventListener('beforeinstallprompt', onInstall)
    window.addEventListener('appinstalled', onInstalled)
    window.addEventListener('online', onOnline)
    window.addEventListener('offline', onOffline)

    return () => {
      window.removeEventListener('beforeinstallprompt', onInstall)
      window.removeEventListener('appinstalled', onInstalled)
      window.removeEventListener('online', onOnline)
      window.removeEventListener('offline', onOffline)
    }
  }, [])

  const install = async () => {
    if (!installEvt) return
    installEvt.prompt()
    await installEvt.userChoice
    // Single-use event, regardless of outcome
    setInstallEvt(null)
  }

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 16,
        right: 16,
        zIndex: 90,          // below AppLayout header (100)
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        maxWidth: 'calc(100vw - 32px)',
      }}
    >
      {offline && (
        <Alert
          type="warning"
          showIcon
          banner
          message="You are offline"
          description="This app needs a connection to load your data."
          style={{ width: 320, maxWidth: '100%' }}
        />
      )}
      {installEvt && (
        <Space>
          <Button type="primary" onClick={install}>
            Install App
          </Button>
        </Space>
      )}
    </div>
  )
}