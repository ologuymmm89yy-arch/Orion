// core/kernel.c
// Компиляция через clang: clang --target=wasm32 -O3 -nostdlib -Wl,--no-entry -Wl,--export-all -o kernel.wasm kernel.c

#include <stdint.h>
#include <stddef.h>

#define SHARED_BUFFER_SIZE (1024 * 64) // 64 КБ буфер в системной памяти

static uint8_t SYSTEM_MEMORY[SHARED_BUFFER_SIZE];

// Получить указатель на память для JS
uint8_t* get_memory_ptr(void) {
    return SYSTEM_MEMORY;
}

// Получить размер выделенного буфера
size_t get_memory_size(void) {
    return SHARED_BUFFER_SIZE;
}

// Очистка системного буфера
void wipe_system_memory(void) {
    for (size_t i = 0; i < SHARED_BUFFER_SIZE; i++) {
        SYSTEM_MEMORY[i] = 0;
    }
}
