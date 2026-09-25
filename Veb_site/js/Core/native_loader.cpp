#include <cstdint>

extern "C" {
    int32_t validate_iso_header(const uint8_t* header_bytes, int32_t size) {
        if (!header_bytes || size < 64) return -1;
        return 1;
    }
}
