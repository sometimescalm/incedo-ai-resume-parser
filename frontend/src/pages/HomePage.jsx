import React from 'react';
import { Layout, Typography, Button, Row, Col, Card } from 'antd';
import { FileAddOutlined, QuestionCircleOutlined, TeamOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Header, Content, Footer } = Layout;
const { Title, Text } = Typography;

const HomePage = () => {
  const navigate = useNavigate();

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ backgroundColor: '#1d3f77', display: 'flex', alignItems: 'center', padding: '0 24px' }}>
        <img
          src="/logo-incedo.png"
          alt="Incedo Logo"
          style={{ height: 32, marginRight: 16 }}
        />
        <Title level={4} style={{ color: 'white', margin: 0 }}>Incedo Intellifit</Title>
      </Header>

      <Content style={{ padding: '60px 24px', background: '#f0f2f5' }}>
        {/* Hero Section */}
        <div style={{ textAlign: 'center', marginBottom: 60 }}>
          <Title level={1} style={{ fontSize: 48, marginBottom: 16 }}>
            Incedo Resume Formatter & AI Tools
          </Title>
          <Text type="secondary" style={{ fontSize: 18 }}>
            Smart tools powered by AI to streamline your recruitment process
          </Text>
        </div>

        {/* Main Feature Cards */}
        <Row gutter={[32, 32]} justify="center">
          <Col xs={24} md={8}>
            <Card
              hoverable
              onClick={() => navigate('/upload')}
              style={{
                textAlign: 'center',
                padding: '40px 24px',
                borderRadius: 12,
                height: '100%',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
              }}
              bodyStyle={{ padding: 0 }}
            >
              <FileAddOutlined style={{ fontSize: 64, color: '#1d3f77', marginBottom: 24 }} />
              <Title level={3} style={{ marginBottom: 16 }}>Convert Resume</Title>
              <Text type="secondary" style={{ fontSize: 16 }}>
                Upload and format any resume to Incedo's professional template instantly
              </Text>
            </Card>
          </Col>

          <Col xs={24} md={8}>
            <Card
              hoverable
              onClick={() => navigate('/interview-qna')}
              style={{
                textAlign: 'center',
                padding: '40px 24px',
                borderRadius: 12,
                height: '100%',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
              }}
              bodyStyle={{ padding: 0 }}
            >
              <QuestionCircleOutlined style={{ fontSize: 64, color: '#1d3f77', marginBottom: 24 }} />
              <Title level={3} style={{ marginBottom: 16 }}>Generate Interview QnA</Title>
              <Text type="secondary" style={{ fontSize: 16 }}>
                Create tailored interview questions with answers from resume and job description
              </Text>
            </Card>
          </Col>

          <Col xs={24} md={8}>
            <Card
              hoverable
              onClick={() => navigate('/bulk-analysis')}
              style={{
                textAlign: 'center',
                padding: '40px 24px',
                borderRadius: 12,
                height: '100%',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
              }}
              bodyStyle={{ padding: 0 }}
            >
              <TeamOutlined style={{ fontSize: 64, color: '#1d3f77', marginBottom: 24 }} />
              <Title level={3} style={{ marginBottom: 16 }}>Resume Ranking</Title>
              <Text type="secondary" style={{ fontSize: 16 }}>
                Analyze and rank multiple resumes against job requirements automatically
              </Text>
            </Card>
          </Col>
        </Row>

        {/* How It Works Section */}
        <div style={{ marginTop: 80, textAlign: 'center' }}>
          <Title level={2} style={{ marginBottom: 40 }}>How It Works</Title>
          <Row gutter={[24, 24]} justify="center">
            <Col xs={24} md={8}>
              <Card bordered={false} style={{ background: '#fff', borderRadius: 12 }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>📤</div>
                <Title level={4}>1. Upload</Title>
                <Text type="secondary">
                  Upload resume(s), job descriptions, or start from scratch
                </Text>
              </Card>
            </Col>
            <Col xs={24} md={8}>
              <Card bordered={false} style={{ background: '#fff', borderRadius: 12 }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>🤖</div>
                <Title level={4}>2. AI Processing</Title>
                <Text type="secondary">
                  Our AI analyzes, extracts, and processes your documents
                </Text>
              </Card>
            </Col>
            <Col xs={24} md={8}>
              <Card bordered={false} style={{ background: '#fff', borderRadius: 12 }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
                <Title level={4}>3. Get Results</Title>
                <Text type="secondary">
                  Download formatted resumes, questions, or ranking reports
                </Text>
              </Card>
            </Col>
          </Row>
        </div>
      </Content>

      <Footer style={{ textAlign: 'center', background: '#fff', marginTop: 60 }}>
        © 2025 Incedo Intellifit. All rights reserved.
      </Footer>
    </Layout>
  );
};

export default HomePage;
