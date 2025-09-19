import { Modal } from 'antd';
import type { ModalProps } from 'antd';

/**
 * 具有玻璃擬態效果的 Modal 組件。
 * 樣式由 global.css 中的 .platform-modal class 控制。
 * 這個組件封裝了 Ant Design 的 Modal，並透過 wrapClassName 應用了全域的玻璃效果樣式。
 */
export const GlassModal = (props: ModalProps) => (
  <Modal
    {...props}
    // 使用 wrapClassName 將樣式應用到 Modal 的最外層容器
    wrapClassName={`platform-modal ${props.wrapClassName || ''}`}
  />
);

export default GlassModal;
