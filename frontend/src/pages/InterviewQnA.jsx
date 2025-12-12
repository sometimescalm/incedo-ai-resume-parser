import React, { useState } from 'react';
import { Layout, Card, Typography, Upload, Form, Input, Select, Slider, Button, Steps, message, Row, Col, Badge, Divider } from 'antd';
import {
  InboxOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
  RocketOutlined,
  BulbOutlined,
  UserOutlined,
  TeamOutlined,
  TrophyOutlined,
  HomeOutlined,
  ThunderboltOutlined
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
    if (!resumeFile || !jdFile) {
      message.error('Please upload both Resume and Job Description');
      return;
    }

    setLoading(true);
    setCurrentStep(0);

    try {
      setCurrentStep(0);
      await new Promise(resolve => setTimeout(resolve, 500));

      setCurrentStep(1);
      message.info('Uploading documents...');

      const formData = new FormData();
      formData.append('resume', resumeFile);
      formData.append('jobd', jdFile);
      
      // Send default values if fields are empty (backend doesn't handle None properly)
      formData.append('role', values.role?.trim() || 'Software Engineer');
      formData.append('domain', values.domain?.trim() || 'Technology');
      formData.append('experience_level', values.experience_level || 'mid');
      formData.append('skills', values.skills?.trim() || 'General technical skills');
      formData.append('num_questions', values.num_questions || 10);

      console.log('=== SENDING TO BACKEND ===');
      console.log('Role:', formData.get('role'));
      console.log('Domain:', formData.get('domain'));
      console.log('Experience:', formData.get('experience_level'));
      console.log('Skills:', formData.get('skills'));
      console.log('Num Questions:', formData.get('num_questions'));
      console.log('=========================');

      setCurrentStep(2);

      const response = await fetch('http://127.0.0.1:8000/interview_question', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Backend error response:', errorText);
        throw new Error(`Failed to generate questions: ${response.status}`);
      }

      const data = await response.json();

      setCurrentStep(3);
      await new Promise(resolve => setTimeout(resolve, 1000));

      message.success('Questions generated successfully!');

      navigate('/interview-questions', {
        state: {
          questionsData: data,
          candidateInfo: {
            role: values.role?.trim() || 'Software Engineer',
            domain: values.domain?.trim() || 'Technology',
            experience: values.experience_level,
            skills: values.skills?.trim() || 'General technical skills',
          }
        }
      });

    } catch (error) {
      console.error('ERROR:', error);
      message.error('Failed to generate questions. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { title: 'Preparing', description: 'Validating files' },
    { title: 'Uploading', description: 'Sending to server' },
    { title: 'Analyzing', description: 'AI processing' },
    { title: 'Complete', description: 'Questions ready' },
  ];

  const experienceLevels = [
    { value: 'junior', label: 'Junior (0-2 years)', icon: '🌱' },
    { value: 'mid', label: 'Mid-Level (3-5 years)', icon: '🌿' },
    { value: 'senior', label: 'Senior (6-10 years)', icon: '🌳' },
    { value: 'lead', label: 'Lead/Architect (10+ years)', icon: '🏆' },
  ];

  return (
    <Layout style={{ minHeight: '100vh', background: '#f5f7fa' }}>
      {/* Professional Header */}
      <Header style={{
        backgroundColor: '#ffffff',
        display: 'flex',
        alignItems: 'center',
        padding: '0 48px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
        height: 72,
        borderBottom: '1px solid #e8ecf0'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <img src="/logo-incedo.png" alt="Incedo Logo" style={{ height: 40 }} />
          <Divider type="vertical" style={{ height: 32, borderColor: '#d9d9d9' }} />
          <Title level={4} style={{ margin: 0, color: '#1d3f77', fontWeight: 600 }}>
            Interview QnA Generator
          </Title>
        </div>
        <Button
          icon={<HomeOutlined />}
          size="large"
          style={{
            marginLeft: 'auto',
            borderRadius: 8,
            fontWeight: 500,
            border: '1px solid #d9d9d9'
          }}
          onClick={() => navigate('/')}
        >
          Home
        </Button>
      </Header>

      <Content style={{ padding: '48px 48px 80px' }}>
        {/* Hero Section */}
        <div style={{ textAlign: 'center', marginBottom: 56, maxWidth: 900, margin: '0 auto 56px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 12,
            padding: '8px 20px',
            background: '#e6f7ff',
            borderRadius: 24,
            marginBottom: 24
          }}>
            <ThunderboltOutlined style={{ color: '#1890ff', fontSize: 18 }} />
            <Text style={{ color: '#1890ff', fontWeight: 500, fontSize: 14 }}>
              AI-Powered Interview Preparation
            </Text>
          </div>

          <Title level={1} style={{
            fontSize: 48,
            fontWeight: 700,
            marginBottom: 16,
            color: '#1d3f77',
            letterSpacing: '-0.5px'
          }}>
            Generate Smart Interview Questions
          </Title>

          <Paragraph style={{
            fontSize: 18,
            color: '#5a6c7d',
            maxWidth: 700,
            margin: '0 auto',
            lineHeight: 1.6
          }}>
            Upload a candidate's resume and job description to receive tailored interview questions with detailed answers, powered by advanced AI
          </Paragraph>
        </div>

        {/* Feature Pills */}
        <Row gutter={[16, 16]} justify="center" style={{ marginBottom: 56, maxWidth: 1000, margin: '0 auto 56px' }}>
          <Col>
            <div style={{
              padding: '12px 24px',
              background: '#ffffff',
              borderRadius: 24,
              border: '1px solid #e8ecf0',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 10
            }}>
              <CheckCircleOutlined style={{ color: '#52c41a', fontSize: 18 }} />
              <Text style={{ fontWeight: 500 }}>Instant Generation</Text>
            </div>
          </Col>
          <Col>
            <div style={{
              padding: '12px 24px',
              background: '#ffffff',
              borderRadius: 24,
              border: '1px solid #e8ecf0',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 10
            }}>
              <TrophyOutlined style={{ color: '#faad14', fontSize: 18 }} />
              <Text style={{ fontWeight: 500 }}>Expert Quality</Text>
            </div>
          </Col>
          <Col>
            <div style={{
              padding: '12px 24px',
              background: '#ffffff',
              borderRadius: 24,
              border: '1px solid #e8ecf0',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 10
            }}>
              <RocketOutlined style={{ color: '#1890ff', fontSize: 18 }} />
              <Text style={{ fontWeight: 500 }}>Role-Specific</Text>
            </div>
          </Col>
        </Row>

        {/* Main Form Card */}
        <Card
          style={{
            maxWidth: 1100,
            margin: '0 auto',
            borderRadius: 16,
            boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
            border: '1px solid #e8ecf0'
          }}
          bodyStyle={{ padding: '48px' }}
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
            <div style={{ marginBottom: 40 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
                <div style={{
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  background: '#1d3f77',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontWeight: 'bold',
                  fontSize: 18
                }}>
                  1
                </div>
                <div>
                  <Title level={4} style={{ margin: 0, color: '#1d3f77' }}>
                    Upload Documents
                  </Title>
                  <Text type="secondary">Resume and job description required</Text>
                </div>
              </div>

              <Row gutter={24}>
                <Col xs={24} lg={12}>
                  <Form.Item
                    label={<Text strong style={{ fontSize: 15 }}>Candidate Resume</Text>}
                    required
                  >
                    <Dragger
                      {...resumeUploadProps}
                      style={{
                        borderRadius: 12,
                        background: resumeFile ? '#f6ffed' : '#fafafa',
                        border: resumeFile ? '2px solid #52c41a' : '2px dashed #d9d9d9',
                        minHeight: 160
                      }}
                    >
                      {resumeFile ? (
                        <>
                          <p className="ant-upload-drag-icon">
                            <CheckCircleOutlined style={{ color: '#52c41a', fontSize: 56 }} />
                          </p>
                          <p className="ant-upload-text" style={{ color: '#52c41a', fontWeight: 600, fontSize: 16 }}>
                            {resumeFile.name}
                          </p>
                          <p className="ant-upload-hint" style={{ color: '#8c8c8c' }}>Click to replace</p>
                        </>
                      ) : (
                        <>
                          <p className="ant-upload-drag-icon">
                            <FileTextOutlined style={{ color: '#1d3f77', fontSize: 56 }} />
                          </p>
                          <p className="ant-upload-text" style={{ fontWeight: 600, fontSize: 16 }}>
                            Upload Resume
                          </p>
                          <p className="ant-upload-hint" style={{ color: '#8c8c8c' }}>
                            PDF or DOCX • Max 10MB
                          </p>
                        </>
                      )}
                    </Dragger>
                  </Form.Item>
                </Col>

                <Col xs={24} lg={12}>
                  <Form.Item
                    label={<Text strong style={{ fontSize: 15 }}>Job Description</Text>}
                    required
                  >
                    <Dragger
                      {...jdUploadProps}
                      style={{
                        borderRadius: 12,
                        background: jdFile ? '#f6ffed' : '#fafafa',
                        border: jdFile ? '2px solid #52c41a' : '2px dashed #d9d9d9',
                        minHeight: 160
                      }}
                    >
                      {jdFile ? (
                        <>
                          <p className="ant-upload-drag-icon">
                            <CheckCircleOutlined style={{ color: '#52c41a', fontSize: 56 }} />
                          </p>
                          <p className="ant-upload-text" style={{ color: '#52c41a', fontWeight: 600, fontSize: 16 }}>
                            {jdFile.name}
                          </p>
                          <p className="ant-upload-hint" style={{ color: '#8c8c8c' }}>Click to replace</p>
                        </>
                      ) : (
                        <>
                          <p className="ant-upload-drag-icon">
                            <FileTextOutlined style={{ color: '#1d3f77', fontSize: 56 }} />
                          </p>
                          <p className="ant-upload-text" style={{ fontWeight: 600, fontSize: 16 }}>
                            Upload Job Description
                          </p>
                          <p className="ant-upload-hint" style={{ color: '#8c8c8c' }}>
                            PDF or DOCX • Max 10MB
                          </p>
                        </>
                      )}
                    </Dragger>
                  </Form.Item>
                </Col>
              </Row>
            </div>

            <Divider />

            {/* Step 2: Configure */}
            <div style={{ marginBottom: 40, marginTop: 40 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
                <div style={{
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  background: '#1d3f77',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontWeight: 'bold',
                  fontSize: 18
                }}>
                  2
                </div>
                <div>
                  <Title level={4} style={{ margin: 0, color: '#1d3f77' }}>
                    Configure Questions
                  </Title>
                  <Text type="secondary">Customize to match interview requirements (optional)</Text>
                </div>
              </div>

              <Row gutter={[24, 24]}>
                <Col xs={24} lg={12}>
                  <Form.Item
                    name="role"
                    label={<Text strong style={{ fontSize: 15 }}>Role/Position</Text>}
                  >
                    <Input
                      placeholder="e.g., Senior Backend Engineer (optional)"
                      size="large"
                      style={{ borderRadius: 8 }}
                      prefix={<UserOutlined style={{ color: '#8c8c8c' }} />}
                    />
                  </Form.Item>
                </Col>

                <Col xs={24} lg={12}>
                  <Form.Item
                    name="domain"
                    label={<Text strong style={{ fontSize: 15 }}>Domain/Industry</Text>}
                  >
                    <Input
                      placeholder="e.g., FinTech, Healthcare (optional)"
                      size="large"
                      style={{ borderRadius: 8 }}
                      prefix={<TeamOutlined style={{ color: '#8c8c8c' }} />}
                    />
                  </Form.Item>
                </Col>

                <Col xs={24} lg={12}>
                  <Form.Item
                    name="experience_level"
                    label={<Text strong style={{ fontSize: 15 }}>Experience Level</Text>}
                    required
                  >
                    <Select size="large" style={{ borderRadius: 8 }}>
                      {experienceLevels.map(level => (
                        <Select.Option key={level.value} value={level.value}>
                          {level.icon} {level.label}
                        </Select.Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>

                <Col xs={24} lg={12}>
                  <Form.Item
                    name="skills"
                    label={<Text strong style={{ fontSize: 15 }}>Key Skills Focus</Text>}
                  >
                    <Input
                      placeholder="e.g., Python, AWS, System Design (optional)"
                      size="large"
                      style={{ borderRadius: 8 }}
                    />
                  </Form.Item>
                </Col>

                <Col xs={24}>
                  <Form.Item
                    name="num_questions"
                    label={
                      <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                        <Text strong style={{ fontSize: 15 }}>Number of Questions</Text>
                        <Badge
                          count={numQuestions}
                          style={{
                            backgroundColor: '#1d3f77',
                            fontSize: 16,
                            height: 28,
                            minWidth: 28,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        />
                      </div>
                    }
                  >
                    <Slider
                      min={5}
                      max={20}
                      marks={{
                        5: '5',
                        10: '10',
                        15: '15',
                        20: '20'
                      }}
                      onChange={(value) => {
                        setNumQuestions(value);
                        form.setFieldsValue({ num_questions: value });
                      }}
                      trackStyle={{ background: '#1d3f77', height: 6 }}
                      handleStyle={{
                        borderColor: '#1d3f77',
                        height: 20,
                        width: 20,
                        marginTop: -7,
                        backgroundColor: '#fff',
                        boxShadow: '0 0 0 4px rgba(29, 63, 119, 0.15)'
                      }}
                    />
                  </Form.Item>
                </Col>
              </Row>
            </div>

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
                  background: '#1d3f77',
                  border: 'none',
                  height: 56,
                  fontSize: 16,
                  fontWeight: 600,
                  borderRadius: 12,
                  boxShadow: '0 4px 12px rgba(29, 63, 119, 0.3)'
                }}
                disabled={!resumeFile || !jdFile}
              >
                {loading ? 'Generating Questions...' : 'Generate Interview Questions'}
              </Button>
            </Form.Item>

            {/* Progress Steps */}
            {loading && (
              <div style={{ marginTop: 40, padding: 32, background: '#fafafa', borderRadius: 12 }}>
                <Steps current={currentStep} items={steps} />
              </div>
            )}
          </Form>
        </Card>

        {/* Info Footer */}
        <div style={{
          textAlign: 'center',
          marginTop: 40,
          padding: '24px 32px',
          background: '#ffffff',
          borderRadius: 12,
          maxWidth: 800,
          margin: '40px auto 0',
          border: '1px solid #e8ecf0'
        }}>
          <BulbOutlined style={{ fontSize: 24, color: '#faad14', marginBottom: 12 }} />
          <Paragraph style={{ margin: 0, color: '#5a6c7d' }}>
            <strong>Pro Tip:</strong> Provide detailed and well-formatted documents for the best results. 
            Our AI analyzes both files to create perfectly tailored interview questions.
          </Paragraph>
        </div>
      </Content>
    </Layout>
  );
};

export default InterviewQnA;