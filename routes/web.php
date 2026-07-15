<?php

use App\Http\Controllers\BookingController;
use App\Models\Product;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

/*
|--------------------------------------------------------------------------
| Web Routes - แหล่งรวมเส้นทางระบบจองตั๋วคอนเสิร์ต
|--------------------------------------------------------------------------
*/



// 1. หน้าแรกสุด: เมื่อเข้าเว็บมา จะบังคับเด้ง (Redirect) ไปที่ผังที่นั่งโซน 1 ทันที
Route::get('/', function () {
    return redirect()->route('booking.show', ['zone_id' => 1]);
});

// 2. หน้าเลือกที่นั่ง: จะส่งงานไปที่ฟังก์ชัน show() เพื่อเรนเดอร์หน้า SeatSelection.jsx
Route::get('/booking/zone/{zone_id}', [BookingController::class, 'show'])->name('booking.show');

// 3. API สำหรับล็อกที่นั่ง: เมื่อคลิกที่นั่ง React จะยิง Post มาที่นี่เพื่อทำ Database Locking
Route::post('/seats/lock', [BookingController::class, 'lockSeat'])->name('seats.lock');

// 4. หน้าชำระเงิน: แสดงหน้า Checkout.jsx พร้อมนับเวลาถอยหลัง 10 นาที
Route::get('/booking/checkout/{reservation_id}', [BookingController::class, 'checkout'])->name('booking.checkout');

// 5. ประมวลผลจ่ายเงิน: รับข้อมูลจากหน้า Checkout เพื่อยืนยันการตัดบัตรและเปลี่ยนสถานะเป็น 'sold'
Route::post('/payment/process', [BookingController::class, 'processPayment'])->name('payment.process');

// routes/web.php
// use App\Models\Product;
Route::get('/product', function () {
    $products = Product::all();
    return Inertia::render('ProductList', compact('products') );
})->name('product');

Route::get('/product-others', function () {
    return Inertia::render('ProductOthers');
})->name('product-others');

Route::get('/product-others', function () {
    return Inertia::render('ProductOthers');
})->name('product-others');

