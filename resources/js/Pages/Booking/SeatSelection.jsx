import React, { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';

export default function SeatSelection({ zone, initialSeats }) {
    // 1. นำข้อมูลตั้งต้นจาก Inertia Props มาทำเป็น Reactive State ใน React
    const [seats, setSeats] = useState(initialSeats);
    const [selectedSeats, setSelectedSeats] = useState([]);

    // 2. เชื่อมต่อท่อส่งสัญญาณสด (WebSockets) ดักฟังเมื่อคนอื่นล็อกที่นั่ง
    useEffect(() => {
        // เงื่อนไข: ต้องเปิดใช้งาน Laravel Reverb/Echo ไว้ในระบบเรียบร้อยแล้ว
        if (typeof Echo !== 'undefined') {
            Echo.channel(`concert-zone.${zone.id}`)
                .listen('.SeatStatusUpdated', (e) => {
                    // เมื่อได้รับสัญญาณว่าที่นั่งเปลี่ยนสถานะ ให้อัปเดตค่าลงใน State ทันที
                    setSeats(prevSeats => ({
                        ...prevSeats,
                        [e.seatCode]: {
                            ...prevSeats[e.seatCode],
                            status: e.newStatus
                        }
                    }));
                });
        }

        // คืนหน่วยความจำท่อสัญญาณเมื่อย้ายหน้าจอออกจาก Component
        return () => {
            if (typeof Echo !== 'undefined') {
                Echo.leaveChannel(`concert-zone.${zone.id}`);
            }
        };
    }, [zone.id]);

    // 3. ฟังก์ชันจัดแจง State เมื่อผู้ใช้คนนี้กดจิ้มที่นั่งบนจอ
    const handleSeatClick = (seatCode) => {
        const currentSeat = seats[seatCode];

        // สกัดกั้น: ห้ามกดที่นั่งที่จองแล้ว หรือติดล็อกคนอื่นอยู่
        if (currentSeat.status !== 'available') return;

        // ดำเนินการสลับค่าเลือก (Toggle Selection)
        if (selectedSeats.includes(seatCode)) {
            setSelectedSeats(selectedSeats.filter(code => code !== seatCode));
        } else {
            // โควตาจำกัด: ห้ามจองเกิน 4 ใบต่อ 1 บัญชีผู้ใช้
            if (selectedSeats.length >= 4) {
                alert('คุณสามารถเลือกที่นั่งได้สูงสุด 4 ที่นั่งต่อการทำรายการ');
                return;
            }

            // เพิ่มค่าลงในตะกร้า Local State ชั่วคราว
            setSelectedSeats([...selectedSeats, seatCode]);

            // ยิงคำขอเบื้องหลังไปที่ Laravel เพื่อล็อกที่นั่งทันที (Optimistic Update)
            router.post('/seats/lock', { seat_code: seatCode }, {
                preserveScroll: true,
                onSuccess: () => {
                    console.log('กักสิทธิ์ที่นั่งเรียบร้อย');
                },
                onError: () => {
                    // หากหลังบ้านพบปัญหาวิ่งชนกัน (มีคนตัดหน้า) ให้ดึงที่นั่งออกจากสิทธิ์ของตนเองทันที
                    setSelectedSeats(prev => prev.filter(code => code !== seatCode));
                    alert('ขออภัยด้วยครับ! ที่นั่งนี้เพิ่งถูกสั่งล็อกโดยผู้ใช้อื่นเมื่อไม่กี่มิลลิวินาทีที่ผ่านมา');
                }
            });
        }
    };

    // คำนวณยอดเงินรวมอัปเดตแปรผันตามขนาดของ State selectedSeats
    const totalPrice = selectedSeats.length * zone.price;

    return (
        <div style={{ padding: '20px', fontFamily: 'sans-serif', maxWidth: '800px', margin: '0 auto' }}>
            {/* ส่วนหัวแสดงรายละเอียดโซน */}
            <div style={{ background: '#1e3a8a', color: 'white', padding: '15px', borderRadius: '6px', textAlign: 'center', marginBottom: '20px' }}>
                <h2 style={{ margin: 0 }}>{zone.name}</h2>
                <p style={{ margin: '5px 0 0 0' }}>ราคาที่นั่งละ {zone.price.toLocaleString()} บาท</p>
            </div>

            {/* ส่วนจัดแสดงเวทีจำลอง */}
            <div style={{ background: '#334155', color: '#fff', textAlign: 'center', padding: '10px', fontWeight: 'bold', borderRadius: '4px', marginBottom: '30px', letterSpacing: '4px' }}>
                STAGE (เวทีคอนเสิร์ต)
            </div>

            {/* Grid วาดผังที่นั่งจำลองขึ้นมาจากข้อมูลในคลัง State */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: '10px', marginBottom: '30px' }}>
                {Object.keys(seats).map((seatCode) => {
                    const seat = seats[seatCode];
                    
                    // เลือกคัดสรรสไตล์สีของปุ่มตามข้อมูลสเตตัสในสเตตปัจจุบัน
                    let backgroundColor = '#cbd5e1'; // ว่าง (available)
                    let cursor = 'pointer';

                    if (selectedSeats.includes(seatCode)) {
                        backgroundColor = '#2563eb'; // คุณกดเลือก (selected)
                    } else if (seat.status === 'locked') {
                        backgroundColor = '#f59e0b'; // มีคนอื่นถือกักไว้ (locked)
                        cursor = 'not-allowed';
                    } else if (seat.status === 'sold') {
                        backgroundColor = '#ef4444'; // จองขาดและขายแล้ว (sold)
                        cursor = 'not-allowed';
                    }

                    return (
                        <button
                            key={seatCode}
                            onClick={() => handleSeatClick(seatCode)}
                            style={{
                                backgroundColor,
                                color: backgroundColor === '#cbd5e1' ? '#334155' : 'white',
                                border: 'none',
                                padding: '12px 0',
                                borderRadius: '6px',
                                fontWeight: 'bold',
                                cursor,
                                transition: 'all 0.2s'
                            }}
                        >
                            {seatCode}
                        </button>
                    );
                })}
            </div>

            {/* แถบอธิบายความหมายของสีที่นั่ง (Legend) */}
            <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', marginBottom: '30px', fontSize: '14px' }}>
                <div><span style={{ display: 'inline-block', width: '12px', height: '12px', backgroundColor: '#cbd5e1', marginRight: '5px', borderRadius: '2px' }}></span>ว่าง</div>
                <div><span style={{ display: 'inline-block', width: '12px', height: '12px', backgroundColor: '#2563eb', marginRight: '5px', borderRadius: '2px' }}></span>คุณเลือกอยู่</div>
                <div><span style={{ display: 'inline-block', width: '12px', height: '12px', backgroundColor: '#f59e0b', marginRight: '5px', borderRadius: '2px' }}></span>มีคนจองคิว</div>
                <div><span style={{ display: 'inline-block', width: '12px', height: '12px', backgroundColor: '#ef4444', marginRight: '5px', borderRadius: '2px' }}></span>ขายแล้ว</div>
            </div>

            {/* บาร์แถบสรุปประมวลผลด้านล่าง */}
            <div style={{ borderTop: '2px solid #e2e8f0', paddingTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <strong>ที่นั่งที่คุณเลือก:</strong> {selectedSeats.length > 0 ? selectedSeats.join(', ') : 'ยังไม่ได้เลือกที่นั่ง'}
                </div>
                <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#b91c1c', marginBottom: '10px' }}>
                        ราคารวมทั้งหมด: {totalPrice.toLocaleString()} บาท
                    </div>
                    <button
                        disabled={selectedSeats.length === 0}
                        onClick={() => router.get(`/booking/checkout/res-999`)}
                        style={{
                            background: selectedSeats.length === 0 ? '#94a3b8' : '#10b981',
                            color: 'white',
                            border: 'none',
                            padding: '10px 20px',
                            borderRadius: '4px',
                            fontWeight: 'bold',
                            cursor: selectedSeats.length === 0 ? 'not-allowed' : 'pointer'
                        }}
                    >
                        กดไปหน้าชำระเงิน
                    </button>
                </div>
            </div>
        </div>
    );
}