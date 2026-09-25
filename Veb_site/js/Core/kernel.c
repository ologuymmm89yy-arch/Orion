#include <stdint.h>
#include <stddef.h>

#define SHARED_BUFFER_SIZE (1024 * 64)
static uint8_t SYSTEM_MEMORY[SHARED_BUFFER_SIZE];

uint8_t* get_memory_ptr(void) { return SYSTEM_MEMORY; }
