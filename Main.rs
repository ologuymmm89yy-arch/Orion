// core/main.rs
// Сборка под WebAssembly: cargo build --target wasm32-unknown-unknown --release

#![no_std]
#![panic_handler]

#[panic_handler]
fn panic(_info: &core::panic::PanicInfo) -> ! {
    loop {}
}

// Экспортируемая функция инициализации ядра
#[no_mangle]
pub extern "C" fn init_core() -> i32 {
    // 1 = Ядро успешно запущено
    1
}

// Проверка и быстрое хэширование входного буфера (сигнатурный анализ)
#[no_mangle]
pub extern "C" fn analyze_payload(ptr: *const u8, len: usize) -> u32 {
    if ptr.is_null() || len == 0 {
        return 0;
    }

    let slice = unsafe { core::slice::from_raw_parts(ptr, len) };
    let mut checksum: u32 = 0x811c9dc5; // FNV-1a hash initial offset

    for &byte in slice {
        checksum ^= byte as u32;
        checksum = checksum.wrapping_mul(0x01000193); // FNV prime
    }

    checksum
}
