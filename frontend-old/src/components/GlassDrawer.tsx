import { Drawer } from 'antd';
import type { DrawerProps } from 'antd';

/**
 * 具有玻璃擬態效果的 Drawer 組件。
 * 樣式由 global.css 中的 .platform-drawer class 控制。
 * 這個組件封裝了 Ant Design 的 Drawer，並透過 className 應用了全域的玻璃效果樣式。
 */
export const GlassDrawer = ({
  className,
  width,
  maskClosable,
  destroyOnClose,
  ...restProps
}: DrawerProps) => (
  <Drawer
    {...restProps}
    width={width ?? 640}
    destroyOnClose={destroyOnClose ?? true}
    maskClosable={maskClosable ?? false}
    className={`platform-drawer ${className || ''}`.trim()}
  />
);

export default GlassDrawer;
