import React, { useState } from 'react';
import { ConfigProvider, theme, App as AntApp } from 'antd';
import { RouterProvider } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import AppRouter from './router';
import dayjs from 'dayjs';
import 'dayjs/locale/zh-tw';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);
dayjs.locale('zh-tw');

// A simple hook to manage state in localStorage
const useLocalStorageState = (key: string, defaultValue: any) => {
    const [state, setState] = useState(() => {
        try {
            const storedValue = window.localStorage.getItem(key);
            return storedValue ? JSON.parse(storedValue) : defaultValue;
        } catch (error) {
            console.log(error);
            return defaultValue;
        }
    });

    React.useEffect(() => {
        try {
            window.localStorage.setItem(key, JSON.stringify(state));
        } catch (error) {
            console.log(error);
        }
    }, [key, state]);

    return [state, setState];
};

const App = () => {
    const [themeMode, setThemeMode] = useLocalStorageState('sre-theme-mode', 'dark');

    const currentTheme = {
        algorithm: themeMode === 'dark' ? theme.darkAlgorithm : theme.defaultAlgorithm,
        token: {
            // Custom tokens for dark theme
        },
        components: {
            Layout: {
                siderBg: themeMode === 'dark' ? '#161719' : '#ffffff',
                headerBg: themeMode === 'dark' ? '#161719' : '#ffffff',
            },
            Menu: {
                darkItemBg: '#161719',
            },
            Card: {
                colorBgContainer: themeMode === 'dark' ? '#202226' : '#ffffff'
            },
            Modal: {
                contentBg: themeMode === 'dark' ? '#202226' : '#ffffff',
                headerBg: themeMode === 'dark' ? '#202226' : '#ffffff',
            },
        }
    };

    return (
        <ConfigProvider theme={currentTheme}>
            <AntApp>
                <AuthProvider>
                    <RouterProvider router={AppRouter} />
                </AuthProvider>
            </AntApp>
        </ConfigProvider>
    );
};

export default App;
