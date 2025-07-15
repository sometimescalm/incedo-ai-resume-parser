// HomePage.jsx
import React from 'react';
import { Layout, Typography, Button, Row, Col, Card, Divider } from 'antd';
import { UploadOutlined, FileAddOutlined } from '@ant-design/icons';
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
      </Header>


      <Content style={{ padding: '60px 24px', background: '#f0f2f5' }}>
        <Row justify="center" align="middle" gutter={32}>
          <Col xs={24} md={12}>
            <img
              src="https://img.freepik.com/free-vector/portfolio-concept-illustration_114360-2574.jpg"
              alt="resume builder"
              style={{ width: '100%', maxWidth: 500 }}
            />
          </Col>

          <Col xs={24} md={12}>

            {/* 🔤 Header Title */}
            <div style={{ fontSize: 50, fontWeight: 'bold' }}>
              Incedo Resume Formatter
            </div>
            <Title level={1}>Build Your Resume in Minutes</Title>
            <Text type="secondary" style={{ fontSize: 16 }}>
              A fast and elegant resume builder powered by smart design and AI parsing.
            </Text>
            <div style={{ marginTop: 32 }}>
              <Button
                type="primary"
                icon={<UploadOutlined />}
                size="large"
                style={{ marginRight: 16 }}
                onClick={() => navigate('/upload')}
              >
                Upload Resume
              </Button>
              <Button
                type="default"
                icon={<FileAddOutlined />}
                size="large"
                onClick={() => navigate('/resume-builder')}
              >
                Create from Scratch
              </Button>
            </div>
          </Col>
        </Row>

        <Divider style={{ margin: '60px 0 40px' }}>How It Works</Divider>
        <Row gutter={16} justify="center">
          <Col xs={24} md={8}>
            <Card title="1. Upload or Start" bordered={false}>Start with your existing resume or a blank form.</Card>
          </Col>
          <Col xs={24} md={8}>
            <Card title="2. Edit & Customize" bordered={false}>Update fields, add sections, and fine-tune your layout.</Card>
          </Col>
          <Col xs={24} md={8}>
            <Card title="3. Download PDF" bordered={false}>Export a polished, printable resume instantly.</Card>
          </Col>
        </Row>
      </Content>

      {/* Footer */}
      <Footer style={{ textAlign: 'center', background: '#fff' }}>
        © 2025 ResumeCraft. All rights reserved.
      </Footer>
    </Layout>
  );
};

export default HomePage;