import { Modal } from 'antd';
import type { ModalProps } from 'antd/es/modal';

export type GlassModalProps = ModalProps;

export const GlassModal = ({ children, ...props }: GlassModalProps) => (
  <Modal
    centered
    maskClosable={false}
    {...props}
    className={`glass-modal ${props.className ?? ''}`.trim()}
    bodyStyle={{
      background: 'var(--bg-elevated)',
      padding: '24px',
      borderRadius: 'var(--radius-lg)',
      color: 'var(--text-primary)',
      ...props.bodyStyle,
    }}
  >
    {children}
  </Modal>
);

export default GlassModal;
