import React, { useState } from 'react';
import { Layout, Card, Typography, Upload, Form, Input, InputNumber, Button, Steps, message } from 'antd';
import { InboxOutlined, ArrowRightOutlined, FileZipOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Header, Content } = Layout;
const { Title, Text } = Typography;
const { Dragger } = Upload;

const BulkResumeAnalysis = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [jdFile, setJdFile] = useState(null);
  const [resumeFiles, setResumeFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  const jdUploadProps = {
    name: 'jd',
    multiple: false,
    accept: '.pdf,.docx',
    showUploadList: false,
    beforeUpload: (file) => {
      setJdFile(file);
      message.success(`${file.name} selected`);
      return false;
    },
  };

  const resumeUploadProps = {
    name: 'resumes',
    multiple: true,
    accept: '.pdf,.docx,.zip',
    showUploadList: true,
    beforeUpload: (file) => {
      setResumeFiles(prev => [...prev, file]);
      return false;
    },
    onRemove: (file) => {
      setResumeFiles(prev => prev.filter(f => f.uid !== file.uid));
    },
    fileList: resumeFiles,
  };

  const handleAnalyze = async (values) => {
    if (!jdFile) {
      message.error('Please upload Job Description');
      return;
    }

    if (resumeFiles.length === 0) {
      message.error('Please upload at least one resume');
      return;
    }

    setLoading(true);
    setCurrentStep(0);

    try {
      // Step 0: Preparing files
      setCurrentStep(0);
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Step 1: Uploading resumes
      setCurrentStep(1);
      
      // Create FormData for API call
      const formData = new FormData();
      formData.append('jd', jdFile);
      
      // Append all resume files
      resumeFiles.forEach((file) => {
        formData.append('resumes', file);
      });

      // Append optional filters
      if (values.role) formData.append('role', values.role);
      if (values.min_experience) formData.append('min_experience', values.min_experience);
      if (values.required_skills) formData.append('required_skills', values.required_skills);

      await new Promise(resolve => setTimeout(resolve, 2000));

      // Step 2: Analyzing resumes
      setCurrentStep(2);

      // TODO: Replace with actual API endpoint
      const response = await fetch('http://127.0.0.1:8000/rank_resumes', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to analyze resumes');
      }

      const data = await response.json();

      await new Promise(resolve => setTimeout(resolve, 3000));

      // Step 3: Ranking candidates
      setCurrentStep(3);
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Step 4: Finalizing
      setCurrentStep(4);
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Navigate to results page with ranking data
      navigate('/ranking-results', { 
        state: { 
          rankingData: data,
          jdInfo: {
            role: values.role,
            totalResumes: resumeFiles.length,
          }
        } 
      });

    } catch (error) {
      console.error('Error analyzing resumes:', error);
      message.error('Failed to analyze resumes. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { title: 'Preparing files' },
    { title: 'Uploading resumes' },
    { title: 'Analyzing resumes' },
    { title: 'Ranking candidates' },
    { title: 'Finalizing' },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ backgroundColor: '#1d3f77', display: 'flex', alignItems: 'center', padding: '0 24px' }}>
        <img src="/logo-incedo.png" alt="Incedo Logo" style={{ height: 32, marginRight: 16 }} />
        <Button
          type="link"
          style={{ color: 'white', fontWeight: 'bold', marginLeft: 'auto' }}
          onClick={() => navigate('/')}
        >
          Home
        </Button>
      </Header>

      <Content style={{ padding: '40px 24px', background: '#f0f2f5' }}>
        <Card
          style={{
            maxWidth: 900,
            margin: '0 auto',
            borderRadius: 12,
            boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
          }}
        >
          <Title level={2} style={{ textAlign: 'center', marginBottom: 8 }}>
            Bulk Resume Analysis & Ranking
          </Title>
          <Text type="secondary" style={{ display: 'block', textAlign: 'center', marginBottom: 40 }}>
            Upload job description and multiple resumes to get AI-powered ranking
          </Text>

          <Form
            form={form}
            layout="vertical"
            onFinish={handleAnalyze}
          >
            {/* JD Upload */}
            <Title level={4} style={{ marginBottom: 24 }}>Step 1: Upload Job Description</Title>
            
            <Form.Item
              label={<strong>Job Description (Required)</strong>}
              required
            >
              <Dragger {...jdUploadProps}>
                <p className="ant-upload-drag-icon">
                  <InboxOutlined style={{ color: '#1d3f77' }} />
                </p>
                <p className="ant-upload-text">
                  {jdFile ? jdFile.name : 'Click or drag JD file (PDF/DOCX)'}
                </p>
                <p className="ant-upload-hint">Upload the job description document</p>
              </Dragger>
            </Form.Item>

            {/* Resume Upload */}
            <Title level={4} style={{ marginTop: 40, marginBottom: 24 }}>Step 2: Upload Candidate Resumes</Title>
            
            <Form.Item
              label={<strong>Candidate Resumes (Required)</strong>}
              required
              extra={
                <div style={{ marginTop: 8 }}>
                  <FileZipOutlined /> You can upload individual PDF/DOCX files or a ZIP file containing multiple resumes
                </div>
              }
            >
              <Dragger {...resumeUploadProps}>
                <p className="ant-upload-drag-icon">
                  <InboxOutlined style={{ color: '#1d3f77' }} />
                </p>
                <p className="ant-upload-text">
                  Click or drag resume files here
                </p>
                <p className="ant-upload-hint">
                  {resumeFiles.length > 0 
                    ? `${resumeFiles.length} file(s) selected` 
                    : 'Upload multiple PDF/DOCX files or a ZIP file'}
                </p>
              </Dragger>
            </Form.Item>

            {/* Optional Filters */}
            <Title level={4} style={{ marginTop: 40, marginBottom: 24 }}>Step 3: Additional Filters (Optional)</Title>

            <Form.Item
              name="role"
              label={<strong>Role/Position</strong>}
            >
              <Input placeholder="e.g., Senior Backend Engineer" size="large" />
            </Form.Item>

            <Form.Item
              name="min_experience"
              label={<strong>Minimum Experience (years)</strong>}
            >
              <InputNumber 
                min={0} 
                max={20} 
                placeholder="e.g., 3" 
                size="large" 
                style={{ width: '100%' }} 
              />
            </Form.Item>

            <Form.Item
              name="required_skills"
              label={<strong>Required Skills (comma-separated)</strong>}
            >
              <Input placeholder="e.g., Python, AWS, Docker, Kubernetes" size="large" />
            </Form.Item>

            {/* Analyze Button */}
            <Form.Item style={{ marginTop: 40 }}>
              <Button
                type="primary"
                htmlType="submit"
                size="large"
                icon={<ArrowRightOutlined />}
                loading={loading}
                block
                style={{ backgroundColor: '#1d3f77', height: 50 }}
                disabled={!jdFile || resumeFiles.length === 0}
              >
                Analyze & Rank Resumes
              </Button>
            </Form.Item>

            {/* Progress Steps */}
            {loading && (
              <div style={{ marginTop: 32 }}>
                <Steps current={currentStep} items={steps} />
              </div>
            )}
          </Form>
        </Card>
      </Content>
    </Layout>
  );
};

export default BulkResumeAnalysis;
