import React, { useState } from 'react';
import { Layout, Card, Typography, Upload, Form, Input, Select, Slider, Button, Steps, message, Row, Col, Badge } from 'antd';
import {
  InboxOutlined,
  ArrowRightOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
  RocketOutlined,
  BulbOutlined,
  UserOutlined,
  TeamOutlined,
  TrophyOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Header, Content } = Layout;
const { Title, Text, Paragraph } = Typography;
const { Dragger } = Upload;

const InterviewQnA = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [resumeFile, setResumeFile] = useState(null);
  const [jdFile, setJdFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [numQuestions, setNumQuestions] = useState(10);

  console.log('InterviewQnA component rendered');

  const resumeUploadProps = {
    name: 'resume',
    multiple: false,
    accept: '.pdf,.docx',
    showUploadList: false,
    beforeUpload: (file) => {
      setResumeFile(file);
      message.success(`${file.name} uploaded successfully!`);
      return false;
    },
  };

  const jdUploadProps = {
    name: 'jd',
    multiple: false,
    accept: '.pdf,.docx',
    showUploadList: false,
    beforeUpload: (file) => {
      setJdFile(file);
      message.success(`${file.name} uploaded successfully!`);
      return false;
    },
  };

  const handleGenerate = async (values) => {

    console.log('🚀 handleGenerate CALLED!', values);

    if (!resumeFile || !jdFile) {
      message.error('Please upload both Resume and Job Description');
      return;
    }

    setLoading(true);
    setCurrentStep(0);

    try {
      console.log('1. Starting generation...');
      setCurrentStep(0);
      await new Promise(resolve => setTimeout(resolve, 500));

      console.log('2. Uploading documents...');
      setCurrentStep(1);
      message.info('Uploading documents...');

      const formData = new FormData();
      formData.append('resume', resumeFile);
      formData.append('jobd', jdFile);

      console.log('3. Calling backend...');
      setCurrentStep(2);

      const response = await fetch('http://127.0.0.1:8000/interview_question', {
        method: 'POST',
        body: formData,
      });

      console.log('4. Response received:', response.ok, response.status);

      if (!response.ok) {
        throw new Error('Failed to generate questions');
      }

      console.log('5. Parsing JSON...');
      const data = await response.json();

      console.log('6. Data parsed:', data);
      console.log('7. Questions:', data.questions);
      console.log('8. Questions length:', data.questions?.length);

      setCurrentStep(3);
      await new Promise(resolve => setTimeout(resolve, 1000));

      message.success('Questions generated successfully!');

      console.log('9. About to navigate...');
      console.log('10. Navigate function:', typeof navigate);

      // Navigate to results page with generated data
      navigate('/interview-questions', {
        state: {
          questionsData: data,
          candidateInfo: {
            role: values.role,
            domain: values.domain,
            experience: values.experience_level,
            skills: values.skills,
          }
        }
      });

      console.log('11. Navigation called!');

    } catch (error) {
      console.error('ERROR:', error);
      message.error('Failed to generate questions. Please try again.');
    } finally {
      setLoading(false);
      console.log('12. Finally block executed');
    }
  };

  const steps = [
    {
      title: 'Preparing',
      icon: <FileTextOutlined />,
      description: 'Validating files'
    },
    {
      title: 'Uploading',
      icon: <BulbOutlined />,
      description: 'Sending to server'
    },
    {
      title: 'Analyzing',
      icon: <RocketOutlined />,
      description: 'AI processing'
    },
    {
      title: 'Complete',
      icon: <CheckCircleOutlined />,
      description: 'Questions ready'
    },
  ];

  const experienceLevels = [
    { value: 'junior', label: 'Junior (0-2 years)', icon: '🌱' },
    { value: 'mid', label: 'Mid-Level (3-5 years)', icon: '🌿' },
    { value: 'senior', label: 'Senior (6-10 years)', icon: '🌳' },
    { value: 'lead', label: 'Lead/Architect (10+ years)', icon: '🏆' },
  ];

  return (
    <Layout style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
      <Header style={{
        backgroundColor: 'rgba(29, 63, 119, 0.95)',
        display: 'flex',
        alignItems: 'center',
        padding: '0 24px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
      }}>
        <img src="/logo-incedo.png" alt="Incedo Logo" style={{ height: 32, marginRight: 16 }} />
        <Title level={4} style={{ color: 'white', margin: 0 }}>Interview QnA Generator</Title>
        <Button
          type="link"
          style={{ color: 'white', fontWeight: 'bold', marginLeft: 'auto' }}
          onClick={() => navigate('/')}
        >
          ← Back to Home
        </Button>
      </Header>

      <Content style={{ padding: '60px 24px' }}>
        {/* Hero Section */}
        <div style={{
          textAlign: 'center',
          marginBottom: 48,
          animation: 'fadeIn 0.8s ease-in'
        }}>
          <div style={{
            display: 'inline-block',
            padding: '20px 40px',
            background: 'rgba(255,255,255,0.95)',
            borderRadius: 20,
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
          }}>
            <Title level={1} style={{ margin: 0, color: '#1d3f77', fontSize: 42 }}>
              🎯 AI-Powered Interview Questions
            </Title>
            <Paragraph style={{ fontSize: 18, color: '#666', marginTop: 12, marginBottom: 0 }}>
              Generate tailored interview questions in seconds with our intelligent system
            </Paragraph>
          </div>
        </div>

        {/* Stats Cards */}
        <Row gutter={[24, 24]} style={{ maxWidth: 1200, margin: '0 auto 48px' }}>
          <Col xs={24} sm={8}>
            <Card
              hoverable
              style={{
                borderRadius: 16,
                background: 'rgba(255,255,255,0.95)',
                border: 'none',
                boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
                textAlign: 'center'
              }}
            >
              <TrophyOutlined style={{ fontSize: 48, color: '#faad14', marginBottom: 12 }} />
              <Title level={4} style={{ margin: 0 }}>Smart Analysis</Title>
              <Text type="secondary">AI analyzes resume & JD to create relevant questions</Text>
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card
              hoverable
              style={{
                borderRadius: 16,
                background: 'rgba(255,255,255,0.95)',
                border: 'none',
                boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
                textAlign: 'center'
              }}
            >
              <RocketOutlined style={{ fontSize: 48, color: '#1890ff', marginBottom: 12 }} />
              <Title level={4} style={{ margin: 0 }}>Fast Generation</Title>
              <Text type="secondary">Get comprehensive questions in under 30 seconds</Text>
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card
              hoverable
              style={{
                borderRadius: 16,
                background: 'rgba(255,255,255,0.95)',
                border: 'none',
                boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
                textAlign: 'center'
              }}
            >
              <CheckCircleOutlined style={{ fontSize: 48, color: '#52c41a', marginBottom: 12 }} />
              <Title level={4} style={{ margin: 0 }}>Expert Quality</Title>
              <Text type="secondary">Questions with detailed answers & difficulty levels</Text>
            </Card>
          </Col>
        </Row>

        {/* Main Form Card */}
        <Card
          style={{
            maxWidth: 1000,
            margin: '0 auto',
            borderRadius: 24,
            boxShadow: '0 12px 48px rgba(0,0,0,0.15)',
            background: 'rgba(255,255,255,0.98)',
            border: 'none',
            overflow: 'hidden'
          }}
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={handleGenerate}
            initialValues={{
              experience_level: 'mid',
              num_questions: 10,
            }}
          >
            {/* Step 1: Upload Documents */}
            <div style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              padding: '24px 32px',
              marginBottom: 32,
              borderRadius: 16,
              color: 'white'
            }}>
              <Title level={3} style={{ color: 'white', margin: 0, display: 'flex', alignItems: 'center', gap: 12 }}>
                <FileTextOutlined /> Step 1: Upload Documents
              </Title>
              <Text style={{ color: 'rgba(255,255,255,0.9)' }}>
                Upload the candidate's resume and job description to begin
              </Text>
            </div>

            <Row gutter={24} style={{ marginBottom: 40 }}>
              <Col xs={24} md={12}>
                <Form.Item
                  label={
                    <Text strong style={{ fontSize: 16 }}>
                      📄 Candidate Resume
                    </Text>
                  }
                  required
                >
                  <Dragger
                    {...resumeUploadProps}
                    style={{
                      borderRadius: 12,
                      background: resumeFile ? '#f0f9ff' : '#fafafa',
                      border: resumeFile ? '2px dashed #1890ff' : '2px dashed #d9d9d9'
                    }}
                  >
                    {resumeFile ? (
                      <>
                        <p className="ant-upload-drag-icon">
                          <CheckCircleOutlined style={{ color: '#52c41a', fontSize: 48 }} />
                        </p>
                        <p className="ant-upload-text" style={{ color: '#52c41a', fontWeight: 'bold' }}>
                          ✓ {resumeFile.name}
                        </p>
                        <p className="ant-upload-hint">Click to change file</p>
                      </>
                    ) : (
                      <>
                        <p className="ant-upload-drag-icon">
                          <InboxOutlined style={{ color: '#1d3f77', fontSize: 48 }} />
                        </p>
                        <p className="ant-upload-text">Click or drag resume here</p>
                        <p className="ant-upload-hint">Supports: PDF, DOCX (Max 10MB)</p>
                      </>
                    )}
                  </Dragger>
                </Form.Item>
              </Col>

              <Col xs={24} md={12}>
                <Form.Item
                  label={
                    <Text strong style={{ fontSize: 16 }}>
                      📋 Job Description
                    </Text>
                  }
                  required
                >
                  <Dragger
                    {...jdUploadProps}
                    style={{
                      borderRadius: 12,
                      background: jdFile ? '#f0f9ff' : '#fafafa',
                      border: jdFile ? '2px dashed #1890ff' : '2px dashed #d9d9d9'
                    }}
                  >
                    {jdFile ? (
                      <>
                        <p className="ant-upload-drag-icon">
                          <CheckCircleOutlined style={{ color: '#52c41a', fontSize: 48 }} />
                        </p>
                        <p className="ant-upload-text" style={{ color: '#52c41a', fontWeight: 'bold' }}>
                          ✓ {jdFile.name}
                        </p>
                        <p className="ant-upload-hint">Click to change file</p>
                      </>
                    ) : (
                      <>
                        <p className="ant-upload-drag-icon">
                          <InboxOutlined style={{ color: '#1d3f77', fontSize: 48 }} />
                        </p>
                        <p className="ant-upload-text">Click or drag JD here</p>
                        <p className="ant-upload-hint">Supports: PDF, DOCX (Max 10MB)</p>
                      </>
                    )}
                  </Dragger>
                </Form.Item>
              </Col>
            </Row>

            {/* Step 2: Configure Questions */}
            <div style={{
              background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
              padding: '24px 32px',
              marginBottom: 32,
              borderRadius: 16,
              color: 'white'
            }}>
              <Title level={3} style={{ color: 'white', margin: 0, display: 'flex', alignItems: 'center', gap: 12 }}>
                <BulbOutlined /> Step 2: Configure Interview Details (Optional)
              </Title>
              <Text style={{ color: 'rgba(255,255,255,0.9)' }}>
                These fields help you track and organize.
              </Text>
            </div>

            <Row gutter={[24, 24]}>
              <Col xs={24} md={12}>
                <Form.Item
                  name="role"
                  label={
                    <span style={{ fontSize: 15, fontWeight: 600 }}>
                      <UserOutlined /> Role/Position
                    </span>
                  }
                >
                  <Input
                    placeholder="e.g., Senior Backend Engineer"
                    size="large"
                    style={{ borderRadius: 8 }}
                    prefix={<UserOutlined style={{ color: '#1890ff' }} />}
                  />
                </Form.Item>
              </Col>

              <Col xs={24} md={12}>
                <Form.Item
                  name="domain"
                  label={
                    <span style={{ fontSize: 15, fontWeight: 600 }}>
                      <TeamOutlined /> Domain/Industry
                    </span>
                  }
                >
                  <Input
                    placeholder="e.g., FinTech, Healthcare, E-commerce"
                    size="large"
                    style={{ borderRadius: 8 }}
                    prefix={<TeamOutlined style={{ color: '#52c41a' }} />}
                  />
                </Form.Item>
              </Col>

              <Col xs={24} md={12}>
                <Form.Item
                  name="experience_level"
                  label={
                    <span style={{ fontSize: 15, fontWeight: 600 }}>
                      <TrophyOutlined /> Experience Level
                    </span>
                  }
                >
                  <Select
                    size="large"
                    placeholder="Select experience level"
                    style={{ borderRadius: 8 }}
                  >
                    {experienceLevels.map(level => (
                      <Select.Option key={level.value} value={level.value}>
                        <span style={{ fontSize: 16 }}>
                          {level.icon} {level.label}
                        </span>
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>

              <Col xs={24} md={12}>
                <Form.Item
                  name="skills"
                  label={
                    <span style={{ fontSize: 15, fontWeight: 600 }}>
                      🎯 Key Skills to Focus
                    </span>
                  }
                >
                  <Input
                    placeholder="e.g., Python, AWS, Microservices, System Design"
                    size="large"
                    style={{ borderRadius: 8 }}
                  />
                </Form.Item>
              </Col>

              <Col xs={24}>
                <Form.Item
                  name="num_questions"
                  label={
                    <span style={{ fontSize: 15, fontWeight: 600 }}>
                      📊 Number of Questions (Reference):
                      <Badge
                        count={numQuestions}
                        style={{
                          backgroundColor: '#1890ff',
                          marginLeft: 12,
                          fontSize: 16,
                          padding: '0 12px',
                          height: 28
                        }}
                      />
                    </span>
                  }
                >
                  <Slider
                    min={5}
                    max={20}
                    marks={{
                      5: { label: '5', style: { fontSize: 14, fontWeight: 'bold' } },
                      10: { label: '10', style: { fontSize: 14, fontWeight: 'bold' } },
                      15: { label: '15', style: { fontSize: 14, fontWeight: 'bold' } },
                      20: { label: '20', style: { fontSize: 14, fontWeight: 'bold' } }
                    }}
                    onChange={(value) => {
                      setNumQuestions(value);
                      form.setFieldsValue({ num_questions: value });
                    }}
                    trackStyle={{ background: 'linear-gradient(to right, #667eea, #764ba2)', height: 8 }}
                    handleStyle={{
                      borderColor: '#667eea',
                      height: 24,
                      width: 24,
                      marginTop: -8,
                      backgroundColor: '#fff',
                      boxShadow: '0 0 0 4px rgba(102, 126, 234, 0.2)'
                    }}
                  />
                </Form.Item>
              </Col>
            </Row>

            {/* Generate Button */}
            <Form.Item style={{ marginTop: 48, marginBottom: 0 }}>
              <Button
                type="primary"
                htmlType="submit"
                size="large"
                icon={<RocketOutlined />}
                loading={loading}
                block
                style={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  border: 'none',
                  height: 60,
                  fontSize: 18,
                  fontWeight: 'bold',
                  borderRadius: 12,
                  boxShadow: '0 6px 20px rgba(102, 126, 234, 0.4)',
                  transition: 'all 0.3s ease'
                }}
                disabled={!resumeFile || !jdFile}
              >
                {loading ? 'Generating Questions...' : '✨ Generate Interview Questions'}
              </Button>
            </Form.Item>

            {/* Progress Steps */}
            {loading && (
              <div style={{
                marginTop: 48,
                padding: 32,
                background: 'linear-gradient(135deg, #f6f8fb 0%, #e9ecef 100%)',
                borderRadius: 16
              }}>
                <Steps
                  current={currentStep}
                  items={steps}
                  labelPlacement="vertical"
                />
              </div>
            )}
          </Form>
        </Card>

        {/* Bottom Info */}
        <div style={{
          textAlign: 'center',
          marginTop: 48,
          padding: 24,
          background: 'rgba(255,255,255,0.95)',
          borderRadius: 16,
          maxWidth: 800,
          margin: '48px auto 0'
        }}>
          <Text type="secondary" style={{ fontSize: 14 }}>
            💡 <strong>Pro Tip:</strong> The AI analyzes both resume and job description to generate perfectly tailored interview questions.
            Make sure both documents are clear and well-formatted for best results.
          </Text>
        </div>
      </Content>
    </Layout>
  );
};

export default InterviewQnA;