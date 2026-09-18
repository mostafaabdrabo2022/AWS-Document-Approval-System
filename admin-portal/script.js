// روابط API Gateway الخاص بـ الأدمن
const GET_DOCS_URL = "https://732ja9c7i0.execute-api.us-east-1.amazonaws.com/dev/documents";
const DECISION_URL = "https://732ja9c7i0.execute-api.us-east-1.amazonaws.com/dev/decision";

// جلب وتحديث جدول المستندات عند تحميل الصفحة
document.addEventListener("DOMContentLoaded", () => {
    loadDocuments();
});

async function loadDocuments() {
    const tableBody = document.querySelector("#documentsTable tbody") || document.querySelector("tbody");
    if (!tableBody) return;

    try {
        const response = await fetch(GET_DOCS_URL);
        if (!response.ok) throw new Error("فشل جلب المستندات");

        const documents = await response.json();
        tableBody.innerHTML = ""; // مسح العناصر القديمة

        if (!documents || documents.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="6" style="text-align:center;">لا توجد طلبات معروضة حالياً</td></tr>`;
            return;
        }

        documents.forEach(doc => {
            const row = document.createElement("tr");
            
            // تحديد لون الحالة
            let statusBadge = `<span style="color: #ffc107;">قيد الانتظار</span>`;
            if (doc.status === "Approved") statusBadge = `<span style="color: #28a745; font-weight: bold;">مقبول</span>`;
            if (doc.status === "Rejected") statusBadge = `<span style="color: #dc3545; font-weight: bold;">مرفوض</span>`;

            row.innerHTML = `
                <td>${doc.document_id || doc.id || '-'}</td>
                <td>${doc.user_name || '-'}</td>
                <td>${doc.user_email || '-'}</td>
                <td>${doc.file_name || doc.declaration || '-'}</td>
                <td>${statusBadge}</td>
                <td>
                    <button onclick="makeDecision('${doc.document_id || doc.id}', 'Approved')" style="background-color: #28a745; color: white; border: none; padding: 5px 10px; cursor: pointer; border-radius: 4px; margin-left: 5px;">موافقة</button>
                    <button onclick="makeDecision('${doc.document_id || doc.id}', 'Rejected')" style="background-color: #dc3545; color: white; border: none; padding: 5px 10px; cursor: pointer; border-radius: 4px;">رفض</button>
                </td>
            `;
            tableBody.appendChild(row);
        });
    } catch (error) {
        console.error("Error loading documents:", error);
    }
}

async function makeDecision(docId, decision) {
    const adminStatus = document.getElementById('adminStatus');
    if (adminStatus) {
        adminStatus.innerText = `جاري تنفيذ القرار (${decision}) على الطلب ${docId}...`;
        adminStatus.style.color = "#007bff";
    }

    try {
        const payload = {
            document_id: docId,
            decision: decision
        };

        const response = await fetch(DECISION_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            throw new Error(`Server returned status: ${response.status}`);
        }

        const data = await response.json();

        if (adminStatus) {
            adminStatus.innerText = `تم تحديث حالة المستند ${docId} إلى: ${decision} بنجاح.`;
            adminStatus.style.color = decision === 'Approved' ? '#28a745' : '#dc3545';
        }

        // إعادة تحميل الجدول فوراً لتحديث الحالة أمام الأدمن
        loadDocuments();

    } catch (error) {
        console.error("Error submitting decision:", error);
        if (adminStatus) {
            adminStatus.innerText = "حدث خطأ أثناء حفظ القرار. يرجى المحاولة لاحقاً.";
            adminStatus.style.color = "#dc3545";
        }
    }
}