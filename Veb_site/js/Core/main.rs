#![no_std]
#![panic_handler]

#[panic_handler]
fn panic(_info: &core::panic::PanicInfo) -> ! { loop {} }

#[no_mangle]
pub extern "C" fn init_core() -> i32 { 1 }
