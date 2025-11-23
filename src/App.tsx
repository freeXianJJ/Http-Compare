import React from 'react';
import { Layout, Button, Card, Row, Col, Input, Select, Form, message, Collapse, Switch } from 'antd';
import { useApiStore } from './stores/apiStore';
import { useServiceStore } from './stores/serviceStore';
import { useResultStore } from './stores/resultStore';
import { RequestService } from './services/requestService';
import { DiffService } from './services/diffService';
import { HttpMethod } from './types/api';
import { Protocol } from './types/service';
import { nanoid } from 'nanoid';
import CompareRunner from './components/CompareRunner/CompareRunner';

const { Header, Content } = Layout;
const { Panel } = Collapse;

// 对象键排序函数
const sortObjectKeys = (obj: any): any => {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) {
    return obj.map(item => sortObjectKeys(item));
  }
  
  const sorted: any = {};
  Object.keys(obj).sort().forEach(key => {
    sorted[key] = sortObjectKeys(obj[key]);
  });
  return sorted;
};

// 格式化JSON函数
const formatJson = (data: any): string => {
  try {
    const sorted = sortObjectKeys(data);
    return JSON.stringify(sorted, null, 2);
  } catch (e) {
    return String(data);
  }
};

const App: React.FC = () => {
  const { currentApi, createNewApi, updateCurrentApi } = useApiStore();
  const { config, updateOldService, updateNewService, useProxy, proxyPrefix, setUseProxy, setProxyPrefix } = useServiceStore();
  const { currentResult, isLoading, setCurrentResult, setLoading } = useResultStore();

  const diffService = new DiffService();

  React.useEffect(() => {
    if (!currentApi) {
      createNewApi();
    }
  }, [currentApi, createNewApi]);

  const handleSendRequest = async () => {
    if (!currentApi) {
      message.error('请先配置接口');
      return;
    }

    setLoading(true);
    try {
      console.log('开始发送请求...');
      console.log('旧服务配置:', config.oldService);
      console.log('新服务配置:', config.newService);
      console.log('接口配置:', currentApi);

      const requestService = new RequestService();
      requestService.setUseProxy(useProxy);
      requestService.setProxyPrefix(proxyPrefix);

      const results = await requestService.sendDualRequests(
        config.oldService,
        config.newService,
        currentApi
      );

      console.log('请求结果:', results);
      console.log('旧服务响应:', results.oldService.response);
      console.log('新服务响应:', results.newService.response);

      const diffResult = diffService.compare(
        results.oldService.response,
        results.newService.response
      );

      const testResult = {
        id: nanoid(),
        apiConfig: currentApi,
        oldService: results.oldService,
        newService: results.newService,
        diffResult,
        timestamp: Date.now()
      };

      setCurrentResult(testResult);
      
      if (diffResult.identical) {
        message.success('✅ 响应完全一致！');
      } else {
        message.warning(`⚠️ 发现 ${diffResult.summary.totalDiffs} 处差异`);
      }
    } catch (error: any) {
      console.error('请求失败:', error);
      message.error('请求失败: ' + error.message);
      
      // 即使失败也显示错误信息
      if (error.response) {
        message.error(`HTTP ${error.response.status}: ${error.response.statusText}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ 
        background: '#fff', 
        padding: '0 24px',
        borderBottom: '1px solid #f0f0f0',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <h1 style={{ margin: 0, fontSize: '20px' }}>HTTP 接口对比测试工具</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <Switch checked={useProxy} onChange={checked => setUseProxy(checked)} />
            <span style={{ marginLeft: 8, color: '#666' }}>使用代理</span>
          </div>
          <Button 
            type="primary" 
            size="large"
            loading={isLoading}
            onClick={handleSendRequest}
          >
            发送请求并对比
          </Button>
        </div>
      </Header>
      
      <Content style={{ padding: '24px' }}>
        <Row gutter={[16, 16]}>
          {/* 服务配置 */}
          <Col span={24}>
            <Card title="服务配置" size="small">
              <Row gutter={16}>
                <Col span={12}>
                  <Card type="inner" title="旧服务" size="small">
                    <Form.Item label="Host">
                      <Input 
                        value={config.oldService.host}
                        onChange={e => updateOldService({ host: e.target.value })}
                      />
                    </Form.Item>
                    <Form.Item label="Port">
                      <Input 
                        type="number"
                        value={config.oldService.port}
                        onChange={e => updateOldService({ port: Number(e.target.value) })}
                      />
                    </Form.Item>
                    <Form.Item label="Client Token">
                      <Input 
                        value={(config.oldService as any).clientToken}
                        onChange={e => updateOldService({ clientToken: e.target.value })}
                        placeholder="可选 - Bearer"
                      />
                    </Form.Item>
                    <Form.Item label="User Token">
                      <Input 
                        value={(config.oldService as any).userToken}
                        onChange={e => updateOldService({ userToken: e.target.value })}
                        placeholder="可选 - Bearer"
                      />
                    </Form.Item>
                  </Card>
                </Col>
                <Col span={12}>
                  <Card type="inner" title="新服务" size="small">
                    <Form.Item label="Host">
                      <Input 
                        value={config.newService.host}
                        onChange={e => updateNewService({ host: e.target.value })}
                      />
                    </Form.Item>
                    <Form.Item label="Port">
                      <Input 
                        type="number"
                        value={config.newService.port}
                        onChange={e => updateNewService({ port: Number(e.target.value) })}
                      />
                    </Form.Item>
                    <Form.Item label="Client Token">
                      <Input 
                        value={(config.newService as any).clientToken}
                        onChange={e => updateNewService({ clientToken: e.target.value })}
                        placeholder="可选 - Bearer"
                      />
                    </Form.Item>
                    <Form.Item label="User Token">
                      <Input 
                        value={(config.newService as any).userToken}
                        onChange={e => updateNewService({ userToken: e.target.value })}
                        placeholder="可选 - Bearer"
                      />
                    </Form.Item>
                  </Card>
                </Col>
              </Row>
            </Card>
          </Col>

          {/* 接口配置 */}
          <Col span={24}>
            <Card title="接口配置" size="small">
              <Form.Item label="接口名称">
                <Input 
                  value={currentApi?.name}
                  onChange={e => updateCurrentApi({ name: e.target.value })}
                />
              </Form.Item>
              <Form.Item label="请求方法">
                <Select
                  value={currentApi?.method}
                  onChange={method => updateCurrentApi({ method })}
                  style={{ width: 120 }}
                >
                  {Object.values(HttpMethod).map(m => (
                    <Select.Option key={m} value={m}>{m}</Select.Option>
                  ))}
                </Select>
              </Form.Item>
              <Form.Item label="接口路径">
                <Input 
                  value={currentApi?.url}
                  onChange={e => updateCurrentApi({ url: e.target.value })}
                  placeholder="/api/user/123"
                />
              </Form.Item>
              
            </Card>
          </Col>

          {/* 批量对比控制面板 */}
          <Col span={24}>
            <Card title="批量对比 (CompareRunner)" size="small">
              <CompareRunner />
            </Card>
          </Col>

          {/* 响应对比 */}
          {currentResult && (
            <Col span={24}>
              <Card 
                title={
                  <span>
                    响应对比结果 
                    {currentResult.diffResult.identical ? 
                      <span style={{ color: '#52c41a', marginLeft: 8 }}>✓ 完全一致</span> :
                      <span style={{ color: '#ff4d4f', marginLeft: 8 }}>✗ 存在差异</span>
                    }
                  </span>
                }
                size="small"
              >
                <Collapse 
                  defaultActiveKey={[]} 
                  ghost
                  style={{ marginBottom: 16 }}
                >
                  <Panel 
                    header={
                      <span style={{ fontSize: '14px', fontWeight: 500 }}>
                        📋 响应详情（点击展开查看）
                      </span>
                    } 
                    key="response"
                  >
                    <Row gutter={16}>
                      <Col span={12}>
                        <Card 
                          type="inner" 
                          title={`旧服务 (HTTP ${currentResult.oldService.response.status})`}
                          size="small"
                          style={{ marginBottom: 0 }}
                        >
                          <div style={{ fontSize: '12px', color: '#666', marginBottom: 8 }}>
                            耗时: {currentResult.oldService.request.duration}ms
                            {currentResult.oldService.response.error && (
                              <span style={{ color: '#ff4d4f', marginLeft: 8 }}>
                                ⚠️ {currentResult.oldService.response.error}
                              </span>
                            )}
                          </div>
                          <pre style={{ 
                            background: '#f5f5f5', 
                            padding: 12, 
                            borderRadius: 4,
                            maxHeight: 500,
                            overflow: 'auto',
                            fontSize: '13px',
                            lineHeight: '1.5'
                          }}>
                            {currentResult.oldService.response.body !== null && currentResult.oldService.response.body !== undefined
                              ? formatJson(currentResult.oldService.response.body)
                              : currentResult.oldService.response.error 
                              ? `错误: ${currentResult.oldService.response.error}`
                              : 'null'}
                          </pre>
                        </Card>
                      </Col>
                      <Col span={12}>
                        <Card 
                          type="inner" 
                          title={`新服务 (HTTP ${currentResult.newService.response.status})`}
                          size="small"
                          style={{ marginBottom: 0 }}
                        >
                          <div style={{ fontSize: '12px', color: '#666', marginBottom: 8 }}>
                            耗时: {currentResult.newService.request.duration}ms
                            {currentResult.newService.response.error && (
                              <span style={{ color: '#ff4d4f', marginLeft: 8 }}>
                                ⚠️ {currentResult.newService.response.error}
                              </span>
                            )}
                          </div>
                          <pre style={{ 
                            background: '#f5f5f5', 
                            padding: 12, 
                            borderRadius: 4,
                            maxHeight: 500,
                            overflow: 'auto',
                            fontSize: '13px',
                            lineHeight: '1.5'
                          }}>
                            {currentResult.newService.response.body !== null && currentResult.newService.response.body !== undefined
                              ? formatJson(currentResult.newService.response.body)
                              : currentResult.newService.response.error 
                              ? `错误: ${currentResult.newService.response.error}`
                              : 'null'}
                          </pre>
                        </Card>
                      </Col>
                    </Row>
                  </Panel>
                </Collapse>
                
                {currentResult.diffResult.differences.length > 0 && (
                  <Card 
                    type="inner" 
                    title="🔍 差异详情" 
                    size="small"
                  >
                    {currentResult.diffResult.differences.map((diff, idx) => {
                      const isAdded = diff.type === 'added';
                      const isDeleted = diff.type === 'deleted';
                      const isModified = diff.type === 'modified';
                      const isTypeMismatch = diff.type === 'type-mismatch';

                      const rowStyle: React.CSSProperties = {
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12,
                        padding: '8px 12px',
                        borderRadius: 4,
                        marginBottom: 6,
                        background: '#fff'
                      };

                      let symbol = '~';
                      let color = '#fa8c16'; // orange for modified
                      if (isAdded) { symbol = '+'; color = '#389e0d'; }
                      if (isDeleted) { symbol = '-'; color = '#cf1322'; }
                      if (isTypeMismatch) { symbol = '≠'; color = '#722ed1'; }

                      return (
                        <div key={idx} style={rowStyle}>
                          <div style={{ fontWeight: 700, color, width: 20 }}>{symbol}</div>
                          <div style={{ flex: 1, fontSize: 13, color: '#222' }}>{diff.path}</div>
                          <div style={{ fontSize: 13, color: '#999', minWidth: 120, textAlign: 'right' }}>
                            {isAdded && (
                              <span style={{ color: '#389e0d' }}>+ {JSON.stringify(diff.newValue)}</span>
                            )}
                            {isDeleted && (
                              <span style={{ color: '#cf1322' }}>- {JSON.stringify(diff.oldValue)}</span>
                            )}
                            {isModified && (
                              <span>
                                <span style={{ color: '#cf1322' }}>- {JSON.stringify(diff.oldValue)}</span>
                                <span style={{ margin: '0 6px', color: '#999' }}>→</span>
                                <span style={{ color: '#389e0d' }}>+ {JSON.stringify(diff.newValue)}</span>
                              </span>
                            )}
                            {isTypeMismatch && (
                              <span style={{ color: '#722ed1' }}>{JSON.stringify(diff.oldValue)} ≠ {JSON.stringify(diff.newValue)}</span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </Card>
                )}
              </Card>
            </Col>
          )}
        </Row>
      </Content>
    </Layout>
  );
};

export default App;