import React, { useState, useEffect } from 'react';
import { useForm } from '@inertiajs/react';

export default function Checkout({ reservationId, initialTimeLeft, items }) {
    // 1. Timer State: เก็บหน่วยวินาทีดิบ คอยสั่งลดทอนเวลาลงวินาทีละ 1 แต้ม
    const [secondsLeft, setSecondsLeft] = useState(initialTimeLeft);

    // 2. Inertia Form State: ฮุกพิเศษของ Inertia ช่วยติดตามค่า ฟอร์ม และสถานะตอนกดส่ง (processing)
    const { data, setData, post, processing } = useForm({
        reservation_id: reservationId,
        payment_method: 'promptpay'
    });

    // 3. Effect สำหรับนาฬิกานับถอยหลัง (Tick-Tock)
    useEffect(() => {
        // ถ้าเวลาหมดตัวล็อก State จะทำงานเพื่อตัดสิทธิ์
        if (secondsLeft <= 0) {
            alert('หมดเวลาสำหรับกาารสำรองล็อกคิวตั๋วแล้ว ระบบจะคืนที่นั่งกลับผังหลักโดยอัตโนมัติ');
            return;
        }

        const timer = setInterval(() => {
            setSecondsLeft(prev => prev - 1);
        }, 1000);

        // คืนหน่วยความจำ (Clean up) เพื่อไม่ให้เกิด Memory Leak ในเบราว์เซอร์
        return () => clearInterval(timer);
    }, [secondsLeft]);

    // ฟังก์ชันสำหรับแปลงหน่วยวินาทีดิบให้กลายเป็นข้อความ "นาที:วินาที" (เช่น 09:54)
    const formatTime = (totalSeconds) => {
        const mins = Math.floor(totalSeconds / 60);
        const secs = totalSeconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    // ฟังก์ชันตอนกดปุ่มชำระเงิน
    const handlePaymentSubmit = (e) => {
        e.preventDefault();
        // ส่ง Form State ผ่าน Inertia ไปปิด Transaction ถาวรบนหลังบ้าน Laravel
        post('/payment/process');
    };

    // คำนวณราคาสุทธิจากข้อมูลมัดจำที่ได้มาจาก Backend Props
    const totalAmount = items.reduce((sum, item) => sum + item.price, 0);

    return (
        <div style={{ padding: '30px', fontFamily: 'sans-serif', maxWidth: '600px', margin: '40px auto', border: '1px solid #e2e8f0', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', backgroundColor: '#fff' }}>
            <h2 style={{ color: '#1e3a8a', borderBottom: '2px solid #f1f5f9', paddingBottom: '10px', marginTop: 0 }}>ยืนยันชำระรายการตั๋ว</h2>
            
            {/* โซนแสดงผลนาฬิกานับถอยหลังตามสภาวะของ State */}
            <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', padding: '15px', borderRadius: '6px', textAlign: 'center', marginBottom: '20px' }}>
                <span style={{ fontSize: '14px', color: '#991b1b', display: 'block', fontWeight: 'bold' }}>กรุณาดำเนินการโอนเงินภายในเวลา</span>
                <span style={{ fontSize: '32px', fontWeight: 'bold', color: '#dc2626', display: 'block', margin: '5px 0' }}>
                    {formatTime(secondsLeft)}
                </span>
                <small style={{ color: '#7f1d1d' }}>หากพ้นเวลาที่กำหนด สิทธิ์การถือกรรมสิทธิ์ตั๋วจะหลุดทันที</small>
            </div>

            <h3 style={{ fontSize: '16px', color: '#334155' }}>รายการตั๋วที่คุณล็อกสิทธิ์สำเร็จ:</h3>
            <ul style={{ paddingLeft: '20px', lineHeight: '2', color: '#475569' }}>
                {items.map((item, index) => (
                    <li key={index}>ที่นั่งรหัส <strong>{item.seat_code}</strong> - ราคา {item.price.toLocaleString()} บาท</li>
                ))}
            </ul>

            <div style={{ fontSize: '18px', fontWeight: 'bold', margin: '20px 0', borderTop: '1px solid #e2e8f0', paddingTop: '15px' }}>
                ยอดสุทธิที่ต้องชำระ: <span style={{ color: '#10b981' }}>{totalAmount.toLocaleString()} บาท</span>
            </div>

            {/* ฟอร์มเลือกช่องทางชำระเงินที่ผูกกับ useForm State */}
            <form onSubmit={handlePaymentSubmit}>
                <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px', color: '#334155', fontSize: '14px' }}>เลือกช่องทางการชำระเงิน:</label>
                    <select 
                        value={data.payment_method} 
                        onChange={e => setData('payment_method', e.target.value)}
                        style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #cbd5e1', outline: 'none' }}
                    >
                        <option value="promptpay">PromptPay (แนะนำ)</option>
                        <option value="credit_card">บัตรเครดิต/เดบิต</option>
                    </select>
                </div>

                <button 
                    type="submit" 
                    disabled={processing || secondsLeft <= 0}
                    style={{
                        width: '100%',
                        background: '#10b981',
                        color: 'white',
                        padding: '12px',
                        border: 'none',
                        borderRadius: '6px',
                        fontWeight: 'bold',
                        fontSize: '16px',
                        cursor: (processing || secondsLeft <= 0) ? 'not-allowed' : 'pointer',
                        opacity: (processing || secondsLeft <= 0) ? 0.6 : 1,
                        transition: 'background 0.2s'
                    }}
                >
                    {processing ? 'กำลังประมวลผลจ่ายเงิน...' : 'ชำระเงินสำเร็จ'}
                </button>
            </form>
        </div>
    );
}