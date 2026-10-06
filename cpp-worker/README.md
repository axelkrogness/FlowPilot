# FlowPilot C++ Worker
C++20 worker boundary for high-throughput execution. Build with `cmake -S . -B build && cmake --build build`, then run `./build/flowpilot-worker --health`.

The Next.js engine remains the reference executor in this package so the repository runs without requiring native PostgreSQL/HTTP dependencies. For production, move queue consumption and node adapters behind this C++ service; the web/API contract and database execution records remain unchanged.
