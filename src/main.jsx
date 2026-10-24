import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ConfigProvider } from 'antd'
import './index.css'
import App from './App.jsx'

const appTheme = {
  token: {
    borderRadius: 10,
    colorPrimary: '#0d6e3f',
    fontFamily:
      'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", sans-serif',
  },
  components: {
    Card: {
      borderRadiusLG: 12,
      paddingLG: 20,
      headerBg: 'transparent',
      headerFontSize: 15,
      colorBorderSecondary: 'transparent',
      boxShadowTertiary:
        '0 1px 2px rgba(0,0,0,0.03), 0 4px 12px rgba(0,0,0,0.04)',
    },
    Table: {
      headerBg: '#fafafa',
      headerColor: '#595959',
      borderColor: '#f0f0f0',
      cellPaddingBlock: 10,
    },
    Button: { borderRadius: 8, controlHeight: 36 },
    Input: { borderRadius: 8 },
    Select: { borderRadius: 8 },
    Modal: { borderRadiusLG: 12 },
  },
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ConfigProvider theme={appTheme}>
      <App />
    </ConfigProvider>
  </StrictMode>,
)