import React, { useState, useEffect } from 'react';
import { Layout, Card, Typography, Button, Tag, Collapse, Radio, Space, Empty } from 'antd';
import { DownloadOutlined, MailOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useLocation, useNavigate } from 'react-router-dom';
import downloadPDF from '../utils/downloadPDF';

const { Header, Content } = Layout;
const { Title, Text, Paragraph } = Typography;
const { Panel } = Collapse;

const InterviewQuestions = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [filteredQuestions, setFilteredQuestions] = useState([]);
  const [typeFilter, setTypeFilter] = useState('all');
  const [difficultyFilter, setDifficultyFilter] = useState('all');

  // Get data from navigation state
  const questionsData = location.state?.questionsData || {};
  const candidateInfo = location.state?.candidateInfo || {};
  const allQuestions = questionsData.questions || [];

  useEffect(() => {
    // Apply filters
    let filtered = allQuestions;

    if (typeFilter !== 'all') {
      filtered = filtered.filter(q => q.type?.toLowerCase() === typeFilter);
    }

    if (difficultyFilter !== 'all') {
      filtered = filtered.filter(q => q.difficulty?.toLowerCase() === difficultyFilter);
    }

    setFilteredQuestions(filtered);
  }, [typeFilter, difficultyFilter, allQuestions]);

  const getDifficultyColor = (difficulty) => {
    const level = difficulty?.toLowerCase();
    if (level === 'easy') return 'green';
    if (level === 'medium') return 'orange';
    if (level === 'hard') return 'red';
    return 'default';
  };

  const getTypeColor = (type) => {
    const questionType = type?.toLowerCase();
    if (questionType === 'technical') return 'blue';
    if (questionType === 'behavioral') return 'purple';
    if (questionType === 'coding') return 'cyan';
    return 'default';
  };

  const handleDownloadPDF = () => {
    downloadPDF('questions-content', `Interview_Questions_${candidateInfo.role || 'Candidate'}.pdf`);
  };

  const handleSendEmail = () => {
    const subject = encodeURIComponent(`Interview Questions - ${candidateInfo.role || 'Position'}`);
    const body = encodeURIComponent(
      `Interview Questions Generated for:\n\nRole: ${candidateInfo.role}\nDomain: ${candidateInfo.domain}\nExperience Level: ${candidateInfo.experience}\nKey Skills: ${candidateInfo.skills}\n\nTotal Questions: ${allQuestions.length}\n\nPlease find the attached PDF with detailed questions and expected answers.`
    );
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  if (!allQuestions.length) {
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
        <Content style={{ padding: '40px 24px', background: '#f0f2f5', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <Card style={{ textAlign: 'center' }}>
            <Empty description="No questions data found. Please generate questions first." />
            <Button type="primary" onClick={() => navigate('/interview-qna')} style={{ marginTop: 16 }}>
              Generate Questions
            </Button>
          </Card>
        </Content>
      </Layout>
    );
  }

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ backgroundColor: '#1d3f77', display: 'flex', alignItems: 'center', padding: '0 24px' }}>
        <img src="/logo-incedo.png" alt="Incedo Logo" style={{ height: 32, marginRight: 16 }} />
        <Button
          type="link"
          icon={<ArrowLeftOutlined />}
          style={{ color: 'white', fontWeight: 'bold', marginLeft: 'auto' }}
          onClick={() => navigate('/interview-qna')}
        >
          Back
        </Button>
        <Button
          type="link"
          style={{ color: 'white', fontWeight: 'bold' }}
          onClick={() => navigate('/')}
        >
          Home
        </Button>
      </Header>

      <Content style={{ padding: '40px 24px', background: '#f0f2f5' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          {/* Header Card */}
          <Card style={{ marginBottom: 24, borderRadius: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
              <div>
                <Title level={3} style={{ margin: 0 }}>Interview Questions Generated</Title>
                <Text type="secondary">
                  Role: <strong>{candidateInfo.role}</strong> | Domain: <strong>{candidateInfo.domain}</strong> | 
                  Experience: <strong>{candidateInfo.experience}</strong>
                </Text>
              </div>
              <Space>
                <Button 
                  type="primary" 
                  icon={<DownloadOutlined />} 
                  onClick={handleDownloadPDF}
                  style={{ backgroundColor: '#1d3f77' }}
                >
                  Download PDF
                </Button>
                <Button 
                  icon={<MailOutlined />} 
                  onClick={handleSendEmail}
                >
                  Send Email
                </Button>
              </Space>
            </div>
          </Card>

          {/* Filters */}
          <Card style={{ marginBottom: 24, borderRadius: 12 }}>
            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
              <div>
                <Text strong style={{ marginRight: 16 }}>Filter by Type:</Text>
                <Radio.Group value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
                  <Radio.Button value="all">All ({allQuestions.length})</Radio.Button>
                  <Radio.Button value="technical">Technical</Radio.Button>
                  <Radio.Button value="behavioral">Behavioral</Radio.Button>
                  <Radio.Button value="coding">Coding</Radio.Button>
                </Radio.Group>
              </div>
              <div>
                <Text strong style={{ marginRight: 16 }}>Filter by Difficulty:</Text>
                <Radio.Group value={difficultyFilter} onChange={(e) => setDifficultyFilter(e.target.value)}>
                  <Radio.Button value="all">All</Radio.Button>
                  <Radio.Button value="easy">Easy</Radio.Button>
                  <Radio.Button value="medium">Medium</Radio.Button>
                  <Radio.Button value="hard">Hard</Radio.Button>
                </Radio.Group>
              </div>
            </Space>
          </Card>

          {/* Questions List - For PDF Export */}
          <div id="questions-content">
            <Card style={{ borderRadius: 12 }}>
              <Title level={4}>Questions ({filteredQuestions.length})</Title>
              
              {filteredQuestions.length === 0 ? (
                <Empty description="No questions match the selected filters" />
              ) : (
                <Collapse accordion>
                  {filteredQuestions.map((question, index) => (
                    <Panel
                      header={
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <Text strong>Q{index + 1}.</Text>
                          <Text>{question.question}</Text>
                          <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
                            <Tag color={getDifficultyColor(question.difficulty)}>
                              {question.difficulty || 'Medium'}
                            </Tag>
                            <Tag color={getTypeColor(question.type)}>
                              {question.type || 'Technical'}
                            </Tag>
                          </div>
                        </div>
                      }
                      key={index}
                    >
                      <div style={{ padding: 16, backgroundColor: '#fafafa', borderRadius: 8 }}>
                        <Title level={5} style={{ color: '#1d3f77' }}>Expected Answer:</Title>
                        <Paragraph style={{ whiteSpace: 'pre-wrap' }}>
                          {question.expected_answer || 'No answer provided'}
                        </Paragraph>

                        {question.sample_code && (
                          <>
                            <Title level={5} style={{ color: '#1d3f77', marginTop: 16 }}>Sample Code:</Title>
                            <pre style={{ 
                              backgroundColor: '#f5f5f5', 
                              padding: 16, 
                              borderRadius: 8, 
                              overflow: 'auto',
                              border: '1px solid #d9d9d9'
                            }}>
                              <code>{question.sample_code}</code>
                            </pre>
                          </>
                        )}

                        {question.hints && question.hints.length > 0 && (
                          <>
                            <Title level={5} style={{ color: '#1d3f77', marginTop: 16 }}>Hints:</Title>
                            <ul>
                              {question.hints.map((hint, idx) => (
                                <li key={idx}>{hint}</li>
                              ))}
                            </ul>
                          </>
                        )}
                      </div>
                    </Panel>
                  ))}
                </Collapse>
              )}
            </Card>
          </div>
        </div>
      </Content>
    </Layout>
  );
};

export default InterviewQuestions;
