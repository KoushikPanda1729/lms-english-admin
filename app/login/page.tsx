'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Form, Input, Button, Checkbox, Typography, message, Divider } from 'antd';
import { MailOutlined, LockOutlined, EyeInvisibleOutlined, EyeTwoTone } from '@ant-design/icons';
import { GoogleLogin } from '@react-oauth/google';

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 48 48">
    <path
      fill="#EA4335"
      d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
    />
    <path
      fill="#4285F4"
      d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
    />
    <path
      fill="#FBBC05"
      d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
    />
    <path
      fill="#34A853"
      d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
    />
  </svg>
);

import { ROUTES } from '@/lib/constants';
import { useAppDispatch } from '@/store/hooks';
import { setCurrentUser } from '@/store/slices/userSlice';
import { authService } from '@/lib/services/auth';
import './login.css';

const { Title, Text, Link } = Typography;

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const googleBtnRef = useRef<HTMLDivElement>(null);

  const ADMIN_ROLES = ['admin', 'super_admin', 'moderator'];

  const handleLogin = async (values: { email: string; password: string; remember: boolean }) => {
    setLoading(true);
    try {
      const result = await authService.login(values.email, values.password);
      if (!ADMIN_ROLES.includes(result.user.role)) {
        messageApi.error('Access denied. This portal is for admins only.');
        return;
      }
      dispatch(
        setCurrentUser({
          name: result.user.email.split('@')[0],
          email: result.user.email,
          role: result.user.role as 'admin' | 'super_admin' | 'moderator',
        }),
      );
      messageApi.success('Welcome back! Redirecting...');
      setTimeout(() => router.push(ROUTES.DASHBOARD), 800);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Invalid credentials';
      messageApi.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (idToken: string) => {
    setGoogleLoading(true);
    try {
      const result = await authService.googleSignIn(idToken);
      if (!ADMIN_ROLES.includes(result.user.role)) {
        messageApi.error('Access denied. This portal is for admins only.');
        return;
      }
      dispatch(
        setCurrentUser({
          name: result.user.email.split('@')[0],
          email: result.user.email,
          role: result.user.role as 'admin' | 'super_admin' | 'moderator',
        }),
      );
      messageApi.success('Welcome back! Redirecting...');
      setTimeout(() => router.push(ROUTES.DASHBOARD), 800);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Google sign-in failed';
      messageApi.error(msg);
    } finally {
      setGoogleLoading(false);
    }
  };

  // Trigger the hidden GoogleLogin button — uses renderButton popup (no third-party cookies needed)
  const googleLogin = () => {
    const btn = googleBtnRef.current?.querySelector<HTMLElement>('[role="button"]');
    if (btn) {
      btn.click();
    } else {
      messageApi.error('Google Sign-In not ready, please try again');
    }
  };

  return (
    <div className="login-page">
      {contextHolder}

      {/* ===== LEFT: Full-bleed image panel ===== */}
      <div className="login-image-panel">
        <Image
          src="/login-hero.png"
          alt="SpeakEasy — English learning platform"
          fill
          priority
          style={{ objectFit: 'cover', objectPosition: 'center' }}
        />
        <div className="login-image-overlay" />
        <div className="login-image-content">
          <div className="login-logo-icon">SE</div>
          <Title level={2} style={{ color: '#fff', margin: '20px 0 8px', fontWeight: 700 }}>
            SpeakEasy
          </Title>
          <Text style={{ color: 'rgba(255,255,255,0.75)', fontSize: 14, lineHeight: 1.6 }}>
            Your command center for managing the English learning experience.
          </Text>
        </div>
      </div>

      {/* ===== RIGHT: Login form ===== */}
      <div className="login-form-panel">
        <div className="login-form-inner">
          {/* Header */}
          <div style={{ marginBottom: 32 }}>
            <div className="login-mobile-logo">
              <div className="login-logo-icon" style={{ width: 40, height: 40, fontSize: 16 }}>
                SE
              </div>
              <Text strong style={{ fontSize: 18, color: '#1A1A2E', marginLeft: 10 }}>
                SpeakEasy
              </Text>
            </div>

            <Title level={3} style={{ margin: 0, color: '#1A1A2E', fontWeight: 700 }}>
              Welcome back 👋
            </Title>
            <Text
              style={{
                color: '#5C5C78',
                fontSize: 14,
                marginTop: 8,
                display: 'block',
                lineHeight: 1.5,
              }}
            >
              Enter your credentials to access the admin dashboard
            </Text>
          </div>

          {/* Hidden GoogleLogin — uses renderButton popup (works without third-party cookies) */}
          <div
            ref={googleBtnRef}
            style={{ position: 'absolute', opacity: 0, height: 0, overflow: 'hidden' }}
          >
            <GoogleLogin
              onSuccess={(credentialResponse) => {
                if (credentialResponse.credential) {
                  handleGoogleSuccess(credentialResponse.credential);
                }
              }}
              onError={() => messageApi.error('Google sign-in failed')}
            />
          </div>

          {/* Google login */}
          <Button
            block
            size="large"
            icon={<GoogleIcon />}
            loading={googleLoading}
            onClick={() => googleLogin()}
            style={{
              borderRadius: 10,
              height: 48,
              border: '1.5px solid #E2E4EC',
              fontWeight: 500,
              color: '#3D3D5C',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 10,
              marginBottom: 20,
              fontSize: 14,
            }}
          >
            Continue with Google
          </Button>

          <Divider style={{ color: '#9D9DB5', fontSize: 12, margin: '16px 0 24px' }}>
            or sign in with email
          </Divider>

          {/* Form */}
          <Form
            layout="vertical"
            onFinish={handleLogin}
            initialValues={{ remember: true }}
            size="large"
            requiredMark={false}
          >
            <Form.Item
              name="email"
              label={
                <Text strong style={{ color: '#3D3D5C', fontSize: 13 }}>
                  Email
                </Text>
              }
              rules={[
                { required: true, message: 'Please enter your email' },
                { type: 'email', message: 'Enter a valid email address' },
              ]}
            >
              <Input
                prefix={<MailOutlined style={{ color: '#9D9DB5', marginRight: 4 }} />}
                placeholder="admin@speakeasy.com"
                style={{
                  borderRadius: 10,
                  height: 48,
                  border: '1.5px solid #E2E4EC',
                  fontSize: 14,
                }}
              />
            </Form.Item>

            <Form.Item
              name="password"
              label={
                <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                  <Text strong style={{ color: '#3D3D5C', fontSize: 13 }}>
                    Password
                  </Text>
                  <Link style={{ color: '#6C5CE7', fontSize: 12, fontWeight: 500 }} href="#">
                    Forgot password?
                  </Link>
                </div>
              }
              rules={[{ required: true, message: 'Please enter your password' }]}
            >
              <Input.Password
                prefix={<LockOutlined style={{ color: '#9D9DB5', marginRight: 4 }} />}
                placeholder="••••••••"
                iconRender={(visible) =>
                  visible ? (
                    <EyeTwoTone twoToneColor="#6C5CE7" />
                  ) : (
                    <EyeInvisibleOutlined style={{ color: '#9D9DB5' }} />
                  )
                }
                style={{
                  borderRadius: 10,
                  height: 48,
                  border: '1.5px solid #E2E4EC',
                  fontSize: 14,
                }}
              />
            </Form.Item>

            <Form.Item name="remember" valuePropName="checked" style={{ marginBottom: 24 }}>
              <Checkbox>
                <Text style={{ color: '#5C5C78', fontSize: 13 }}>Remember me for 30 days</Text>
              </Checkbox>
            </Form.Item>

            <Form.Item style={{ marginBottom: 20 }}>
              <Button
                type="primary"
                htmlType="submit"
                block
                loading={loading}
                style={{
                  height: 50,
                  borderRadius: 12,
                  fontSize: 15,
                  fontWeight: 600,
                  background: 'linear-gradient(135deg, #6C5CE7 0%, #A29BFE 100%)',
                  border: 'none',
                  boxShadow: '0 6px 20px rgba(108, 92, 231, 0.35)',
                }}
              >
                Sign In
              </Button>
            </Form.Item>
          </Form>

          <div style={{ textAlign: 'center', marginTop: 4 }}>
            <Text style={{ color: '#5C5C78', fontSize: 13 }}>
              Don&apos;t have an account?{' '}
              <Link style={{ color: '#6C5CE7', fontWeight: 600 }} href="#">
                Contact Admin
              </Link>
            </Text>
          </div>
        </div>
      </div>
    </div>
  );
}
