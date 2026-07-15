import React from 'react';
import { Head } from '@inertiajs/react';

export default function Quiz4() {
    const data = [
        { id: 1, name: 'WiFi MCU Module', type: 'ESP32', price: '250 ฿', stock: 50, description: 'Dual-core MCU with Wi-Fi and Bluetooth' },
        { id: 2, name: 'Power Toggle Button', type: 'Component', price: '15 ฿', stock: 100, description: 'Power toggle button wired to input Pin 2' },
        { id: 3, name: 'Stepper Motor', type: 'Actuator', price: '350 ฿', stock: 30, description: 'Used for automated bottle return bin' },
        { id: 4, name: 'Smoke Sensor', type: 'Arduino', price: '85 ฿', stock: 60, description: 'Gas and smoke detection module' },
        { id: 5, name: 'NodeMCU', type: 'ESP8266', price: '120 ฿', stock: 100, description: 'Low-cost Wi-Fi microchip' },
        { id: 6, name: 'Ultrasonic Sensor (HC-SR04)', type: 'Sensor', price: '45 ฿', stock: 200, description: 'Distance measuring sensor module' },
    ];

    return (
        <div className="min-h-screen bg-white p-8 font-sans">
            <Head title="Quiz 4" />
            <div className="max-w-[1200px] mx-auto">
                <h1 className="text-lg font-semibold text-gray-800 mb-6">ตารางแสดงข้อมูลอุปกรณ์ IoT (Quiz 4)</h1>
                
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-[14px]">
                        <thead>
                            <tr className="border-b-2 border-gray-100">
                                <th className="py-4 pr-6 font-bold text-gray-900 w-[5%] text-center">ID</th>
                                <th className="py-4 pr-6 font-bold text-gray-900 w-[20%]">ชื่ออุปกรณ์ (Name)</th>
                                <th className="py-4 pr-6 font-bold text-gray-900 w-[15%]">ประเภท (Board Type)</th>
                                <th className="py-4 pr-6 font-bold text-gray-900 w-[10%]">ราคา (Price)</th>
                                <th className="py-4 pr-6 font-bold text-gray-900 w-[15%]">จำนวนในสต็อก (Stock)</th>
                                <th className="py-4 font-bold text-gray-900">คำอธิบาย (Description)</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {data.map((item) => (
                                <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="py-4 pr-6 font-medium text-gray-900 text-center">{item.id}</td>
                                    <td className="py-4 pr-6 text-gray-600">{item.name}</td>
                                    <td className="py-4 pr-6 text-gray-600">{item.type}</td>
                                    <td className="py-4 pr-6 text-gray-600">{item.price}</td>
                                    <td className="py-4 pr-6 text-gray-600">{item.stock}</td>
                                    <td className="py-4 text-gray-600">{item.description}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
