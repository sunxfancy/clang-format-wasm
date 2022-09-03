LLVM_BUILD_TYPE=Release
PWD:=$(shell pwd)
COMMA := ,
gen_linker_flags   = -DCMAKE_EXE_LINKER_FLAGS="$(1)" -DCMAKE_SHARED_LINKER_FLAGS="$(1)" -DCMAKE_MODULE_LINKER_FLAGS="$(1)"

.PHONY: ninja 
ninja: build
	cd build && ninja -v clang-format
	mkdir -p out
	cp build/bin/clang-format.js out/clang-format.js
	cp build/bin/clang-format.wasm out/clang-format.wasm

build: $(PWD)/pre.js makefile 
	mkdir -p build/
	emcmake cmake -G Ninja -B build -S llvm-project/llvm \
		-DCMAKE_BUILD_TYPE=${LLVM_BUILD_TYPE} \
		-DLLVM_ENABLE_ASSERTIONS=ON \
		-DBUILD_SHARED_LIBS=OFF \
		-DLLVM_INCLUDE_TESTS=ON \
		-DLLVM_BUILD_TESTS=ON \
		-DLLVM_OPTIMIZED_TABLEGEN=ON \
		-DLLVM_TARGETS_TO_BUILD="X86" \
		-DLLVM_ENABLE_RTTI=ON \
		-DLLVM_ENABLE_PROJECTS="clang" \
		-DCMAKE_INSTALL_PREFIX=install \
		-DCMAKE_EXPORT_COMPILE_COMMANDS=1 \
		$(call gen_linker_flags,--pre-js $(PWD)/pre.js -sEXPORTED_RUNTIME_METHODS=ccall$(COMMA)cwrap) \
		-DCMAKE_TOOLCHAIN_FILE=$(PWD)/emsdk/upstream/emscripten/cmake/Modules/Platform/Emscripten.cmake
	touch build

install-deps: emsdk llvm-project


emsdk:
	git clone https://github.com/emscripten-core/emsdk.git
	cd emsdk && ./emsdk install latest && ./emsdk activate latest

llvm-project:
	git clone --branch release/15.x --depth 1 git@github.com:llvm/llvm-project.git
	cd llvm-project && git apply ../clang_format.patch
