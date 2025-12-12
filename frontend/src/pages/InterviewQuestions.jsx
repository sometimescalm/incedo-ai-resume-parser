import React, { useState, useEffect } from 'react';
import { Layout, Card, Typography, Button, Tag, Collapse, Radio, Space, Empty, Divider, Badge, Statistic, Row, Col } from 'antd';
import {
  ArrowLeftOutlined,
  HomeOutlined,
  FilterOutlined,
  BulbOutlined,
  CodeOutlined,
  TeamOutlined,
  ThunderboltOutlined,
  CheckCircleOutlined
} from '@ant-design/icons';
import { useLocation, useNavigate } from 'react-router-dom';

const { Header, Content } = Layout;
const { Title, Text, Paragraph } = Typography;
const { Panel } = Collapse;

const InterviewQuestions = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [filteredQuestions, setFilteredQuestions] = useState([]);
  const [typeFilter, setTypeFilter] = useState('all');
  const [difficultyFilter, setDifficultyFilter] = useState('all');

  const questionsData = location.state?.questionsData || {};
  const candidateInfo = location.state?.candidateInfo || {};
  const allQuestions = questionsData.questions || [];

  useEffect(() => {
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
    if (level === 'easy') return '#52c41a';
    if (level === 'medium') return '#faad14';
    if (level === 'hard') return '#f5222d';
    return '#8c8c8c';
  };

  const getTypeIcon = (type) => {
    const questionType = type?.toLowerCase();
    if (questionType === 'technical') return <ThunderboltOutlined />;
    if (questionType === 'behavioral') return <TeamOutlined />;
    if (questionType === 'coding') return <CodeOutlined />;
    return <BulbOutlined />;
  };

  const getTypeColor = (type) => {
    const questionType = type?.toLowerCase();
    if (questionType === 'technical') return '#1890ff';
    if (questionType === 'behavioral') return '#722ed1';
    if (questionType === 'coding') return '#13c2c2';
    return '#8c8c8c';
  };

  // Calculate statistics
  const technicalCount = allQuestions.filter(q => q.type?.toLowerCase() === 'technical').length;
  const behavioralCount = allQuestions.filter(q => q.type?.toLowerCase() === 'behavioral').length;
  const codingCount = allQuestions.filter(q => q.type?.toLowerCase() === 'coding').length;

  if (!allQuestions.length) {
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
            <Divider type="vertical" style={{ height: 32 }} />
            <Title level={4} style={{ margin: 0, color: '#1d3f77' }}>Interview Questions</Title>
          </div>
          <Button icon={<HomeOutlined />} size="large" style={{ marginLeft: 'auto' }} onClick={() => navigate('/')}>
            Home
          </Button>
        </Header>
        <Content style={{ padding: '48px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <Card style={{ textAlign: 'center', maxWidth: 500 }}>
            <Empty description="No questions found. Please generate questions first." />
            <Button type="primary" onClick={() => navigate('/interview-qna')} style={{ marginTop: 16 }}>
              Generate Questions
            </Button>
          </Card>
        </Content>
      </Layout>
    );
  }

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
          <Divider type="vertical" style={{ height: 32 }} />
          <Title level={4} style={{ margin: 0, color: '#1d3f77', fontWeight: 600 }}>
            Interview Questions
          </Title>
        </div>
        <Space style={{ marginLeft: 'auto' }}>
          <Button
            icon={<ArrowLeftOutlined />}
            size="large"
            style={{ borderRadius: 8 }}
            onClick={() => navigate('/interview-qna')}
          >
            Back
          </Button>
          <Button
            icon={<HomeOutlined />}
            size="large"
            style={{ borderRadius: 8 }}
            onClick={() => navigate('/')}
          >
            Home
          </Button>
        </Space>
      </Header>

      <Content style={{ padding: '48px 48px 80px' }}>
        <div style={{ maxWidth: 1400, margin: '0 auto' }}>
          {/* Header Info Card */}
          <Card
            style={{
              marginBottom: 24,
              borderRadius: 16,
              border: '1px solid #e8ecf0',
              boxShadow: '0 4px 24px rgba(0,0,0,0.06)'
            }}
            bodyStyle={{ padding: '32px' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 24 }}>
              <div style={{ flex: 1 }}>
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '6px 16px',
                  background: '#e6f7ff',
                  borderRadius: 16,
                  marginBottom: 16
                }}>
                  <CheckCircleOutlined style={{ color: '#1890ff' }} />
                  <Text style={{ color: '#1890ff', fontWeight: 500, fontSize: 13 }}>
                    Generated Successfully
                  </Text>
                </div>

                <Title level={3} style={{ margin: '0 0 12px 0', color: '#1d3f77' }}>
                  {allQuestions.length} Interview Questions
                </Title>

                <Space split={<Divider type="vertical" />} wrap>
                  {candidateInfo.role && (
                    <Text type="secondary">
                      <strong>Role:</strong> {candidateInfo.role}
                    </Text>
                  )}
                  {candidateInfo.domain && (
                    <Text type="secondary">
                      <strong>Domain:</strong> {candidateInfo.domain}
                    </Text>
                  )}
                  {candidateInfo.experience && (
                    <Text type="secondary">
                      <strong>Experience:</strong> {candidateInfo.experience}
                    </Text>
                  )}
                </Space>
              </div>


            </div>
          </Card>

          {/* Statistics Cards */}
          <Row gutter={16} style={{ marginBottom: 24 }}>
            <Col xs={24} sm={8}>
              <Card style={{ borderRadius: 12, border: '1px solid #e8ecf0' }}>
                <Statistic
                  title={<Text style={{ fontSize: 14, color: '#8c8c8c' }}>Technical Questions</Text>}
                  value={technicalCount}
                  prefix={<ThunderboltOutlined style={{ color: '#1890ff' }} />}
                  valueStyle={{ color: '#1890ff', fontSize: 32, fontWeight: 600 }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={8}>
              <Card style={{ borderRadius: 12, border: '1px solid #e8ecf0' }}>
                <Statistic
                  title={<Text style={{ fontSize: 14, color: '#8c8c8c' }}>Behavioral Questions</Text>}
                  value={behavioralCount}
                  prefix={<TeamOutlined style={{ color: '#722ed1' }} />}
                  valueStyle={{ color: '#722ed1', fontSize: 32, fontWeight: 600 }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={8}>
              <Card style={{ borderRadius: 12, border: '1px solid #e8ecf0' }}>
                <Statistic
                  title={<Text style={{ fontSize: 14, color: '#8c8c8c' }}>Coding Questions</Text>}
                  value={codingCount}
                  prefix={<CodeOutlined style={{ color: '#13c2c2' }} />}
                  valueStyle={{ color: '#13c2c2', fontSize: 32, fontWeight: 600 }}
                />
              </Card>
            </Col>
          </Row>

          {/* Filters Card */}
          <Card
            style={{
              marginBottom: 24,
              borderRadius: 16,
              border: '1px solid #e8ecf0'
            }}
            bodyStyle={{ padding: '24px 32px' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
              <FilterOutlined style={{ fontSize: 18, color: '#1d3f77' }} />
              <Title level={5} style={{ margin: 0 }}>Filter Questions</Title>
            </div>

            <Space direction="vertical" size="large" style={{ width: '100%' }}>
              <div>
                <Text strong style={{ marginRight: 16, display: 'inline-block', minWidth: 100 }}>Type:</Text>
                <Radio.Group value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} size="large">
                  <Radio.Button value="all">All ({allQuestions.length})</Radio.Button>
                  <Radio.Button value="technical">
                    <ThunderboltOutlined /> Technical
                  </Radio.Button>
                  <Radio.Button value="behavioral">
                    <TeamOutlined /> Behavioral
                  </Radio.Button>
                  <Radio.Button value="coding">
                    <CodeOutlined /> Coding
                  </Radio.Button>
                </Radio.Group>
              </div>

              <div>
                <Text strong style={{ marginRight: 16, display: 'inline-block', minWidth: 100 }}>Difficulty:</Text>
                <Radio.Group value={difficultyFilter} onChange={(e) => setDifficultyFilter(e.target.value)} size="large">
                  <Radio.Button value="all">All</Radio.Button>
                  <Radio.Button value="easy">
                    <Badge color="#52c41a" text="Easy" />
                  </Radio.Button>
                  <Radio.Button value="medium">
                    <Badge color="#faad14" text="Medium" />
                  </Radio.Button>
                  <Radio.Button value="hard">
                    <Badge color="#f5222d" text="Hard" />
                  </Radio.Button>
                </Radio.Group>
              </div>
            </Space>
          </Card>

          {/* Questions List */}
          <div id="questions-content">
            <Card
              style={{
                borderRadius: 16,
                border: '1px solid #e8ecf0'
              }}
              bodyStyle={{ padding: '32px' }}
            >
              <div style={{ marginBottom: 24 }}>
                <Title level={4} style={{ margin: 0 }}>
                  {filteredQuestions.length} {filteredQuestions.length === 1 ? 'Question' : 'Questions'}
                </Title>
              </div>

              {filteredQuestions.length === 0 ? (
                <Empty
                  description="No questions match the selected filters"
                  style={{ padding: '60px 0' }}
                />
              ) : (
                <Collapse
                  accordion
                  bordered={false}
                  style={{ background: 'transparent' }}
                >
                  {filteredQuestions.map((question, index) => (
                    <Panel
                      header={
                        <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '8px 0' }}>
                          <Badge
                            count={index + 1}
                            style={{
                              backgroundColor: '#1d3f77',
                              fontSize: 14,
                              fontWeight: 600,
                              minWidth: 32,
                              height: 32,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                          />
                          <Text strong style={{ flex: 1, fontSize: 15 }}>{question.question}</Text>
                          <Space>
                            <Tag
                              color={getDifficultyColor(question.difficulty)}
                              style={{
                                borderRadius: 16,
                                padding: '4px 12px',
                                border: 'none',
                                fontWeight: 500
                              }}
                            >
                              {question.difficulty || 'Medium'}
                            </Tag>
                            <Tag
                              icon={getTypeIcon(question.type)}
                              color={getTypeColor(question.type)}
                              style={{
                                borderRadius: 16,
                                padding: '4px 12px',
                                border: 'none',
                                fontWeight: 500
                              }}
                            >
                              {question.type || 'Technical'}
                            </Tag>
                          </Space>
                        </div>
                      }
                      key={index}
                      style={{
                        marginBottom: 16,
                        background: '#ffffff',
                        border: '1px solid #e8ecf0',
                        borderRadius: 12,
                        overflow: 'hidden'
                      }}
                    >

                      <div style={{ padding: '24px', background: '#fafbfc' }}>
                        {question.type?.toLowerCase() !== "coding" && (
                          <div style={{ marginBottom: 24 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                              <div
                                style={{
                                  width: 4,
                                  height: 20,
                                  background: '#1d3f77',
                                  borderRadius: 2
                                }}
                              />
                              <Title level={5} style={{ margin: 0, color: '#1d3f77' }}>
                                Expected Answer
                              </Title>
                            </div>

                            <Paragraph
                              style={{
                                whiteSpace: 'pre-wrap',
                                color: '#262626',
                                lineHeight: 1.8,
                                margin: 0,
                                paddingLeft: 12
                              }}
                            >
                              {question.expected_answer || 'No answer provided'}
                            </Paragraph>
                          </div>
                        )}

                        {question.sample_code && (
                          <div style={{ marginBottom: 24 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                              <div style={{
                                width: 4,
                                height: 20,
                                background: '#13c2c2',
                                borderRadius: 2
                              }} />
                              <Title level={5} style={{ margin: 0, color: '#13c2c2' }}>
                                Sample Code
                              </Title>
                            </div>
                            <pre style={{
                              backgroundColor: '#1e1e1e',
                              color: '#d4d4d4',
                              padding: 20,
                              borderRadius: 8,
                              overflow: 'auto',
                              border: 'none',
                              marginLeft: 12,
                              fontSize: 13,
                              lineHeight: 1.6
                            }}>
                              <code>{question.sample_code}</code>
                            </pre>
                          </div>
                        )}

                        {question.hints && question.hints.length > 0 && (
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                              <div style={{
                                width: 4,
                                height: 20,
                                background: '#faad14',
                                borderRadius: 2
                              }} />
                              <Title level={5} style={{ margin: 0, color: '#faad14' }}>
                                Hints
                              </Title>
                            </div>
                            <ul style={{ paddingLeft: 28, margin: 0 }}>
                              {question.hints.map((hint, idx) => (
                                <li key={idx} style={{ marginBottom: 8, color: '#595959' }}>
                                  {hint}
                                </li>
                              ))}
                            </ul>
                          </div>
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