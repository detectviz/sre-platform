import React from 'react';
import { Modal, Button, Space } from 'antd';
import { ModalProps } from 'antd/lib/modal';
import ActionButton from './ActionButton';

interface StandardModalProps extends ModalProps {
    onOk?: (e: React.MouseEvent<HTMLElement>) => void;
    onCancel?: (e: React.MouseEvent<HTMLElement>) => void;
}

/**
 * 專案的標準化 Modal 元件
 * 封裝了統一的頁腳和樣式
 * @param {StandardModalProps} props - Ant Design Modal 的 props
 */
const StandardModal: React.FC<StandardModalProps> = ({ children, onOk, onCancel, ...rest }) => {
    const footer = (
        <div className="modal-footer">
            <div>
                {/* 可選的左側頁腳內容 */}
            </div>
            <Space>
                <ActionButton onClick={onCancel} className="btn-secondary">
                    取消
                </ActionButton>
                <ActionButton onClick={onOk} type="primary" className="btn-primary">
                    確定
                </ActionButton>
            </Space>
        </div>
    );

    return (
        <Modal
            width={700}
            centered
            footer={footer}
            onCancel={onCancel}
            {...rest}
        >
            {children}
        </Modal>
    );
};

export default StandardModal;
