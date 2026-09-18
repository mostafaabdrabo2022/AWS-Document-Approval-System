// إعدادات Cognito المحدثة
const COGNITO_CONFIG = {
    region: 'us-east-1',
    userPoolId: 'us-east-1_B0BYJ1xLi',
    clientId: '6be4cpn796gb16f1mfsrpsgiqe',
    domain: 'us-east-1b0byj1xli.auth.us-east-1.amazoncognito.com'
};

// فحص المصادقة فور تحميل الصفحة
document.addEventListener("DOMContentLoaded", () => {
    checkAuth();
});

function checkAuth() {
    const hash = window.location.hash.substring(1);
    const params = new URLSearchParams(hash);
    const accessToken = params.get('access_token');
    const idToken = params.get('id_token');

    if (accessToken) {
        // حفظ التوكن في الـ LocalStorage
        localStorage.setItem('cognito_access_token', accessToken);
        if (idToken) localStorage.setItem('cognito_id_token', idToken);
        // تنظيف عنوان الـ URL من التوكنات الظاهرة
        window.history.pushState("", document.title, window.location.pathname);
    }

    const storedToken = localStorage.getItem('cognito_access_token');
    
    if (!storedToken) {
        // إذا لم يكن مسجلاً، عرض واجهة تسجيل الدخول
        showLoginPrompt();
    } else {
        // إذا كان مسجلاً، إظهار محتوى لوحة الأدمن
        const appContainer = document.getElementById('appContainer');
        if (appContainer) appContainer.style.display = 'block';
    }
}

function showLoginPrompt() {
    document.body.innerHTML = `
        <div style="display: flex; justify-content: center; align-items: center; height: 100vh; background: #f4f7f6; font-family: Tahoma, sans-serif;">
            <div style="background: white; padding: 40px; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.1); text-align: center; max-width: 400px; width: 100%;">
                <h2 style="color: #2c3e50; margin-bottom: 20px;">🔒 لوحة تحكم المشرفين</h2>
                <p style="color: #666; margin-bottom: 30px;">يجب تسجيل الدخول باستخدام حساب المشرف المصرح له للوصول إلى هذه الصفحة.</p>
                <button onclick="redirectToLogin()" style="background: #232f3e; color: white; border: none; padding: 12px 24px; font-size: 16px; border-radius: 6px; cursor: pointer; width: 100%; font-weight: bold;">تسجيل الدخول عبر Cognito</button>
            </div>
        </div>
    `;
}

function redirectToLogin() {
    const redirectUri = window.location.href.split('#')[0];
    const loginUrl = `https://${COGNITO_CONFIG.domain}/login?client_id=${COGNITO_CONFIG.clientId}&response_type=token&redirect_uri=${encodeURIComponent(redirectUri)}`;
    window.location.href = loginUrl;
}

function logout() {
    localStorage.removeItem('cognito_access_token');
    localStorage.removeItem('cognito_id_token');
    location.reload();
}