import { Button, Result } from 'antd'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { homePathForRole } from '../config/roles'

export default function NotFound() {
  const navigate = useNavigate()
  const { user } = useAuth()

  const handleBack = () => {
    // The role layouts expose their dashboard at the index route ("/owner",
    // "/tenant", "/admin"); there is no nested "/dashboard" path, so sending
    // users there would land them straight back on this 404 page.
    navigate(homePathForRole(user))
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Result
        status="404"
        title="Page Not Found"
        subTitle="Sorry, the page you visited does not exist."
        extra={
          <Button type="primary" onClick={handleBack} style={{ background: '#0d6e3f' }}>
            Back to Dashboard
          </Button>
        }
      />
    </div>
  )
}
