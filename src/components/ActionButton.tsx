import React from 'react';
import { Button, Tooltip } from 'antd';
import { ButtonProps } from 'antd/lib/button';

interface ActionButtonProps extends ButtonProps {
    tooltip?: string;
}

/**
 * 專案的標準化操作按鈕
 * @param {string} type - 按鈕類型: 'primary', 'secondary', 'danger', 'link'
 * @param {string} tooltip - 滑鼠懸浮提示文字
 * @param {React.ReactNode} icon - 按鈕圖示
 */
const ActionButton: React.FC<ActionButtonProps> = ({ tooltip, children, ...rest }) => {
    const btn = (
        <Button {...rest}>
            {children}
        </Button>
    );

    if (tooltip) {
        return <Tooltip title={tooltip}>{btn}</Tooltip>;
    }

    return btn;
};

export default ActionButton;
