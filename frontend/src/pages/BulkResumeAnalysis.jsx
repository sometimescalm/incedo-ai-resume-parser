import React, { useState } from 'react';
import { Layout, Card, Typography, Upload, Form, Input, InputNumber, Button, Steps, message } from 'antd';
import { InboxOutlined, ArrowRightOutlined, FileZipOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import JSZip from 'jszip';

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
    multiple: true,  // Allow multiple files
    accept: '.pdf,.docx,.zip',  // Accept individual files or ZIP
    showUploadList: true,
    beforeUpload: (file) => {
      const ext = file.name.toLowerCase();
      if (!ext.endsWith('.pdf') && !ext.endsWith('.docx') && !ext.endsWith('.zip')) {
        message.error('Only PDF, DOCX, and ZIP files are allowed');
        return false;
      }
      setResumeFiles(prev => [...prev, file]);
      return false;
    },
    onRemove: (file) => {
      setResumeFiles(prev => prev.filter(f => f.uid !== file.uid));
    },
    fileList: resumeFiles,
  };

  // Function to convert multiple files to a ZIP
  const createZipFromFiles = async (files) => {
    const zip = new JSZip();
    
    for (const file of files) {
      // If file is already a ZIP, return it directly
      if (file.name.toLowerCase().endsWith('.zip')) {
        return file;
      }
      
      // Add file to ZIP
      const arrayBuffer = await file.arrayBuffer();
      zip.file(file.name, arrayBuffer);
    }
    
    // Generate ZIP blob
    const zipBlob = await zip.generateAsync({ type: 'blob' });
    
    // Create a File object from the blob
    const zipFile = new File([zipBlob], 'resumes.zip', { type: 'application/zip' });
    
    return zipFile;
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
      message.info('Preparing files...');
      await new Promise(resolve => setTimeout(resolve, 500));

      // Convert multiple files to ZIP if needed
      setCurrentStep(1);
      message.info('Creating ZIP archive...');
      const zipFile = await createZipFromFiles(resumeFiles);
      
      console.log('=== ZIP CREATION ===');
      console.log('Original files:', resumeFiles.length);
      console.log('ZIP file created:', zipFile.name, 'Size:', zipFile.size, 'bytes');
      console.log('===================');

      await new Promise(resolve => setTimeout(resolve, 500));

      // Step 2: Uploading
      setCurrentStep(2);
      message.info('Uploading to server...');
      
      // Create FormData for API call
      const formData = new FormData();
      formData.append('jobd', jdFile);
      formData.append('resumes', zipFile);  // Send the ZIP file

      // Append optional filters
      if (values.role) formData.append('role', values.role);
      if (values.min_experience) formData.append('min_experience', values.min_experience);
      if (values.required_skills) formData.append('required_skills', values.required_skills);

      console.log('=== SENDING TO BACKEND ===');
      console.log('JD file:', jdFile.name);
      console.log('Resumes ZIP:', zipFile.name, zipFile.size, 'bytes');
      console.log('Role:', values.role);
      console.log('Min Experience:', values.min_experience);
      console.log('Skills:', values.required_skills);
      console.log('=========================');

      // Step 3: Analyzing resumes
      setCurrentStep(3);
      message.info('Analyzing resumes with AI...');

      const response = await fetch('http://127.0.0.1:8000/rank_resumes', {
        method: 'POST',
        body: formData,
      });

      console.log('=== BACKEND RESPONSE ===');
      console.log('Status:', response.status);
      console.log('OK:', response.ok);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Backend error response:', errorText);
        throw new Error(`Failed to analyze resumes: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      
      console.log('=== RESPONSE DATA ===');
      console.log('Full response:', JSON.stringify(data, null, 2));
      console.log('Candidates count:', data.candidates?.length);
      console.log('First candidate:', JSON.stringify(data.candidates?.[0], null, 2));
      console.log('====================');

      if (!data.candidates || data.candidates.length === 0) {
        throw new Error('No candidates returned from backend');
      }

      // Step 4: Ranking candidates
      setCurrentStep(4);
      message.success('Ranking complete!');
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Navigate to results page with ranking data AND original files
      navigate('/ranking-results', { 
        state: { 
          rankingData: data,
          jdInfo: {
            role: values.role,
            totalResumes: resumeFiles.length,
          },
          originalFiles: resumeFiles, // Pass the original uploaded files
          jdFile: jdFile // Also pass JD file for QnA generation
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
    { title: 'Preparing' },
    { title: 'Creating ZIP' },
    { title: 'Uploading' },
    { title: 'Analyzing' },
    { title: 'Complete' },
  ];

  return (
    <Layout style={{ minHeight: '100vh', background: '#f5f7fa' }}>
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
          <Title level={4} style={{ margin: 0, color: '#1d3f77', fontWeight: 600 }}>
            Bulk Resume Analysis
          </Title>
        </div>
        <Button
          size="large"
          style={{
            marginLeft: 'auto',
            borderRadius: 8,
            fontWeight: 500
          }}
          onClick={() => navigate('/')}
        >
          Home
        </Button>
      </Header>

      <Content style={{ padding: '48px 24px', background: '#f5f7fa' }}>
        <Card
          style={{
            maxWidth: 1000,
            margin: '0 auto',
            borderRadius: 16,
            boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
            border: '1px solid #e8ecf0'
          }}
          bodyStyle={{ padding: '48px' }}
        >
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <Title level={2} style={{ margin: 0, color: '#1d3f77' }}>
              Bulk Resume Analysis & Ranking
            </Title>
            <Text type="secondary" style={{ fontSize: 16 }}>
              Upload job description and multiple resumes to get AI-powered ranking
            </Text>
          </div>

          <Form
            form={form}
            layout="vertical"
            onFinish={handleAnalyze}
          >
            {/* JD Upload */}
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
                    Upload Job Description
                  </Title>
                  <Text type="secondary">Required for matching candidates</Text>
                </div>
              </div>
              
              <Form.Item required>
                <Dragger {...jdUploadProps} style={{ 
                  borderRadius: 12,
                  background: jdFile ? '#f6ffed' : '#fafafa',
                  border: jdFile ? '2px solid #52c41a' : '2px dashed #d9d9d9'
                }}>
                  <p className="ant-upload-drag-icon">
                    <InboxOutlined style={{ color: '#1d3f77', fontSize: 48 }} />
                  </p>
                  <p className="ant-upload-text" style={{ fontWeight: 600 }}>
                    {jdFile ? `✓ ${jdFile.name}` : 'Click or drag Job Description here'}
                  </p>
                  <p className="ant-upload-hint">PDF or DOCX • Max 10MB</p>
                </Dragger>
              </Form.Item>
            </div>

            {/* Resume Upload */}
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
                  2
                </div>
                <div>
                  <Title level={4} style={{ margin: 0, color: '#1d3f77' }}>
                    Upload Candidate Resumes
                  </Title>
                  <Text type="secondary">Multiple files or ZIP archive</Text>
                </div>
              </div>
              
              <Form.Item
                required
                extra={
                  <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <FileZipOutlined style={{ color: '#1890ff' }} />
                    <Text type="secondary">
                      Upload multiple PDF/DOCX files or a ZIP archive. Files will be automatically packaged for processing.
                    </Text>
                  </div>
                }
              >
                <Dragger {...resumeUploadProps} style={{ borderRadius: 12 }}>
                  <p className="ant-upload-drag-icon">
                    <InboxOutlined style={{ color: '#1d3f77', fontSize: 48 }} />
                  </p>
                  <p className="ant-upload-text" style={{ fontWeight: 600 }}>
                    Click or drag resume files here
                  </p>
                  <p className="ant-upload-hint">
                    {resumeFiles.length > 0 
                      ? `${resumeFiles.length} file(s) selected` 
                      : 'Upload PDF/DOCX files or a ZIP archive'}
                  </p>
                </Dragger>
              </Form.Item>
            </div>

            {/* Optional Filters */}
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
                  3
                </div>
                <div>
                  <Title level={4} style={{ margin: 0, color: '#1d3f77' }}>
                    Additional Filters
                  </Title>
                  <Text type="secondary">Optional criteria for better matching</Text>
                </div>
              </div>

              <Form.Item name="role" label={<Text strong>Role/Position</Text>}>
                <Input placeholder="e.g., Senior Backend Engineer" size="large" style={{ borderRadius: 8 }} />
              </Form.Item>

              <Form.Item name="min_experience" label={<Text strong>Minimum Experience (years)</Text>}>
                <InputNumber 
                  min={0} 
                  max={20} 
                  placeholder="e.g., 3" 
                  size="large" 
                  style={{ width: '100%', borderRadius: 8 }} 
                />
              </Form.Item>

              <Form.Item name="required_skills" label={<Text strong>Required Skills (comma-separated)</Text>}>
                <Input 
                  placeholder="e.g., Python, AWS, Docker, Kubernetes" 
                  size="large" 
                  style={{ borderRadius: 8 }}
                />
              </Form.Item>
            </div>

            {/* Analyze Button */}
            <Form.Item style={{ marginTop: 48, marginBottom: 0 }}>
              <Button
                type="primary"
                htmlType="submit"
                size="large"
                icon={<ArrowRightOutlined />}
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
                disabled={!jdFile || resumeFiles.length === 0}
              >
                {loading ? 'Analyzing Resumes...' : 'Analyze & Rank Resumes'}
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
      </Content>
    </Layout>
  );
};

export default BulkResumeAnalysis;