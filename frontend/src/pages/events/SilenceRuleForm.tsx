import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Steps, Select, Switch, Button } from 'antd';
import type { Silence } from '../../hooks/useSilences';

const { Step } = Steps;
const { TextArea } = Input;

interface SilenceRuleFormProps {
  visible: boolean;
  onCancel: () => void;
  onOk: (values: Partial<Silence>) => void;
  initialValues?: Partial<Silence>;
}

const steps = [
  { title: '基本資訊', content: 'First-content' },
  { title: '設定排程', content: 'Second-content' },
  { title: '設定範圍', content: 'Last-content' },
];

const SilenceRuleForm: React.FC<SilenceRuleFormProps> = ({ visible, onCancel, onOk, initialValues }) => {
  const [form] = Form.useForm();
  const [currentStep, setCurrentStep] = useState(0);
  const isEditMode = !!initialValues?.id;

  useEffect(() => {
    if (visible && initialValues) {
      form.setFieldsValue(initialValues);
    } else {
      form.resetFields();
    }
  }, [visible, initialValues, form]);


  const handleNext = () => {
    form.validateFields().then(() => {
      setCurrentStep(currentStep + 1);
    });
  };

  const handlePrev = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleFinish = () => {
    form.validateFields().then(values => {
      onOk({ ...initialValues, ...values });
      setCurrentStep(0); // Reset step for next time
    }).catch(info => {
      console.log('表單驗證失敗:', info);
    });
  };

  const handleCancel = () => {
    setCurrentStep(0);
    onCancel();
  }

  return (
    <Modal
      title={isEditMode ? '編輯靜音規則' : '新增靜音規則'}
      visible={visible}
      onCancel={handleCancel}
      width={800}
      footer={
        <div>
          {currentStep > 0 && (
            <Button style={{ margin: '0 8px' }} onClick={handlePrev}>
              上一步
            </Button>
          )}
          {currentStep < steps.length - 1 && (
            <Button type="primary" onClick={handleNext}>
              下一步
            </Button>
          )}
          {currentStep === steps.length - 1 && (
            <Button type="primary" onClick={handleFinish}>
              完成
            </Button>
          )}
        </div>
      }
    >
      <Steps current={currentStep} style={{ marginBottom: 24 }}>
        {steps.map(item => (
          <Step key={item.title} title={item.title} />
        ))}
      </Steps>
      <Form form={form} layout="vertical" name="silence_rule_form" initialValues={initialValues}>
        <div style={{ display: currentStep === 0 ? 'block' : 'none' }}>
          <Form.Item name="name" label="規則名稱" rules={[{ required: true, message: '請輸入規則名稱！' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="description" label="描述">
            <TextArea rows={4} />
          </Form.Item>
        </div>
        <div style={{ display: currentStep === 1 ? 'block' : 'none' }}>
          <Form.Item name="time_range" label="靜音期間" rules={[{ required: true, message: '請輸入靜音期間！' }]}>
            <Input placeholder="例如：每日 02:00-04:00 或 Sat 00:00 - Sun 23:59" />
          </Form.Item>
        </div>
        <div style={{ display: currentStep === 2 ? 'block' : 'none' }}>
          <Form.Item name="matchers" label="靜音條件 (Matchers)" rules={[{ required: true, message: '請輸入靜音條件！' }]}>
            <Input placeholder="例如：env=production, app=api" />
          </Form.Item>
          <Form.Item name="scope" label="靜音範圍">
            <Input placeholder="例如：全域" />
          </Form.Item>
          <Form.Item name="enabled" label="是否啟用" valuePropName="checked">
            <Switch defaultChecked={initialValues?.enabled ?? true} />
          </Form.Item>
        </div>
      </Form>
    </Modal>
  );
};

export default SilenceRuleForm;
