'use client';

import {
  Card,
  Form,
  Input,
  Select,
  Switch,
  Button,
  Row,
  Col,
  Typography,
  Space,
  message,
} from 'antd';
import { SaveOutlined, GlobalOutlined, BellOutlined, LockOutlined } from '@ant-design/icons';
import PageHeader from '@/components/shared/PageHeader';
import { useAppSelector } from '@/store/hooks';
import { getTokens } from '@/lib/theme';

const { Title, Text } = Typography;

export default function SettingsPage() {
  const [form] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();
  const mode = useAppSelector((state) => state.theme.mode);
  const t = getTokens(mode);

  const handleSave = () => {
    messageApi.success('Settings saved successfully!');
  };

  return (
    <div>
      {contextHolder}
      <PageHeader
        title="Settings"
        subtitle="Configure your application preferences"
        action={
          <Button
            type="primary"
            icon={<SaveOutlined />}
            style={{ borderRadius: 10 }}
            onClick={handleSave}
          >
            Save Changes
          </Button>
        }
      />
      <Row gutter={[24, 24]}>
        {/* General Settings */}
        <Col xs={24} lg={12}>
          <Card
            className="glass-card"
            style={{ borderRadius: 14 }}
            styles={{ body: { padding: 28 } }}
          >
            <Space size={8} style={{ marginBottom: 24 }}>
              <GlobalOutlined style={{ color: '#6C5CE7', fontSize: 18 }} />
              <Title level={5} style={{ margin: 0, color: t.textPrimary }}>
                General
              </Title>
            </Space>
            <Form
              form={form}
              layout="vertical"
              initialValues={{
                appName: 'SpeakEasy',
                defaultLanguage: 'en',
                timezone: 'Asia/Kolkata',
                maxEnrollments: 10,
              }}
            >
              <Form.Item
                label={<Text style={{ color: t.textSecondary }}>App Name</Text>}
                name="appName"
              >
                <Input style={{ borderRadius: 8 }} />
              </Form.Item>
              <Form.Item
                label={<Text style={{ color: t.textSecondary }}>Default Language</Text>}
                name="defaultLanguage"
              >
                <Select
                  style={{ borderRadius: 8 }}
                  options={[
                    { value: 'en', label: 'English' },
                    { value: 'hi', label: 'Hindi' },
                    { value: 'ta', label: 'Tamil' },
                    { value: 'te', label: 'Telugu' },
                    { value: 'bn', label: 'Bengali' },
                  ]}
                />
              </Form.Item>
              <Form.Item
                label={<Text style={{ color: t.textSecondary }}>Timezone</Text>}
                name="timezone"
              >
                <Select
                  style={{ borderRadius: 8 }}
                  options={[
                    { value: 'Asia/Kolkata', label: 'IST (UTC+5:30)' },
                    { value: 'America/New_York', label: 'EST (UTC-5:00)' },
                    { value: 'Europe/London', label: 'GMT (UTC+0:00)' },
                    { value: 'Asia/Tokyo', label: 'JST (UTC+9:00)' },
                  ]}
                />
              </Form.Item>
              <Form.Item
                label={<Text style={{ color: t.textSecondary }}>Max Enrollments Per User</Text>}
                name="maxEnrollments"
              >
                <Input type="number" style={{ borderRadius: 8 }} />
              </Form.Item>
            </Form>
          </Card>
        </Col>

        {/* Notification + Security */}
        <Col xs={24} lg={12}>
          <Card
            className="glass-card"
            style={{ borderRadius: 14, marginBottom: 24 }}
            styles={{ body: { padding: 28 } }}
          >
            <Space size={8} style={{ marginBottom: 24 }}>
              <BellOutlined style={{ color: '#FDCB6E', fontSize: 18 }} />
              <Title level={5} style={{ margin: 0, color: t.textPrimary }}>
                Notifications
              </Title>
            </Space>
            {[
              {
                label: 'New User Registration',
                desc: 'Get notified when a new user signs up',
                defaultChecked: true,
              },
              {
                label: 'Course Completion',
                desc: 'Alert when a user completes a course',
                defaultChecked: true,
              },
              {
                label: 'Payment Alerts',
                desc: 'Receive payment and subscription updates',
                defaultChecked: true,
              },
              {
                label: 'Weekly Reports',
                desc: 'Automated weekly analytics summary via email',
                defaultChecked: false,
              },
              {
                label: 'System Updates',
                desc: 'Maintenance and platform update notifications',
                defaultChecked: true,
              },
            ].map((item, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '14px 0',
                  borderBottom: i < 4 ? `1px solid ${t.border}` : 'none',
                }}
              >
                <div>
                  <Text strong style={{ color: t.textPrimary, display: 'block', fontSize: 14 }}>
                    {item.label}
                  </Text>
                  <Text style={{ color: t.textMuted, fontSize: 12 }}>{item.desc}</Text>
                </div>
                <Switch defaultChecked={item.defaultChecked} />
              </div>
            ))}
          </Card>

          <Card
            className="glass-card"
            style={{ borderRadius: 14 }}
            styles={{ body: { padding: 28 } }}
          >
            <Space size={8} style={{ marginBottom: 24 }}>
              <LockOutlined style={{ color: '#E74C3C', fontSize: 18 }} />
              <Title level={5} style={{ margin: 0, color: t.textPrimary }}>
                Security
              </Title>
            </Space>
            {[
              {
                label: 'Two-Factor Authentication',
                desc: 'Require 2FA for admin accounts',
                defaultChecked: false,
              },
              {
                label: 'Session Timeout',
                desc: 'Auto-logout after 30 minutes of inactivity',
                defaultChecked: true,
              },
              {
                label: 'IP Whitelisting',
                desc: 'Restrict admin access to specific IPs',
                defaultChecked: false,
              },
            ].map((item, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '14px 0',
                  borderBottom: i < 2 ? `1px solid ${t.border}` : 'none',
                }}
              >
                <div>
                  <Text strong style={{ color: t.textPrimary, display: 'block', fontSize: 14 }}>
                    {item.label}
                  </Text>
                  <Text style={{ color: t.textMuted, fontSize: 12 }}>{item.desc}</Text>
                </div>
                <Switch defaultChecked={item.defaultChecked} />
              </div>
            ))}
          </Card>
        </Col>
      </Row>
    </div>
  );
}
