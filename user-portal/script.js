const API_URL = "https://732ja9c7i0.execute-api.us-east-1.amazonaws.com/dev/submit";

document.addEventListener("DOMContentLoaded", () => {
    const form = document.querySelector("form") || document.getElementById("uploadForm");
    
    if (form) {
        form.addEventListener("submit", async function(e) {
            e.preventDefault();
            
            const nameInput = document.getElementById("userName") || document.querySelector('input[type="text"]');
            const emailInput = document.getElementById("userEmail") || document.querySelector('input[type="email"]');
            const declarationInput = document.getElementById("declaration") || document.querySelector('textarea');
            const fileInput = document.getElementById("fileInput") || document.querySelector('input[type="file"]');

            if (!emailInput || !emailInput.value) {
                alert("يرجى إدخال البريد الإلكتروني!");
                return;
            }

            console.log("Sending request to API Gateway...");

            try {
                // تجميع البيانات لإرسالها للـ Lambda
                const payload = {
                    user_name: nameInput ? nameInput.value : "غير محدد",
                    user_email: emailInput.value,
                    declaration: declarationInput ? declarationInput.value : "",
                    file_name: (fileInput && fileInput.files[0]) ? fileInput.files[0].name : "بدون ملف مرفق"
                };

                const response = await fetch(API_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });

                const data = await response.json();

                if (response.ok) {
                    alert(`تم الإرسال بنجاح! رقم الطلب: ${data.document_id}`);
                    form.reset(); // إعادة ضبط الخانات بعد النجاح
                } else {
                    alert(`حدث خطأ من الخادم: ${data.message || 'فشل الإرسال'}`);
                }
            } catch (error) {
                console.error(error);
                alert("فشل الاتصال بـ API Gateway. تحقق من إعدادات CORS أو الرابط!");
            }
        });
    }
});