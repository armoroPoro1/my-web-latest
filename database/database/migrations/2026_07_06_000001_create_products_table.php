<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->string('name');            // คอลัมน์ 1: ชื่อสินค้า
            $table->string('category');         // คอลัมน์ 2: หมวดหมู่
            $table->decimal('price', 10, 2);    // คอลัมน์ 3: ราคา
            $table->integer('stock');           // คอลัมน์ 4: จำนวนคงเหลือ
            $table->text('description')->nullable(); // คอลัมน์ 5: รายละเอียด
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};