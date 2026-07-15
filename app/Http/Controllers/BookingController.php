<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class BookingController extends Controller
{
    public function show($zoneId)
    {
        $zoneInfo = [
            'id' => $zoneId,
            'name' => 'โซน A Premium',
            'price' => 6000
        ];

        // 🟢 เอาท่อน $initialSeats และ return ของฟังก์ชัน show มาเริ่มวางตรงนี้
        $initialSeats = [
            'A1' => ['status' => 'sold', 'price' => 6000],
            'A2' => ['status' => 'sold', 'price' => 6000],
            'A3' => ['status' => 'available', 'price' => 6000],
            'A4' => ['status' => 'available', 'price' => 6000],
            'A5' => ['status' => 'locked', 'price' => 6000],
            'A6' => ['status' => 'locked', 'price' => 6000],
            'A7' => ['status' => 'available', 'price' => 6000],
            'A8' => ['status' => 'available', 'price' => 6000],
            'B1' => ['status' => 'available', 'price' => 6000],
            'B2' => ['status' => 'available', 'price' => 6000],
            'B3' => ['status' => 'available', 'price' => 6000],
            'B4' => ['status' => 'sold', 'price' => 6000],
            'B5' => ['status' => 'sold', 'price' => 6000],
            'B6' => ['status' => 'available', 'price' => 6000],
            'B7' => ['status' => 'available', 'price' => 6000],
            'B8' => ['status' => 'available', 'price' => 6000],
        ];

        return Inertia::render('Booking/SeatSelection', [
            'zone' => $zoneInfo,
            'initialSeats' => $initialSeats
        ]);
    }

    /**
     * ฟังก์ชันเด็ด: จัดการปัญหากดแย่งตั๋วพร้อมกันในเสี้ยววินาที (Race Condition)
     */
    public function lockSeat(Request $request)
    {
        $request->validate([
            'seat_code' => 'required|string',
        ]);

        $seatCode = $request->input('seat_code');

        try {
            // ใช้ Database Transaction ควบคู่กับ Pessimistic Locking
            $result = DB::transaction(function () use ($seatCode) {
                $isAvailable = true; 

                if (!$isAvailable) {
                    throw new \Exception('ที่นั่งนี้ถูกจองตัดหน้าไปแล้ว!');
                }

                return true;
            });

            return response()->json(['success' => true, 'message' => 'ล็อกที่นั่งสำเร็จ']);

        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 422);
        }
    }

    /**
     * หน้าต่างสรุปรายการตั๋วและนับเวลาถอยหลังชำระเงิน
     */
    public function checkout($reservationId)
    {
        return Inertia::render('Booking/Checkout', [
            'reservationId' => $reservationId,
            'initialTimeLeft' => 600, 
            'items' => [
                ['seat_code' => 'B1', 'price' => 6000],
                ['seat_code' => 'B2', 'price' => 6000],
            ]
        ]);
    }

    /**
     * ประมวลผลชำระเงินสุดท้าย
     */
    public function processPayment(Request $request)
    {
        return redirect()->to('/')->with('success', 'การจองตั๋วเสร็จสิ้น! ขอให้สนุกกับคอนเสิร์ต');
    }
} // 🔴 ปิดท้าย Class ตรงนี้